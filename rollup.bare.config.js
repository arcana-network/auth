import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import { handleCircularDependancyWarning } from 'node-stdlib-browser/helpers/rollup/plugin'
import stdLibBrowser from 'node-stdlib-browser'
import inject from '@rollup/plugin-inject'
import postcss from 'rollup-plugin-postcss'

const bareConfig = {
  input: './src/index.ts',
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: true,
    }),
    typescript({
      module: 'esnext',
      //   declaration: false,
      declarationDir: 'dist-esm/types',
    }),
    commonjs({
      requireReturnsDefault: 'auto',
    }),
    inject({
      process: stdLibBrowser.process,
    }),
    postcss({
      plugins: [],
    }),
  ],
  onwarn: (warning, rollupWarn) => {
    handleCircularDependancyWarning(warning, rollupWarn)
  },
  output: {
    dir: 'dist-esm',
    format: 'esm',
  },
}

export default bareConfig
