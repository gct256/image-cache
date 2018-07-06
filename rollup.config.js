import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import nodeBuiltins from 'rollup-plugin-node-builtins'

const base = {
  input: './src/ImageUtils.js',
  plugins: [babel(), commonjs(), nodeResolve(), nodeBuiltins()]
}

export default [
  {
    ...base,
    output: {
      file: './index.js',
      format: 'cjs'
    }
  },
  {
    ...base,
    output: {
      file: './index.mjs',
      format: 'es'
    }
  }
]
