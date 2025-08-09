'use client';

import React, { useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

import { useIdeasSlider } from './useIdeasSlider';
import { SLIDER_CONFIG } from './config';

export type SlideItem = string | readonly [string, string];

interface IdeasSliderProps {
  images: readonly SlideItem[];
  onIdeaSelect?: (ideaId: number, isSelected: boolean) => void;
  autoPlayInterval?: number;
  onFilteredCountChange?: (current: number, total: number) => void;
  altPrefix?: string;
}

type CardPosition =
  | 'center'
  | 'left'
  | 'right'
  | 'far-left'
  | 'far-right'
  | 'hidden';

const getImage = (item: SlideItem): string =>
  Array.isArray(item) ? item[0] : (item as string);

const IdeasSlider = ({
  images,
  onIdeaSelect,
  autoPlayInterval = 6000,
  onFilteredCountChange,
  altPrefix = 'Slide',
}: IdeasSliderProps) => {
  const totalIdeas = images.length;
  const {
    currentIndex,
    selectedIds,
    isUserInteracting,
    isTransitioning,
    isDragging,
    dragOffset,
    vhInPixels,
    handlers,
  } = useIdeasSlider({
    totalIdeas,
    autoPlayInterval,
    onIdeaSelect,
    onFilteredCountChange,
  });

  const getCardPosition = useCallback(
    (cardIndex: number, currentIdx: number): CardPosition => {
      const getCircularIndex = (index: number) =>
        ((index % totalIdeas) + totalIdeas) % totalIdeas;

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
    [totalIdeas]
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

      return {
        x: `${baseX}vh`,
        scale: baseScale,
        opacity: baseOpacity,
        filter: `blur(${baseBlur}px)`,
        zIndex: baseZIndex,
      };
    },
    [isDragging, dragOffset, vhInPixels]
  );

  const renderCard = useCallback(
    (index: number, isCenter: boolean, position: CardPosition) => {
      const ideaId = index + 1;
      const isSelected = selectedIds.has(ideaId);
      const imageSrc = getImage(images[index % images.length]);

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
          className={`relative z-30 ${aspectClass} overflow-hidden rounded-xl`}
          style={{ width: `${cardWidthVh}vh` }}
          onMouseEnter={handlers.handleInteractionStart}
          onMouseLeave={handlers.handleInteractionEnd}
          whileTap={{ scale: 0.95 }}
        >
          {isCenter ? (
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
            <Image
              src={imageSrc}
              alt={`${altPrefix} ${index + 1}`}
              fill
              className='object-cover object-center'
              sizes={
                isCenter
                  ? '(max-width: 768px) 90vw, 40vh'
                  : '(max-width: 768px) 60vw, 30vh'
              }
              priority={isCenter}
            />
            {!isCenter && (
              <div className='absolute inset-0 rounded-xl bg-black/40' />
            )}
            {isSelected && (
              <div className='absolute inset-0 rounded-xl bg-emerald-500/10' />
            )}
            {isCenter && (
              <div className='absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t from-black/70 to-transparent p-3'>
                <span className='text-sm font-medium leading-tight text-white'>{`${altPrefix} ${index + 1}`}</span>
              </div>
            )}
          </div>
          {isCenter && (
            <div className='absolute bottom-2 right-2'>
              <div className='flex items-center gap-2 rounded-full bg-black/50 px-2 py-1 backdrop-blur-sm'>
                <span className='text-xs font-medium text-white'>
                  {index + 1}
                </span>
                <span className='text-xs text-white/60'>/ {totalIdeas}</span>
              </div>
            </div>
          )}
        </motion.div>
      );
    },
    [selectedIds, handlers, images, altPrefix, totalIdeas]
  );

  return (
    <div className='relative w-full overflow-hidden'>
      <div className='relative h-[40vh] w-full overflow-hidden md:h-[48vh]'>
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
              const duration = isTransitioning
                ? isUserInteracting
                  ? SLIDER_CONFIG.duration.transitioning.user
                  : SLIDER_CONFIG.duration.transitioning.auto
                : isUserInteracting
                  ? SLIDER_CONFIG.duration.idle.user
                  : SLIDER_CONFIG.duration.idle.auto;

              return (
                <motion.div
                  key={`card-${cardIndex}`}
                  className='pointer-events-auto absolute'
                  initial={{ ...transform, opacity: 0 }}
                  animate={transform}
                  exit={{ ...transform, opacity: 0 }}
                  transition={
                    isDragging
                      ? { type: 'tween', duration: 0 }
                      : { type: 'spring', ...spring, duration }
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

export default IdeasSlider;
