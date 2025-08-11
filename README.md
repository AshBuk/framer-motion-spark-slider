# Framer Motion Spark Slider

Optimized production-ready slider built with Next.js and Framer Motion. Includes a simple image upload API that stores files in `public/uploads`.

## Features

- Smooth drag-to-swipe with momentum-free, precise control
- Double-tap on the center card to select/deselect
- Auto-play with pause on interaction
- Responsive layout using `vh`
- Simple upload/delete API (no external deps)
- Docker-ready (standalone output, volume for uploads)

## Support

If you find this project useful, consider supporting ongoing development:

[Sponsor on GitHub](https://github.com/sponsors/AshBuk)

Sponsors are appreciated and can be listed in the README (optional).

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and upload some images. They will appear in the slider.

## API

- GET `/api/images` → `{ images: string[] }`
- POST `/api/images` with JSON body `{ dataUrl: string, filename?: string }` → `{ ok: true, url: string }`
- DELETE `/api/images?name=<filename>` → `{ ok: true }`

Files are saved under `public/uploads`.

## Docker

```bash
docker compose up --build
```

This mounts `./public/uploads` as a volume for persistence.

## Usage (component)

```tsx
import SparkSlider from '@/components/SparkSlider/SparkSlider';

<SparkSlider images={['/uploads/one.jpg', '/uploads/two.jpg']} />;
```

- `images`: array of strings
- Optional props: `altPrefix`, `autoPlayInterval`, `onIdeaSelect`, `onFilteredCountChange`

## Development

- Build: `npm run build`
- Start: `npm start`
- Lint: `npm run lint`

## License

MIT — see `LICENSE`.
