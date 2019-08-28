import typescript2 from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default [
  {
    input: './example/script.ts',
    plugins: [typescript2(), commonjs(), nodeResolve()],
    output: {
      file: './example/script.js',
      format: 'iife'
    }
  }
]
