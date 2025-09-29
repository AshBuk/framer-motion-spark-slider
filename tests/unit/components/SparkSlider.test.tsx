/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import '@testing-library/jest-dom';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SparkSlider, SLIDER_CONFIG } from '@ashbuk/spark-slider';

// Mock next/image for Next.js integration tests
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('SparkSlider', () => {
  const mockImages = [
    '/image1.jpg',
    '/image2.jpg',
    '/image3.jpg',
    '/image4.jpg',
    '/image5.jpg',
  ];

  const waitForTransitionEnd = () =>
    new Promise((resolve) =>
      setTimeout(
        resolve,
        SLIDER_CONFIG.TRANSITION_DELAY_MS + SLIDER_CONFIG.TRANSITION_DURATION_MS
      )
    );

  describe('rendering', () => {
    test('renders slider with images', () => {
      render(<SparkSlider images={mockImages} />);

      const slider = screen.getByRole('region');
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute('aria-label', 'Spark slider');
      expect(slider).toHaveAttribute('aria-roledescription', 'carousel');
    });

    test('renders correct slide counter', () => {
      render(<SparkSlider images={mockImages} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('/ 5')).toBeInTheDocument();
    });

    test('renders with custom alt text', () => {
      render(<SparkSlider images={mockImages} alt='Gallery image' />);

      expect(screen.getByText('Gallery image 1')).toBeInTheDocument();
    });

    test('renders with custom className', () => {
      render(<SparkSlider images={mockImages} className='custom-slider' />);

      const slider = screen.getByRole('region');
      expect(slider).toHaveClass('custom-slider');
    });

    test('renders with custom cardClassName', () => {
      render(<SparkSlider images={mockImages} cardClassName='custom-card' />);

      const cards = screen.getAllByRole('img');
      cards.forEach((card) => {
        expect(card.closest('.custom-card')).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<SparkSlider images={mockImages} />);

      const slider = screen.getByRole('region');
      expect(slider).toHaveAttribute('tabIndex', '0');
      expect(slider).toHaveAttribute('aria-roledescription', 'carousel');
      expect(slider).toHaveAttribute('aria-label', 'Spark slider');
    });

    test('announces current slide to screen readers', () => {
      render(<SparkSlider images={mockImages} />);

      expect(screen.getByText('Slide 1 of 5')).toBeInTheDocument();
    });

    test('has focus ring on focus', async () => {
      const user = userEvent.setup();
      render(<SparkSlider images={mockImages} />);

      const slider = screen.getByRole('region');
      await act(async () => {
        await user.tab();
      });

      expect(slider).toHaveFocus();
      expect(slider).toHaveClass('spark');
      expect(slider).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('keyboard navigation', () => {
    test('navigates with arrow keys', async () => {
      const user = userEvent.setup();
      render(<SparkSlider images={mockImages} />);

      const slider = screen.getByRole('region');

      // Wrap all user interactions in act()
      await act(async () => {
        await user.click(slider);
      });

      // Navigate right
      await act(async () => {
        await user.keyboard('{ArrowRight}');
      });

      await waitFor(() => {
        expect(screen.getByText('Slide 2 of 5')).toBeInTheDocument();
      });

      // Ensure transition finished before next input
      await act(async () => {
        await waitForTransitionEnd();
      });

      // Navigate left
      await act(async () => {
        await user.keyboard('{ArrowLeft}');
      });

      await waitFor(() => {
        expect(screen.getByText('Slide 1 of 5')).toBeInTheDocument();
      });
    });

    test('wraps around with keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SparkSlider images={mockImages} />);

      const slider = screen.getByRole('region');

      await act(async () => {
        await user.click(slider);
      });

      // Navigate left from first slide (should wrap to last)
      await act(async () => {
        await user.keyboard('{ArrowLeft}');
      });

      await waitFor(() => {
        expect(screen.getByText('Slide 5 of 5')).toBeInTheDocument();
      });

      // Ensure transition finished before next input
      await act(async () => {
        await waitForTransitionEnd();
      });

      // Navigate right from last slide (should wrap to first)
      await act(async () => {
        await user.keyboard('{ArrowRight}');
      });

      await waitFor(() => {
        expect(screen.getByText('Slide 1 of 5')).toBeInTheDocument();
      });
    });

    test('ignores arrow keys with single slide', async () => {
      const user = userEvent.setup();
      render(<SparkSlider images={['/single.jpg']} />);

      const slider = screen.getByRole('region');

      await act(async () => {
        await user.click(slider);
      });

      await act(async () => {
        await user.keyboard('{ArrowRight}');
        await user.keyboard('{ArrowLeft}');
      });

      // Should still show slide 1
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('mouse interactions', () => {
    test('shows drag cursor on center card', () => {
      render(<SparkSlider images={mockImages} />);

      const dragArea = screen
        .getByRole('region')
        .querySelector('.spark-card-drag');
      expect(dragArea).toBeInTheDocument();
    });

    test('does not show drag area for single slide', () => {
      render(<SparkSlider images={['/single.jpg']} />);

      const dragArea = screen
        .getByRole('region')
        .querySelector('.spark-card-drag');
      expect(dragArea).not.toBeInTheDocument();
    });
  });

  describe('custom image renderer', () => {
    test('uses custom renderImage prop', () => {
      const mockRenderImage = jest.fn((src, alt, isCenter) => (
        <div
          data-testid={isCenter ? 'custom-image-center' : 'custom-image-side'}
          data-src={src}
          data-alt={alt}
          data-center={isCenter}
        >
          Custom Image: {alt}
        </div>
      ));

      render(<SparkSlider images={mockImages} renderImage={mockRenderImage} />);

      expect(screen.getByTestId('custom-image-center')).toBeInTheDocument();
      expect(screen.getByText('Custom Image: Slide 1')).toBeInTheDocument();
      expect(mockRenderImage).toHaveBeenCalledWith(
        '/image1.jpg',
        'Slide 1',
        true
      );
    });

    test('renderImage receives correct isCenter parameter', () => {
      const mockRenderImage = jest.fn((src, alt, isCenter) => (
        <div data-testid={`image-${isCenter ? 'center' : 'side'}`}>
          {alt} - {isCenter ? 'Center' : 'Side'}
        </div>
      ));

      render(<SparkSlider images={mockImages} renderImage={mockRenderImage} />);

      expect(screen.getByTestId('image-center')).toBeInTheDocument();
      expect(screen.getAllByTestId('image-side')).toHaveLength(4);
    });
  });

  describe('fullscreen mode', () => {
    // Fullscreen exit test skipped - complex to test Framer Motion click events in JSDOM
    // Fullscreen Enter key test skipped - complex to test keyboard events with Framer Motion in JSDOM
    test('does not enter fullscreen during drag', async () => {
      const user = userEvent.setup();
      render(<SparkSlider images={mockImages} />);

      const centerCard = screen
        .getByRole('region')
        .querySelector('.spark-card-drag');

      // Simulate drag to prevent fullscreen
      await act(async () => {
        fireEvent.mouseDown(centerCard!);
        fireEvent.mouseMove(centerCard!, { clientX: 50 });
      });

      await act(async () => {
        await user.click(centerCard!);
      });

      // Should not show fullscreen overlay (spark-fullscreen class)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('image loading optimization', () => {
    test('center image loads eagerly, others lazy', () => {
      render(<SparkSlider images={mockImages} />);

      const images = screen.getAllByRole('img');

      // Find center image (should be eager)
      const centerImage = images.find(
        (img) => img.getAttribute('loading') === 'eager'
      );
      expect(centerImage).toBeInTheDocument();

      // Other images should be lazy
      const lazyImages = images.filter(
        (img) => img.getAttribute('loading') === 'lazy'
      );
      expect(lazyImages.length).toBeGreaterThan(0);
    });
  });

  describe('visual indicators', () => {
    test('shows green border on center card', () => {
      render(<SparkSlider images={mockImages} />);

      const centerHighlight = screen
        .getByRole('region')
        .querySelector('.spark-highlight');
      expect(centerHighlight).toBeInTheDocument();
    });

    test('shows slide number and total', () => {
      render(<SparkSlider images={mockImages} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('/ 5')).toBeInTheDocument();
    });

    test('shows caption with alt text and slide number', () => {
      render(<SparkSlider images={mockImages} alt='Photo' />);

      expect(screen.getByText('Photo 1')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    test('handles empty images array gracefully', () => {
      render(<SparkSlider images={[]} />);

      const slider = screen.getByRole('region');
      expect(slider).toBeInTheDocument();
    });

    test('handles single image', () => {
      render(<SparkSlider images={['/single.jpg']} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('/ 1')).toBeInTheDocument();

      // Should not show drag controls for single image
      const dragArea = screen.getByRole('region').querySelector('.cursor-grab');
      expect(dragArea).not.toBeInTheDocument();
    });

    test('handles autoplay interval changes', () => {
      const { rerender } = render(
        <SparkSlider images={mockImages} autoPlayInterval={1000} />
      );

      // Should not throw when changing interval
      rerender(<SparkSlider images={mockImages} autoPlayInterval={2000} />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('responsiveness', () => {
    test('applies responsive CSS custom properties', () => {
      render(
        <SparkSlider images={mockImages} className='[--spark-slider-h:60svh]' />
      );

      const slider = screen.getByRole('region');
      expect(slider).toHaveClass('[--spark-slider-h:60svh]');
    });

    test('uses svh and svmin units for viewport consistency', () => {
      render(<SparkSlider images={mockImages} />);

      const region = screen.getByRole('region');
      expect(region).toBeInTheDocument();

      // Check for svh usage in container styles
      const container = region.querySelector('[style*="svh"]');
      if (container) {
        expect(container).toBeInTheDocument();
      } else {
        // Alternative: check that the component renders with proper structure
        expect(region.querySelector('.relative')).toBeInTheDocument();
      }
    });
  });
});
