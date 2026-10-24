import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base './' so the built dist/ can be served from any sub-path (or a static host)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});
