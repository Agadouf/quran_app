
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
        id: '/',
        name: 'Quran App',
        short_name: 'Quran',
        description:
          'Listen to Sheikh Al-Zain Muhammad Ahmed reciting the Holy Quran, with offline audio downloads.',

        theme_color: '#0f172a',
        background_color: '#ffffff',

        display: 'standalone',
        orientation: 'portrait',

        start_url: '/',
        scope: '/',

        icons: [
          {
           public: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            public: '/icon-512.png',
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
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
})
