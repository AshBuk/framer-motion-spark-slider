/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Custom render function for any future providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, options);

export * from '@testing-library/react';
export { customRender as render };

// Mock data generators for tests
export const generateMockImages = (count: number = 5): string[] =>
  Array.from({ length: count }, (_, i) => `/mock-image-${i + 1}.jpg`);

export const generateMockPanInfo = (
  offsetX: number = 0,
  offsetY: number = 0
) => ({
  offset: { x: offsetX, y: offsetY },
  delta: { x: offsetX, y: offsetY },
  velocity: { x: 0, y: 0 },
  point: { x: 0, y: 0 },
});

// Test helpers
export const waitForSliderTransition = () =>
  new Promise((resolve) => setTimeout(resolve, 400));

export const mockViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};
