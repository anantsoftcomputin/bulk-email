import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward /api calls to the Express backend in dev
      // Run both together with: npm run dev:all
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // Ensure error responses from Express are forwarded as-is (not replaced by proxy HTML)
        proxyTimeout: 30000,
        timeout: 30000,
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Email server is not running. Start it with: npm run dev:all' }));
          });
        },
      },
    },
  },
})
