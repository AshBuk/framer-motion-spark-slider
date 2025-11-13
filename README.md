<div align="center">

# Spark Slider

> High-performance framework-agnostic React carousel slider powered by Framer Motion.

</div>

<div align="center">

[![CI](https://github.com/AshBuk/framer-motion-spark-slider/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/AshBuk/framer-motion-spark-slider/actions/workflows/ci.yml)
[![Publish](https://github.com/AshBuk/framer-motion-spark-slider/actions/workflows/publish-package.yml/badge.svg)](https://github.com/AshBuk/framer-motion-spark-slider/actions/workflows/publish-package.yml)
[![Code Quality](https://img.shields.io/badge/Code%20Quality-TypeScript%20%7C%20ESLint%20%7C%20Prettier-brightgreen?logo=eslint)](https://github.com/AshBuk/framer-motion-spark-slider)

[![npm](https://img.shields.io/npm/v/@ashbuk/spark-slider?logo=npm)](https://npmjs.com/package/@ashbuk/spark-slider)
[![GitHub Packages](https://img.shields.io/badge/GitHub%20Packages-enabled-181717?logo=github)](https://github.com/AshBuk/framer-motion-spark-slider/packages)

[![Demo](https://img.shields.io/badge/demo-vercel-black?logo=vercel)](https://spark-slider.vercel.app/)

</div>

### ✦ Screencast

https://github.com/user-attachments/assets/95d524de-4d2f-402b-a7b2-62f9f4add3f8

[spark-slider.vercel.app](https://spark-slider.vercel.app/)

**Lightweight and fast React slider carousel powered by Framer Motion animations.
Designed as a modern and highly optimized solution for large image datasets, it works seamlessly across laptops, tablets, and phones, with smooth support for both touch and mouse/keyboard input.**

### ✦ For businesses and users

A robust slider suitable for galleries, installations, projections, events, or products that need precise, smooth interactions and an accessible UI.

## ✦ Features

- Smooth drag-to-swipe with momentum-free, precise control
- Click on center card to select (single tap on touch)
- Auto-play with pause on interaction and hidden tab detection
- Responsive layout using viewport units (`svh`/`svmin`)
- Keyboard navigation (arrow keys)
- Accessibility features with ARIA support
- Performance: renders only visible cards, lazy loading for non-center images
- Lightweight (~12KB gzipped core)
- Framework-agnostic: works with Next.js, Vite, Create React App, Remix, Gatsby, and any React framework

### ✦ Vercel demo

- Public demo: [spark-slider.vercel.app](https://spark-slider.vercel.app/)
  You are viewing a hosted demo on Vercel. Images are randomized daily via [picsum.photos](https://picsum.photos) (sourced from the Unsplash photographers collection). Uploading and managing your own images is disabled here. I am considering expanding the online service with private-cloud storage so users can manage their own images.
  // Private preview (if provided): uploads and deletes are enabled (images up to 5 MB; common image formats).

## For developers

- Packaged as an npm React library for easy reuse in apps
- NPM Package: [@ashbuk/spark-slider](https://www.npmjs.com/package/@ashbuk/spark-slider)
- Package documentation: [`packages/spark-slider/README.md`](packages/spark-slider/README.md)
- Public API surfaces are documented with concise TSDoc

**Installation**

```bash
npm install @ashbuk/spark-slider
# or
yarn add @ashbuk/spark-slider
# or
pnpm add @ashbuk/spark-slider
```

**Quick Start:**

```tsx
import SparkSlider from '@ashbuk/spark-slider';
import '@ashbuk/spark-slider/dist/spark-slider.css';

const images = ['/image1.jpg', '/image2.jpg', '/image3.jpg'];

export default function App() {
  return <SparkSlider images={images} />;
}
```

- Start onboarding by reading:
- [`DEVELOPMENT.md`](DEVELOPMENT.md)
- [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Comments in the codebase are concise and serve as additional documentation.
- The project adheres to SOLID and DRY principles.
- The slider uses modern technologies with minimal dependencies (Next.js 15 App Router, React, Framer Motion, Tailwind CSS, CSS viewport units `svh`/`svmin`).
- Performance: renders only visible cards, non-visible slides are not mounted, non-center images use `loading="lazy"`. Scales to large image lists while keeping the DOM small.

## ✦ Links and contact

**📝 Original article:** [Read on my blog](https://ashbuk.hashnode.dev/high-performance-framework-agnostic-react-carousel-slider-powered-by-framer-motion)

- GitHub: https://github.com/AshBuk
- LinkedIn: https://www.linkedin.com/in/ashbuk/
- Email: 2asherbuk@gmail.com

## ✦ MIT [LICENSE](LICENSE)

## ✦ Sponsor

[![Sponsor](https://img.shields.io/badge/Sponsor-💖-pink?style=for-the-badge&logo=github)](https://github.com/sponsors/AshBuk) [![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=R3HZH8DX7SCJG)

If you find Spark Slider useful, please consider supporting development.
