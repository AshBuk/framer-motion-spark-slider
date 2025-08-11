'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useSparkSlider } from './useSparkSlider';
import { SLIDER_CONFIG, type CardPosition } from './config';

interface SparkSliderProps {
  images: readonly string[];
  onSlideSelect?: (index: number, isSelected: boolean) => void;
  autoPlayInterval?: number;
  onSelectionChange?: (current: number, total: number) => void;
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
  onSlideSelect,
  autoPlayInterval = 6000,
  onSelectionChange,
  alt = 'Slide',
  className,
  cardClassName,
  renderImage,
}: SparkSliderProps) => {
  const totalSlides = images.length;
  const {
    currentIndex,
    selectedIds,
    isTransitioning,
    isDragging,
    dragOffset,
    vhInPixels,
    handlers,
  } = useSparkSlider({
    totalSlides,
    autoPlayInterval,
    onSlideSelect,
    onSelectionChange,
  });

  const getCardPosition = useCallback(
    (cardIndex: number, currentIdx: number): CardPosition => {
      const getCircularIndex = (index: number) =>
        ((index % totalSlides) + totalSlides) % totalSlides;

      const normalizedCard = getCircularIndex(cardIndex);
      const normalizedCurrent = getCircularIndex(currentIdx);

      if (normalizedCard === normalizedCurrent) return 'center';
      if (normalizedCard === getCircularIndex(currentIdx - 1)) return 'left';
      if (normalizedCard === getCircularIndex(currentIdx - 2))
        return 'far-left';
      if (normalizedCard === getCircularIndex(currentIdx + 1)) return 'right';
      if (normalizedCard === getCircularIndex(currentIdx + 2))
        return 'far-right';
      return 'hidden';
    },
    [totalSlides]
  );

  const getCardTransform = useCallback(
    (position: CardPosition) => {
      const centerWidthVH = SLIDER_CONFIG.CENTER_CARD_WIDTH_VH;
      const sideWidthVH = SLIDER_CONFIG.SIDE_CARD_WIDTH_VH;
      const spacingVH = SLIDER_CONFIG.SPACING_VH;
      const posConfig = SLIDER_CONFIG.positions[position];

      const widthVHForPos = position === 'center' ? centerWidthVH : sideWidthVH;
      let baseX = posConfig.xOffsetFactor * (widthVHForPos + spacingVH);
      let baseScale = posConfig.scale;
      let baseOpacity = posConfig.opacity;
      let baseBlur = posConfig.blur;
      const baseZIndex = posConfig.zIndex;

      if (isDragging && dragOffset !== 0) {
        const dragDistance = widthVHForPos + spacingVH;
        const dragProgress = dragOffset / (dragDistance * vhInPixels);

        if (position === 'center') {
          const shrinkFactor = Math.min(
            SLIDER_CONFIG.drag.center.maxShrink,
            Math.abs(dragProgress) * SLIDER_CONFIG.drag.center.shrinkFactor
          );
          baseScale = Math.max(0.7, baseScale - shrinkFactor);
          baseOpacity = Math.max(
            0.4,
            1 - Math.abs(dragProgress) * SLIDER_CONFIG.drag.center.opacityFactor
          );
          baseBlur =
            Math.abs(dragProgress) * SLIDER_CONFIG.drag.center.blurFactor;
        } else if (position === 'left' || position === 'right') {
          const isMovingTowardCenter =
            (position === 'left' && dragProgress > 0) ||
            (position === 'right' && dragProgress < 0);
          if (isMovingTowardCenter) {
            const progressFactor = Math.abs(dragProgress);
            const target = SLIDER_CONFIG.positions.center;
            baseScale +=
              (target.scale - baseScale) *
              progressFactor *
              SLIDER_CONFIG.drag.side.scaleFactor;
            baseOpacity +=
              (target.opacity - baseOpacity) *
              progressFactor *
              SLIDER_CONFIG.drag.side.opacityFactor;
            baseBlur +=
              (target.blur - baseBlur) *
              progressFactor *
              SLIDER_CONFIG.drag.side.blurFactor;
            baseX +=
              (target.xOffsetFactor - baseX) *
              progressFactor *
              SLIDER_CONFIG.drag.side.xOffsetFactor;
          }
        }
      }

      // Prevent fully invisible non-center cards in rare race conditions
      if (position !== 'center') {
        baseOpacity = Math.max(baseOpacity, SLIDER_CONFIG.MIN_SIDE_OPACITY);
      }

      // Ensure blur is never negative to avoid keyframe filter warnings
      const clampedBlur = Math.max(0, baseBlur);

      return {
        x: `${baseX}vh`,
        scale: baseScale,
        opacity: baseOpacity,
        filter: `blur(${clampedBlur}px)`,
        zIndex: baseZIndex,
      };
    },
    [isDragging, dragOffset, vhInPixels]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (totalSlides < 2) return;
      if (e.key === 'ArrowLeft') {
        handlers.handleInteractionStart();
        const prevIndex =
          currentIndex === 0 ? totalSlides - 1 : currentIndex - 1;
        handlers.handleSideCardClick(prevIndex);
        handlers.handleInteractionEnd();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        handlers.handleInteractionStart();
        const nextIndex = (currentIndex + 1) % totalSlides;
        handlers.handleSideCardClick(nextIndex);
        handlers.handleInteractionEnd();
        e.preventDefault();
      } else if (e.key === 'Enter' || e.key === ' ') {
        // Programmatic toggle for center card selection
        (
          handlers as unknown as { toggleCenterSelection?: () => void }
        ).toggleCenterSelection?.();
        e.preventDefault();
      }
    },
    [currentIndex, totalSlides, handlers]
  );

  const renderCard = useCallback(
    (index: number, isCenter: boolean, position: CardPosition) => {
      const slideIndex = index + 1;
      const isSelected = selectedIds.has(slideIndex);
      const imageSrc = images[index % images.length];

      const aspectClass =
        SLIDER_CONFIG.CARD_LAYOUT === 'vertical'
          ? 'aspect-[3/4]'
          : 'aspect-[4/3]';
      const cardWidthVh = isCenter
        ? SLIDER_CONFIG.CENTER_CARD_WIDTH_VH
        : SLIDER_CONFIG.SIDE_CARD_WIDTH_VH;

      return (
        <motion.div
          key={`card-${index}`}
          className={`relative z-30 ${aspectClass} overflow-hidden rounded-xl ${cardClassName ?? ''}`}
          style={{ width: `${cardWidthVh}vh` }}
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
              onDragStart={handlers.handleDragStart}
              onDrag={handlers.handleDrag}
              onDragEnd={handlers.handleDragEnd}
              onClick={handlers.handleCenterCardClick}
            />
          ) : position === 'left' || position === 'right' ? (
            <div
              className='absolute inset-0 z-50 cursor-pointer'
              onClick={() => handlers.handleSideCardClick(index)}
            />
          ) : null}

          <div className='absolute inset-0 rounded-xl bg-gradient-to-b from-neutral-800 to-black' />
          {(isCenter || isSelected) && (
            <div
              className={`absolute inset-0 rounded-xl border ${isSelected ? 'border-emerald-400' : 'border-emerald-400/50'}`}
            />
          )}
          {isSelected && (
            <div className='pointer-events-none absolute right-2 top-2 z-10'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500'>
                <svg
                  className='h-4 w-4 text-white'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
            </div>
          )}
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
            {isSelected && (
              <div className='absolute inset-0 rounded-xl bg-emerald-500/10' />
            )}
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
    [selectedIds, handlers, images, alt, totalSlides, cardClassName]
  );

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${className ?? ''}`}
      tabIndex={0}
      role='region'
      aria-roledescription='carousel'
      aria-label='Spark slider'
      onKeyDown={handleKeyDown}
      onFocus={handlers.handleInteractionStart}
      onBlur={handlers.handleInteractionEnd}
    >
      <div
        className='relative w-full overflow-hidden'
        style={{
          height: `min(${SLIDER_CONFIG.CONTAINER_HEIGHTS_VH.base}vh, 100svh)`,
        }}

        /* - md breakpoint override via CSS variable
           - Consumers can override via Tailwind if needed
           - We keep a single source of truth in config for base height */
      >
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
