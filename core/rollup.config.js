import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@wessberg/rollup-plugin-ts'
import svelte from 'rollup-plugin-svelte'
import autoPreprocess from 'svelte-preprocess'
import scss from 'rollup-plugin-scss'
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
      preprocess: autoPreprocess(preprocessOptions)
    }),
    scss(),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    isProduction && terser()
  ],
  watch: {
    clearScreen: false
  }
}
