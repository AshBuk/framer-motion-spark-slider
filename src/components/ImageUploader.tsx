'use client';

import { useState } from 'react';

export default function ImageUploader({
  onUploaded,
}: {
  onUploaded: (urls: string[]) => void;
}) {
  const [loading, setLoading] = useState(false);

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
          });
          const json = await res.json();
          return json.url as string | undefined;
        })
      );
      onUploaded(results.filter(Boolean) as string[]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center gap-3'>
      <input
        type='file'
        multiple
        accept='image/*'
        onChange={(e) => handleFiles(e.target.files)}
      />
      {loading ? (
        <span className='text-sm text-neutral-600'>Uploading...</span>
      ) : null}
    </div>
  );
}
