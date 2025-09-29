# Development Guide

## Quick Start

```bash
npm install
npm run dev     # → http://localhost:3000
```

## Commands

### Development

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server

### Quality

- `npm test` - Run all tests
- `npm run type-check` - TypeScript validation
- `npm run lint` - Code linting
- `npm run format` - Code formatting
- `npm run check-all` - Full validation pipeline

### Docker

- `docker compose up --build` - Containerized development

## Architecture

### Tech Stack

- **Next.js 15** + **React 18** - App Router framework
- **Framer Motion** - Smooth animations
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### Core Components

**SparkSlider** (`src/components/SparkSlider/`)

The slider is split into specialized modules:

1. **`SparkSlider.tsx`** — Main React component
   - Framer Motion cards with drag, side-clicks, double-tap select
   - Accessibility: keyboard arrows, focus ring, `aria-roledescription="carousel"`
   - Props: `images`, `alt`, `onSlideSelect`, `onSelectionChange`, `autoPlayInterval`, `className`, `cardClassName`, `renderImage`
   - `renderImage` allows injecting `next/image`; default uses `<img>`
   - Guards for 0/1 slide; uses `vh`-based sizing

2. **`useSparkSlider.ts`** — Core slider hook
   - Manages index, selection, interaction and drag state
   - Auto-play with pause on interaction and on hidden tab (`visibilitychange`)
   - Debounced resume; swipe thresholds/cooldowns

3. **`useSparkFullscreen.ts`** — Fullscreen functionality hook
   - Handles fullscreen mode activation/deactivation
   - Manages fullscreen drag interactions and navigation
   - Provides fullscreen state and control functions

4. **`useSparkKeyboard.ts`** — Keyboard navigation hook
   - Arrow keys for slide navigation with circular wrapping
   - Enter key to open fullscreen mode
   - Escape/Enter keys to exit fullscreen mode
   - Form field detection to avoid conflicts with user input
   - Proper event handling and cleanup

5. **`useSparkTransforms.ts`** — Position and animation calculations
   - Card positioning logic (center, left, right, far-left, far-right, hidden)
   - Transform calculations for smooth animations
   - Position-based rendering optimization

6. **`config.ts`** — Configuration constants
   - Positions, visual effects, drag constraints, timing/springs
   - Exposes `SLIDER_CONFIG` and `type CardPosition`

**Key Design Patterns**

- **Circular navigation** - Slides wrap around infinitely
- **Position-based rendering** - Cards have specific positions with optimized transforms
- **Interaction states** - Different animations for idle, transitioning, and dragging
- **Responsive sizing** - Uses vh units for consistent sizing across devices
- **Accessibility-first** - Full keyboard navigation and screen reader support

### API Routes

**Image API** (`/api/images`)

- `GET` - List images with write permissions check
- `POST` - Upload images (5MB max, multipart/form-data)
- `DELETE` - Remove images by URL or name

**Storage Options**

- Local: `public/uploads/` directory
- Production: `@vercel/blob` with `BLOB_READ_WRITE_TOKEN`
- Fallback: Picsum.photos for demo

**Upload Component** (`src/components/ImageUploader.tsx`)

- Drag-and-drop interface
- Image management UI

## Configuration

### TypeScript

- Path mapping: `@/*` → `src/*`
- Strict mode with incremental compilation

### ESLint + Prettier

- Flat config with TypeScript/React rules
- Auto-formatting integration

### Tailwind CSS

- Optional styling enhancement
- Component works standalone with inline styles

## Development

### Customization

Configure slider behavior in `config.ts`:

- Card dimensions, spacing, animations
- Drag sensitivity and spring physics
- Visual effects (scale, opacity, blur)

### Package Usage

```tsx
import { SparkSlider, SLIDER_CONFIG } from '@ashbuk/spark-slider';

<SparkSlider
  images={['/uploads/one.jpg', '/uploads/two.jpg']}
  alt='Image'
  autoPlayInterval={SLIDER_CONFIG.DEFAULT_AUTOPLAY_INTERVAL_MS}
  className='md:[--spark-slider-h:48svh]'
/>;
```

### File Structure

```
src/components/SparkSlider/
├── SparkSlider.tsx           # Main React component
├── useSparkSlider.ts         # Core slider hook
├── useSparkFullscreen.ts     # Fullscreen functionality
├── useSparkKeyboard.ts       # Keyboard navigation
├── useSparkTransforms.ts     # Position calculations
└── config.ts                 # Configuration constants

packages/spark-slider/        # NPM package (symlinked to src)
src/app/api/images/          # Image management API
public/uploads/              # Local image storage
tests/
├── unit/                    # Component and hook tests
└── integration/             # API and E2E tests
```

### Deployment

- **Local**: Uses `public/uploads/` directory
- **Vercel**: Requires `BLOB_READ_WRITE_TOKEN` for persistence
- **Package**: Published to GitHub Packages on version tags

### CI/CD

- Type checking, linting, testing on PRs
- Auto-publish on `spark-slider-v*` tags
- Docker support with volume persistence
