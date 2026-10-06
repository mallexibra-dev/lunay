/**
 * Generator aset ikon Lunay (putih-pink, tema terang).
 *
 * Output:
 *  - public/icons/icon-{192,512}.png           (purpose: any)
 *  - public/icons/icon-maskable-{192,512}.png  (purpose: maskable, zona aman 80%)
 *  - app/apple-icon.png                        (180x180, dipakai Next metadata)
 *
 * Jalankan: node scripts/generate-icons.mjs
 * Geometri marka harus tetap sinkron dgn src/components/shared/lunay-logo.tsx
 * dan app/icon.svg (viewBox 32: lingkaran 15,16 r13.5; potong 20.5,13 r11;
 * titik fase 24,23 r2.4).
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Warna brand — selaras token .app-theme di src/styles/app.css
const PINK = '#ca4a8b'; // primary
const PINK_DEEP = '#b12874'; // titik fase utama
const PINK_SOFT = '#f9dcec'; // titik fase kecil
const WHITE = '#fefafc'; // latar

/** Marka Lunay diskalakan dari viewBox 32 ke kanvas `size`. */
const mark = (size, scale) => {
  const s = (size / 32) * scale;
  const p = (v) => size / 2 + (v - 16) * s;
  const r = (v) => v * s;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${WHITE}"/>
  <circle cx="${p(15)}" cy="${p(16)}" r="${r(13.5)}" fill="${PINK}"/>
  <circle cx="${p(20.5)}" cy="${p(13)}" r="${r(11)}" fill="${WHITE}"/>
  <circle cx="${p(24)}" cy="${p(23)}" r="${r(2.4)}" fill="${PINK_DEEP}"/>
  <circle cx="${p(28)}" cy="${p(6)}" r="${r(1.5)}" fill="${PINK_SOFT}"/>
</svg>`;
};

const png = (svg) => sharp(Buffer.from(svg)).png();

const jobs = [
  // purpose: any — marka agak longgar agar ada napas di sekelilingnya
  { file: 'public/icons/icon-192.png', size: 192, scale: 0.92 },
  { file: 'public/icons/icon-512.png', size: 512, scale: 0.92 },
  // purpose: maskable — konten harus di dalam lingkaran aman 80%,
  // latar full-bleed supaya masking OS rapi
  { file: 'public/icons/icon-maskable-192.png', size: 192, scale: 0.72 },
  { file: 'public/icons/icon-maskable-512.png', size: 512, scale: 0.72 },
  // iOS home screen
  { file: 'app/apple-icon.png', size: 180, scale: 0.92 },
];

for (const { file, size, scale } of jobs) {
  const target = resolve(root, file);
  mkdirSync(dirname(target), { recursive: true });
  await png(mark(size, scale)).toFile(target);
  console.log('✔', file);
}
