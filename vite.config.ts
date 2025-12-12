import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Defines process.env.API_KEY globally so your existing code works without changes
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});