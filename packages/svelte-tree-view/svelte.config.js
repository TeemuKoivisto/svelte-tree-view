import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

const preprocessOptions = {
  scss: {}
}

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(preprocessOptions),
  preprocessOptions,
  compilerOptions: {
    hydratable: true
  }
}
