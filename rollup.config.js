import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import cjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/app-container.ts',
  output: { file: 'public/app.js', format: 'esm', sourcemap: true},
  plugins: [
    typescript({
      sourceMap: true
    }),
    resolve(),
    cjs(),
    json(),
    process.env.minify ? terser() : {}
  ]
}