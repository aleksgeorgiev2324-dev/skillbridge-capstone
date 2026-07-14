import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: '.',
  base: './',
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'pages/login.html'),
        register: resolve(__dirname, 'pages/register.html'),
        dashboard: resolve(__dirname, 'pages/dashboard.html'),
        profile: resolve(__dirname, 'pages/profile.html'),
        listing: resolve(__dirname, 'pages/listing-detail.html'),
        listingForm: resolve(__dirname, 'pages/listing-form.html'),
        admin: resolve(__dirname, 'pages/admin.html')
      }
    }
  },
  server: {
    port: 5173,
    strictPort: false
  }
});
