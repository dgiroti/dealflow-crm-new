import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Codespaces opens the app on a *.app.github.dev address, so Vite must allow it
    allowedHosts: ['.app.github.dev'],
    // Forward /api requests to the Express API, so the browser only sees ONE website
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
