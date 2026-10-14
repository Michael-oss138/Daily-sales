import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Forward API calls to Express during development (avoids CORS in dev).
    proxy: { '/api': 'http://localhost:4000' },
  },
});
