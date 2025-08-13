import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { put, list, del as blobDel } from '@vercel/blob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const BLOB_PREFIX = 'uploads/';
const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
const isVercel = !!process.env.VERCEL;
const isReadOnlyProd = isVercel && !hasBlob;
const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif|avif)$/i;
const sanitize = (name: string) =>
  (name || `img_${Date.now()}`).replace(/[^\w.-]/g, '_');
const isAllowedImageMime = (type: string) =>
  /^(image\/)(png|jpe?g|webp|gif|avif)$/i.test(type);

export async function GET() {
  // When token is present, use Vercel Blob (server-only)
  if (hasBlob) {
    const { blobs } = await list({
      prefix: BLOB_PREFIX,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    const images = blobs.map((b) => b.url);
    return NextResponse.json({ images, canWrite: true });
  }

  // On Vercel without token, return read-only mode with empty list (client will fallback)
  if (isReadOnlyProd) {
    return NextResponse.json({ images: [], canWrite: false });
  }

  // Local dev fallback: use filesystem as before
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const files = await fs.readdir(UPLOAD_DIR);
  const images = files
    .filter((f) => IMAGE_EXT_RE.test(f))
    .map((name) => `/uploads/${name}`);
  return NextResponse.json({ images, canWrite: true });
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';

  // Blob-backed uploads in production when token is available
  if (hasBlob) {
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'multipart/form-data required' },
        { status: 400 }
      );
    }
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 });
    }
    if (!isAllowedImageMime(file.type)) {
      return NextResponse.json({ error: 'Invalid mime type' }, { status: 415 });
    }
    const safe = sanitize(file.name);
    const { url } = await put(`${BLOB_PREFIX}${safe}`, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.json({ ok: true, url });
  }

  // On Vercel without token → read-only
  if (isReadOnlyProd) {
    return NextResponse.json({ error: 'Read-only demo' }, { status: 403 });
  }

  // Local dev fallback: filesystem
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  // Preferred path: multipart/form-data
  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 });
    }
    const safe = sanitize(file.name);
    await fs.writeFile(path.join(UPLOAD_DIR, safe), buffer);
    return NextResponse.json({ ok: true, url: `/uploads/${safe}` });
  }

  // Backward compatibility: JSON with dataUrl
  const { dataUrl, filename } = (await req.json().catch(() => ({}))) as {
    dataUrl?: string;
    filename?: string;
  };
  if (!dataUrl)
    return NextResponse.json({ error: 'No dataUrl' }, { status: 400 });

  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match)
    return NextResponse.json({ error: 'Invalid dataUrl' }, { status: 400 });

  const ext = match[1].toLowerCase();
  if (!/^(png|jpe?g|webp|gif|avif)$/.test(ext)) {
    return NextResponse.json({ error: 'Invalid image type' }, { status: 415 });
  }
  const buf = Buffer.from(match[2], 'base64');
  if (buf.length > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large' }, { status: 413 });
  }
  const safe = sanitize(filename || `img_${Date.now()}.${ext}`);
  await fs.writeFile(path.join(UPLOAD_DIR, safe), buf);
  return NextResponse.json({ ok: true, url: `/uploads/${safe}` });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Blob-backed delete when token is available
  if (hasBlob) {
    const url = searchParams.get('url');
    const name = searchParams.get('name');
    if (!url && !name) {
      return NextResponse.json(
        { error: 'url or name required' },
        { status: 400 }
      );
    }
    const target = url ?? `${BLOB_PREFIX}${path.basename(name as string)}`;
    await blobDel(target, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return NextResponse.json({ ok: true });
  }

  // On Vercel without token → read-only
  if (isReadOnlyProd) {
    return NextResponse.json({ error: 'Read-only demo' }, { status: 403 });
  }

  // Local dev fallback: filesystem delete
  const url = searchParams.get('url');
  const name = searchParams.get('name') || (url ? path.basename(url) : null);
  if (!name)
    return NextResponse.json(
      { error: 'name or url required' },
      { status: 400 }
    );
  const file = path.join(UPLOAD_DIR, path.basename(name));
  await fs.unlink(file).catch(() => {});
  return NextResponse.json({ ok: true });
}
