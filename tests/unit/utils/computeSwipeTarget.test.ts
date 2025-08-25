/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

import { computeSwipeTarget } from '@ashbuk/spark-slider';

describe('computeSwipeTarget', () => {
  describe('basic functionality', () => {
    test('returns null when total slides is less than 2', () => {
      expect(computeSwipeTarget(100, 0, 1)).toBe(null);
      expect(computeSwipeTarget(-100, 0, 0)).toBe(null);
    });

    test('returns null when offset is below threshold', () => {
      expect(computeSwipeTarget(0, 0, 5)).toBe(null);
      expect(computeSwipeTarget(10, 0, 5)).toBe(null);
      expect(computeSwipeTarget(-10, 0, 5)).toBe(null);
      expect(computeSwipeTarget(49, 0, 5)).toBe(null);
      expect(computeSwipeTarget(-49, 0, 5)).toBe(null);
    });
  });

  describe('navigation logic', () => {
    test('positive offset (drag right) goes to previous slide', () => {
      expect(computeSwipeTarget(60, 2, 5)).toBe(1);
      expect(computeSwipeTarget(100, 3, 5)).toBe(2);
    });

    test('negative offset (drag left) goes to next slide', () => {
      expect(computeSwipeTarget(-60, 2, 5)).toBe(3);
      expect(computeSwipeTarget(-100, 1, 5)).toBe(2);
    });
  });

  describe('wrapping behavior', () => {
    test('wraps from first slide to last when going previous', () => {
      expect(computeSwipeTarget(60, 0, 5)).toBe(4);
      expect(computeSwipeTarget(100, 0, 3)).toBe(2);
    });

    test('wraps from last slide to first when going next', () => {
      expect(computeSwipeTarget(-60, 4, 5)).toBe(0);
      expect(computeSwipeTarget(-100, 2, 3)).toBe(0);
    });
  });

  describe('edge cases', () => {
    test('handles exactly threshold values', () => {
      expect(computeSwipeTarget(51, 1, 3)).toBe(0);
      expect(computeSwipeTarget(-51, 1, 3)).toBe(2);
    });

    test('handles large offset values', () => {
      expect(computeSwipeTarget(1000, 2, 4)).toBe(1);
      expect(computeSwipeTarget(-1000, 2, 4)).toBe(3);
    });

    test('works with minimum valid slide count', () => {
      expect(computeSwipeTarget(60, 0, 2)).toBe(1);
      expect(computeSwipeTarget(-60, 0, 2)).toBe(1);
      expect(computeSwipeTarget(60, 1, 2)).toBe(0);
      expect(computeSwipeTarget(-60, 1, 2)).toBe(0);
    });
  });
});
