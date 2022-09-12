import { sveltekit } from '@sveltejs/kit/vite'

/** @type {import('vite').UserConfig} */
export default {
  plugins: [sveltekit()],
  server: {
    port: 5185
  }
}
