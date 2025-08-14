#!/usr/bin/env node
import { request } from 'undici';

const BASE = process.env.API_URL || 'https://revenue-ripple.onrender.com';
const paths = [
  '/insights/api/insight-of-day',
  '/insights/api/competitors',
  '/insights/api/analytics',
  '/insights/api/prompt-suggestions'
];

function print(title, obj) {
  console.log(`\n=== ${title} ===`);
  console.log(obj);
}

async function probe(path) {
  const url = `${BASE}${path}`;
  try {
    const pre = await request(url, { method: 'OPTIONS', headers: { 'Origin': process.env.TEST_ORIGIN || 'https://example.vercel.app', 'Access-Control-Request-Method': 'GET' } });
    print(`OPTIONS ${url}`, { status: pre.statusCode, headers: Object.fromEntries(pre.headers) });
  } catch (e) {
    print(`OPTIONS ${url} ERROR`, e.message || e.toString());
  }

  try {
    const get = await request(url, { method: 'GET' });
    const body = await get.body.text();
    print(`GET ${url}`, { status: get.statusCode, headers: Object.fromEntries(get.headers), body: body.slice(0, 200) });
  } catch (e) {
    print(`GET ${url} ERROR`, e.message || e.toString());
  }
}

(async () => {
  console.log(`Probing API at ${BASE}`);
  for (const p of paths) await probe(p);
})();
