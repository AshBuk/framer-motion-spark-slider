export type CardPosition =
  | 'center'
  | 'left'
  | 'right'
  | 'far-left'
  | 'far-right'
  | 'hidden';
export declare const SLIDER_CONFIG: {
  DEFAULT_AUTOPLAY_INTERVAL_MS: number;
  CARD_LAYOUT: 'horizontal' | 'vertical';
  CENTER_CARD_SIZE: number;
  SIDE_CARD_SIZE: number;
  DOUBLE_TAP_THRESHOLD_MS: number;
  SWIPE_THRESHOLD_PX: number;
  SWIPE_COOLDOWN_MS: number;
  USER_INTERACTION_DEBOUNCE_MS: number;
  TRANSITION_DURATION_MS: number;
  TRANSITION_DELAY_MS: number;
  AUTO_SCROLL_SPEED_MULTIPLIER: number;
  SPACING_UNITS: number;
  MIN_SIDE_OPACITY: number;
  OFFSET_RESPONSIVE: {
    breakpointPx: number;
    minMultiplier: number;
  };
  CONTAINER_HEIGHTS_VH: {
    base: number;
    md: number;
  };
  DRAG_CONSTRAINTS_PX: number;
  DRAG_ELASTICITY: number;
  positions: {
    center: {
      scale: number;
      opacity: number;
      blur: number;
      zIndex: number;
      xOffsetFactor: number;
    };
    left: {
      scale: number;
      opacity: number;
      blur: number;
      zIndex: number;
      xOffsetFactor: number;
    };
    right: {
      scale: number;
      opacity: number;
      blur: number;
      zIndex: number;
      xOffsetFactor: number;
    };
    'far-left': {
      scale: number;
      opacity: number;
      blur: number;
      zIndex: number;
      xOffsetFactor: number;
    };
    'far-right': {
      scale: number;
      opacity: number;
      blur: number;
      zIndex: number;
      xOffsetFactor: number;
    };
    hidden: {
      scale: number;
      opacity: number;
      blur: number;
      zIndex: number;
      xOffsetFactor: number;
    };
  };
  drag: {
    center: {
      shrinkFactor: number;
      maxShrink: number;
      opacityFactor: number;
      blurFactor: number;
    };
    side: {
      scaleFactor: number;
      opacityFactor: number;
      blurFactor: number;
      xOffsetFactor: number;
    };
    far: {
      scaleFactor: number;
      opacityFactor: number;
      blurFactor: number;
    };
  };
  slide: {
    center: {
      xOffsetFactor: number;
      scaleFactor: number;
      opacityFactor: number;
      blurIncrease: number;
    };
    side: {
      xOffsetFactor: number;
      scaleFactor: number;
      opacityFactor: number;
      blurDecrease: number;
    };
  };
  spring: {
    transitioning: {
      stiffness: number;
      damping: number;
    };
    idle: {
      stiffness: number;
      damping: number;
    };
  };
  duration: {
    transitioning: {
      user: number;
      auto: number;
    };
    idle: {
      user: number;
      auto: number;
    };
  };
};
