import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { terser } from 'rollup-plugin-terser'

const baseConfig = {
  input: './src/index.ts',
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    typescript(),
    json(),
    commonjs({
      requireReturnsDefault: 'auto',
    }),
    nodePolyfills({
      include: null,
    }),
    terser(),
  ],
}

export default baseConfig
