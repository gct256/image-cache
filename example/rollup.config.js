import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import nodeBuiltins from 'rollup-plugin-node-builtins'

export default [
  {
    input: './script.src.js',
    plugins: [babel(), commonjs(), nodeResolve(), nodeBuiltins()],
    output: {
      file: './script.js',
      format: 'cjs'
    }
  }
]
