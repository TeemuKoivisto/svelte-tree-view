import { sveltekit } from '@sveltejs/kit/vite'
import { svelteTesting } from '@testing-library/svelte/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit(), svelteTesting()],
  server: {
    port: 5185
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/lib/__tests__/setupTests.js']
  }
})
