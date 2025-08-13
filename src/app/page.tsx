'use client';

import { useEffect, useMemo, useState } from 'react';
import SparkSlider from '@/components/SparkSlider/SparkSlider';
import ImageUploader from '@/components/ImageUploader';

function TapIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      className={className}
      fill='currentColor'
    >
      <path d='M9.5 2.75a1.75 1.75 0 0 1 3.5 0V11h.25a3.75 3.75 0 0 1 3.75 3.75v1.15l1.18-.53a1.75 1.75 0 1 1 1.47 3.18l-4.96 2.24a5 5 0 0 1-2.1.46H9.25A4.75 4.75 0 0 1 4.5 17.5V12a1.5 1.5 0 0 1 3 0v1h1V7.75a1.75 1.75 0 0 1 3.5 0V11h1V2.75z' />
    </svg>
  );
}

export default function HomePage() {
  const [images, setImages] = useState<string[]>([]);
  const [canWrite, setCanWrite] = useState<boolean>(false);
  // Use a deterministic daily seed (UTC date) to avoid SSR/CSR hydration mismatch
  const [fallbackSeed, setFallbackSeed] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const fallbackImages = useMemo(() => {
    const count = 8;
    // 4:3 aspect to better match horizontal card layout
    return Array.from({ length: count }, (_, i) =>
      `https://picsum.photos/seed/${fallbackSeed}-${i}/1600/1200`
    );
  }, [fallbackSeed]);

  const refresh = async () => {
    const res = await fetch('/api/images', { cache: 'no-store' });
    const json = (await res.json()) as { images?: string[]; canWrite?: boolean };
    setImages(json.images || []);
    if (typeof json.canWrite === 'boolean') setCanWrite(json.canWrite);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const sliderImages = images.length > 0 ? images : fallbackImages;

  return (
    <main className='relative flex min-h-screen flex-col items-center justify-center gap-6 px-3 py-6 sm:p-6'>
      <div className='absolute left-0 right-0 top-[clamp(0.5rem,1.5vw,1.25rem)] grid grid-cols-1 gap-[clamp(0.4rem,1vw,0.75rem)] sm:grid-cols-[1fr_auto_1fr] sm:items-center'>
        <div className='pointer-events-auto order-1 justify-self-start pl-[clamp(0.5rem,2vw,1.5rem)] sm:order-none'>
          {canWrite ? (
            <ImageUploader
              uploadedCount={images.length}
              images={images}
              onDeleted={(url) => {
                setImages((prev) => prev.filter((u) => u !== url));
              }}
              onUploaded={(urls) => {
                setImages((prev) => [...prev, ...urls]);
                void refresh();
              }}
            />
          ) : null}
        </div>
        <h1
          className='order-2 justify-self-center text-center font-semibold sm:order-none sm:col-start-2 sm:col-end-3'
          style={{ fontSize: 'clamp(0.9rem, 2.4vw, 1.35rem)' }}
        >
          Framer Motion Spark Slider
        </h1>
        <div className='order-3 justify-self-start pl-[clamp(0.5rem,2vw,1.5rem)] sm:justify-self-end sm:pl-0 sm:pr-[clamp(0.5rem,2vw,1.5rem)]'>
          <button
            type='button'
            className='rounded-md bg-white/10 px-[clamp(0.5rem,2vw,1rem)] py-[clamp(0.3rem,1.2vw,0.5rem)] text-[clamp(0.8rem,1.6vw,1rem)] text-white hover:bg-white/20'
            onClick={() => setFallbackSeed(`${Date.now().toString(36)}`)}
            aria-label='Shuffle images'
          >
            Shuffle
          </button>
        </div>
      </div>

      <div className='w-full max-w-none sm:max-w-[min(92vw,1200px)]'>
        <SparkSlider
          images={sliderImages}
          alt='Image'
          className='[--spark-slider-h:calc(100svh-18rem)] [--spark-slider-scale:0.8] sm:[--spark-slider-h:calc(100svh-12rem)] sm:[--spark-slider-scale:1]'
        />
      </div>

      {/* Instructions pinned to bottom of the screen */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 bottom-[clamp(0.25rem,1.5vw,0.75rem)] flex w-full justify-center px-2 sm:px-4'
      >
        <div className='flex max-w-full flex-col items-center gap-2 rounded-xl bg-black/35 px-2.5 py-2 text-[10px] text-white/80 backdrop-blur-sm sm:gap-2 sm:px-3 sm:py-2 sm:text-xs'>
          {/* Line 1: Touch hints */}
          <div className='flex flex-wrap items-center justify-center gap-3'>
            <div className='flex items-center gap-1'>
              <TapIcon className='h-3 w-3 opacity-80 sm:h-4 sm:w-4' />
              <span className='opacity-90'>tap preview card</span>
            </div>
            <div className='flex items-center gap-1'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                className='h-3 w-3 opacity-80 sm:h-4 sm:w-4'
                fill='currentColor'
              >
                <path d='M7.75 12a.75.75 0 0 1 .75-.75h6.69l-1.72-1.72a.75.75 0 0 1 1.06-1.06l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 1 1-1.06-1.06l1.72-1.72H8.5a.75.75 0 0 1-.75-.75zM16.25 12a.75.75 0 0 1-.75.75H8.81l1.72 1.72a.75.75 0 1 1-1.06 1.06L6.22 12.28a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 1.06L8.81 11.25h6.69a.75.75 0 0 1 .75.75z' />
              </svg>
              <span className='opacity-90'>swipe the center</span>
            </div>
          </div>

          {/* Line 2: Keyboard help */}
          <div className='flex max-w-full flex-wrap items-center justify-center gap-3 rounded-full bg-black/25 px-2.5 py-1.5 sm:gap-4 sm:px-3 sm:py-1.5'>
            <div className='flex items-center gap-1'>
              <span className='rounded border border-white/20 bg-white/5 px-1.5 py-0.5 leading-none'>
                ←
              </span>
              <span className='rounded border border-white/20 bg-white/5 px-1.5 py-0.5 leading-none'>
                →
              </span>
              <span className='ml-1 opacity-80'>navigate</span>
            </div>
            <div className='flex items-center gap-1'>
              <TapIcon className='h-3 w-3 opacity-80 sm:h-4 sm:w-4' />
              <span className='rounded border border-white/20 bg-white/5 px-1.5 py-0.5 leading-none'>
                Esc
              </span>
              <span className='opacity-80'>exit fullscreen</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
