/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

import { renderHook, act } from '@testing-library/react';
import { useSparkFullscreen } from '../../../src/components/SparkSlider/useSparkFullscreen';
import { SLIDER_CONFIG } from '../../../src/components/SparkSlider/config';

// Mock computeSwipeTarget
jest.mock('../../../src/components/SparkSlider/useSparkSlider', () => ({
  computeSwipeTarget: jest.fn(),
}));

import { computeSwipeTarget } from '../../../src/components/SparkSlider/useSparkSlider';
const mockComputeSwipeTarget = computeSwipeTarget as jest.MockedFunction<
  typeof computeSwipeTarget
>;

describe('useSparkFullscreen', () => {
  const mockHandlers = {
    handleSideCardClick: jest.fn(),
  };

  const defaultOptions = {
    currentIndex: 1,
    totalSlides: 5,
    isDragging: false,
    handlers: mockHandlers,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useSparkFullscreen(defaultOptions));

      expect(result.current.fullscreenIndex).toBe(null);
      expect(result.current.isFullscreenDragging).toBe(false);
      expect(result.current.lastCenterDragAtRef.current).toBe(0);
    });
  });

  describe('openFullscreenAt', () => {
    it('should open fullscreen at specified index', () => {
      const { result } = renderHook(() => useSparkFullscreen(defaultOptions));

      act(() => {
        result.current.openFullscreenAt(2);
      });

      expect(result.current.fullscreenIndex).toBe(2);
    });

    it('should not open fullscreen when isDragging is true', () => {
      const { result } = renderHook(() =>
        useSparkFullscreen({ ...defaultOptions, isDragging: true })
      );

      act(() => {
        result.current.openFullscreenAt(2);
      });

      expect(result.current.fullscreenIndex).toBe(null);
    });

    it('should respect FULLSCREEN_EXIT_COOLDOWN_MS', () => {
      const { result } = renderHook(() => useSparkFullscreen(defaultOptions));

      // First, exit fullscreen to set the cooldown
      act(() => {
        result.current.openFullscreenAt(1);
      });

      act(() => {
        result.current.exitFullscreen();
      });

      // Advance time by less than cooldown period
      act(() => {
        jest.advanceTimersByTime(
          SLIDER_CONFIG.FULLSCREEN_EXIT_COOLDOWN_MS - 10
        );
      });

      // Try to open again - should be blocked
      act(() => {
        result.current.openFullscreenAt(2);
      });

      expect(result.current.fullscreenIndex).toBe(null);

      // Advance time past cooldown period
      act(() => {
        jest.advanceTimersByTime(20);
      });

      // Now it should work
      act(() => {
        result.current.openFullscreenAt(2);
      });

      expect(result.current.fullscreenIndex).toBe(2);
    });

    it('should respect SWIPE_COOLDOWN_MS from lastCenterDragAtRef', () => {
      const { result } = renderHook(() => useSparkFullscreen(defaultOptions));

      // Simulate a recent drag
      act(() => {
        result.current.lastCenterDragAtRef.current = Date.now();
      });

      // Try to open fullscreen immediately - should be blocked
      act(() => {
        result.current.openFullscreenAt(2);
      });

      expect(result.current.fullscreenIndex).toBe(null);

      // Advance time past swipe cooldown
      act(() => {
        jest.advanceTimersByTime(SLIDER_CONFIG.SWIPE_COOLDOWN_MS + 10);
      });

      // Now it should work
      act(() => {
        result.current.openFullscreenAt(2);
      });

      expect(result.current.fullscreenIndex).toBe(2);
    });
  });

  describe('exitFullscreen', () => {
    it('should close fullscreen without navigation when no targetIndex', () => {
      const { result } = renderHook(() => useSparkFullscreen(defaultOptions));

      // Open fullscreen first
      act(() => {
        result.current.openFullscreenAt(2);
      });

      expect(result.current.fullscreenIndex).toBe(2);

      // Exit without navigation
      act(() => {
        result.current.exitFullscreen();
      });

      expect(result.current.fullscreenIndex).toBe(null);
      expect(mockHandlers.handleSideCardClick).not.toHaveBeenCalled();
    });

    it('should close fullscreen and navigate when targetIndex provided', () => {
      const { result } = renderHook(() => useSparkFullscreen(defaultOptions));

      // Open fullscreen first
      act(() => {
        result.current.openFullscreenAt(2);
      });

      // Exit with navigation
      act(() => {
        result.current.exitFullscreen(3);
      });

      expect(result.current.fullscreenIndex).toBe(null);
      expect(mockHandlers.handleSideCardClick).toHaveBeenCalledWith(3);
    });
  });

  describe('fullscreenHandlers', () => {
    describe('onDragStart', () => {
      it('should set isFullscreenDragging to true', () => {
        const { result } = renderHook(() => useSparkFullscreen(defaultOptions));

        act(() => {
          result.current.fullscreenHandlers.onDragStart();
        });

        expect(result.current.isFullscreenDragging).toBe(true);
      });
    });

    describe('onDragEnd', () => {
      const mockInfo = {
        offset: { x: 100, y: 0 },
        velocity: { x: 0, y: 0 },
        point: { x: 0, y: 0 },
      };

      beforeEach(() => {
        mockComputeSwipeTarget.mockReturnValue(3);
      });

      it('should exit fullscreen and navigate on valid swipe', () => {
        const { result } = renderHook(() => useSparkFullscreen(defaultOptions));

        // Open fullscreen first
        act(() => {
          result.current.openFullscreenAt(2);
        });

        // Simulate drag end with swipe
        act(() => {
          result.current.fullscreenHandlers.onDragEnd(
            {} as MouseEvent,
            mockInfo as any
          );
        });

        expect(result.current.fullscreenIndex).toBe(null);
        expect(result.current.isFullscreenDragging).toBe(false);
        expect(mockHandlers.handleSideCardClick).toHaveBeenCalledWith(3);
        expect(mockComputeSwipeTarget).toHaveBeenCalledWith(100, 2, 5);
      });

      it('should only reset dragging state when swipe is invalid', () => {
        mockComputeSwipeTarget.mockReturnValue(null);
        const { result } = renderHook(() => useSparkFullscreen(defaultOptions));

        // Open fullscreen and start dragging
        act(() => {
          result.current.openFullscreenAt(2);
          result.current.fullscreenHandlers.onDragStart();
        });

        // Simulate drag end without valid swipe
        act(() => {
          result.current.fullscreenHandlers.onDragEnd(
            {} as MouseEvent,
            mockInfo as any
          );
        });

        expect(result.current.fullscreenIndex).toBe(2); // Still open
        expect(result.current.isFullscreenDragging).toBe(false); // But not dragging
        expect(mockHandlers.handleSideCardClick).not.toHaveBeenCalled();
      });

      it('should do nothing when fullscreenIndex is null', () => {
        const { result } = renderHook(() => useSparkFullscreen(defaultOptions));

        // Don't open fullscreen, just try to drag
        act(() => {
          result.current.fullscreenHandlers.onDragEnd(
            {} as MouseEvent,
            mockInfo as any
          );
        });

        expect(result.current.isFullscreenDragging).toBe(false);
        expect(mockHandlers.handleSideCardClick).not.toHaveBeenCalled();
      });
    });

    describe('onClick', () => {
      it('should exit fullscreen when clicked', () => {
        const { result } = renderHook(() => useSparkFullscreen(defaultOptions));

        // Open fullscreen first
        act(() => {
          result.current.openFullscreenAt(2);
        });

        // Click to exit
        act(() => {
          result.current.fullscreenHandlers.onClick();
        });

        expect(result.current.fullscreenIndex).toBe(null);
        expect(mockHandlers.handleSideCardClick).not.toHaveBeenCalled();
      });

      it('should do nothing when dragging', () => {
        const { result } = renderHook(() => useSparkFullscreen(defaultOptions));

        // Open fullscreen and start dragging
        act(() => {
          result.current.openFullscreenAt(2);
          result.current.fullscreenHandlers.onDragStart();
        });

        // Try to click - should be ignored
        act(() => {
          result.current.fullscreenHandlers.onClick();
        });

        expect(result.current.fullscreenIndex).toBe(2); // Still open
      });

      it('should do nothing when fullscreenIndex is null', () => {
        const { result } = renderHook(() => useSparkFullscreen(defaultOptions));

        // Try to click without opening fullscreen
        act(() => {
          result.current.fullscreenHandlers.onClick();
        });

        // Should not crash or call handlers
        expect(mockHandlers.handleSideCardClick).not.toHaveBeenCalled();
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete open -> drag -> close cycle', () => {
      mockComputeSwipeTarget.mockReturnValue(4);
      const { result } = renderHook(() => useSparkFullscreen(defaultOptions));

      // Open fullscreen
      act(() => {
        result.current.openFullscreenAt(1);
      });
      expect(result.current.fullscreenIndex).toBe(1);

      // Start dragging
      act(() => {
        result.current.fullscreenHandlers.onDragStart();
      });
      expect(result.current.isFullscreenDragging).toBe(true);

      // Complete drag with navigation
      act(() => {
        result.current.fullscreenHandlers.onDragEnd(
          {} as MouseEvent,
          { offset: { x: 150, y: 0 } } as any
        );
      });

      expect(result.current.fullscreenIndex).toBe(null);
      expect(result.current.isFullscreenDragging).toBe(false);
      expect(mockHandlers.handleSideCardClick).toHaveBeenCalledWith(4);
    });
  });
});
