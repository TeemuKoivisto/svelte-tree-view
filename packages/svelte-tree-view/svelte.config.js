import autoPreprocess from 'svelte-preprocess'

const preprocessOptions = {
  scss: {}
}

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: autoPreprocess(preprocessOptions),
  preprocessOptions,
  compilerOptions: {
    hydratable: true
  }
}
