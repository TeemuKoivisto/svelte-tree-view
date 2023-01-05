import adapter from '@sveltejs/adapter-static'
import preprocess from 'svelte-preprocess'

const { GH_PAGES } = process.env

/** @type {import('@sveltejs/kit').Config} */
export default {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    paths: {
      // For Github pages deployment, locally with preview favicon points to wrong path
      base: GH_PAGES ? '/svelte-tree-view' : ''
    },
    files: {
      routes: './src/routes',
      lib: './src/lib'
    },
    adapter: adapter({
      // default options are shown
      pages: 'build',
      assets: 'build'
    })
  }
}
