import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { VitePWA } from 'vite-plugin-pwa'

// The base path must match both the Vite base and the PWA manifest's
// start_url / scope, otherwise the home screen icon will 404 on GitHub Pages.
const base = process.env.GITHUB_ACTIONS ? '/le-semainier/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'fonts/*.woff2'],
      manifest: {
        name: 'Le Semainier',
        short_name: 'Semainier',
        description: 'Votre agenda hebdomadaire',
        theme_color: '#F5F0E8',
        background_color: '#F5F0E8',
        display: 'standalone',
        // These three must all match the Vite base path to avoid a 404
        // when launching the PWA from the home screen on GitHub Pages.
        id: base,
        scope: base,
        start_url: base,
        icons: [
          {
            // SVG — crisp at any size on modern browsers (Chrome, Android)
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            // PNG fallbacks — required by iOS Safari & older Android
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg}']
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
