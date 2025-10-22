/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

'use client';

import { useEffect, useCallback } from 'react';

/**
 * Options for {@link useSparkKeyboard} hook.
 */
interface UseSparkKeyboardOptions {
  currentIndex: number;
  totalSlides: number;
  isFullscreen: boolean;
  isTypingInFormField?: () => boolean;
  openFullscreenAt: (index: number) => void;
  navigateTo: (index: number) => void;
  onInteractionStart: () => void;
  onInteractionEnd: () => void;
  exitFullscreen: () => void;
}

/**
 * Global keyboard controller for Spark slider.
 *
 * @remarks
 * - Attaches a `keydown` listener on `document` to handle arrows and Enter/Escape.
 * - Skips handling while user types in standard form fields.
 *
 * @param options - {@link UseSparkKeyboardOptions}
 */
export function useSparkKeyboard({
  currentIndex,
  totalSlides,
  isFullscreen,
  isTypingInFormField,
  openFullscreenAt,
  navigateTo,
  onInteractionStart,
  onInteractionEnd,
  exitFullscreen,
}: UseSparkKeyboardOptions) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      // Ignore text entry contexts
      const active = document.activeElement as HTMLElement | null;
      const isTyping =
        isTypingInFormField?.() ||
        !!(
          active &&
          (active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.tagName === 'SELECT' ||
            active.isContentEditable)
        );
      if (isTyping) return;

      // Handle fullscreen keys (Enter/Escape)
      if (isFullscreen) {
        if (e.key === 'Escape' || e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          exitFullscreen();
          return;
        }
        return;
      }

      if (e.key === 'Enter') {
        openFullscreenAt(currentIndex);
        e.preventDefault();
        return;
      }

      if (totalSlides < 2) return;
      if (e.key === 'ArrowLeft') {
        onInteractionStart();
        const prev = currentIndex === 0 ? totalSlides - 1 : currentIndex - 1;
        navigateTo(prev);
        onInteractionEnd();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        onInteractionStart();
        const next = (currentIndex + 1) % totalSlides;
        navigateTo(next);
        onInteractionEnd();
        e.preventDefault();
      }
    },
    [
      currentIndex,
      totalSlides,
      isFullscreen,
      isTypingInFormField,
      openFullscreenAt,
      navigateTo,
      onInteractionStart,
      onInteractionEnd,
      exitFullscreen,
    ]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);
}
