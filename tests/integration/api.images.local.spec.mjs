import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, json: JSON.parse(data) });
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

let proc;
// Standalone server reads from ".next/standalone/public/uploads"
const uploadDir = path.join(
  process.cwd(),
  '.next',
  'standalone',
  'public',
  'uploads'
);
const testFile = path.join(uploadDir, 'test_api_local.jpg');

before(async () => {
  // Ensure a jpeg-like file exists in public/uploads
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(testFile, Buffer.from([0xff, 0xd8, 0xff, 0xd9]));

  // Start standalone server on port 3032 (local FS mode)
  proc = spawn('node', ['.next/standalone/server.js'], {
    env: { ...process.env, PORT: '3032', HOSTNAME: '127.0.0.1' },
    stdio: 'inherit',
    shell: false,
  });
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    try {
      const { status } = await fetchJson('http://127.0.0.1:3032/api/images');
      if (status === 200) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
});

after(async () => {
  if (proc) proc.kill('SIGTERM');
  await fs.unlink(testFile).catch(() => {});
});

test('GET /api/images returns FS list with canWrite:true in local mode', async () => {
  const { status, json } = await fetchJson('http://127.0.0.1:3032/api/images');
  assert.equal(status, 200);
  assert.equal(json.canWrite, true);
  assert.ok(Array.isArray(json.images));
  assert.ok(json.images.includes('/uploads/test_api_local.jpg'));
});
