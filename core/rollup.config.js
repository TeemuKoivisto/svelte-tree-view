import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-ts'
import svelte from 'rollup-plugin-svelte'
import autoPreprocess from 'svelte-preprocess'
import scss from 'rollup-plugin-scss'

import pkg from './package.json'
import svelteConfig from './svelte.config'

const isProduction = !process.env.ROLLUP_WATCH

export default {
  input: 'src/lib/index.ts',
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
      preprocess: autoPreprocess(svelteConfig.preprocessOptions)
    }),
    scss(),
    resolve({
      browser: true,
      dedupe: ['svelte']
    })
  ],
  watch: {
    clearScreen: false
  }
}
