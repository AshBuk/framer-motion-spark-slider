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

- `SparkSlider.tsx` - Main component with accessibility
- `useSparkSlider.ts` - State management and interactions
- `config.ts` - Configuration and positioning

**Key Features**

- Circular navigation with position-based rendering
- Auto-play with interaction pause
- Drag/swipe support with momentum
- Responsive sizing using viewport units

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
src/components/SparkSlider/    # Core slider code
packages/spark-slider/         # NPM package (symlinked)
src/app/api/images/           # Image management API
public/uploads/               # Local image storage
```

### Deployment

- **Local**: Uses `public/uploads/` directory
- **Vercel**: Requires `BLOB_READ_WRITE_TOKEN` for persistence
- **Package**: Published to GitHub Packages on version tags

### CI/CD

- Type checking, linting, testing on PRs
- Auto-publish on `spark-slider-v*` tags
- Docker support with volume persistence
