'use client';

export default function SponsorPage() {
  return (
    <main className='mx-auto max-w-2xl p-6'>
      <h1 className='mb-3 text-2xl font-semibold'>Support the project</h1>
      <p className='mb-6 text-sm text-neutral-300'>
        If this slider saves you time, consider sponsoring to help me keep
        improving it. Thank you!
      </p>
      <a
        href='https://github.com/sponsors/AshBuk'
        target='_blank'
        rel='noreferrer'
        className='inline-flex items-center rounded-md bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-500'
      >
        Sponsor on GitHub
      </a>
    </main>
  );
}
