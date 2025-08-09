import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export async function GET() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const files = await fs.readdir(UPLOAD_DIR);
  const images = files
    .filter((f) => /\.(png|jpe?g|webp|gif|avif)$/i.test(f))
    .map((name) => `/uploads/${name}`);
  return NextResponse.json({ images });
}

export async function POST(req: NextRequest) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const contentType = req.headers.get('content-type') || '';

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
    const safe = (file.name || `img_${Date.now()}`).replace(/[^\w.-]/g, '_');
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
  const buf = Buffer.from(match[2], 'base64');
  if (buf.length > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large' }, { status: 413 });
  }
  const safe = (filename || `img_${Date.now()}.${ext}`).replace(
    /[^\w.-]/g,
    '_'
  );
  await fs.writeFile(path.join(UPLOAD_DIR, safe), buf);
  return NextResponse.json({ ok: true, url: `/uploads/${safe}` });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  if (!name)
    return NextResponse.json({ error: 'name required' }, { status: 400 });

  const file = path.join(UPLOAD_DIR, path.basename(name));
  await fs.unlink(file).catch(() => {});
  return NextResponse.json({ ok: true });
}
