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
          ? 'is-vertical'
          : 'is-horizontal';
      const cardWidthVh = isCenter
        ? SLIDER_CONFIG.CENTER_CARD_SIZE
        : SLIDER_CONFIG.SIDE_CARD_SIZE;

      return (
        <motion.div
          key={`card-${index}`}
          className={`spark-card ${aspectClass} ${cardClassName ?? ''}`}
          style={{ width: `${cardWidthVh}svmin` }}
          onMouseEnter={handlers.handleInteractionStart}
          onMouseLeave={handlers.handleInteractionEnd}
          whileTap={{ scale: 0.95 }}
        >
          {isCenter && totalSlides > 1 ? (
            <motion.div
              className='spark-card-drag'
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
              className='spark-card-click'
              onClick={() => handlers.handleSideCardClick(index)}
            />
          ) : null}

          <div className='spark-gradient' />
          {isCenter && <div className='spark-highlight' />}
          {/* Selection indicators removed in favor of fullscreen UX */}
          <div className='spark-content'>
            {renderImage ? (
              renderImage(imageSrc, `${alt} ${index + 1}`, isCenter)
            ) : (
              <img
                src={imageSrc}
                alt={`${alt} ${index + 1}`}
                className='spark-card-image'
                loading={isCenter ? 'eager' : 'lazy'}
              />
            )}
            {!isCenter && <div className='spark-dim' />}
            {/* No selection overlay */}
            {isCenter && (
              <div className='spark-caption'>
                <span className='spark-caption-text'>{`${alt} ${index + 1}`}</span>
              </div>
            )}
          </div>
          {isCenter && (
            <div className='spark-badge'>
              <div className='spark-badge-inner'>
                <span className='spark-badge-text'>{index + 1}</span>
                <span className='spark-badge-subtext'>/ {totalSlides}</span>
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
      className={`spark ${className ?? ''}`}
      tabIndex={0}
      role='region'
      aria-roledescription='carousel'
      aria-label='Spark slider'
      onFocus={handlers.handleInteractionStart}
      onBlur={handlers.handleInteractionEnd}
    >
      {/* Fullscreen overlay */}
      {fullscreenIndex !== null && (
        <div className='spark-fullscreen' role='dialog' aria-modal='true'>
          <motion.div
            className='spark-fullscreen-inner'
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
                className=''
                draggable={false}
              />
            )}
          </motion.div>
        </div>
      )}
      <div
        className='spark-container'
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
          className='spark-visually-hidden'
        >{`Slide ${currentIndex + 1} of ${totalSlides}`}</div>
        <div className='spark-stage'>
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
                  className='spark-stage-card'
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
