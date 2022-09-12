import { sveltekit } from '@sveltejs/kit/vite'

import { resolve } from 'path'
import { readFile } from 'fs/promises'

const pkg = JSON.parse(await readFile(new URL('./package.json', import.meta.url)))

/** @type {import('vite').UserConfig} */
export default {
  plugins: [sveltekit()],
  server: {
    port: 5185
  }
}
