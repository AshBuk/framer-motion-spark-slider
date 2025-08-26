<div align="center">

# Spark Slider

> \*\*Responsive carousel slider built with Next.js and Framer Motion

</div>

<div align="center">

[![CI](https://github.com/AshBuk/framer-motion-spark-slider/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/AshBuk/framer-motion-spark-slider/actions/workflows/ci.yml)
[![Publish](https://github.com/AshBuk/framer-motion-spark-slider/actions/workflows/publish-package.yml/badge.svg)](https://github.com/AshBuk/framer-motion-spark-slider/actions/workflows/publish-package.yml)
[![Code Quality](https://img.shields.io/badge/Code%20Quality-TypeScript%20%7C%20ESLint%20%7C%20Prettier-brightgreen?logo=eslint)](https://github.com/AshBuk/framer-motion-spark-slider)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-%E2%89%A518-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-%E2%89%A512-0055FF?logo=framer)](https://www.framer.com/motion/)
[![Node](https://img.shields.io/badge/node-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

[![Lines of Code](https://tokei.rs/b1/github/AshBuk/framer-motion-spark-slider?category=code)](https://github.com/AshBuk/framer-motion-spark-slider)
[![Dependencies](https://img.shields.io/librariesio/github/AshBuk/framer-motion-spark-slider)](https://libraries.io/github/AshBuk/framer-motion-spark-slider)
[![Monorepo](https://img.shields.io/badge/monorepo-workspaces-orange)](#)

[![npm](https://img.shields.io/npm/v/@ashbuk/spark-slider?logo=npm)](https://npmjs.com/package/@ashbuk/spark-slider)
[![GitHub Packages](https://img.shields.io/badge/GitHub%20Packages-enabled-181717?logo=github)](https://github.com/AshBuk/framer-motion-spark-slider/packages)

[![Demo](https://img.shields.io/badge/demo-vercel-black?logo=vercel)](https://spark-slider.vercel.app/)

</div>

### ✦ Screencast

https://github.com/user-attachments/assets/95d524de-4d2f-402b-a7b2-62f9f4add3f8

[spark-slider.vercel.app](https://spark-slider.vercel.app/)

**Lightweight and fast React slider carousel powered by Framer Motion animations.
Designed as a modern, custom, and highly optimized solution for large image datasets, it works seamlessly on laptops, tablets, and phones, with smooth support for both touch and mouse/keyboard input.**

### ✦ For businesses and users

A robust slider suitable for galleries, installations, projections, events, or products that need precise, smooth interactions and an accessible UI.

## Features

- Smooth drag-to-swipe with momentum-free, precise control
- Click on the center card to enter fullscreen (single tap on touch)
- Auto-play with pause on interaction
- Responsive layout using viewport units (`svh`/`svmin`)
- Simple image uploads UI (Browse/Manage)

### ✦ Vercel demo

- Public demo: [spark-slider.vercel.app](https://spark-slider.vercel.app/)
  You are viewing a hosted demo on Vercel. Images are randomized daily via [picsum.photos](https://picsum.photos) (sourced from the Unsplash photographers collection). Uploading and managing your own images is disabled here. I am considering expanding the online service with private-cloud storage so users can manage their own images.
  // Private preview (if provided): uploads and deletes are enabled (images up to 5 MB; common image formats).

## For developers

- Packaged as an npm React library for easy reuse in apps (see `packages/spark-slider/README.md`).

**Install as a library**

```bash
npm i @ashbuk/spark-slider framer-motion react react-dom
```

- Stars are appreciated; contributions are welcome! Start onboarding by reading `DEVELOPMENT.md` and `CONTRIBUTING.md`. Comments in the codebase are concise and serve as additional documentation.

- The project adheres to SOLID and DRY principles.
- The slider uses modern technologies with minimal dependencies (Next.js 15 App Router, React, Framer Motion, Tailwind CSS, CSS viewport units `svh`/`svmin`).
- Performance: renders only visible cards, non-visible slides are not mounted, non-center images use `loading="lazy"`. Scales to large image lists while keeping the DOM small.

Slider breakdown:

- `SparkSlider.tsx` — presentation and accessibility: renders position-based cards, handles keyboard and fullscreen.
- `useSparkSlider.ts` — interaction/state: index, autoplay, drag/swipe, and transition gating.
- `config.ts` — single source of truth (`SLIDER_CONFIG`) for sizes, spacing, positions, spring presets, and thresholds.

## ✦ Links and contact

- GitHub: https://github.com/AshBuk
- LinkedIn: https://www.linkedin.com/in/ashbuk/
- Email: 2asherbuk@gmail.com

## ✦ License

MIT — see `LICENSE`.

## ✦ Sponsor

[![Sponsor](https://img.shields.io/badge/Sponsor-💖-pink?style=for-the-badge&logo=github)](https://github.com/sponsors/AshBuk) [![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=R3HZH8DX7SCJG)
