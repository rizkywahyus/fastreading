import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';
import { app } from '../server.js';
import { MESSAGES } from '../lib/article.js';

let server;
let base;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

async function postExtract(body) {
  const res = await fetch(`${base}/api/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

test('POST /api/extract requires a url', async () => {
  const res = await postExtract({});
  assert.equal(res.status, 400);
  assert.equal(res.body.error, MESSAGES.urlRequired);
});

test('POST /api/extract rejects an invalid url', async () => {
  const res = await postExtract({ url: 'nope' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, MESSAGES.urlInvalid);
});

test('POST /api/extract rejects non-http protocols', async () => {
  const res = await postExtract({ url: 'file:///etc/passwd' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, MESSAGES.urlProtocol);
});

test('error messages are in English', () => {
  const strings = Object.values(MESSAGES).map((m) =>
    typeof m === 'function' ? m(500) : m
  );
  for (const message of strings) {
    assert.doesNotMatch(message, /\b(Gagal|wajib|tidak|Tidak|Hanya|Coba|Periksa)\b/);
  }
});

test('GET /read serves the app shell', async () => {
  const res = await fetch(`${base}/read`);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /<html/i);
});
