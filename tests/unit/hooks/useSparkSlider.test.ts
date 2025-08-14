import { renderHook, act } from '@testing-library/react';
import { useSparkSlider } from '@ashbuk/spark-slider';

// Mock timers for autoplay tests
jest.useFakeTimers();

describe('useSparkSlider', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe('initial state', () => {
    test('initializes with correct default values', () => {
      const { result } = renderHook(() =>
        useSparkSlider({ totalSlides: 5, autoPlayInterval: 1000 })
      );

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.isTransitioning).toBe(false);
      expect(result.current.isDragging).toBe(false);
      expect(result.current.dragOffset).toBe(0);
      expect(result.current.vminInPixels).toBe(7.68); // min(1024, 768) / 100
      expect(result.current.handlers).toBeDefined();
    });
  });

  describe('autoplay functionality', () => {
    test('advances to next slide after interval', () => {
      const { result } = renderHook(() =>
        useSparkSlider({ totalSlides: 3, autoPlayInterval: 1000 })
      );

      expect(result.current.currentIndex).toBe(0);

      act(() => {
        jest.advanceTimersByTime(1050); // interval + transition delay
      });

      expect(result.current.currentIndex).toBe(1);
    });

    test('wraps to first slide after last slide', () => {
      const { result } = renderHook(() =>
        useSparkSlider({ totalSlides: 3, autoPlayInterval: 1000 })
      );

      // Advance to last slide (index 2)
      act(() => {
        jest.advanceTimersByTime(1000); // First interval
      });
      expect(result.current.currentIndex).toBe(0); // Still transitioning

      act(() => {
        jest.advanceTimersByTime(350); // Complete first transition (50 + 300)
      });
      expect(result.current.currentIndex).toBe(1);

      act(() => {
        jest.advanceTimersByTime(1000); // Second interval
      });
      act(() => {
        jest.advanceTimersByTime(350); // Complete second transition
      });
      expect(result.current.currentIndex).toBe(2);

      // Should wrap to first slide
      act(() => {
        jest.advanceTimersByTime(1000); // Third interval
      });
      act(() => {
        jest.advanceTimersByTime(350); // Complete wrap transition
      });
      expect(result.current.currentIndex).toBe(0);
    });

    test('pauses autoplay during user interaction', () => {
      const { result } = renderHook(() =>
        useSparkSlider({ totalSlides: 3, autoPlayInterval: 1000 })
      );

      act(() => {
        result.current.handlers.handleInteractionStart();
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Should remain at index 0 because autoplay is paused
      expect(result.current.currentIndex).toBe(0);
    });

    test('resumes autoplay after interaction ends', () => {
      const { result } = renderHook(() =>
        useSparkSlider({ totalSlides: 3, autoPlayInterval: 1000 })
      );

      act(() => {
        result.current.handlers.handleInteractionStart();
        jest.advanceTimersByTime(500);
        result.current.handlers.handleInteractionEnd();
      });

      act(() => {
        jest.advanceTimersByTime(1050);
      });

      expect(result.current.currentIndex).toBe(1);
    });

    test('does not autoplay with single slide', () => {
      const { result } = renderHook(() =>
        useSparkSlider({ totalSlides: 1, autoPlayInterval: 1000 })
      );

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.currentIndex).toBe(0);
    });

    test('does not autoplay when interval is 0', () => {
      const { result } = renderHook(() =>
        useSparkSlider({ totalSlides: 3, autoPlayInterval: 0 })
      );

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.currentIndex).toBe(0);
    });
  });

  describe('manual navigation', () => {
    test('handleSideCardClick navigates to specific index', () => {
      const { result } = renderHook(() =>
        useSparkSlider({ totalSlides: 5, autoPlayInterval: 1000 })
      );

      act(() => {
        result.current.handlers.handleSideCardClick(3);
      });

      act(() => {
        jest.advanceTimersByTime(350); // transition delay + duration
      });

      expect(result.current.currentIndex).toBe(3);
    });

    test('ignores navigation during transition', () => {
      const { result } = renderHook(() =>
        useSparkSlider({ totalSlides: 5, autoPlayInterval: 1000 })
      );

      // Start first navigation
      act(() => {
        result.current.handlers.handleSideCardClick(2);
      });

      // Verify transition started
      expect(result.current.isTransitioning).toBe(true);

      // Try to navigate again during transition - should be ignored
      act(() => {
        result.current.handlers.handleSideCardClick(4);
      });

      // Complete the transition
      act(() => {
        jest.advanceTimersByTime(350); // delay + duration
      });

      // Should only go to the first clicked index, second click ignored
      expect(result.current.currentIndex).toBe(2);
      expect(result.current.isTransitioning).toBe(false);
    });
  });

  describe('drag functionality', () => {
    test('handleDragStart sets dragging state', () => {
      const { result } = renderHook(() =>
        useSparkSlider({ totalSlides: 3, autoPlayInterval: 1000 })
      );

      act(() => {
        result.current.handlers.handleDragStart();
      });

      expect(result.current.isDragging).toBe(true);
      expect(result.current.dragOffset).toBe(0);
    });

    test('handleDrag updates drag offset', () => {
      const { result } = renderHook(() =>
        useSparkSlider({ totalSlides: 3, autoPlayInterval: 1000 })
      );

      const mockPanInfo = {
        offset: { x: 50, y: 0 },
        delta: { x: 10, y: 0 },
        velocity: { x: 0, y: 0 },
        point: { x: 0, y: 0 },
      };

      // Start drag first
      act(() => {
        result.current.handlers.handleDragStart();
      });

      // Verify drag started
      expect(result.current.isDragging).toBe(true);

      // Now update drag offset
      act(() => {
        result.current.handlers.handleDrag({} as any, mockPanInfo);
      });

      expect(result.current.isDragging).toBe(true);
      expect(result.current.dragOffset).toBe(50);
    });

    test('handleDragEnd navigates on sufficient offset', () => {
      const { result } = renderHook(() =>
        useSparkSlider({ totalSlides: 3, autoPlayInterval: 1000 })
      );

      const mockPanInfo = {
        offset: { x: -100, y: 0 }, // Drag left (next)
        delta: { x: -100, y: 0 },
        velocity: { x: 0, y: 0 },
        point: { x: 0, y: 0 },
      };

      act(() => {
        result.current.handlers.handleDragStart();
        result.current.handlers.handleDragEnd({} as any, mockPanInfo);
      });

      act(() => {
        jest.advanceTimersByTime(350);
      });

      expect(result.current.currentIndex).toBe(1);
      expect(result.current.isDragging).toBe(false);
      expect(result.current.dragOffset).toBe(0);
    });

    test('handleDragEnd does not navigate on insufficient offset', () => {
      const { result } = renderHook(() =>
        useSparkSlider({ totalSlides: 3, autoPlayInterval: 1000 })
      );

      const mockPanInfo = {
        offset: { x: -30, y: 0 }, // Below threshold
        delta: { x: -30, y: 0 },
        velocity: { x: 0, y: 0 },
        point: { x: 0, y: 0 },
      };

      act(() => {
        result.current.handlers.handleDragStart();
        result.current.handlers.handleDragEnd({} as any, mockPanInfo);
      });

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.isDragging).toBe(false);
    });

    test('drag right goes to previous slide', () => {
      const { result } = renderHook(() =>
        useSparkSlider({ totalSlides: 3, autoPlayInterval: 1000 })
      );

      // Start at index 1
      act(() => {
        result.current.handlers.handleSideCardClick(1);
        jest.advanceTimersByTime(350);
      });

      const mockPanInfo = {
        offset: { x: 100, y: 0 }, // Drag right (previous)
        delta: { x: 100, y: 0 },
        velocity: { x: 0, y: 0 },
        point: { x: 0, y: 0 },
      };

      act(() => {
        result.current.handlers.handleDragStart();
        result.current.handlers.handleDragEnd({} as any, mockPanInfo);
        jest.advanceTimersByTime(350);
      });

      expect(result.current.currentIndex).toBe(0);
    });

    test('drag wraps around at boundaries', () => {
      const { result } = renderHook(() =>
        useSparkSlider({ totalSlides: 3, autoPlayInterval: 1000 })
      );

      // Test wrap from first to last
      const mockPanInfoRight = {
        offset: { x: 100, y: 0 },
        delta: { x: 100, y: 0 },
        velocity: { x: 0, y: 0 },
        point: { x: 0, y: 0 },
      };

      act(() => {
        result.current.handlers.handleDragStart();
        result.current.handlers.handleDragEnd({} as any, mockPanInfoRight);
        jest.advanceTimersByTime(350);
      });

      expect(result.current.currentIndex).toBe(2); // Wrapped to last
    });
  });

  describe('viewport size tracking', () => {
    test('updates vminInPixels on resize', () => {
      const { result } = renderHook(() =>
        useSparkSlider({ totalSlides: 3, autoPlayInterval: 1000 })
      );

      expect(result.current.vminInPixels).toBe(7.68); // min(1024, 768) / 100

      act(() => {
        // Mock window resize
        Object.defineProperty(window, 'innerWidth', { value: 800 });
        Object.defineProperty(window, 'innerHeight', { value: 600 });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.vminInPixels).toBe(6); // min(800, 600) / 100
    });
  });

  describe('interaction timing', () => {
    test('prevents rapid interactions with cooldown', () => {
      const { result } = renderHook(() =>
        useSparkSlider({ totalSlides: 3, autoPlayInterval: 1000 })
      );

      const mockPanInfo = {
        offset: { x: -100, y: 0 },
        delta: { x: -100, y: 0 },
        velocity: { x: 0, y: 0 },
        point: { x: 0, y: 0 },
      };

      // First drag
      act(() => {
        result.current.handlers.handleDragStart();
        result.current.handlers.handleDragEnd({} as any, mockPanInfo);
        jest.advanceTimersByTime(50); // Less than cooldown
      });

      // Second drag immediately (should be ignored due to cooldown)
      act(() => {
        result.current.handlers.handleDragStart();
        result.current.handlers.handleDragEnd({} as any, mockPanInfo);
        jest.advanceTimersByTime(350);
      });

      // Should only advance once
      expect(result.current.currentIndex).toBe(1);
    });
  });
});
