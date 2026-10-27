import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string };

export default defineConfig(({ mode }) => {
  // CrazyGames serves the build from its own path inside an iframe, where a
  // service worker and install prompt have nothing to do.
  const crazyGames = mode === 'crazygames';

  return {
    base: crazyGames ? './' : '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@engine': path.resolve(__dirname, './src/engine'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@ui': path.resolve(__dirname, './src/ui'),
        '@state': path.resolve(__dirname, './src/state'),
        '@images': path.resolve(__dirname, './src/images'),
      },
    },
    plugins: crazyGames ? [{
      name: 'crazygames-sdk',
      transformIndexHtml: (html: string) => ({
        html: html.replace(/<title>[^<]*<\/title>/, '<title>GridNova</title>'),
        tags: [{ tag: 'script', attrs: { src: 'https://sdk.crazygames.com/crazygames-sdk-v3.js' }, injectTo: 'head-prepend' as const }],
      }),
    }] : [
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
          // Every precached entry is a request each new visitor makes on first
          // load, and each one invokes the Pages Function (see _routes.json).
          // Players were downloading the admin panel and its chart library, and
          // re-fetching the Search Console verification file, for nothing.
            globIgnores: ['admin/**', 'google*.html', 'assets/2027-*.webp', 'assets/skin-*.webp'],
        },
      }),
    ],
    define: {
      __APP_VERSION__: JSON.stringify(version),
    },
    build: {
      target: 'es2022',
      outDir: crazyGames ? 'dist-crazygames' : 'dist',
      sourcemap: !crazyGames,
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
      watch: { ignored: ['**/dist-space-preview/**'] },
      host: true, // listen on 0.0.0.0 — allow LAN access (phone testing)
    },
  };
});
