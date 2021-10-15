import adapter from '@sveltejs/adapter-static'
import preprocess from 'svelte-preprocess'

const { NO_SSR, DEPLOY_TO_GH } = process.env

/** @type {import('@sveltejs/kit').Config} */
export default {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    // Needed by Cypress tests as using ssr with `svelte-kit dev` might not hydrate the app fast enough,
    // resulting in failing tests.
    ...(NO_SSR && { ssr: false }),
    target: '#svelte',
    trailingSlash: 'never',
    paths: {
      base: DEPLOY_TO_GH ? '/svelte-tree-view' : '',
    },
    files: {
      routes: './src/routes',
      lib: './src/lib',
    },
    adapter: adapter({
      // default options are shown
      pages: 'build',
      assets: 'build',
    }),
  },
}
