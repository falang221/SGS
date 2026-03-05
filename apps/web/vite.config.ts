import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'School Management System Pro',
        short_name: 'SGS Pro',
        description: 'Solution de gestion scolaire haute performance',
        theme_color: '#4f46e5',
        background_color: '#f8fafc',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 an
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/api\/v1\/(students|academic|hr).*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-data-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 2 // 2 heures
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3001',
        ws: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/')
          if (!normalizedId.includes('/node_modules/')) return undefined
          if (normalizedId.includes('/node_modules/socket.io-client/')
            || normalizedId.includes('/node_modules/engine.io-client/')
            || normalizedId.includes('/node_modules/socket.io-parser/')
            || normalizedId.includes('/node_modules/engine.io-parser/')) return 'vendor-realtime'
          if (normalizedId.includes('/node_modules/lucide-react/')) return 'vendor-icons'
          if (normalizedId.includes('/node_modules/react-router') || normalizedId.includes('/node_modules/@remix-run/')) return 'vendor-router'
          if (normalizedId.includes('/node_modules/@tanstack/')) return 'vendor-query'
          if (normalizedId.includes('/node_modules/axios/')) return 'vendor-http'
          if (normalizedId.includes('/node_modules/zustand/')) return 'vendor-state'
          if (normalizedId.includes('/node_modules/react/') || normalizedId.includes('/node_modules/react-dom/') || normalizedId.includes('/node_modules/scheduler/')) return 'vendor-react-core'
          return undefined
        }
      }
    }
  }
})
