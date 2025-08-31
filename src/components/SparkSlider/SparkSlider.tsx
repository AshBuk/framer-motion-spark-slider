/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

'use client';
/* eslint-disable @next/next/no-img-element */
/**
 * We intentionally keep <img> as the default renderer to avoid coupling the
 * component to Next.js when published as an npm library. Consumers using Next.js
 * can provide a custom renderer via the `renderImage` prop (e.g., `next/image`).
 * This local disable prevents Next-specific lint warnings in a framework-agnostic
 * package context.
 */

import React, { useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useSparkSlider } from './useSparkSlider';
import { useSparkKeyboard } from './useSparkKeyboard';
import { SLIDER_CONFIG, type CardPosition } from './config';
import { useSparkTransforms } from './useSparkTransforms';
import { useFullscreen } from './useFullscreen';

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

const SparkSlider = ({
  images,
  autoPlayInterval = SLIDER_CONFIG.DEFAULT_AUTOPLAY_INTERVAL_MS,
  alt = 'Slide',
  className,
  cardClassName,
  renderImage,
}: SparkSliderProps) => {
  const totalSlides = images.length;
  const {
    currentIndex,
    isTransitioning,
    isDragging,
    dragOffset,
    vminInPixels,
    handlers,
  } = useSparkSlider({
    totalSlides,
    autoPlayInterval,
  });

  const centerGestureMovedRef = useRef<boolean>(false);

  const lastCenterDragAtRef = useRef<number>(Date.now());

  const {
    fullscreenIndex,
    isFullscreenDragging: _isFullscreenDragging,
    openFullscreenAt,
    exitFullscreen,
    fullscreenHandlers,
  } = useFullscreen({
    currentIndex,
    totalSlides,
    isDragging,
    handlers,
    lastCenterDragAtRef,
  });

  // Global keyboard handling via hook (single source of truth)
  useSparkKeyboard({
    currentIndex,
    totalSlides,
    isFullscreen: fullscreenIndex !== null,
    openFullscreenAt,
    navigateTo: handlers.handleSideCardClick,
    onInteractionStart: handlers.handleInteractionStart,
    onInteractionEnd: handlers.handleInteractionEnd,
    exitFullscreen: () => exitFullscreen(),
  });

  const { getCardPosition, getCardTransform } = useSparkTransforms({
    totalSlides,
    isDragging,
    dragOffset,
    vminInPixels,
  });

  // Removed local onKeyDown; use global document handler instead

  const renderCard = useCallback(
    (index: number, isCenter: boolean, position: CardPosition) => {
      // Disable selection visuals; fullscreen handles selection UX
      const imageSrc = images[index % images.length];

      const aspectClass =
        SLIDER_CONFIG.CARD_LAYOUT === 'vertical'
          ? 'aspect-[3/4]'
          : 'aspect-[4/3]';
      const cardWidthVh = isCenter
        ? SLIDER_CONFIG.CENTER_CARD_SIZE
        : SLIDER_CONFIG.SIDE_CARD_SIZE;

      return (
        <motion.div
          key={`card-${index}`}
          className={`relative z-30 ${aspectClass} overflow-hidden rounded-xl ${cardClassName ?? ''}`}
          style={{ width: `${cardWidthVh}svmin` }}
          onMouseEnter={handlers.handleInteractionStart}
          onMouseLeave={handlers.handleInteractionEnd}
          whileTap={{ scale: 0.95 }}
        >
          {isCenter && totalSlides > 1 ? (
            <motion.div
              className='absolute inset-0 z-50 cursor-grab active:cursor-grabbing'
              drag='x'
              dragConstraints={{
                left: -SLIDER_CONFIG.DRAG_CONSTRAINTS_PX,
                right: SLIDER_CONFIG.DRAG_CONSTRAINTS_PX,
              }}
              dragElastic={SLIDER_CONFIG.DRAG_ELASTICITY}
              dragMomentum={false}
              onDragStart={(_evt) => {
                centerGestureMovedRef.current = false;
                handlers.handleDragStart();
              }}
              onDrag={(_evt, info) => {
                if (Math.abs(info.offset.x) > 2) {
                  centerGestureMovedRef.current = true;
                }
                handlers.handleDrag(
                  _evt as unknown as MouseEvent | TouchEvent | PointerEvent,
                  info
                );
              }}
              onDragEnd={(evt, info) => {
                handlers.handleDragEnd(
                  evt as unknown as MouseEvent | TouchEvent | PointerEvent,
                  info
                );
                lastCenterDragAtRef.current = Date.now();
              }}
              onTap={() => {
                if (isDragging) return;
                if (centerGestureMovedRef.current) {
                  // Do not open fullscreen if there was any drag movement in this gesture
                  centerGestureMovedRef.current = false;
                  return;
                }
                openFullscreenAt(index);
              }}
            />
          ) : position === 'left' || position === 'right' ? (
            <div
              className='absolute inset-0 z-50 cursor-pointer'
              onClick={() => handlers.handleSideCardClick(index)}
            />
          ) : null}

          <div className='absolute inset-0 rounded-xl bg-gradient-to-b from-neutral-800 to-black' />
          {isCenter && (
            <div className='absolute inset-0 rounded-xl border border-emerald-400/50' />
          )}
          {/* Selection indicators removed in favor of fullscreen UX */}
          <div className='pointer-events-none relative h-full w-full overflow-hidden rounded-xl'>
            {renderImage ? (
              renderImage(imageSrc, `${alt} ${index + 1}`, isCenter)
            ) : (
              <img
                src={imageSrc}
                alt={`${alt} ${index + 1}`}
                className='h-full w-full object-cover object-center'
                loading={isCenter ? 'eager' : 'lazy'}
              />
            )}
            {!isCenter && (
              <div className='absolute inset-0 rounded-xl bg-black/40' />
            )}
            {/* No selection overlay */}
            {isCenter && (
              <div className='absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t from-black/70 to-transparent p-3'>
                <span className='text-sm font-medium leading-tight text-white'>{`${alt} ${index + 1}`}</span>
              </div>
            )}
          </div>
          {isCenter && (
            <div className='absolute bottom-2 right-2'>
              <div className='flex items-center gap-2 rounded-full bg-black/50 px-2 py-1 backdrop-blur-sm'>
                <span className='text-xs font-medium text-white'>
                  {index + 1}
                </span>
                <span className='text-xs text-white/60'>/ {totalSlides}</span>
              </div>
            </div>
          )}
        </motion.div>
      );
    },
    [
      handlers,
      images,
      alt,
      totalSlides,
      cardClassName,
      renderImage,
      isDragging,
      lastCenterDragAtRef,
      openFullscreenAt,
    ]
  );

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${className ?? ''}`}
      tabIndex={0}
      role='region'
      aria-roledescription='carousel'
      aria-label='Spark slider'
      onFocus={handlers.handleInteractionStart}
      onBlur={handlers.handleInteractionEnd}
    >
      {/* Fullscreen overlay */}
      {fullscreenIndex !== null && (
        <div
          className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4'
          role='dialog'
          aria-modal='true'
        >
          <motion.div
            className='max-h-[96svh] max-w-[96svw]'
            drag='x'
            dragConstraints={{
              left: -SLIDER_CONFIG.DRAG_CONSTRAINTS_PX,
              right: SLIDER_CONFIG.DRAG_CONSTRAINTS_PX,
            }}
            dragElastic={SLIDER_CONFIG.DRAG_ELASTICITY}
            dragMomentum={false}
            onDragStart={fullscreenHandlers.onDragStart}
            onDragEnd={fullscreenHandlers.onDragEnd}
            onTap={fullscreenHandlers.onClick}
          >
            {renderImage ? (
              renderImage(
                images[fullscreenIndex % images.length],
                `${alt} ${fullscreenIndex + 1}`,
                true
              )
            ) : (
              <img
                src={images[fullscreenIndex % images.length]}
                alt={`${alt} ${fullscreenIndex + 1}`}
                className='h-full max-h-[96svh] w-full max-w-[96svw] select-none object-contain'
                draggable={false}
              />
            )}
          </motion.div>
        </div>
      )}
      <div
        className='relative w-full overflow-hidden'
        style={{
          height: `min(var(--spark-slider-h, ${SLIDER_CONFIG.CONTAINER_HEIGHTS_VH.base}svh), 100svh)`,
          transform: 'scale(var(--spark-slider-scale, 1))',
          transformOrigin: 'center',
        }}
      >
        {/**
         * CSS variable override on any breakpoint via Tailwind (`--spark-slider-h`).
         * - Default base height: SLIDER_CONFIG.CONTAINER_HEIGHTS_VH.base
         * - Height is clamped by 100svh for mobile viewport safety
         */}
        <div
          aria-live='polite'
          className='sr-only'
        >{`Slide ${currentIndex + 1} of ${totalSlides}`}</div>
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
          <AnimatePresence mode='sync'>
            {images.map((_, cardIndex) => {
              const position = getCardPosition(cardIndex, currentIndex);
              if (position === 'hidden') return null;

              const transform = getCardTransform(position);
              const isCenter = position === 'center';

              const spring = isTransitioning
                ? SLIDER_CONFIG.spring.transitioning
                : SLIDER_CONFIG.spring.idle;
              // Use spring presets only for consistent timing

              return (
                <motion.div
                  key={`card-${cardIndex}`}
                  className='pointer-events-auto absolute'
                  initial={isCenter ? transform : { ...transform, opacity: 0 }}
                  animate={transform}
                  exit={{ ...transform, opacity: 0 }}
                  transition={
                    isDragging
                      ? { type: 'tween', duration: 0 }
                      : { type: 'spring', ...spring }
                  }
                  style={{
                    transformOrigin: 'center center',
                    zIndex: (transform as { zIndex: number }).zIndex,
                  }}
                >
                  {renderCard(cardIndex, isCenter, position)}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SparkSlider;
