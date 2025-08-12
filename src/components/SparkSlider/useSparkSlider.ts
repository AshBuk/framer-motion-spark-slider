'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { PanInfo } from 'framer-motion';
import { SLIDER_CONFIG } from './config';

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
  const [vminInPixels, setVminInPixels] = useState(1);
  const lastSwipeAtRef = useRef<number>(0);
  const interactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

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

  useEffect(() => {
    if (isUserInteracting) return;
    if (totalSlides < 2) return;

    const effectiveInterval =
      autoPlayInterval / SLIDER_CONFIG.AUTO_SCROLL_SPEED_MULTIPLIER;

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
    setIsUserInteracting(true);
  }, []);

  const handleInteractionEnd = useCallback(() => {
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(
      () => setIsUserInteracting(false),
      SLIDER_CONFIG.USER_INTERACTION_DEBOUNCE_MS
    );
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
        // During transition ignore and ensure visuals are clean
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
      if (now - lastSwipeAtRef.current < SLIDER_CONFIG.SWIPE_COOLDOWN_MS) {
        handleInteractionEnd();
        return;
      }

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
