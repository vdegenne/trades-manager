import dts from 'rollup-plugin-dts';

export default {
  input: 'src/app-container.ts',
  output: { file: 'tradon.d.ts' },
  plugins: [dts({
    respectExternal: false,
  })]
}