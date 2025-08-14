#!/usr/bin/env node
/* eslint-disable no-console */
console.log('Resolved runtime env:');
console.log({
  VITE_API_BASE_URL: process.env.VITE_API_BASE_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_USE_PROXY: process.env.NEXT_PUBLIC_USE_PROXY,
  NEXT_PUBLIC_ENABLE_RIPPLE: process.env.NEXT_PUBLIC_ENABLE_RIPPLE,
});
