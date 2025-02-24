// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    server: {
      allowedHosts: ['present-lioness-repeatedly.ngrok-free.app']
    },
    plugins: [tailwindcss()],
  }
});