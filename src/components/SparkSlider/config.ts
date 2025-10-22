/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

/**
 * Relative position of a slide within the carousel rendering layout.
 *
 * @remarks
 * Positions drive z‑index, scale, opacity, blur and x‑offset presets.
 */
export type CardPosition =
  | 'center'
  | 'left'
  | 'right'
  | 'far-left'
  | 'far-right'
  | 'hidden';

/**
 * Public configuration object for Spark slider behavior and visuals.
 *
 * @remarks
 * - Sizing uses viewport units (`svh`/`svmin`) for consistent geometry on mobile.
 * - Drag interactions are tuned to be precise (no momentum) and predictable.
 * - Consumers may read constants (e.g., default autoplay interval) for integration.
 */
export const SLIDER_CONFIG = {
  // Default autoplay interval in milliseconds
  DEFAULT_AUTOPLAY_INTERVAL_MS: 4000,
  // Card layout orientation; controls base aspect ratio and spacing
  CARD_LAYOUT: 'horizontal' as 'horizontal' | 'vertical',
  // Width of the center card in svmin units (vmin-safe, scales with viewport)
  CENTER_CARD_SIZE: 66,
  // Width of side/far cards in svmin units
  SIDE_CARD_SIZE: 48,

  // Max delay between taps to treat as a double‑tap (currently not wired)
  DOUBLE_TAP_THRESHOLD_MS: 300,
  // Min horizontal drag distance in pixels to count as a swipe
  SWIPE_THRESHOLD_PX: 50,
  // Cooldown after a swipe to ignore accidental clicks and rapid swipes
  SWIPE_COOLDOWN_MS: 350,
  // Cooldown after exiting fullscreen to prevent accidental re-open
  FULLSCREEN_EXIT_COOLDOWN_MS: 280,
  // Debounce - time without user input before autoplay resumes
  USER_INTERACTION_DEBOUNCE_MS: 0,
  // Programmatic transition duration gate in ms (visuals use spring presets)
  TRANSITION_DURATION_MS: 300,
  // Small delay before index switch to schedule exit/enter animations
  TRANSITION_DELAY_MS: 50,
  // Speeds up autoplay by dividing the provided interval
  AUTO_SCROLL_SPEED_MULTIPLIER: 1.5,

  // Horizontal spacing between cards in svmin units
  SPACING_UNITS: 3,
  // Lower bound to avoid fully invisible side/far cards
  MIN_SIDE_OPACITY: 0.05,

  // Responsive clamp for horizontal offsets so side/far cards stay visible on narrow viewports
  OFFSET_RESPONSIVE: {
    // Viewport min‑side in px where offsets reach 100%
    breakpointPx: 1024,
    // Minimum multiplier applied on very narrow screens
    minMultiplier: 0.76,
  },

  CONTAINER_HEIGHTS_VH: {
    // Default container height in svh (can be overridden via CSS var)
    base: 40,
    // Optional larger height hint for wider breakpoints (via CSS var)
    md: 48,
  },

  // Framer Motion drag bounds in pixels for draggable center/fullscreen
  DRAG_CONSTRAINTS_PX: 100,
  // Framer Motion drag elasticity (0 = rigid, 1 = very elastic)
  DRAG_ELASTICITY: 0.1,

  // Visual presets per relative position
  // scale/opacity/blur are visual effects; zIndex controls stacking; xOffsetFactor shifts along X in card-width units
  positions: {
    center: { scale: 1.1, opacity: 1, blur: 0, zIndex: 50, xOffsetFactor: 0 },
    left: {
      scale: 1.05,
      opacity: 0.8,
      blur: 1,
      zIndex: 40,
      xOffsetFactor: -0.41,
    },
    right: {
      scale: 1.05,
      opacity: 0.8,
      blur: 1,
      zIndex: 40,
      xOffsetFactor: 0.41,
    },
    'far-left': {
      scale: 0.8,
      opacity: 0.5,
      blur: 2,
      zIndex: 30,
      xOffsetFactor: -0.66,
    },
    'far-right': {
      scale: 0.8,
      opacity: 0.5,
      blur: 2,
      zIndex: 30,
      xOffsetFactor: 0.66,
    },
    hidden: { scale: 0.5, opacity: 0, blur: 5, zIndex: 10, xOffsetFactor: 0 },
  } satisfies Record<
    CardPosition,
    {
      // Multiplier for size relative to base card size
      scale: number;
      // Base opacity for this position
      opacity: number;
      // Base blur (px) for depth/defocus effect
      blur: number;
      // Stacking order to keep center above sides
      zIndex: number;
      // Horizontal offset in units of (card width + spacing)
      xOffsetFactor: number;
    }
  >,

  // Dynamic visual adjustments while the user is dragging
  drag: {
    center: {
      // How fast the center card shrinks based on drag progress
      shrinkFactor: 0.35,
      // Maximum amount the center card is allowed to shrink
      maxShrink: 0.4,
      // Opacity reduction rate for center while dragging
      opacityFactor: 0.6,
      // Blur increase rate for center while dragging
      blurFactor: 4,
    },
    side: {
      // How aggressively side cards move toward center scale while dragging toward center
      scaleFactor: 2.5,
      // Opacity increase rate for side cards when moving toward center
      opacityFactor: 1.3,
      // Blur decrease rate as side cards approach center
      blurFactor: 1.2,
      // How fast side cards close the X gap toward the center
      xOffsetFactor: 0.6,
    },
    // Visual dampening for far cards during drag
    far: { scaleFactor: 0.5, opacityFactor: 0.5, blurFactor: 3 },
  },

  // Programmatic slide emphasis (reserved; not used by current animations)
  slide: {
    center: {
      // Temporary extra shift for center during programmatic slide
      xOffsetFactor: 0.8,
      // Temporary scale change for center
      scaleFactor: 0.9,
      // Temporary opacity change for center
      opacityFactor: 0.7,
      // Temporary extra blur applied to center
      blurIncrease: 2,
    },
    side: {
      // Temporary X shift for side cards during programmatic slide
      xOffsetFactor: 0.3,
      // Temporary scale change for side
      scaleFactor: 1.15,
      // Temporary opacity change for side
      opacityFactor: 1.25,
      // Temporary blur reduction for side
      blurDecrease: 1,
    },
  },

  // Spring presets for Framer Motion transitions (non‑drag)
  spring: {
    transitioning: { stiffness: 120, damping: 30 },
    idle: { stiffness: 80, damping: 25 },
  },
  // Target durations for modes (informational; visuals rely on spring)
  duration: {
    transitioning: { user: 0.4, auto: 0.6 },
    idle: { user: 0.6, auto: 2.0 },
  },
};
