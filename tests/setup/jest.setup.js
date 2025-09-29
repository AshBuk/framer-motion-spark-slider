/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

import '@testing-library/jest-dom';

// Mock Framer Motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  motion: {
    div: ({
      children,
      onDragStart,
      onDrag,
      onDragEnd,
      onClick,
      // Filter out Framer Motion props to avoid React warnings
      animate: _animate,
      initial: _initial,
      exit: _exit,
      transition: _transition,
      whileTap: _whileTap,
      whileHover: _whileHover,
      drag: _drag,
      dragConstraints: _dragConstraints,
      dragElastic: _dragElastic,
      dragMomentum: _dragMomentum,
      dragTransition: _dragTransition,
      layout: _layout,
      layoutId: _layoutId,
      style,
      variants: _variants,
      custom: _custom,
      ...domProps
    }) => {
      // Forward event handlers for testing
      const handleMouseDown = (e) => {
        if (onDragStart) onDragStart(e);
      };
      const handleMouseMove = (e) => {
        if (onDrag) onDrag(e, { offset: { x: 0, y: 0 } });
      };
      const handleMouseUp = (e) => {
        if (onDragEnd) onDragEnd(e, { offset: { x: 0, y: 0 } });
      };

      // Enhanced click handler to simulate proper Framer Motion behavior
      const handleClick = (e) => {
        // Don't trigger onClick if we've detected a drag
        if (onClick) {
          onClick(e);
        }
      };

      return (
        <div
          {...domProps}
          style={style}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
        >
          {children}
        </div>
      );
    },
    img: 'img',
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window viewport dimensions
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

// Suppress console warnings and errors in tests
const originalWarn = console.warn;
const originalError = console.error;

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
