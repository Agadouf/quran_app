```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.ico',
        'icon-192.png',
        'icon-512.png'
      ],

      manifest: {
        name: 'Quran App',
        short_name: 'Quran',
        description:
          'Quran App with offline Quran reading and Al-Zain Muhammad Ahmed recitation',

        theme_color: '#0f172a',
        background_color: '#ffffff',

        display: 'standalone',
        orientation: 'portrait',

        start_url: '/',
        scope: '/',

        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },

      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,woff2}'
        ],

        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,

        navigateFallback: '/index.html',

        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/.*\.(?:mp3|m4a|ogg|wav)$/i,

            handler: 'CacheFirst',

            options: {
              cacheName: 'quran-audio',

              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },

              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    )
  ]
})
```
