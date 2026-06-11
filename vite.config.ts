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
      registerType: 'autoUpdate',    // forces immediate activation
      workbox: {
        skipWaiting: true,           // bypass "waiting" phase
        clientsClaim: true,          // take control of all pages
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // optional: exclude the service worker itself from caching
        navigateFallback: 'index.html',
      },
      manifest: false,               // set to true if you have a manifest.json
      devOptions: {
        enabled: true,               // allows testing service worker in dev mode
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})