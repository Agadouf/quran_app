
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  quranIcon192Base64,
  quranIcon512Base64,
} from './src/quran-icon-data';

function generateQuranIcons() {
  return {
    name: 'generate-quran-icons',

    configResolved(config: { root: string }) {
      const publicDir = resolve(config.root, 'public');
      mkdirSync(publicDir, { recursive: true });

      writeFileSync(
        resolve(publicDir, 'quran-icon-192.webp'),
        Buffer.from(quranIcon192Base64, 'base64'),
      );

      writeFileSync(
        resolve(publicDir, 'quran-icon-512.webp'),
        Buffer.from(quranIcon512Base64, 'base64'),
      );
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    generateQuranIcons(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: ['favicon.ico'],

      manifest: {
        id: '/',
        name: 'Quran App',
        short_name: 'Quran',
        description:
          'Listen to Sheikh Al-Zain Muhammad Ahmed reciting the Holy Quran, with offline audio downloads.',

        theme_color: '#0f172a',
        background_color: '#0f172a',

        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',

        icons: [
          {
            src: '/quran-icon-192.webp',
            sizes: '192x192',
            type: 'image/webp',
            purpose: 'any',
          },
          {
            src: '/quran-icon-512.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'any',
          },
        ],
      },

      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,woff2}',
        ],

        maximumFileSizeToCacheInBytes:
          10 * 1024 * 1024,

        navigateFallback: '/index.html',

        runtimeCaching: [
          {
            urlPattern:
              /^https:\/\/.*\.(?:mp3|m4a|ogg|wav)(?:\?.*)?$/i,

            handler: 'CacheFirst',

            options: {
              cacheName: 'quran-audio',

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
