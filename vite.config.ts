import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string };

export default defineConfig({
  // GitHub Pages deploys to /mini-games/ — use env var so local dev still uses /
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@engine': path.resolve(__dirname, './src/engine'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@state': path.resolve(__dirname, './src/state'),
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'GridNova',
        short_name: 'GridNova',
        description: 'Daily Sudoku puzzle with global leaderboard',
        theme_color: '#667eea',
        background_color: '#667eea',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true, // listen on 0.0.0.0 — allow LAN access (phone testing)
  },
});
