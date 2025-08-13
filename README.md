# Framer Motion Spark Slider

Optimized production-ready slider built with Next.js and Framer Motion.

## Features

- Smooth drag-to-swipe with momentum-free, precise control
- Double-tap on the center card to select/deselect
- Auto-play with pause on interaction
- Responsive layout using viewport units (`svh`/`svmin`)
- Simple image uploads UI (Browse/Manage)

### Live demo


- Public demo: [spark-slider.vercel.app](https://spark-slider.vercel.app/)
uploads are turned off to keep the demo clean. You can browse the slider with high‑quality placeholder images and use the Shuffle button to refresh the set.
- Private preview: if you received a private preview link, uploads and deletes are enabled (images up to 5 MB; common image formats).

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

- Use Browse/Manage to upload images — they will appear in the slider.
- If no images yet, the demo shows a high-quality fallback set (randomized daily). Use the Shuffle button to regenerate.

Using Docker? Use Docker Compose:

```bash
docker compose up --build
```

This mounts `./public/uploads` as a volume for persistence.

## For developers

Start onboarding by reading `project-context.md`. Comments in the codebase are concise and serve as additional documentation. 
- The project adheres to SOLID and SRP principles.
- The slider uses modern technologies with minimal dependencies (Next.js 15 App Router, React, Framer Motion, Tailwind CSS, CSS viewport units `svh`/`svmin`).
- Performance: renders only visible cards, non-visible slides are not mounted, non-center images use `loading="lazy"`. Scales to large image lists while keeping the DOM small.


Slider breakdown:
- `SparkSlider.tsx` — presentation and accessibility: renders position-based cards, handles keyboard and fullscreen.
- `useSparkSlider.ts` — interaction/state: index, autoplay, drag/swipe, and transition gating.
- `config.ts` — single source of truth (`SLIDER_CONFIG`) for sizes, spacing, positions, spring presets, and thresholds.


## Support

If you find this project useful, consider supporting ongoing development:

[Sponsor on GitHub](https://github.com/sponsors/AshBuk)

## License

MIT — see `LICENSE`.
