import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

import { resolve } from 'path'

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  resolve: {
    alias: {
      $components: resolve('./src/components'),
      $lib: resolve('./src/lib')
    }
  },
  server: {
    port: 5185
  }
})
