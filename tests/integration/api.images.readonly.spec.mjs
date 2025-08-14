import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import { spawn } from 'node:child_process';
import http from 'node:http';

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

before(async () => {
  // Assume build is already done in pretest. Start standalone server.
  proc = spawn('node', ['.next/standalone/server.js'], {
    env: { ...process.env, VERCEL: '1', PORT: '3031', HOSTNAME: '127.0.0.1' },
    stdio: 'inherit',
    shell: false,
  });
  // Wait for server to respond
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    try {
      const { status } = await fetchJson('http://127.0.0.1:3031/api/images');
      if (status === 200) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
});

after(() => {
  if (proc) proc.kill('SIGTERM');
});

test('GET /api/images returns read-only in prod without token', async () => {
  const { status, json } = await fetchJson('http://127.0.0.1:3031/api/images');
  assert.equal(status, 200);
  assert.equal(json.canWrite, false);
  assert.ok(Array.isArray(json.images));
  assert.equal(json.images.length, 0);
});
