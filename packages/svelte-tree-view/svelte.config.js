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
  },
  package: {
    exports: filepath => {
      if (['__tests__'].some(s => filepath.includes(s))) return false
      return true
    },
    files: filepath => {
      if (['__tests__'].some(s => filepath.includes(s))) return false
      return true
    }
  }
}
