// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import tailwindcss from '@tailwindcss/vite';

// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   server: {
//     port: 5173,
//     // Codespaces opens the app on a *.app.github.dev address, so Vite must allow it
//     allowedHosts: ['.app.github.dev'],
//     // Forward /api requests to the Express API, so the browser only sees ONE website
//     proxy: {
//       '/api': 'http://localhost:3000',
//     },
//   },
// });

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Read apps/web/.env, .env.local, and so on.
  // The '' means "load ALL variables", not only the ones starting with VITE_.
  const env = loadEnv(mode, process.cwd(), '');

  // The Lambda URL if it's set, otherwise the local API
  const apiTarget = env.API_PROXY_TARGET || 'http://localhost:3000';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      allowedHosts: ['.app.github.dev'],
      proxy: {
        '/api': {
          target: apiTarget,
          // Tell the target it's being called at ITS OWN address.
          // Lambda Function URLs reject requests addressed to any other host.
          changeOrigin: true,
        },
      },
    },
  };
});
