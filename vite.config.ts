import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // SECURITY FIX: Removed Gemini API keys - not used in landing page
      // API keys should only be used server-side (backend), never exposed in client bundles
      define: {
        // Removed: 'process.env.API_KEY' and 'process.env.GEMINI_API_KEY'
        // These were not used in the landing page code and should not be exposed client-side
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
