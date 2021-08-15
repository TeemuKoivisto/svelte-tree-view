import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import svelte from 'rollup-plugin-svelte'
import autoPreprocess from 'svelte-preprocess'
import postcss from 'rollup-plugin-postcss'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'
const preprocessOptions = require('./svelte.config').preprocessOptions

const isProduction = !process.env.ROLLUP_WATCH

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'umd',
      name: 'svelte-tree-view',
      sourcemap: isProduction
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: isProduction
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    // ...Object.keys(pkg.devDependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  plugins: [
    commonjs(),
    typescript(),
    svelte({
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !isProduction
      },
      preprocess: autoPreprocess(preprocessOptions),
    }),
    postcss(),
    resolve({
      dedupe: ['svelte']
    }),
    isProduction && terser()
  ],
  watch: {
    clearScreen: false
  }
}
