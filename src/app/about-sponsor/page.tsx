/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

import Link from 'next/link';

export default function AboutSponsorPage() {
  return (
    <main className='mx-auto max-w-2xl p-6'>
      <div className='mb-3'>
        <Link
          href='/'
          aria-label='Back to slider'
          className='inline-flex items-center gap-1 text-sm text-white/70 hover:text-white hover:underline'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            className='h-4 w-4'
            fill='currentColor'
            aria-hidden='true'
          >
            <path d='M15.75 5.75a.75.75 0 0 1 0 1.5H8.81l2.72 2.72a.75.75 0 1 1-1.06 1.06L6.22 8.03a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 1 1 1.06 1.06L8.81 5.75h6.94z' />
          </svg>
          <span>Back to slider</span>
        </Link>
      </div>
      <h1 className='mb-4 text-2xl font-semibold'>About</h1>
      <p className='mb-6 text-sm text-neutral-300'>
        Spark Slider — a lightweight and fast React slider carousel powered by
        Framer Motion animations. Designed as a modern, custom, and highly
        optimized solution for large image datasets, it works seamlessly on
        laptops, tablets, and phones, with smooth support for both touch and
        mouse/keyboard input.
      </p>

      <section className='mb-6'>
        <h2 className='mb-2 text-lg font-medium'>For businesses and users</h2>
        <p className='text-sm text-neutral-300'>
          A robust slider suitable for galleries, installations, projections,
          events, or products that need precise, smooth interactions and an
          accessible UI.
        </p>
      </section>

      <section className='mb-6'>
        <h2 className='mb-2 text-lg font-medium'>For developers</h2>
        <ul className='list-inside list-disc text-sm text-neutral-300'>
          <li>
            Source code on GitHub —
            <a
              className='ml-1 underline hover:text-white'
              href='https://github.com/AshBuk/framer-motion-spark-slider'
              target='_blank'
              rel='noreferrer'
            >
              framer-motion-spark-slider
            </a>
          </li>
          <li>Packaged as an npm React library for easy reuse in apps.</li>
        </ul>
        <p className='mt-2 text-sm text-neutral-300'>
          I would appreciate your interest on GitHub in the form of stars and
          contributions. Your PR will not be overlooked. If it follows the
          project&#39;s philosophy (minimal dependencies, SOLID, DRY) and the
          development context, it will likely be accepted.
        </p>
      </section>

      <section className='mb-6'>
        <h2 className='mb-2 text-lg font-medium'>Vercel demo</h2>
        <p className='text-sm text-neutral-300'>
          You are viewing a hosted demo on Vercel. Images are randomized daily
          via
          <a
            className='mx-1 underline hover:text-white'
            href='https://picsum.photos'
            target='_blank'
            rel='noreferrer'
          >
            picsum.photos
          </a>
          (sourced from the Unsplash photographers collection). Uploading and
          managing your own images is disabled here. I am considering expanding
          the online service with private-cloud storage so users can manage
          their own images.
        </p>
      </section>

      <section className='mb-6'>
        <h2 className='mb-2 text-lg font-medium'>Sponsor</h2>
        <div className='flex flex-wrap items-center gap-3'>
          <a
            href='https://github.com/sponsors/AshBuk'
            target='_blank'
            rel='noreferrer'
            className='inline-flex items-center gap-2 rounded-md bg-white/10 px-5 py-2.5 text-base font-medium text-white hover:bg-white/20'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              className='h-5 w-5'
              fill='currentColor'
              aria-hidden='true'
            >
              <path d='M12 21.35l-1.45-1.32C6.4 15.36 4 13.07 4 10.25 4 8.18 5.68 6.5 7.75 6.5c1.07 0 2.1.46 2.8 1.27l.45.51.45-.51c.7-.81 1.73-1.27 2.8-1.27 2.07 0 3.75 1.68 3.75 3.75 0 2.82-2.4 5.11-6.55 9.78L12 21.35z' />
            </svg>
            Sponsor on GitHub
          </a>
          <a
            href='https://www.paypal.com/donate/?hosted_button_id=R3HZH8DX7SCJG'
            target='_blank'
            rel='noreferrer'
            className='inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 py-2.5 text-base font-medium text-white hover:bg-white/10'
          >
            Donate via PayPal
          </a>
        </div>
      </section>

      <section className='mb-6 text-sm text-neutral-300'>
        <div className='mb-2'>Links and contact</div>
        <ul className='list-inside list-disc'>
          <li>
            GitHub:
            <a
              className='ml-1 underline hover:text-white'
              href='https://github.com/AshBuk'
              target='_blank'
              rel='noreferrer'
            >
              https://github.com/AshBuk
            </a>
          </li>
          <li>
            LinkedIn:
            <a
              className='ml-1 underline hover:text-white'
              href='https://www.linkedin.com/in/ashbuk/'
              target='_blank'
              rel='noreferrer'
            >
              https://www.linkedin.com/in/ashbuk/
            </a>
          </li>
          <li>
            Email:
            <a
              className='ml-1 underline hover:text-white'
              href='mailto:2asherbuk@gmail.com'
            >
              2asherbuk@gmail.com
            </a>
          </li>
        </ul>
      </section>

      <p className='text-sm text-neutral-300'>
        Thanks for checking out Spark Slider. If it helps your work, consider
        sponsoring future development.
      </p>
      <div className='mt-1 text-sm text-neutral-300'>
        <div>Cheers,</div>
        <div>Asher Buk</div>
      </div>
      <div className='mt-6 text-right text-xs text-neutral-500'>
        © 2025 Asher Buk — MIT
      </div>
    </main>
  );
}
