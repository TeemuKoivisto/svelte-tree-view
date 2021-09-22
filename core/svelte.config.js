import autoPreprocess from 'svelte-preprocess'

const preprocessOptions = {
  scss: {}
}

export default {
  preprocess: autoPreprocess(preprocessOptions),
  preprocessOptions,
  kit: {
    package: {
      exports: {
        include: ['**'],
        exclude: ['package.json', 'types.ts']
      },
      files: {
        include: ['**'],
        exclude: ['__tests__/**/*']
      }
    }
  }
}
