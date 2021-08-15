const autoPreprocess = require('svelte-preprocess')

const preprocessOptions = {
  scss: {}
}

module.exports = {
  preprocess: autoPreprocess(preprocessOptions),
  preprocessOptions,
}
