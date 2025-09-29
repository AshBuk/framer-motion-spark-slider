/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

import { renderHook } from '@testing-library/react';
import { useSparkTransforms } from '../../../src/components/SparkSlider/useSparkTransforms';
import { SLIDER_CONFIG } from '../../../src/components/SparkSlider/config';

describe('useSparkTransforms', () => {
  const defaultOptions = {
    totalSlides: 5,
    isDragging: false,
    dragOffset: 0,
    vminInPixels: 8, // Example: min(1200, 800) / 100 = 8
  };

  describe('getCardPosition', () => {
    it('should return correct position for center card', () => {
      const { result } = renderHook(() => useSparkTransforms(defaultOptions));

      expect(result.current.getCardPosition(2, 2)).toBe('center');
      expect(result.current.getCardPosition(0, 0)).toBe('center');
      expect(result.current.getCardPosition(4, 4)).toBe('center');
    });

    it('should return correct position for adjacent cards', () => {
      const { result } = renderHook(() => useSparkTransforms(defaultOptions));

      // Current index 2, check adjacent cards
      expect(result.current.getCardPosition(1, 2)).toBe('left');
      expect(result.current.getCardPosition(3, 2)).toBe('right');
    });

    it('should return correct position for far cards', () => {
      const { result } = renderHook(() => useSparkTransforms(defaultOptions));

      // Current index 2, check far cards
      expect(result.current.getCardPosition(0, 2)).toBe('far-left');
      expect(result.current.getCardPosition(4, 2)).toBe('far-right');
    });

    it('should return hidden for distant cards', () => {
      const { result } = renderHook(() =>
        useSparkTransforms({ ...defaultOptions, totalSlides: 7 })
      );

      // With 7 slides, index 2 is current
      // Visible: far-left(0), left(1), center(2), right(3), far-right(4)
      // Hidden: 5, 6
      expect(result.current.getCardPosition(5, 2)).toBe('hidden');
      expect(result.current.getCardPosition(6, 2)).toBe('hidden');
    });

    it('should handle circular navigation correctly', () => {
      const { result } = renderHook(() => useSparkTransforms(defaultOptions));

      // Current index 0, check wrap-around
      expect(result.current.getCardPosition(4, 0)).toBe('left'); // Last slide is left of first
      expect(result.current.getCardPosition(3, 0)).toBe('far-left');
      expect(result.current.getCardPosition(1, 0)).toBe('right');
      expect(result.current.getCardPosition(2, 0)).toBe('far-right');
    });

    it('should handle edge case with minimal slides', () => {
      const { result } = renderHook(() =>
        useSparkTransforms({ ...defaultOptions, totalSlides: 2 })
      );

      expect(result.current.getCardPosition(0, 0)).toBe('center');
      expect(result.current.getCardPosition(1, 0)).toBe('left'); // Only other slide
    });
  });

  describe('getCardTransform without dragging', () => {
    it('should return correct transform for center position', () => {
      const { result } = renderHook(() => useSparkTransforms(defaultOptions));

      const transform = result.current.getCardTransform('center');
      const centerConfig = SLIDER_CONFIG.positions.center;

      expect(transform.x).toBe(
        `${centerConfig.xOffsetFactor * (SLIDER_CONFIG.CENTER_CARD_SIZE + SLIDER_CONFIG.SPACING_UNITS)}svmin`
      );
      expect(transform.scale).toBe(centerConfig.scale);
      expect(transform.opacity).toBe(centerConfig.opacity);
      expect(transform.filter).toBe(`blur(${centerConfig.blur}px)`);
      expect(transform.zIndex).toBe(centerConfig.zIndex);
    });

    it('should return correct transform for side positions', () => {
      const { result } = renderHook(() => useSparkTransforms(defaultOptions));

      const leftTransform = result.current.getCardTransform('left');
      const rightTransform = result.current.getCardTransform('right');
      const leftConfig = SLIDER_CONFIG.positions.left;
      const rightConfig = SLIDER_CONFIG.positions.right;

      // Check left
      expect(leftTransform.scale).toBe(leftConfig.scale);
      expect(leftTransform.opacity).toBe(leftConfig.opacity);
      expect(leftTransform.zIndex).toBe(leftConfig.zIndex);

      // Check right
      expect(rightTransform.scale).toBe(rightConfig.scale);
      expect(rightTransform.opacity).toBe(rightConfig.opacity);
      expect(rightTransform.zIndex).toBe(rightConfig.zIndex);
    });

    it('should apply responsive offset multiplier', () => {
      const smallViewport = { ...defaultOptions, vminInPixels: 4 }; // 400px min side
      const { result } = renderHook(() => useSparkTransforms(smallViewport));

      const transform = result.current.getCardTransform('left');
      const baseX =
        SLIDER_CONFIG.positions.left.xOffsetFactor *
        (SLIDER_CONFIG.SIDE_CARD_SIZE + SLIDER_CONFIG.SPACING_UNITS);

      // Should be clamped by responsive multiplier
      const expectedMultiplier = Math.max(
        SLIDER_CONFIG.OFFSET_RESPONSIVE.minMultiplier,
        Math.min(1, 400 / SLIDER_CONFIG.OFFSET_RESPONSIVE.breakpointPx)
      );

      expect(transform.x).toBe(`${baseX * expectedMultiplier}svmin`);
    });

    it('should enforce minimum side opacity', () => {
      const { result } = renderHook(() => useSparkTransforms(defaultOptions));

      const farLeftTransform = result.current.getCardTransform('far-left');
      const farRightTransform = result.current.getCardTransform('far-right');

      expect(farLeftTransform.opacity).toBeGreaterThanOrEqual(
        SLIDER_CONFIG.MIN_SIDE_OPACITY
      );
      expect(farRightTransform.opacity).toBeGreaterThanOrEqual(
        SLIDER_CONFIG.MIN_SIDE_OPACITY
      );
    });

    it('should never return negative blur', () => {
      const { result } = renderHook(() => useSparkTransforms(defaultOptions));

      const positions = [
        'center',
        'left',
        'right',
        'far-left',
        'far-right',
      ] as const;

      positions.forEach((position) => {
        const transform = result.current.getCardTransform(position);
        const filter = (transform as any).filter as string | undefined;
        const blurValue = parseFloat(
          filter?.match(/blur\((.+?)px\)/)?.[1] || '0'
        );
        expect(blurValue).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getCardTransform with dragging', () => {
    const draggingOptions = {
      ...defaultOptions,
      isDragging: true,
      dragOffset: 100, // Positive = dragging right
    };

    it('should apply drag effects to center card', () => {
      const { result } = renderHook(() => useSparkTransforms(draggingOptions));

      const normalTransform = result.current.getCardTransform('center');
      const baseConfig = SLIDER_CONFIG.positions.center;

      // Should be smaller and more transparent when dragging
      expect(normalTransform.scale).toBeLessThan(baseConfig.scale);
      expect(normalTransform.opacity).toBeLessThan(baseConfig.opacity);

      // Should have blur applied
      const filter = (normalTransform as any).filter as string | undefined;
      const blurValue = parseFloat(
        filter?.match(/blur\((.+?)px\)/)?.[1] || '0'
      );
      expect(blurValue).toBeGreaterThan(baseConfig.blur);
    });

    it('should apply drag effects to side cards moving toward center', () => {
      const { result } = renderHook(() => useSparkTransforms(draggingOptions));

      const leftTransform = result.current.getCardTransform('left'); // Moving toward center (drag right)
      const baseLeftConfig = SLIDER_CONFIG.positions.left;
      const centerConfig = SLIDER_CONFIG.positions.center;

      // Left card should become more like center card when dragging right
      expect(leftTransform.scale).toBeGreaterThan(baseLeftConfig.scale);
      expect(leftTransform.opacity).toBeGreaterThan(baseLeftConfig.opacity);

      // But not fully reach center values
      expect(leftTransform.scale).toBeLessThan(centerConfig.scale);
    });

    it('should not apply drag effects to side cards moving away from center', () => {
      const { result } = renderHook(() => useSparkTransforms(draggingOptions));

      const rightTransform = result.current.getCardTransform('right'); // Moving away from center
      const baseRightConfig = SLIDER_CONFIG.positions.right;

      // Right card should remain at base values when dragging right (moving away)
      expect(rightTransform.scale).toBe(baseRightConfig.scale);
      expect(rightTransform.opacity).toBe(baseRightConfig.opacity);
    });

    it('should handle negative drag offset correctly', () => {
      const leftDraggingOptions = {
        ...defaultOptions,
        isDragging: true,
        dragOffset: -100,
      };
      const { result } = renderHook(() =>
        useSparkTransforms(leftDraggingOptions)
      );

      const rightTransform = result.current.getCardTransform('right'); // Now moving toward center
      const baseRightConfig = SLIDER_CONFIG.positions.right;

      // Right card should enhance when dragging left (toward center)
      expect(rightTransform.scale).toBeGreaterThan(baseRightConfig.scale);
      expect(rightTransform.opacity).toBeGreaterThan(baseRightConfig.opacity);
    });

    it('should respect center card drag limits', () => {
      const extremeDragOptions = {
        ...defaultOptions,
        isDragging: true,
        dragOffset: 1000,
      };
      const { result } = renderHook(() =>
        useSparkTransforms(extremeDragOptions)
      );

      const centerTransform = result.current.getCardTransform('center');

      // Should not shrink below minimum
      expect(centerTransform.scale).toBeGreaterThanOrEqual(0.7);

      // Should not become fully transparent
      expect(centerTransform.opacity).toBeGreaterThanOrEqual(0.4);
    });
  });

  describe('dependency updates', () => {
    it('should update transforms when isDragging changes', () => {
      const { result, rerender } = renderHook(
        (props) => useSparkTransforms(props),
        { initialProps: defaultOptions }
      );

      const staticTransform = result.current.getCardTransform('center');

      // Change to dragging state
      rerender({ ...defaultOptions, isDragging: true, dragOffset: 50 });

      const draggingTransform = result.current.getCardTransform('center');

      // Should be different when dragging
      expect(draggingTransform.scale).not.toBe(staticTransform.scale);
      expect(draggingTransform.opacity).not.toBe(staticTransform.opacity);
    });

    it('should update transforms when dragOffset changes', () => {
      const { result, rerender } = renderHook(
        (props) => useSparkTransforms(props),
        {
          initialProps: { ...defaultOptions, isDragging: true, dragOffset: 50 },
        }
      );

      const smallDragTransform = result.current.getCardTransform('center');

      // Change drag offset
      rerender({ ...defaultOptions, isDragging: true, dragOffset: 150 });

      const largeDragTransform = result.current.getCardTransform('center');

      // Should be more affected with larger drag
      expect(Number(largeDragTransform.scale)).toBeLessThan(
        Number(smallDragTransform.scale)
      );
    });

    it('should update transforms when vminInPixels changes', () => {
      const { result, rerender } = renderHook(
        (props) => useSparkTransforms(props),
        { initialProps: defaultOptions }
      );

      const standardTransform = result.current.getCardTransform('left');

      // Change to smaller viewport
      rerender({ ...defaultOptions, vminInPixels: 3 }); // Very small viewport

      const smallViewportTransform = result.current.getCardTransform('left');

      // X offset should be different due to responsive multiplier
      expect(smallViewportTransform.x).not.toBe(standardTransform.x);
    });

    it('should update position calculation when totalSlides changes', () => {
      const { result, rerender } = renderHook(
        (props) => useSparkTransforms(props),
        { initialProps: defaultOptions }
      );

      const _position5Slides = result.current.getCardPosition(3, 1);

      // Change total slides
      rerender({ ...defaultOptions, totalSlides: 8 });

      const position8Slides = result.current.getCardPosition(3, 1);

      // Position relationships might change with different total slides
      expect(position8Slides).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle single slide scenario', () => {
      const singleSlideOptions = { ...defaultOptions, totalSlides: 1 };
      const { result } = renderHook(() =>
        useSparkTransforms(singleSlideOptions)
      );

      expect(result.current.getCardPosition(0, 0)).toBe('center');
    });

    it('should handle zero drag offset', () => {
      const { result } = renderHook(() =>
        useSparkTransforms({
          ...defaultOptions,
          isDragging: true,
          dragOffset: 0,
        })
      );

      const transform = result.current.getCardTransform('center');
      const baseConfig = SLIDER_CONFIG.positions.center;

      // Should be same as non-dragging when offset is zero
      expect(transform.scale).toBe(baseConfig.scale);
      expect(transform.opacity).toBe(baseConfig.opacity);
    });

    it('should handle very small vminInPixels', () => {
      const tinyOptions = { ...defaultOptions, vminInPixels: 0.1 };
      const { result } = renderHook(() => useSparkTransforms(tinyOptions));

      const transform = result.current.getCardTransform('left');

      // Should still return valid transform
      expect(transform.x).toMatch(/svmin$/);
      expect(transform.scale).toBeGreaterThan(0);
      expect(transform.opacity).toBeGreaterThan(0);
    });
  });
});
