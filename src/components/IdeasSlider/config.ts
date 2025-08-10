export const SLIDER_CONFIG = {
  // Card layout: 'horizontal' (laptop) or 'vertical' (phone)
  CARD_LAYOUT: 'horizontal' as 'horizontal' | 'vertical',
  // Visual widths (in vh) for center/side cards
  CENTER_CARD_WIDTH_VH: 40,
  SIDE_CARD_WIDTH_VH: 30,

  DOUBLE_TAP_THRESHOLD_MS: 300,
  SWIPE_THRESHOLD_PX: 50,
  SWIPE_COOLDOWN_MS: 350,
  USER_INTERACTION_DEBOUNCE_MS: 8000,
  TRANSITION_DURATION_MS: 300,
  TRANSITION_DELAY_MS: 50,
  AUTO_SCROLL_SPEED_MULTIPLIER: 1.5,

  CARD_WIDTH_VH: 20,
  SPACING_VH: 3,

  DRAG_CONSTRAINTS_PX: 100,
  DRAG_ELASTICITY: 0.1,

  positions: {
    center: { scale: 1.1, opacity: 1, blur: 0, zIndex: 50, xOffsetFactor: 0 },
    left: {
      scale: 1.05,
      opacity: 0.8,
      blur: 1,
      zIndex: 40,
      xOffsetFactor: -0.4,
    },
    right: {
      scale: 1.05,
      opacity: 0.8,
      blur: 1,
      zIndex: 40,
      xOffsetFactor: 0.4,
    },
    'far-left': {
      scale: 0.8,
      opacity: 0.5,
      blur: 2,
      zIndex: 30,
      xOffsetFactor: -0.7,
    },
    'far-right': {
      scale: 0.8,
      opacity: 0.5,
      blur: 2,
      zIndex: 30,
      xOffsetFactor: 0.7,
    },
    hidden: { scale: 0.5, opacity: 0, blur: 5, zIndex: 10, xOffsetFactor: 0 },
  },

  drag: {
    center: {
      shrinkFactor: 0.35,
      maxShrink: 0.4,
      opacityFactor: 0.6,
      blurFactor: 4,
    },
    side: {
      scaleFactor: 2.5,
      opacityFactor: 1.3,
      blurFactor: 1.2,
      xOffsetFactor: 0.6,
    },
    far: { scaleFactor: 0.5, opacityFactor: 0.5, blurFactor: 3 },
  },

  slide: {
    center: {
      xOffsetFactor: 0.8,
      scaleFactor: 0.9,
      opacityFactor: 0.7,
      blurIncrease: 2,
    },
    side: {
      xOffsetFactor: 0.3,
      scaleFactor: 1.15,
      opacityFactor: 1.25,
      blurDecrease: 1,
    },
  },

  spring: {
    transitioning: { stiffness: 120, damping: 30 },
    idle: { stiffness: 80, damping: 25 },
  },
  duration: {
    transitioning: { user: 0.4, auto: 0.6 },
    idle: { user: 0.6, auto: 2.0 },
  },
};
