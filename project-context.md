## Development Commands

### Essential Commands

- `npm test` - Run tests (Node.js Test Runner)
- `npm run dev` - Start development server (localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check Prettier formatting
- `npm run check` - Run type-check and lint
- `npm run check-all` - Run type-check, lint, and format check
- `npm run fix-all` - Run lint:fix and format
- `npm run analyze` - Analyze bundle size

### Docker Commands

- `docker compose up --build -d` - Run in Docker with volume persistence for uploads

## Project Architecture

### Core Technology Stack

- **Next.js 15** - React framework with App Router
- **Framer Motion** - Animation library for smooth slider interactions
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first styling
- **React 18** - UI library

### Main Components

#### SparkSlider Component (`src/components/SparkSlider/`)

The slider is split into three files:

1. **`SparkSlider.tsx`** — React component
   - Framer Motion cards with drag, side-clicks, click center to enter fullscreen
   - A11y: keyboard arrows, focus ring, `aria-roledescription="carousel"`
   - Props: `images`, `alt`, `onSlideSelect`, `onSelectionChange`, `autoPlayInterval`, `className`, `cardClassName`, `renderImage`
   - `renderImage` allows injecting `next/image`; default uses `<img>`
   - Guards for 0/1 slide; uses `svh`/`svmin`-based sizing

2. **`useSparkSlider.ts`** — hook
   - Manages index, selection, interaction and drag state
   - Auto-play with pause on interaction and on hidden tab (`visibilitychange`)
   - Debounced resume; swipe thresholds/cooldowns

3. **`config.ts`** — configuration
   - Positions, visual effects, drag constraints, timing/springs
   - Exposes `SLIDER_CONFIG` and `type CardPosition`

#### Key Design Patterns

- **Circular navigation** - Slides wrap around infinitely
- **Position-based rendering** - Cards have specific positions (center, left, right, far-left, far-right, hidden)
- **Interaction states** - Different animations for idle, transitioning, and dragging states
- **Responsive sizing** - Uses vh units for consistent sizing across devices

### API Routes (`src/app/api/images/route.ts`)

Phase 2: Blob-backed API with safe fallbacks

- **GET** `/api/images` - Returns `{ images: string[], canWrite: boolean }`
  - With `BLOB_READ_WRITE_TOKEN`: lists `@vercel/blob` objects under prefix `uploads/` and returns public URLs; `canWrite: true`.
  - On Vercel without token: `{ images: [], canWrite: false }` (client shows fallback set).
  - Locally without token: reads `public/uploads/`; `canWrite: true`.
- **POST** `/api/images` - Upload image:
  - With token: `multipart/form-data` only; stores via `put(file, { access: 'public' })` and returns `{ ok: true, url }`.
  - On Vercel without token: `403` read-only.
  - Local dev without token: writes to `public/uploads/`.
- **DELETE** `/api/images` - Delete image:
  - With token: accepts `?url=<public-url>` or `?name=<filename>`; deletes via `del(urlOrPath)`.
  - On Vercel without token: `403` read-only.
  - Local dev without token: deletes from `public/uploads/` by `?name=`.

Implementation details:

- Blob prefix: `uploads/`.
- Preferred upload path is `multipart/form-data` with field `file`.
- JSON fallback (`dataUrl`) remains supported only in local dev fallback.
- Max file size: 5 MB; image mime-types enforced.
- Filenames are sanitized with `replace(/[^\w.-]/g, '_')` to avoid unsafe paths.
- Token stays server-only; SDK is used exclusively in the route handler.

### Image Upload Component (`src/components/ImageUploader.tsx`)

Handles image uploads with drag-and-drop interface that integrates with the slider.

## Configuration Files

### TypeScript

- Uses `@/*` path mapping pointing to `src/*`
- Strict mode enabled with incremental compilation
- Next.js plugin integration

### ESLint

- Modern flat config format
- TypeScript, React, and Next.js rules
- Prettier integration for formatting
- Consistent type imports enforced

### Tailwind CSS

- Standard setup; optional for consumers
- Component works without Tailwind (uses inline styles); Tailwind enhances visuals
- When used as a package, document adding the package path to `content` to avoid purge

## Development Notes

### Slider Customization

All slider behavior is controlled through `SLIDER_CONFIG` in `config.ts`:

- Card dimensions and spacing
- Animation timing and spring physics
- Drag sensitivity and constraints
- Visual effects (scale, opacity, blur)

### File Structure Conventions

- Components in `src/components/` with co-located hooks and config
- API routes follow Next.js App Router conventions
- Images stored in `public/uploads/` for static serving

### State Management

Uses React hooks and context patterns - no external state management library. The slider maintains its own internal state while providing callbacks for parent component integration.

### Styling Approach

The slider uses Framer Motion and `vh` units; Tailwind utilities are optional and enhance styling. Default fallback uses inline styles and regular `<img>`.

### Sizing (component)

- Card sizes and horizontal offsets are interpreted in `svmin` units for mobile correctness (stable with dynamic toolbars)
- Slider container height is clamped by `svh` and can be overridden via CSS variable `--spark-slider-h` (e.g., `md:[--spark-slider-h:48svh]`)

### Component usage

```tsx
import SparkSlider from '@/components/SparkSlider/SparkSlider';

<SparkSlider
  images={['/uploads/one.jpg', '/uploads/two.jpg']}
  alt='Image'
  autoPlayInterval={6000}
  className='md:[--spark-slider-h:48svh]'
/>;
```

- `images`: array of strings
- Optional: `alt`, `autoPlayInterval`, `className`, `cardClassName`, `renderImage(src, alt, isCenter)`

### Images and uploads (technical)

- Data sources for `SparkSlider` (`src/app/page.tsx`):
  - Primary: `GET /api/images` → `string[]` paths (local FS under `public/uploads/` in Phase 1)
  - Fallback: generated URLs from `picsum.photos` if server list is empty
- SSR/hydration correctness:
  - Avoid non-deterministic values (`Math.random()`, `Date.now()`) during initial render
  - We derive a deterministic daily seed `new Date().toISOString().slice(0,10)` and then build
    fallback URLs with `https://picsum.photos/seed/${seed}-${i}/1600/1200`
  - A client-only "Shuffle" button updates a `fallbackSeed` state post-mount to regenerate the set without hydration mismatches
- UI controls:
  - `ImageUploader` handles browse/manage; it sends `multipart/form-data` POST and `DELETE`
  - The Shuffle button lives in the header and regenerates fallback-only images; user uploads always take precedence when present
  - The uploader is hidden when `GET /api/images` returns `canWrite: false` (read-only mode)

### Vercel demo (uploads persistence)

- Vercel’s filesystem is ephemeral; use `@vercel/blob` for persistence when a server token is configured.
- Behavior summary:
  - Production (no token): read-only; `{ images: [], canWrite: false }`; client shows `picsum.photos` fallback.
  - Preview (token set for Preview env): full browse/manage; public URLs; `canWrite: true`. Share preview URL privately for testing.
  - Local dev without token: filesystem in `public/uploads/` stays as-is.
