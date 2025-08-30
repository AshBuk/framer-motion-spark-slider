/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

import { renderHook, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import { useSparkKeyboard } from '../../../src/components/SparkSlider/useSparkKeyboard';

describe('useSparkKeyboard', () => {
  const mockNavigateTo = jest.fn();
  const mockOpenFullscreenAt = jest.fn();
  const mockExitFullscreen = jest.fn();
  const mockOnInteractionStart = jest.fn();
  const mockOnInteractionEnd = jest.fn();
  const mockIsTypingInFormField = jest.fn();

  const defaultOptions = {
    currentIndex: 1,
    totalSlides: 5,
    isFullscreen: false,
    openFullscreenAt: mockOpenFullscreenAt,
    navigateTo: mockNavigateTo,
    onInteractionStart: mockOnInteractionStart,
    onInteractionEnd: mockOnInteractionEnd,
    exitFullscreen: mockExitFullscreen,
    isTypingInFormField: mockIsTypingInFormField,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset DOM
    document.body.innerHTML = '';
    // Reset activeElement mock
    Object.defineProperty(document, 'activeElement', {
      value: document.body,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Clean up any event listeners
    document.removeEventListener('keydown', jest.fn());
  });

  describe('initialization', () => {
    it('should add keydown event listener on mount', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      renderHook(() => useSparkKeyboard(defaultOptions));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });

    it('should remove keydown event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(
        document,
        'removeEventListener'
      );
      const { unmount } = renderHook(() => useSparkKeyboard(defaultOptions));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });
  });

  describe('form field detection', () => {
    it('should ignore keys when focused on input element', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);

      renderHook(() => useSparkKeyboard(defaultOptions));

      // Mock activeElement to simulate focus
      Object.defineProperty(document, 'activeElement', {
        value: input,
        writable: true,
        configurable: true,
      });

      act(() => {
        fireEvent.keyDown(document, { key: 'ArrowRight' });
      });

      expect(mockNavigateTo).not.toHaveBeenCalled();
      expect(mockOnInteractionStart).not.toHaveBeenCalled();
    });

    it('should ignore keys when focused on textarea element', () => {
      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);

      renderHook(() => useSparkKeyboard(defaultOptions));

      // Mock activeElement to simulate focus
      Object.defineProperty(document, 'activeElement', {
        value: textarea,
        writable: true,
        configurable: true,
      });

      act(() => {
        fireEvent.keyDown(document, { key: 'ArrowLeft' });
      });

      expect(mockNavigateTo).not.toHaveBeenCalled();
    });

    it('should ignore keys when focused on select element', () => {
      const select = document.createElement('select');
      document.body.appendChild(select);

      renderHook(() => useSparkKeyboard(defaultOptions));

      // Mock activeElement to simulate focus
      Object.defineProperty(document, 'activeElement', {
        value: select,
        writable: true,
        configurable: true,
      });

      act(() => {
        fireEvent.keyDown(document, { key: 'Enter' });
      });

      expect(mockOpenFullscreenAt).not.toHaveBeenCalled();
    });

    it('should ignore keys when focused on contentEditable element', () => {
      const div = document.createElement('div');
      div.contentEditable = 'true';
      div.tabIndex = 0; // Make it focusable
      document.body.appendChild(div);

      renderHook(() => useSparkKeyboard(defaultOptions));

      // Mock both contentEditable and isContentEditable properties
      Object.defineProperty(div, 'isContentEditable', {
        value: true,
        writable: false,
        configurable: true,
      });

      // Mock activeElement to simulate focus
      Object.defineProperty(document, 'activeElement', {
        value: div,
        writable: true,
        configurable: true,
      });

      act(() => {
        fireEvent.keyDown(document, { key: 'ArrowRight' });
      });

      expect(mockNavigateTo).not.toHaveBeenCalled();
    });

    it('should use custom isTypingInFormField function when provided', () => {
      mockIsTypingInFormField.mockReturnValue(true);

      renderHook(() => useSparkKeyboard(defaultOptions));

      act(() => {
        fireEvent.keyDown(document, { key: 'ArrowRight' });
      });

      expect(mockIsTypingInFormField).toHaveBeenCalled();
      expect(mockNavigateTo).not.toHaveBeenCalled();
    });
  });
});
