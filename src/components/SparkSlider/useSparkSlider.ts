'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { PanInfo } from 'framer-motion';
import { SLIDER_CONFIG } from './config';

interface UseSparkSliderProps {
  totalIdeas: number;
  autoPlayInterval: number;
  onIdeaSelect?: (ideaId: number, isSelected: boolean) => void;
  onSelectionChange?: (current: number, total: number) => void;
}

export const useSparkSlider = ({
  totalIdeas,
  autoPlayInterval,
  onIdeaSelect,
  onSelectionChange,
}: UseSparkSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [lastCenterTap, setLastCenterTap] = useState<number | null>(null);
  const [pendingSelection, setPendingSelection] = useState<{
    ideaId: number;
    isSelected: boolean;
  } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [vhInPixels, setVhInPixels] = useState(1);
  const lastSwipeAtRef = useRef<number>(0);
  const interactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    setVhInPixels(window.innerHeight / 100);
  }, []);

  // Keep vhInPixels in sync with viewport height changes
  useEffect(() => {
    const onResize = () => setVhInPixels(window.innerHeight / 100);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onSelectionChangeRef = useRef(onSelectionChange);
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  });

  const onIdeaSelectRef = useRef(onIdeaSelect);
  useEffect(() => {
    onIdeaSelectRef.current = onIdeaSelect;
  });

  useEffect(() => {
    if (!onSelectionChangeRef.current) return;
    onSelectionChangeRef.current(selectedIds.size, totalIdeas);
  }, [selectedIds.size, totalIdeas]);

  useEffect(() => {
    if (pendingSelection) {
      onIdeaSelectRef.current?.(
        pendingSelection.ideaId,
        pendingSelection.isSelected
      );
      setPendingSelection(null);
    }
  }, [pendingSelection]);

  useEffect(() => {
    if (isUserInteracting) return;

    const effectiveInterval =
      autoPlayInterval / SLIDER_CONFIG.AUTO_SCROLL_SPEED_MULTIPLIER;

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
      if (!isTransitioning) {
        scheduleTransition(() =>
          setCurrentIndex((prev) => (prev + 1) % totalIdeas)
        );
      }
    }, effectiveInterval);

    return () => clearInterval(interval);
  }, [autoPlayInterval, totalIdeas, isUserInteracting, isTransitioning]);

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

  const handleCenterCardClick = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (isDragging) {
        event.preventDefault();
        return;
      }

      const now = Date.now();
      const ideaId = currentIndex + 1;

      if (
        lastCenterTap &&
        now - lastCenterTap < SLIDER_CONFIG.DOUBLE_TAP_THRESHOLD_MS
      ) {
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          const wasSelected = newSet.has(ideaId);
          if (wasSelected) newSet.delete(ideaId);
          else newSet.add(ideaId);
          setPendingSelection({ ideaId, isSelected: !wasSelected });
          return newSet;
        });
        setLastCenterTap(null);
      } else {
        setLastCenterTap(now);
      }
    },
    [currentIndex, lastCenterTap, isDragging]
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
            setCurrentIndex((prev) => (prev === 0 ? totalIdeas - 1 : prev - 1));
          } else {
            setCurrentIndex((prev) => (prev + 1) % totalIdeas);
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
    [totalIdeas, isTransitioning, handleInteractionEnd]
  );

  const handlers = useMemo(
    () => ({
      handleInteractionStart,
      handleInteractionEnd,
      handleCenterCardClick,
      handleSideCardClick,
      handleDragStart,
      handleDrag,
      handleDragEnd,
      toggleCenterSelection: () => {
        const ideaId = currentIndex + 1;
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          const wasSelected = newSet.has(ideaId);
          if (wasSelected) newSet.delete(ideaId);
          else newSet.add(ideaId);
          setPendingSelection({ ideaId, isSelected: !wasSelected });
          return newSet;
        });
      },
    }),
    [
      handleInteractionStart,
      handleInteractionEnd,
      handleCenterCardClick,
      handleSideCardClick,
      handleDragStart,
      handleDrag,
      handleDragEnd,
      currentIndex,
    ]
  );

  return {
    currentIndex,
    selectedIds,
    isUserInteracting,
    isTransitioning,
    isDragging,
    dragOffset,
    vhInPixels,
    handlers,
  };
};
