import type { PanInfo } from 'framer-motion';
/**
 * Decides which slide to go to based on horizontal drag offset.
 * Returns null if movement is under the swipe threshold or total < 2.
 * Positive offset means previous slide (drag right → reveal previous).
 */
export declare function computeSwipeTarget(
  offsetX: number,
  baseIndex: number,
  totalSlides: number
): number | null;
interface UseSparkSliderProps {
  totalSlides: number;
  autoPlayInterval: number;
}
export declare const useSparkSlider: ({
  totalSlides,
  autoPlayInterval,
}: UseSparkSliderProps) => {
  currentIndex: number;
  isUserInteracting: boolean;
  isTransitioning: boolean;
  isDragging: boolean;
  dragOffset: number;
  vminInPixels: number;
  handlers: {
    handleInteractionStart: () => void;
    handleInteractionEnd: () => void;
    handleSideCardClick: (index: number) => void;
    handleDragStart: () => void;
    handleDrag: (
      _: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo
    ) => void;
    handleDragEnd: (
      _: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo
    ) => void;
  };
};
export {};
