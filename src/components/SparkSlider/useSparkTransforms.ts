/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

'use client';

import { useCallback } from 'react';
import { SLIDER_CONFIG, type CardPosition } from './config';
import type { TargetAndTransition } from 'framer-motion';

interface UseSparkTransformsArgs {
  totalSlides: number;
  isDragging: boolean;
  dragOffset: number;
  vminInPixels: number;
}

type SparkTransform = TargetAndTransition;

/**
 * Provides memoized helpers for computing card positions and transforms.
 */
export function useSparkTransforms({
  totalSlides,
  isDragging,
  dragOffset,
  vminInPixels,
}: UseSparkTransformsArgs) {
  const getCardPosition = useCallback(
    (cardIndex: number, currentIdx: number): CardPosition => {
      const getCircularIndex = (index: number) =>
        ((index % totalSlides) + totalSlides) % totalSlides;

      const normalizedCard = getCircularIndex(cardIndex);
      const normalizedCurrent = getCircularIndex(currentIdx);

      if (normalizedCard === normalizedCurrent) return 'center';
      if (normalizedCard === getCircularIndex(currentIdx - 1)) return 'left';
      if (normalizedCard === getCircularIndex(currentIdx - 2))
        return 'far-left';
      if (normalizedCard === getCircularIndex(currentIdx + 1)) return 'right';
      if (normalizedCard === getCircularIndex(currentIdx + 2))
        return 'far-right';
      return 'hidden';
    },
    [totalSlides]
  );

  const getCardTransform = useCallback(
    (position: CardPosition): SparkTransform => {
      const centerWidthVH = SLIDER_CONFIG.CENTER_CARD_SIZE;
      const sideWidthVH = SLIDER_CONFIG.SIDE_CARD_SIZE;
      const spacingVH = SLIDER_CONFIG.SPACING_UNITS;
      const posConfig = SLIDER_CONFIG.positions[position];

      const widthVHForPos = position === 'center' ? centerWidthVH : sideWidthVH;
      let baseX = posConfig.xOffsetFactor * (widthVHForPos + spacingVH);
      // Responsive clamp: reduce absolute X offset on narrow viewports so side/far cards remain visible
      // Uses vmin (min(width,height)) to stay consistent in portrait
      const minViewportSidePx = vminInPixels * 100;
      const { breakpointPx, minMultiplier } = SLIDER_CONFIG.OFFSET_RESPONSIVE;
      const responsiveOffsetMultiplier = Math.max(
        minMultiplier,
        Math.min(1, minViewportSidePx / breakpointPx)
      );
      baseX *= responsiveOffsetMultiplier;
      let baseScale = posConfig.scale;
      let baseOpacity = posConfig.opacity;
      let baseBlur = posConfig.blur;
      const baseZIndex = posConfig.zIndex;

      if (isDragging && dragOffset !== 0) {
        // Use vmin to keep geometry consistent in portrait where height >> width
        const baseUnit = vminInPixels;
        const dragDistance = widthVHForPos + spacingVH;
        const dragProgress = dragOffset / (dragDistance * baseUnit);

        if (position === 'center') {
          const shrinkFactor = Math.min(
            SLIDER_CONFIG.drag.center.maxShrink,
            Math.abs(dragProgress) * SLIDER_CONFIG.drag.center.shrinkFactor
          );
          baseScale = Math.max(0.7, baseScale - shrinkFactor);
          baseOpacity = Math.max(
            0.4,
            1 - Math.abs(dragProgress) * SLIDER_CONFIG.drag.center.opacityFactor
          );
          baseBlur =
            Math.abs(dragProgress) * SLIDER_CONFIG.drag.center.blurFactor;
        } else if (position === 'left' || position === 'right') {
          const isMovingTowardCenter =
            (position === 'left' && dragProgress > 0) ||
            (position === 'right' && dragProgress < 0);
          if (isMovingTowardCenter) {
            const progressFactor = Math.abs(dragProgress);
            const target = SLIDER_CONFIG.positions.center;
            baseScale +=
              (target.scale - baseScale) *
              progressFactor *
              SLIDER_CONFIG.drag.side.scaleFactor;
            baseOpacity +=
              (target.opacity - baseOpacity) *
              progressFactor *
              SLIDER_CONFIG.drag.side.opacityFactor;
            baseBlur +=
              (target.blur - baseBlur) *
              progressFactor *
              SLIDER_CONFIG.drag.side.blurFactor;
            baseX +=
              (target.xOffsetFactor - baseX) *
              progressFactor *
              SLIDER_CONFIG.drag.side.xOffsetFactor;
          }
        }
      }

      // Prevent fully invisible non-center cards in rare race conditions
      if (position !== 'center') {
        baseOpacity = Math.max(baseOpacity, SLIDER_CONFIG.MIN_SIDE_OPACITY);
      }

      // Ensure blur is never negative to avoid keyframe filter warnings
      const clampedBlur = Math.max(0, baseBlur);

      return {
        x: `${baseX}svmin`,
        scale: baseScale,
        opacity: baseOpacity,
        filter: `blur(${clampedBlur}px)`,
        // zIndex is read by style prop below via transform.zIndex extraction
        // but framer-motion animate/initial accept arbitrary style keys
        zIndex: baseZIndex as unknown as number,
      } as TargetAndTransition;
    },
    [isDragging, dragOffset, vminInPixels]
  );

  return { getCardPosition, getCardTransform };
}
