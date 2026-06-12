import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // Cache Supabase API responses (GET requests)
            urlPattern: ({ url }) => url.hostname === 'fedgwfuhrvwxpaqewjm.supabase.co',
            handler: 'CacheFirst',   // ✅ serves from cache instantly when offline
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      // 👇 Add this: pre‑cache specific API endpoints during installation
      injectManifest: {
        injectionPoint: 'self.__WB_MANIFEST'
      },
      manifest: false,
      devOptions: { enabled: true }
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  assetsInclude: ['**/*.svg', '**/*.csv']
})