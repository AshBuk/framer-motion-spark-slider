/**
 * We intentionally keep <img> as the default renderer to avoid coupling the
 * component to Next.js when published as an npm library. Consumers using Next.js
 * can provide a custom renderer via the `renderImage` prop (e.g., `next/image`).
 * This local disable prevents Next-specific lint warnings in a framework-agnostic
 * package context.
 */
import React from 'react';
interface SparkSliderProps {
  images: readonly string[];
  autoPlayInterval?: number;
  alt?: string;
  className?: string;
  cardClassName?: string;
  renderImage?: (
    src: string,
    alt: string,
    isCenter: boolean
  ) => React.ReactNode;
}
declare const SparkSlider: ({
  images,
  autoPlayInterval,
  alt,
  className,
  cardClassName,
  renderImage,
}: SparkSliderProps) => import('react/jsx-runtime').JSX.Element;
export default SparkSlider;
