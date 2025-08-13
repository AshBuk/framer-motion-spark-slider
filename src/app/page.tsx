'use client';

import { SLIDER_CONFIG } from '@/components/SparkSlider/config';

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

function SwipeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      className={className}
      fill='currentColor'
    >
      <path d='M7.75 12a.75.75 0 0 1 .75-.75h6.69l-1.72-1.72a.75.75 0 0 1 1.06-1.06l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 1 1-1.06-1.06l1.72-1.72H8.5a.75.75 0 0 1-.75-.75zM16.25 12a.75.75 0 0 1-.75.75H8.81l1.72 1.72a.75.75 0 1 1-1.06 1.06L6.22 12.28a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 1.06L8.81 11.25h6.69a.75.75 0 0 1 .75.75z' />
    </svg>
  );
}

export default function HomePage() {
  const [images, setImages] = useState<string[]>([]);
  const [canWrite, setCanWrite] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [autoPlayMs, setAutoPlayMs] = useState<number | null>(null);
  const [sliderScale, setSliderScale] = useState<number | null>(null);
  // Use a deterministic daily seed (UTC date) to avoid SSR/CSR hydration mismatch
  const [fallbackSeed, setFallbackSeed] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const fallbackImages = useMemo(() => {
    const count = 8;
    // 4:3 aspect to better match horizontal card layout
    return Array.from(
      { length: count },
      (_, i) => `https://picsum.photos/seed/${fallbackSeed}-${i}/1600/1200`
    );
  }, [fallbackSeed]);

  const refresh = async () => {
    const res = await fetch('/api/images', { cache: 'no-store' });
    const json = (await res.json()) as {
      images?: string[];
      canWrite?: boolean;
    };
    setImages(json.images || []);
    if (typeof json.canWrite === 'boolean') setCanWrite(json.canWrite);
  };

  useEffect(() => {
    void refresh();
  }, []);

  // Load persisted UI config from sessionStorage (client-only)
  useEffect(() => {
    try {
      const ap = sessionStorage.getItem('spark.autoPlayMs');
      const s = sessionStorage.getItem('spark.sliderScale');
      if (ap) setAutoPlayMs(Number(ap));
      if (s) setSliderScale(Number(s));
    } catch {
      // no-op
    }
  }, []);

  // No JS default scale calculation; rely on CSS var per breakpoint

  const sliderImages = images.length > 0 ? images : fallbackImages;

  return (
    <main className='relative flex min-h-[100svh] flex-col items-center justify-center gap-6 px-3 py-6 sm:p-6'>
      <div className='absolute left-0 right-0 top-[clamp(0.5rem,1.5vw,1.25rem)] z-[200] grid grid-cols-1 gap-[clamp(0.4rem,1vw,0.75rem)] sm:grid-cols-[1fr_auto_1fr] sm:items-center'>
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
        <div className='relative order-3 justify-self-start pl-[clamp(0.5rem,2vw,1.5rem)] sm:justify-self-end sm:pl-0 sm:pr-[clamp(0.5rem,2vw,1.5rem)]'>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              className='rounded-md bg-white/10 px-[clamp(0.5rem,2vw,1rem)] py-[clamp(0.3rem,1.2vw,0.5rem)] text-[clamp(0.8rem,1.6vw,1rem)] text-white hover:bg-white/20'
              onClick={() => setFallbackSeed(`${Date.now().toString(36)}`)}
              aria-label='Shuffle images'
            >
              Shuffle
            </button>
            <button
              type='button'
              className='rounded-md bg-white/10 px-[clamp(0.5rem,2vw,1rem)] py-[clamp(0.3rem,1.2vw,0.5rem)] text-[clamp(0.8rem,1.6vw,1rem)] text-white hover:bg-white/20'
              onClick={() => setShowConfig((v) => !v)}
              aria-label='Open slider config'
            >
              Config
            </button>
          </div>
          {showConfig ? (
            <div className='pointer-events-auto absolute left-2 top-full z-[250] mt-2 w-[min(92vw,22rem)] rounded-lg border border-white/10 bg-black/40 p-3 text-white backdrop-blur-sm sm:left-auto sm:right-0'>
              <div className='mb-2 text-sm font-medium'>Slider settings</div>
              <div className='flex flex-col gap-2'>
                <label className='flex flex-col gap-1 text-sm'>
                  <div className='flex items-center justify-between gap-3'>
                    <span>Autoplay (s)</span>
                    <span className='tabular-nums text-white/80'>
                      {Math.min(
                        30,
                        Math.max(
                          0,
                          Math.round(
                            (autoPlayMs ??
                              SLIDER_CONFIG.DEFAULT_AUTOPLAY_INTERVAL_MS) / 1000
                          )
                        )
                      )}
                    </span>
                  </div>
                  <input
                    type='range'
                    min={0}
                    max={30}
                    step={1}
                    value={Math.min(
                      30,
                      Math.max(
                        0,
                        Math.round(
                          (autoPlayMs ??
                            SLIDER_CONFIG.DEFAULT_AUTOPLAY_INTERVAL_MS) / 1000
                        )
                      )
                    )}
                    onChange={(e) => {
                      const secs = Math.min(
                        30,
                        Math.max(0, Number(e.target.value) || 0)
                      );
                      const nextMs = secs * 1000;
                      setAutoPlayMs(nextMs);
                      try {
                        sessionStorage.setItem(
                          'spark.autoPlayMs',
                          String(nextMs)
                        );
                      } catch {
                        const _ = null;
                      }
                    }}
                    className='w-full accent-gray-400'
                  />
                </label>
                <label className='flex flex-col gap-1 text-sm'>
                  <div className='flex items-center justify-between gap-3'>
                    <span>Scale</span>
                    <span className='tabular-nums text-white/80'>
                      {(sliderScale ?? 1).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type='range'
                    min={0.8}
                    max={1.28}
                    step={0.01}
                    value={sliderScale ?? 1}
                    onChange={(e) => {
                      const next = Math.min(
                        1.28,
                        Math.max(0.8, Number(e.target.value) || 1)
                      );
                      setSliderScale(next);
                      try {
                        sessionStorage.setItem(
                          'spark.sliderScale',
                          String(next)
                        );
                      } catch {
                        const _ = null;
                      }
                    }}
                    className='w-full accent-gray-400'
                  />
                </label>
                <div className='mt-1 flex items-center justify-end gap-2'>
                  <button
                    type='button'
                    className='rounded-md border border-white/20 px-3 py-1 text-sm text-white/90 hover:bg-white/10'
                    onClick={() => {
                      try {
                        sessionStorage.removeItem('spark.autoPlayMs');
                        sessionStorage.removeItem('spark.sliderScale');
                      } catch {
                        const _ = null;
                      }
                      setAutoPlayMs(null);
                      setSliderScale(null);
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className='w-full max-w-none sm:max-w-[min(96vw,1280px)] lg:max-w-[min(99vw,1760px)] xl:max-w-[min(99vw,2048px)]'>
        <div
          className='[--spark-slider-scale-default:0.88] [--spark-slider-scale:var(--spark-slider-scale-default)] sm:[--spark-slider-scale-default:1] lg:[--spark-slider-scale-default:1.12] xl:[--spark-slider-scale-default:1.2]'
          style={
            sliderScale != null
              ? ({
                  ['--spark-slider-scale' as string]: `calc(var(--spark-slider-scale-default, 1) * ${sliderScale})`,
                } as React.CSSProperties)
              : undefined
          }
        >
          <SparkSlider
            images={sliderImages}
            alt='Image'
            autoPlayInterval={
              autoPlayMs ?? SLIDER_CONFIG.DEFAULT_AUTOPLAY_INTERVAL_MS
            }
            className='[--spark-slider-h:calc(100svh-10rem)] lg:[--spark-slider-h:calc(100svh-8rem)] xl:[--spark-slider-h:calc(100svh-7rem)]'
          />
        </div>
      </div>

      {/* Instructions pinned to bottom of the screen */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 bottom-[clamp(0.25rem,1.5vw,0.75rem)] flex w-full justify-center px-2 sm:px-4'
      >
        <div className='flex max-w-full flex-col items-center gap-2 rounded-xl bg-black/20 px-2.5 py-2 text-[10px] text-white/80 backdrop-blur-none sm:gap-2 sm:px-3 sm:py-2 sm:text-xs'>
          {/* Line 1: Touch/gesture hints */}
          <div className='flex flex-wrap items-center justify-center gap-3'>
            <div className='flex items-center gap-1'>
              <TapIcon className='h-3 w-3 opacity-80 sm:h-4 sm:w-4' />
              <span className='opacity-90'>tap or</span>
            </div>
            <div className='flex items-center gap-1'>
              <SwipeIcon className='h-3 w-3 opacity-80 sm:h-4 sm:w-4' />
              <span className='opacity-90'>swipe the cards</span>
            </div>
            <div className='flex items-center gap-1'>
              <TapIcon className='h-3 w-3 opacity-80 sm:h-4 sm:w-4' />
              <span className='opacity-90'>choose</span>
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
              <SwipeIcon className='h-3 w-3 opacity-80 sm:h-4 sm:w-4' />
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
