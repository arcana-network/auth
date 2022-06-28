import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

export default {
  input: './src/index.ts',
  output: {
    file: 'dist/standalone/auth.esm.js',
    format: 'es',
  },
  plugins: [
    resolve({
      browser: true,
      //   extensions: ['.ts'],
      preferBuiltins: false,
    }),
    typescript(),
    json(),
    commonjs({
      requireReturnsDefault: 'auto',
    }),
    nodePolyfills({
      include: null,
      //   exclude: 'node_modules/eccrypto/*',
    }),
  ],
}
