'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';

import { useSparkSlider, computeSwipeTarget } from './useSparkSlider';
import { SLIDER_CONFIG, type CardPosition } from './config';

interface SparkSliderProps {
  images: readonly string[];
  autoPlayInterval?: number;
  alt?: string;
  className?: string;
  cardClassName?: string;
  renderImage?: (
    src: string,
    alt: string,
    isCenter: boolean
  ) => React.ReactNode;
}

const SparkSlider = ({
  images,
  autoPlayInterval = SLIDER_CONFIG.DEFAULT_AUTOPLAY_INTERVAL_MS,
  alt = 'Slide',
  className,
  cardClassName,
  renderImage,
}: SparkSliderProps) => {
  const totalSlides = images.length;
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [isFullscreenDragging, setIsFullscreenDragging] = useState(false);
  const lastCenterDragAtRef = useRef<number>(0);
  const {
    currentIndex,
    isTransitioning,
    isDragging,
    dragOffset,
    vminInPixels,
    handlers,
  } = useSparkSlider({
    totalSlides,
    autoPlayInterval,
  });

  useEffect(() => {
    if (fullscreenIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreenIndex(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [fullscreenIndex]);

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
    (position: CardPosition) => {
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
        zIndex: baseZIndex,
      };
    },
    [isDragging, dragOffset, vminInPixels]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (totalSlides < 2) return;
      if (e.key === 'ArrowLeft') {
        handlers.handleInteractionStart();
        const prevIndex =
          currentIndex === 0 ? totalSlides - 1 : currentIndex - 1;
        handlers.handleSideCardClick(prevIndex);
        handlers.handleInteractionEnd();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        handlers.handleInteractionStart();
        const nextIndex = (currentIndex + 1) % totalSlides;
        handlers.handleSideCardClick(nextIndex);
        handlers.handleInteractionEnd();
        e.preventDefault();
      }
    },
    [currentIndex, totalSlides, handlers]
  );

  const renderCard = useCallback(
    (index: number, isCenter: boolean, position: CardPosition) => {
      // Disable selection visuals; fullscreen handles selection UX
      const imageSrc = images[index % images.length];

      const aspectClass =
        SLIDER_CONFIG.CARD_LAYOUT === 'vertical'
          ? 'aspect-[3/4]'
          : 'aspect-[4/3]';
      const cardWidthVh = isCenter
        ? SLIDER_CONFIG.CENTER_CARD_SIZE
        : SLIDER_CONFIG.SIDE_CARD_SIZE;

      return (
        <motion.div
          key={`card-${index}`}
          className={`relative z-30 ${aspectClass} overflow-hidden rounded-xl ${cardClassName ?? ''}`}
          style={{ width: `${cardWidthVh}svmin` }}
          onMouseEnter={handlers.handleInteractionStart}
          onMouseLeave={handlers.handleInteractionEnd}
          whileTap={{ scale: 0.95 }}
        >
          {isCenter && totalSlides > 1 ? (
            <motion.div
              className='absolute inset-0 z-50 cursor-grab active:cursor-grabbing'
              drag='x'
              dragConstraints={{
                left: -SLIDER_CONFIG.DRAG_CONSTRAINTS_PX,
                right: SLIDER_CONFIG.DRAG_CONSTRAINTS_PX,
              }}
              dragElastic={SLIDER_CONFIG.DRAG_ELASTICITY}
              dragMomentum={false}
              onDragStart={handlers.handleDragStart}
              onDrag={handlers.handleDrag}
              onDragEnd={(evt, info) => {
                handlers.handleDragEnd(
                  evt as unknown as MouseEvent | TouchEvent | PointerEvent,
                  info
                );
                lastCenterDragAtRef.current = Date.now();
              }}
              onClick={(e) => {
                // Avoid opening during drag
                if (isDragging) {
                  e.preventDefault();
                  return;
                }
                // Ignore click that happens right after a swipe/drag
                if (
                  Date.now() - lastCenterDragAtRef.current <
                  SLIDER_CONFIG.SWIPE_COOLDOWN_MS
                ) {
                  e.preventDefault();
                  return;
                }
                setFullscreenIndex(index);
              }}
            />
          ) : position === 'left' || position === 'right' ? (
            <div
              className='absolute inset-0 z-50 cursor-pointer'
              onClick={() => handlers.handleSideCardClick(index)}
            />
          ) : null}

          <div className='absolute inset-0 rounded-xl bg-gradient-to-b from-neutral-800 to-black' />
          {isCenter && (
            <div className='absolute inset-0 rounded-xl border border-emerald-400/50' />
          )}
          {/* Selection indicators removed in favor of fullscreen UX */}
          <div className='pointer-events-none relative h-full w-full overflow-hidden rounded-xl'>
            {renderImage ? (
              renderImage(imageSrc, `${alt} ${index + 1}`, isCenter)
            ) : (
              <img
                src={imageSrc}
                alt={`${alt} ${index + 1}`}
                className='h-full w-full object-cover object-center'
                loading={isCenter ? 'eager' : 'lazy'}
              />
            )}
            {!isCenter && (
              <div className='absolute inset-0 rounded-xl bg-black/40' />
            )}
            {/* No selection overlay */}
            {isCenter && (
              <div className='absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t from-black/70 to-transparent p-3'>
                <span className='text-sm font-medium leading-tight text-white'>{`${alt} ${index + 1}`}</span>
              </div>
            )}
          </div>
          {isCenter && (
            <div className='absolute bottom-2 right-2'>
              <div className='flex items-center gap-2 rounded-full bg-black/50 px-2 py-1 backdrop-blur-sm'>
                <span className='text-xs font-medium text-white'>
                  {index + 1}
                </span>
                <span className='text-xs text-white/60'>/ {totalSlides}</span>
              </div>
            </div>
          )}
        </motion.div>
      );
    },
    [handlers, images, alt, totalSlides, cardClassName]
  );

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${className ?? ''}`}
      tabIndex={0}
      role='region'
      aria-roledescription='carousel'
      aria-label='Spark slider'
      onKeyDown={handleKeyDown}
      onFocus={handlers.handleInteractionStart}
      onBlur={handlers.handleInteractionEnd}
    >
      {/* Fullscreen overlay */}
      {fullscreenIndex !== null && (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4'>
          <motion.div
            className='max-h-[96svh] max-w-[96svw]'
            drag='x'
            dragConstraints={{
              left: -SLIDER_CONFIG.DRAG_CONSTRAINTS_PX,
              right: SLIDER_CONFIG.DRAG_CONSTRAINTS_PX,
            }}
            dragElastic={SLIDER_CONFIG.DRAG_ELASTICITY}
            dragMomentum={false}
            onDragStart={() => setIsFullscreenDragging(true)}
            onDragEnd={(
              _: MouseEvent | TouchEvent | PointerEvent,
              info: PanInfo
            ) => {
              if (fullscreenIndex !== null) {
                const target = computeSwipeTarget(
                  info.offset.x,
                  fullscreenIndex,
                  totalSlides
                );
                if (typeof target === 'number') {
                  setFullscreenIndex(null);
                  handlers.handleSideCardClick(target);
                  setIsFullscreenDragging(false);
                  return;
                }
              }
              setIsFullscreenDragging(false);
            }}
            onClick={() => {
              if (isFullscreenDragging || fullscreenIndex === null) return;
              const idx = fullscreenIndex;
              setFullscreenIndex(null);
              handlers.handleSideCardClick(idx);
            }}
          >
            {renderImage ? (
              renderImage(
                images[fullscreenIndex % images.length],
                `${alt} ${fullscreenIndex + 1}`,
                true
              )
            ) : (
              <img
                src={images[fullscreenIndex % images.length]}
                alt={`${alt} ${fullscreenIndex + 1}`}
                className='h-full max-h-[96svh] w-full max-w-[96svw] select-none object-contain'
                draggable={false}
              />
            )}
          </motion.div>
        </div>
      )}
      <div
        className='relative w-full overflow-hidden'
        style={{
          height: `min(var(--spark-slider-h, ${SLIDER_CONFIG.CONTAINER_HEIGHTS_VH.base}svh), 100svh)`,
          transform: 'scale(var(--spark-slider-scale, 1))',
          transformOrigin: 'center',
        }}
      >
        {/**
         * CSS variable override on any breakpoint via Tailwind (`--spark-slider-h`).
         * - Default base height: SLIDER_CONFIG.CONTAINER_HEIGHTS_VH.base
         * - Height is clamped by 100svh for mobile viewport safety
         */}
        <div
          aria-live='polite'
          className='sr-only'
        >{`Slide ${currentIndex + 1} of ${totalSlides}`}</div>
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
          <AnimatePresence mode='sync'>
            {images.map((_, cardIndex) => {
              const position = getCardPosition(cardIndex, currentIndex);
              if (position === 'hidden') return null;

              const transform = getCardTransform(position);
              const isCenter = position === 'center';

              const spring = isTransitioning
                ? SLIDER_CONFIG.spring.transitioning
                : SLIDER_CONFIG.spring.idle;
              // Use spring presets only for consistent timing

              return (
                <motion.div
                  key={`card-${cardIndex}`}
                  className='pointer-events-auto absolute'
                  initial={isCenter ? transform : { ...transform, opacity: 0 }}
                  animate={transform}
                  exit={{ ...transform, opacity: 0 }}
                  transition={
                    isDragging
                      ? { type: 'tween', duration: 0 }
                      : { type: 'spring', ...spring }
                  }
                  style={{
                    transformOrigin: 'center center',
                    zIndex: (transform as { zIndex: number }).zIndex,
                  }}
                >
                  {renderCard(cardIndex, isCenter, position)}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SparkSlider;
