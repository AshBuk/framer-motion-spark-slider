# Spark Slider

> Lightweight and fast React carousel slider powered by Framer Motion animations

[![npm](https://img.shields.io/npm/v/@ashbuk/spark-slider?logo=npm)](https://npmjs.com/package/@ashbuk/spark-slider)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-%E2%89%A518-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-%E2%89%A512-0055FF?logo=framer)](https://www.framer.com/motion/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[![Demo](https://img.shields.io/badge/demo-vercel-black?logo=vercel)](https://spark-slider.vercel.app/)

**Lightweight React carousel built with Framer Motion. Framework-agnostic by default (uses `<img>`), with an escape hatch to inject `next/image`. Designed as a modern, custom, and highly optimized solution for large image datasets, it works seamlessly on laptops, tablets, and phones.**

## ✦ Features

- Smooth drag-to-swipe with momentum-free, precise control
- Click on center card to select (single tap on touch)
- Auto-play with pause on interaction and hidden tab detection
- Responsive layout using viewport units (`svh`/`svmin`)
- Keyboard navigation (arrow keys)
- Accessibility features with ARIA support
- Performance: renders only visible cards, lazy loading for non-center images
- Framework-agnostic with Next.js integration support

## ✦ Install

```bash
npm i @ashbuk/spark-slider framer-motion react react-dom
```

Peer dependencies: React 18+, Framer Motion 12+

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

## ✦ API Reference

### SparkSlider Props

| Prop                 | Type                                | Description                        |
| -------------------- | ----------------------------------- | ---------------------------------- |
| `images`             | `string[]`                          | Array of image URLs or paths       |
| `alt?`               | `string`                            | Alt text for images                |
| `autoPlayInterval?`  | `number`                            | Auto-play interval in milliseconds |
| `className?`         | `string`                            | CSS classes for container          |
| `cardClassName?`     | `string`                            | CSS classes for each card wrapper  |
| `renderImage?`       | `(src, alt, isCenter) => ReactNode` | Custom image renderer              |
| `onSlideSelect?`     | `(index: number) => void`           | Called when slide is selected      |
| `onSelectionChange?` | `(index: number) => void`           | Called when selection changes      |

### Exports

- `SparkSlider` – Main component
- `SLIDER_CONFIG` – Configuration constants
- `useSparkSlider` – Internal hook for advanced usage
- `CardPosition` – TypeScript type

## ✦ Styling

- Pre-styled with utility classes (no external CSS files required).
- Height can be set via CSS var `--spark-slider-h` using svh units.
- Custom styling via `className` and `cardClassName` props.
  > **Note**: Component uses Tailwind utility classes internally. If you don't use Tailwind, you may want to add it or override styles via className props.

## ✦ Demo

Try the live demo: [spark-slider.vercel.app](https://spark-slider.vercel.app/)

## ✦ GitHub Repository

Full source code and demo app: [github.com/AshBuk/framer-motion-spark-slider](https://github.com/AshBuk/framer-motion-spark-slider)

## ✦ Development (monorepo)

- This package is developed inside a Next.js demo app. In dev, the package sources under `packages/spark-slider/src/spark` are a symbolic link to the app sources `src/components/SparkSlider/*` to avoid duplication.
- The app imports by package name and Next is configured with `transpilePackages: ['@ashbuk/spark-slider']` for hot reload.
- Build locally:

```bash
npm -w packages/spark-slider run build
```

## ✦ Support

- GitHub Issues: [Report bugs or request features](https://github.com/AshBuk/framer-motion-spark-slider/issues)
- Contributions welcome! See [CONTRIBUTING.md](https://github.com/AshBuk/framer-motion-spark-slider/blob/main/CONTRIBUTING.md)

## ✦ License

MIT — see [LICENSE](https://github.com/AshBuk/framer-motion-spark-slider/blob/main/LICENSE)
