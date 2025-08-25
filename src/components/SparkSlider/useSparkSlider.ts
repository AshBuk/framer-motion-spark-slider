/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { PanInfo } from 'framer-motion';
import { SLIDER_CONFIG } from './config';

/**
 * Decides which slide to go to based on horizontal drag offset.
 * Returns null if movement is under the swipe threshold or total < 2.
 * Positive offset means previous slide (drag right → reveal previous).
 */
export function computeSwipeTarget(
  offsetX: number,
  baseIndex: number,
  totalSlides: number
): number | null {
  if (totalSlides < 2) return null;
  if (Math.abs(offsetX) <= SLIDER_CONFIG.SWIPE_THRESHOLD_PX) return null;
  const goPrev = offsetX > 0;
  if (goPrev) return baseIndex === 0 ? totalSlides - 1 : baseIndex - 1;
  return (baseIndex + 1) % totalSlides;
}

interface UseSparkSliderProps {
  totalSlides: number;
  autoPlayInterval: number;
}

export const useSparkSlider = ({
  totalSlides,
  autoPlayInterval,
}: UseSparkSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  // Use vmin to make geometry consistent on tall/narrow devices with dynamic toolbars
  const [vminInPixels, setVminInPixels] = useState(1);
  const lastSwipeAtRef = useRef<number>(0);
  const interactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Track vmin in pixels to convert svmin-based distances to pixel offsets
  useEffect(() => {
    setVminInPixels(Math.min(window.innerWidth, window.innerHeight) / 100);
  }, []);

  // Keep vminInPixels in sync with viewport size changes
  useEffect(() => {
    const onResize = () => {
      setVminInPixels(Math.min(window.innerWidth, window.innerHeight) / 100);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Autoplay: pauses on user interaction and when tab is hidden; gates transitions
  useEffect(() => {
    if (isUserInteracting) return;
    if (totalSlides < 2) return;
    if (!(autoPlayInterval > 0)) return;

    const effectiveInterval = Math.max(1, autoPlayInterval);

    // Avoid advancing while tab is hidden to save resources
    let paused =
      typeof document !== 'undefined' && document.visibilityState === 'hidden';
    const onVisibility = () => {
      paused = document.visibilityState === 'hidden';
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibility);
    }

    const scheduleTransition = (update: () => void) => {
      setIsDragging(false);
      setDragOffset(0);
      setIsTransitioning(true);
      setTimeout(() => {
        update();
        setTimeout(
          () => setIsTransitioning(false),
          SLIDER_CONFIG.TRANSITION_DURATION_MS
        );
      }, SLIDER_CONFIG.TRANSITION_DELAY_MS);
    };

    const interval = setInterval(() => {
      if (!isTransitioning && !paused) {
        scheduleTransition(() =>
          setCurrentIndex((prev) => (prev + 1) % totalSlides)
        );
      }
    }, effectiveInterval);

    return () => {
      clearInterval(interval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibility);
      }
    };
  }, [autoPlayInterval, totalSlides, isUserInteracting, isTransitioning]);

  const handleInteractionStart = useCallback(() => {
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
      interactionTimeoutRef.current = null;
    }
    // Immediately pause autoplay as soon as the user interacts
    setIsUserInteracting(true);
  }, []);

  const handleInteractionEnd = useCallback(() => {
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    const debounceMs = SLIDER_CONFIG.USER_INTERACTION_DEBOUNCE_MS;
    if (debounceMs > 0) {
      // Debounce resume so short interactions do not instantly restart autoplay
      interactionTimeoutRef.current = setTimeout(() => {
        setIsUserInteracting(false);
        interactionTimeoutRef.current = null;
      }, debounceMs);
    } else {
      interactionTimeoutRef.current = null;
      setIsUserInteracting(false);
    }
  }, []);

  useEffect(
    () => () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    },
    []
  );

  const handleSideCardClick = useCallback(
    (index: number) => {
      if (isTransitioning) {
        // Ignore inputs during transition and reset drag state for clean visuals
        setIsDragging(false);
        setDragOffset(0);
        handleInteractionEnd();
        return;
      }
      // Soft programmatic transition to selected index
      setIsDragging(false);
      setDragOffset(0);
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setTimeout(
          () => setIsTransitioning(false),
          SLIDER_CONFIG.TRANSITION_DURATION_MS
        );
      }, SLIDER_CONFIG.TRANSITION_DELAY_MS);
    },
    [isTransitioning, handleInteractionEnd]
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setDragOffset(0);
    handleInteractionStart();
  }, [handleInteractionStart]);

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!isDragging) return;
      setDragOffset(info.offset.x);
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (isTransitioning) {
        setIsDragging(false);
        setDragOffset(0);
        handleInteractionEnd();
        return;
      }

      setIsDragging(false);
      setDragOffset(0);

      const now = Date.now();
      // Prevent accidental double-triggers by enforcing a short cooldown
      if (now - lastSwipeAtRef.current < SLIDER_CONFIG.SWIPE_COOLDOWN_MS) {
        handleInteractionEnd();
        return;
      }

      // Only commit a swipe if beyond threshold; otherwise snap back
      if (Math.abs(info.offset.x) > SLIDER_CONFIG.SWIPE_THRESHOLD_PX) {
        lastSwipeAtRef.current = now;
        setIsTransitioning(true);
        setTimeout(() => {
          if (info.offset.x > 0) {
            setCurrentIndex((prev) =>
              prev === 0 ? totalSlides - 1 : prev - 1
            );
          } else {
            setCurrentIndex((prev) => (prev + 1) % totalSlides);
          }
          setTimeout(() => {
            setIsTransitioning(false);
            setIsDragging(false);
            setDragOffset(0);
          }, SLIDER_CONFIG.TRANSITION_DURATION_MS);
        }, SLIDER_CONFIG.TRANSITION_DELAY_MS);
      }

      handleInteractionEnd();
    },
    [totalSlides, isTransitioning, handleInteractionEnd]
  );

  const handlers = useMemo(
    () => ({
      handleInteractionStart,
      handleInteractionEnd,
      handleSideCardClick,
      handleDragStart,
      handleDrag,
      handleDragEnd,
    }),
    [
      handleInteractionStart,
      handleInteractionEnd,
      handleSideCardClick,
      handleDragStart,
      handleDrag,
      handleDragEnd,
    ]
  );

  return {
    currentIndex,
    isUserInteracting,
    isTransitioning,
    isDragging,
    dragOffset,
    vminInPixels,
    handlers,
  };
};
