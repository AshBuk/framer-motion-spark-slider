'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
const jsx_runtime_1 = require('react/jsx-runtime');
/* eslint-disable @next/next/no-img-element */
/**
 * We intentionally keep <img> as the default renderer to avoid coupling the
 * component to Next.js when published as an npm library. Consumers using Next.js
 * can provide a custom renderer via the `renderImage` prop (e.g., `next/image`).
 * This local disable prevents Next-specific lint warnings in a framework-agnostic
 * package context.
 */
const react_1 = require('react');
const framer_motion_1 = require('framer-motion');
const useSparkSlider_1 = require('./useSparkSlider');
const config_1 = require('./config');
const SparkSlider = ({
  images,
  autoPlayInterval = config_1.SLIDER_CONFIG.DEFAULT_AUTOPLAY_INTERVAL_MS,
  alt = 'Slide',
  className,
  cardClassName,
  renderImage,
}) => {
  const totalSlides = images.length;
  const [fullscreenIndex, setFullscreenIndex] = (0, react_1.useState)(null);
  const [isFullscreenDragging, setIsFullscreenDragging] = (0, react_1.useState)(
    false
  );
  const lastCenterDragAtRef = (0, react_1.useRef)(0);
  const {
    currentIndex,
    isTransitioning,
    isDragging,
    dragOffset,
    vminInPixels,
    handlers,
  } = (0, useSparkSlider_1.useSparkSlider)({
    totalSlides,
    autoPlayInterval,
  });
  (0, react_1.useEffect)(() => {
    if (fullscreenIndex === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setFullscreenIndex(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [fullscreenIndex]);
  const getCardPosition = (0, react_1.useCallback)(
    (cardIndex, currentIdx) => {
      const getCircularIndex = (index) =>
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
  const getCardTransform = (0, react_1.useCallback)(
    (position) => {
      const centerWidthVH = config_1.SLIDER_CONFIG.CENTER_CARD_SIZE;
      const sideWidthVH = config_1.SLIDER_CONFIG.SIDE_CARD_SIZE;
      const spacingVH = config_1.SLIDER_CONFIG.SPACING_UNITS;
      const posConfig = config_1.SLIDER_CONFIG.positions[position];
      const widthVHForPos = position === 'center' ? centerWidthVH : sideWidthVH;
      let baseX = posConfig.xOffsetFactor * (widthVHForPos + spacingVH);
      // Responsive clamp: reduce absolute X offset on narrow viewports so side/far cards remain visible
      // Uses vmin (min(width,height)) to stay consistent in portrait
      const minViewportSidePx = vminInPixels * 100;
      const { breakpointPx, minMultiplier } =
        config_1.SLIDER_CONFIG.OFFSET_RESPONSIVE;
      const responsiveOffsetMultiplier = Math.max(
        minMultiplier,
        Math.min(1, minViewportSidePx / breakpointPx)
      );
      baseX *= responsiveOffsetMultiplier;
      let baseScale = posConfig.scale;
      let baseOpacity = posConfig.opacity;
      let baseBlur = posConfig.blur;
      const baseZIndex = posConfig.zIndex;
      if (isDragging && dragOffset !== 0) {
        // Use vmin to keep geometry consistent in portrait where height >> width
        const baseUnit = vminInPixels;
        const dragDistance = widthVHForPos + spacingVH;
        const dragProgress = dragOffset / (dragDistance * baseUnit);
        if (position === 'center') {
          const shrinkFactor = Math.min(
            config_1.SLIDER_CONFIG.drag.center.maxShrink,
            Math.abs(dragProgress) *
              config_1.SLIDER_CONFIG.drag.center.shrinkFactor
          );
          baseScale = Math.max(0.7, baseScale - shrinkFactor);
          baseOpacity = Math.max(
            0.4,
            1 -
              Math.abs(dragProgress) *
                config_1.SLIDER_CONFIG.drag.center.opacityFactor
          );
          baseBlur =
            Math.abs(dragProgress) *
            config_1.SLIDER_CONFIG.drag.center.blurFactor;
        } else if (position === 'left' || position === 'right') {
          const isMovingTowardCenter =
            (position === 'left' && dragProgress > 0) ||
            (position === 'right' && dragProgress < 0);
          if (isMovingTowardCenter) {
            const progressFactor = Math.abs(dragProgress);
            const target = config_1.SLIDER_CONFIG.positions.center;
            baseScale +=
              (target.scale - baseScale) *
              progressFactor *
              config_1.SLIDER_CONFIG.drag.side.scaleFactor;
            baseOpacity +=
              (target.opacity - baseOpacity) *
              progressFactor *
              config_1.SLIDER_CONFIG.drag.side.opacityFactor;
            baseBlur +=
              (target.blur - baseBlur) *
              progressFactor *
              config_1.SLIDER_CONFIG.drag.side.blurFactor;
            baseX +=
              (target.xOffsetFactor - baseX) *
              progressFactor *
              config_1.SLIDER_CONFIG.drag.side.xOffsetFactor;
          }
        }
      }
      // Prevent fully invisible non-center cards in rare race conditions
      if (position !== 'center') {
        baseOpacity = Math.max(
          baseOpacity,
          config_1.SLIDER_CONFIG.MIN_SIDE_OPACITY
        );
      }
      // Ensure blur is never negative to avoid keyframe filter warnings
      const clampedBlur = Math.max(0, baseBlur);
      return {
        x: `${baseX}svmin`,
        scale: baseScale,
        opacity: baseOpacity,
        filter: `blur(${clampedBlur}px)`,
        zIndex: baseZIndex,
      };
    },
    [isDragging, dragOffset, vminInPixels]
  );
  const handleKeyDown = (0, react_1.useCallback)(
    (e) => {
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
      }
    },
    [currentIndex, totalSlides, handlers]
  );
  const renderCard = (0, react_1.useCallback)(
    (index, isCenter, position) => {
      // Disable selection visuals; fullscreen handles selection UX
      const imageSrc = images[index % images.length];
      const aspectClass =
        config_1.SLIDER_CONFIG.CARD_LAYOUT === 'vertical'
          ? 'aspect-[3/4]'
          : 'aspect-[4/3]';
      const cardWidthVh = isCenter
        ? config_1.SLIDER_CONFIG.CENTER_CARD_SIZE
        : config_1.SLIDER_CONFIG.SIDE_CARD_SIZE;
      return (0, jsx_runtime_1.jsxs)(
        framer_motion_1.motion.div,
        {
          className: `relative z-30 ${aspectClass} overflow-hidden rounded-xl ${cardClassName ?? ''}`,
          style: { width: `${cardWidthVh}svmin` },
          onMouseEnter: handlers.handleInteractionStart,
          onMouseLeave: handlers.handleInteractionEnd,
          whileTap: { scale: 0.95 },
          children: [
            isCenter && totalSlides > 1
              ? (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, {
                  className:
                    'absolute inset-0 z-50 cursor-grab active:cursor-grabbing',
                  drag: 'x',
                  dragConstraints: {
                    left: -config_1.SLIDER_CONFIG.DRAG_CONSTRAINTS_PX,
                    right: config_1.SLIDER_CONFIG.DRAG_CONSTRAINTS_PX,
                  },
                  dragElastic: config_1.SLIDER_CONFIG.DRAG_ELASTICITY,
                  dragMomentum: false,
                  onDragStart: handlers.handleDragStart,
                  onDrag: handlers.handleDrag,
                  onDragEnd: (evt, info) => {
                    handlers.handleDragEnd(evt, info);
                    lastCenterDragAtRef.current = Date.now();
                  },
                  onClick: (e) => {
                    // Avoid opening during drag
                    if (isDragging) {
                      e.preventDefault();
                      return;
                    }
                    // Ignore click that happens right after a swipe/drag
                    if (
                      Date.now() - lastCenterDragAtRef.current <
                      config_1.SLIDER_CONFIG.SWIPE_COOLDOWN_MS
                    ) {
                      e.preventDefault();
                      return;
                    }
                    setFullscreenIndex(index);
                  },
                })
              : position === 'left' || position === 'right'
                ? (0, jsx_runtime_1.jsx)('div', {
                    className: 'absolute inset-0 z-50 cursor-pointer',
                    onClick: () => handlers.handleSideCardClick(index),
                  })
                : null,
            (0, jsx_runtime_1.jsx)('div', {
              className:
                'absolute inset-0 rounded-xl bg-gradient-to-b from-neutral-800 to-black',
            }),
            isCenter &&
              (0, jsx_runtime_1.jsx)('div', {
                className:
                  'absolute inset-0 rounded-xl border border-emerald-400/50',
              }),
            (0, jsx_runtime_1.jsxs)('div', {
              className:
                'pointer-events-none relative h-full w-full overflow-hidden rounded-xl',
              children: [
                renderImage
                  ? renderImage(imageSrc, `${alt} ${index + 1}`, isCenter)
                  : (0, jsx_runtime_1.jsx)('img', {
                      src: imageSrc,
                      alt: `${alt} ${index + 1}`,
                      className: 'h-full w-full object-cover object-center',
                      loading: isCenter ? 'eager' : 'lazy',
                    }),
                !isCenter &&
                  (0, jsx_runtime_1.jsx)('div', {
                    className: 'absolute inset-0 rounded-xl bg-black/40',
                  }),
                isCenter &&
                  (0, jsx_runtime_1.jsx)('div', {
                    className:
                      'absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t from-black/70 to-transparent p-3',
                    children: (0, jsx_runtime_1.jsx)('span', {
                      className: 'text-sm font-medium leading-tight text-white',
                      children: `${alt} ${index + 1}`,
                    }),
                  }),
              ],
            }),
            isCenter &&
              (0, jsx_runtime_1.jsx)('div', {
                className: 'absolute bottom-2 right-2',
                children: (0, jsx_runtime_1.jsxs)('div', {
                  className:
                    'flex items-center gap-2 rounded-full bg-black/50 px-2 py-1 backdrop-blur-sm',
                  children: [
                    (0, jsx_runtime_1.jsx)('span', {
                      className: 'text-xs font-medium text-white',
                      children: index + 1,
                    }),
                    (0, jsx_runtime_1.jsxs)('span', {
                      className: 'text-xs text-white/60',
                      children: ['/ ', totalSlides],
                    }),
                  ],
                }),
              }),
          ],
        },
        `card-${index}`
      );
    },
    [handlers, images, alt, totalSlides, cardClassName, renderImage, isDragging]
  );
  return (0, jsx_runtime_1.jsxs)('div', {
    className: `relative w-full overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${className ?? ''}`,
    tabIndex: 0,
    role: 'region',
    'aria-roledescription': 'carousel',
    'aria-label': 'Spark slider',
    onKeyDown: handleKeyDown,
    onFocus: handlers.handleInteractionStart,
    onBlur: handlers.handleInteractionEnd,
    children: [
      fullscreenIndex !== null &&
        (0, jsx_runtime_1.jsx)('div', {
          className:
            'fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4',
          children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, {
            className: 'max-h-[96svh] max-w-[96svw]',
            drag: 'x',
            dragConstraints: {
              left: -config_1.SLIDER_CONFIG.DRAG_CONSTRAINTS_PX,
              right: config_1.SLIDER_CONFIG.DRAG_CONSTRAINTS_PX,
            },
            dragElastic: config_1.SLIDER_CONFIG.DRAG_ELASTICITY,
            dragMomentum: false,
            onDragStart: () => setIsFullscreenDragging(true),
            onDragEnd: (_, info) => {
              if (fullscreenIndex !== null) {
                const target = (0, useSparkSlider_1.computeSwipeTarget)(
                  info.offset.x,
                  fullscreenIndex,
                  totalSlides
                );
                if (typeof target === 'number') {
                  setFullscreenIndex(null);
                  handlers.handleSideCardClick(target);
                  setIsFullscreenDragging(false);
                  return;
                }
              }
              setIsFullscreenDragging(false);
            },
            onClick: () => {
              if (isFullscreenDragging || fullscreenIndex === null) return;
              const idx = fullscreenIndex;
              setFullscreenIndex(null);
              handlers.handleSideCardClick(idx);
            },
            children: renderImage
              ? renderImage(
                  images[fullscreenIndex % images.length],
                  `${alt} ${fullscreenIndex + 1}`,
                  true
                )
              : (0, jsx_runtime_1.jsx)('img', {
                  src: images[fullscreenIndex % images.length],
                  alt: `${alt} ${fullscreenIndex + 1}`,
                  className:
                    'h-full max-h-[96svh] w-full max-w-[96svw] select-none object-contain',
                  draggable: false,
                }),
          }),
        }),
      (0, jsx_runtime_1.jsxs)('div', {
        className: 'relative w-full overflow-hidden',
        style: {
          height: `min(var(--spark-slider-h, ${config_1.SLIDER_CONFIG.CONTAINER_HEIGHTS_VH.base}svh), 100svh)`,
          transform: 'scale(var(--spark-slider-scale, 1))',
          transformOrigin: 'center',
        },
        children: [
          (0, jsx_runtime_1.jsx)('div', {
            'aria-live': 'polite',
            className: 'sr-only',
            children: `Slide ${currentIndex + 1} of ${totalSlides}`,
          }),
          (0, jsx_runtime_1.jsx)('div', {
            className:
              'pointer-events-none absolute inset-0 flex items-center justify-center',
            children: (0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, {
              mode: 'sync',
              children: images.map((_, cardIndex) => {
                const position = getCardPosition(cardIndex, currentIndex);
                if (position === 'hidden') return null;
                const transform = getCardTransform(position);
                const isCenter = position === 'center';
                const spring = isTransitioning
                  ? config_1.SLIDER_CONFIG.spring.transitioning
                  : config_1.SLIDER_CONFIG.spring.idle;
                // Use spring presets only for consistent timing
                return (0, jsx_runtime_1.jsx)(
                  framer_motion_1.motion.div,
                  {
                    className: 'pointer-events-auto absolute',
                    initial: isCenter
                      ? transform
                      : { ...transform, opacity: 0 },
                    animate: transform,
                    exit: { ...transform, opacity: 0 },
                    transition: isDragging
                      ? { type: 'tween', duration: 0 }
                      : { type: 'spring', ...spring },
                    style: {
                      transformOrigin: 'center center',
                      zIndex: transform.zIndex,
                    },
                    children: renderCard(cardIndex, isCenter, position),
                  },
                  `card-${cardIndex}`
                );
              }),
            }),
          }),
        ],
      }),
    ],
  });
};
exports.default = SparkSlider;
