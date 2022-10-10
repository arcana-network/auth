import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { terser } from 'rollup-plugin-terser'
import { handleCircularDependancyWarning } from 'node-stdlib-browser/helpers/rollup/plugin'
import stdLibBrowser from 'node-stdlib-browser'
import alias from '@rollup/plugin-alias'
import inject from '@rollup/plugin-inject'
const baseConfig = {
  input: './src/index.ts',
  plugins: [
    alias({
      entries: stdLibBrowser,
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    typescript({ module: 'esnext' }),
    json(),
    commonjs({
      requireReturnsDefault: 'auto',
    }),
    inject({
      process: stdLibBrowser.process,
      Buffer: [stdLibBrowser.buffer, 'Buffer'],
    }),
    terser(),
  ],
  onwarn: (warning, rollupWarn) => {
    handleCircularDependancyWarning(warning, rollupWarn)
  },
}

export default baseConfig
