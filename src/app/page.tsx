'use client';

import { useEffect, useState } from 'react';
import SparkSlider from '@/components/SparkSlider/SparkSlider'; 
import ImageUploader from '@/components/ImageUploader';

export default function HomePage() {
  const [images, setImages] = useState<string[]>([]);

  const refresh = async () => {
    const res = await fetch('/api/images', { cache: 'no-store' });
    const json = (await res.json()) as { images?: string[] };
    setImages(json.images || []);
  };

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <main className='min-h-screen p-6'>
      <h1 className='mb-4 text-2xl font-semibold'>Framer Motion Spark Slider</h1>
      <p className='mb-4 text-sm text-neutral-700'>
        Upload images and preview them in the slider. Double tap center card to
        select.
      </p>
      <ImageUploader
        onUploaded={(urls) => {
          // optimistic update for immediate preview
          setImages((prev) => [...prev, ...urls]);
          void refresh();
        }}
      />
      <div className='mt-6'>
        <SparkSlider images={images} altPrefix='Image' onSelectionChange={() => {}} />
      </div>
    </main>
  );
}
