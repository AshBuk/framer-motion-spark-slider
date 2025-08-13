'use client';

import { useEffect, useState } from 'react';

export default function ImageUploader({
  onUploaded,
  uploadedCount,
  images,
  onDeleted,
}: {
  onUploaded: (urls: string[]) => void;
  uploadedCount?: number;
  images?: string[];
  onDeleted?: (url: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(100);

  useEffect(() => {
    // Reset page size when opening the panel or when image list changes
    setVisibleCount(100);
  }, [manageOpen, images?.length]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setLoading(true);
    try {
      const results = await Promise.all(
        Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/images', {
            method: 'POST',
            body: formData,
            headers: { 'x-requested-with': 'fetch' },
          });
          if (!res.ok) {
            const msg =
              (await res.json().catch(() => ({}))).error || 'Upload failed';
            throw new Error(msg);
          }
          const json = await res.json();
          return json.url as string | undefined;
        })
      );
      onUploaded(results.filter(Boolean) as string[]);
    } catch (err) {
      // Minimal surface: alert once; avoid per-file spam
      const message = err instanceof Error ? err.message : 'Upload failed';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='relative flex items-center gap-[clamp(0.25rem,1vw,0.5rem)]'>
      <label
        className='relative inline-flex cursor-pointer items-center gap-[clamp(0.25rem,1vw,0.5rem)] rounded-lg bg-white/10 px-[clamp(0.5rem,2vw,1rem)] py-[clamp(0.3rem,1.2vw,0.5rem)] text-[clamp(0.8rem,1.6vw,1rem)] text-white hover:bg-white/20'
        aria-label='Browse images'
      >
        <span>Browse…</span>
        {typeof uploadedCount === 'number' && uploadedCount > 0 ? (
          <span className='ml-2 inline-flex h-[clamp(1rem,2.2vw,1.5rem)] min-w-[clamp(1rem,2.2vw,1.5rem)] items-center justify-center rounded-full bg-white/20 px-[clamp(0.25rem,0.6vw,0.375rem)] text-[clamp(0.625rem,1vw,0.75rem)] leading-none text-white'>
            {uploadedCount}
          </span>
        ) : null}
        <input
          type='file'
          multiple
          accept='image/*'
          onChange={(e) => handleFiles(e.target.files)}
          className='hidden'
        />
      </label>
      <button
        type='button'
        className='rounded-md bg-white/10 px-[clamp(0.5rem,2vw,1rem)] py-[clamp(0.3rem,1.2vw,0.5rem)] text-[clamp(0.8rem,1.6vw,1rem)] text-white hover:bg-white/20'
        onClick={() => setManageOpen((v) => !v)}
        aria-expanded={manageOpen}
        aria-controls='upload-manage-panel'
      >
        Manage
      </button>
      {manageOpen && images && images.length > 0 ? (
        <div
          id='upload-manage-panel'
          className='absolute left-0 top-full z-50 mt-2 w-64 rounded-md border border-white/10 bg-black/90 p-2 shadow-lg backdrop-blur'
        >
          <ul className='max-h-60 overflow-auto text-xs sm:text-sm'>
            {images.slice(0, visibleCount).map((url) => (
              <li
                key={url}
                className='flex items-center justify-between gap-2 py-1'
              >
                <span className='truncate'>{url.split('/').pop()}</span>
                <button
                  type='button'
                  className='rounded bg-white/10 px-2 py-0.5 text-[11px] text-red-300 hover:bg-white/20'
                  onClick={async () => {
                    await fetch(`/api/images?url=${encodeURIComponent(url)}`, {
                      method: 'DELETE',
                      headers: { 'x-requested-with': 'fetch' },
                    });
                    onDeleted?.(url);
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          {visibleCount < (images?.length ?? 0) ? (
            <div className='mt-2 flex justify-center'>
              <button
                type='button'
                className='rounded bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20'
                onClick={() =>
                  setVisibleCount((v) => Math.min(v + 100, images.length))
                }
              >
                Load more
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      {loading ? (
        <span className='text-sm text-white/60'>Uploading...</span>
      ) : null}
    </div>
  );
}
