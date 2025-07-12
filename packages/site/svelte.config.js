import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  kit: {
    paths: {
      // For Github pages deployment, locally with preview favicon points to wrong path
      base: process.env.GH_PAGES ? '/svelte-tree-view' : ''
    },
    adapter: adapter(),
    alias: {
      $lib: 'src/lib',
    }
  }
}

export default config
