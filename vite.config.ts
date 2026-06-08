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
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    
    // Progressive Web App Configuration for Offline Network Resilience
    VitePWA({
      registerType: 'autoUpdate', // Silently updates the service worker when new code is pushed
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'], // Static core asset items
      workbox: {
        // Automatically caches all compiled HTML, JS, CSS, and structural images/vectors
        globPatterns: ['**/*.{js,css,html,png,svg,woff2,json}'],
        
        // Safety Fallback Strategy: If network is dead, force load the cached app shell layout
        navigateFallback: '/index.html',
        
        // Runtime caching rules for external asset dependencies (like online font kits or external icons)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // Keep for 1 year
              },
              cacheableResponse: { statuses: [0, 201] }
            }
          }
        ]
      },
      
      // Standalone app credentials so phones can install it directly from the browser
      manifest: {
        name: 'Festival Buddy',
        short_name: 'FestivalBuddy',
        description: 'Your intelligent offline-first festival companion',
        theme_color: '#000000', // Matches your deep high-contrast background choice
        background_color: '#000000',
        display: 'standalone', // Erases the browser URL search bar to make it look like a real App Store app
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})