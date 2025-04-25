import path from 'node:path'

import {defineConfig} from 'rollup'

export default defineConfig({
  input: path.join(import.meta.dirname, 'src', 'index.js'),
  output: {
    file: path.join(import.meta.dirname, 'umd', 'client.js'),
    format: 'umd',
    name: 'PicoSanity',
  },
})
