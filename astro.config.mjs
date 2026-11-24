// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  // Venta y arriendo ahora se despliegan dentro de /publica; se conservan las URLs viejas ya indexadas.
  redirects: {
    '/publica/venta': { status: 301, destination: '/publica' },
    '/publica/arriendo': { status: 301, destination: '/publica' },
  },
  vite: {
    plugins: [tailwindcss()]
  },
  adapter: node({
    mode: 'standalone'
  }),
  security: {
    checkOrigin: false
  }
});