import autoPreprocess from 'svelte-preprocess'

const preprocessOptions = {
  scss: {}
}

export default {
  preprocess: autoPreprocess(preprocessOptions),
  preprocessOptions,
  kit: {
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
}
