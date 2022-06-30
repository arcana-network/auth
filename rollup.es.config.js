import baseConfig from './rollup.base.config'

export default {
  ...baseConfig,
  output: {
    file: 'dist/standalone/auth.esm.js',
    format: 'es',
    compact: true,
  },
}
