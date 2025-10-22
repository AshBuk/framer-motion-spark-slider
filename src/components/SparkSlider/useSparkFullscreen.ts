/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

'use client';

import { useCallback, useRef, useState } from 'react';
import type { PanInfo } from 'framer-motion';
import { SLIDER_CONFIG } from './config';
import { computeSwipeTarget } from './useSparkSlider';

/**
 * Options for {@link useSparkFullscreen} hook.
 */
interface UseSparkFullscreenOptions {
  currentIndex: number;
  totalSlides: number;
  isDragging: boolean;
  handlers: {
    handleSideCardClick: (index: number) => void;
  };
  lastCenterDragAtRef?: React.MutableRefObject<number>;
}

/**
 * Return type for {@link useSparkFullscreen} hook.
 */
interface UseSparkFullscreenReturn {
  fullscreenIndex: number | null;
  isFullscreenDragging: boolean;
  openFullscreenAt: (index: number) => void;
  exitFullscreen: (targetIndex?: number) => void;
  fullscreenHandlers: {
    onDragStart: () => void;
    onDragEnd: (
      _: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo
    ) => void;
    onClick: () => void;
  };
  lastCenterDragAtRef: React.MutableRefObject<number>;
}

/**
 * Hook for managing fullscreen overlay state and interactions.
 *
 * @param options - {@link UseSparkFullscreenOptions}
 * @returns {@link UseSparkFullscreenReturn}
 */
export function useSparkFullscreen({
  currentIndex: _currentIndex,
  totalSlides,
  isDragging,
  handlers,
  lastCenterDragAtRef,
}: UseSparkFullscreenOptions): UseSparkFullscreenReturn {
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [isFullscreenDragging, setIsFullscreenDragging] = useState(false);
  const lastFullscreenExitAtRef = useRef<number>(0);
  const internalLastCenterDragAtRef = useRef<number>(0);
  const lastCenterRef = lastCenterDragAtRef ?? internalLastCenterDragAtRef;

  const exitFullscreen = useCallback(
    (targetIndex?: number) => {
      setFullscreenIndex(null);
      lastFullscreenExitAtRef.current = Date.now();
      if (typeof targetIndex === 'number') {
        handlers.handleSideCardClick(targetIndex);
      }
    },
    [handlers]
  );

  const openFullscreenAt = useCallback(
    (index: number) => {
      if (isDragging) return;

      // Prevent accidental reopen right after exit
      if (
        Date.now() - lastFullscreenExitAtRef.current <
        SLIDER_CONFIG.FULLSCREEN_EXIT_COOLDOWN_MS
      ) {
        return;
      }

      // Ignore click that happens right after a swipe/drag
      if (
        Date.now() - lastCenterRef.current <
        SLIDER_CONFIG.SWIPE_COOLDOWN_MS
      ) {
        return;
      }

      setFullscreenIndex(index);
    },
    [isDragging, lastCenterRef]
  );

  const fullscreenHandlers = {
    onDragStart: useCallback(() => {
      setIsFullscreenDragging(true);
    }, []),

    onDragEnd: useCallback(
      (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (fullscreenIndex !== null) {
          const target = computeSwipeTarget(
            info.offset.x,
            fullscreenIndex,
            totalSlides
          );
          if (typeof target === 'number') {
            exitFullscreen(target);
            setIsFullscreenDragging(false);
            return;
          }
        }
        setIsFullscreenDragging(false);
      },
      [fullscreenIndex, totalSlides, exitFullscreen]
    ),

    onClick: useCallback(() => {
      if (isFullscreenDragging || fullscreenIndex === null) return;
      exitFullscreen();
    }, [isFullscreenDragging, fullscreenIndex, exitFullscreen]),
  };

  return {
    fullscreenIndex,
    isFullscreenDragging,
    openFullscreenAt,
    exitFullscreen,
    fullscreenHandlers,
    // Expose the ref used, for tests and integration timing
    lastCenterDragAtRef: lastCenterRef,
  };
}
