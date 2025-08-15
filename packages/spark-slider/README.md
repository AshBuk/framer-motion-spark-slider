# Spark Slider

Lightweight React carousel built with Framer Motion. Framework-agnostic by default (uses `<img>`), with an escape hatch to inject `next/image`.

## ✦ Install

```bash
npm i @ashbuk/spark-slider framer-motion react react-dom
```

**Alternative:** Install from GitHub Packages (requires [GitHub token setup](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package))

Peer deps expected in host app: React 18, Framer Motion 12.

## ✦ Usage

```tsx
import { SparkSlider, SLIDER_CONFIG } from '@ashbuk/spark-slider';

export default function Example() {
  const images = [
    'https://picsum.photos/id/1015/1600/1200',
    'https://picsum.photos/id/1016/1600/1200',
    'https://picsum.photos/id/1018/1600/1200',
  ];
  return (
    <SparkSlider
      images={images}
      alt='Image'
      autoPlayInterval={SLIDER_CONFIG.DEFAULT_AUTOPLAY_INTERVAL_MS}
      className='[--spark-slider-h:60svh]'
    />
  );
}
```

With Next.js `next/image`:

```tsx
import Image from 'next/image';
import { SparkSlider } from '@ashbuk/spark-slider';

<SparkSlider
  images={['/a.jpg', '/b.jpg']}
  renderImage={(src, alt, isCenter) => (
    <Image
      src={src}
      alt={alt}
      fill
      priority={isCenter}
      style={{ objectFit: 'cover' }}
    />
  )}
/>;
```

## ✦ API

- • `SparkSlider` props:
  - `images: string[]`
  - `alt?: string`
  - `autoPlayInterval?: number`
  - `className?: string` – container classes
  - `cardClassName?: string` – applied to each card wrapper
  - `renderImage?(src, alt, isCenter): ReactNode` – custom renderer
- • `SLIDER_CONFIG` – exported config; safe to read for defaults
- • `useSparkSlider` – hook used internally (advanced integration)
- • `CardPosition` – type

## ✦ Development (monorepo)

- This package is developed inside a Next.js demo app. In dev, the package sources under `packages/spark-slider/src/spark` are a symbolic link to the app sources `src/components/SparkSlider/*` to avoid duplication.
- The app imports by package name and Next is configured with `transpilePackages: ['@ashbuk/spark-slider']` for hot reload.
- Build locally:

```bash
npm -w packages/spark-slider run build
```

## ✦ Publish

- Version bump `packages/spark-slider/package.json` and push a tag matching `spark-slider-v*` (e.g. `spark-slider-v0.1.4`). 
- A GitHub Action will automatically publish to **both**:
  - **npm registry** (https://npmjs.com) - public access
  - **GitHub Packages** (https://npm.pkg.github.com) - requires auth

### Requirements for dual publishing:
- `NPM_TOKEN` secret in GitHub repository settings
- npm account with publish permissions

## ✦ Styling

- No CSS required. Works without Tailwind.
- Height can be set via CSS var `--spark-slider-h` using svh units.

## ✦ License

MIT
