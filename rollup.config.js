import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/app-container.ts',
  output: { file: 'app.js', format: 'esm'},
  plugins: [typescript()]
}