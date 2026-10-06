import type { MetadataRoute } from 'next';

/**
 * Manifest PWA Lunay. Ikon digenerate oleh scripts/generate-icons.mjs;
 * warna mengikuti tema putih-pink (selalu terang).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lunay — Pelacak Siklus & Kesehatan Wanita',
    short_name: 'Lunay',
    description:
      'Catat haid, gejala, dan sinyal tubuhmu; lihat prediksi siklus dan wawasan kesehatan. Data tersimpan privat di perangkatmu.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'id',
    dir: 'ltr',
    background_color: '#fefafc',
    theme_color: '#fefafc',
    categories: ['health', 'fitness', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
