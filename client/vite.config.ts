import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
      },
      manifest: {
        name: 'LIBRIS PWA',
        short_name: 'LIBRIS',
        description: 'LIBRIS PWA',
        theme_color: '#000',
        background_color: '#000',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'any',
        icons: [
          {
            purpose: 'maskable',
            sizes: '625x625',
            src: 'maskable_icon.png',
            type: 'image/png',
          },
          {
            purpose: 'maskable',
            sizes: '48x48',
            src: 'maskable_icon_x48.png',
            type: 'image/png',
          },
          {
            purpose: 'maskable',
            sizes: '72x72',
            src: 'maskable_icon_x72.png',
            type: 'image/png',
          },
          {
            purpose: 'maskable',
            sizes: '96x96',
            src: 'maskable_icon_x96.png',
            type: 'image/png',
          },
          {
            purpose: 'maskable',
            sizes: '128x128',
            src: 'maskable_icon_x128.png',
            type: 'image/png',
          },
          {
            purpose: 'maskable',
            sizes: '192x192',
            src: 'maskable_icon_x192.png',
            type: 'image/png',
          },
          {
            purpose: 'maskable',
            sizes: '384x384',
            src: 'maskable_icon_x384.png',
            type: 'image/png',
          },
          {
            purpose: 'maskable',
            sizes: '512x512',
            src: 'maskable_icon_x512.png',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: [{ find: '_', replacement: '/src' }],
  },
  optimizeDeps: {
    include: ['@mui/x-date-pickers'],
  },
});
