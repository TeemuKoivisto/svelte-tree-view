import autoPreprocess from 'svelte-preprocess'
import { resolve } from 'path'

const preprocessOptions = {
  scss: {}
}

export default {
  preprocess: autoPreprocess(preprocessOptions),
  preprocessOptions,
  kit: {
    vite: {
      resolve: {
        alias: {
          $lib: resolve('./src/lib')
        }
      }
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
}
