import path from 'path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: path.resolve('src/lib/index.ts'),
      formats: ['es', 'cjs'],
      fileName: format => {
        if (format === 'cjs') {
          return 'index.cjs'
        } else {
          return 'index.js'
        }
      }
    },
    minify: false
  },
  plugins: [svelte({ extensions: ['.svelte'], emitCss: false })]
})
