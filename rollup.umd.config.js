import baseConfig from './rollup.base.config'

export default {
  ...baseConfig,
  output: {
    file: 'dist/standalone/auth.umd.js',
    format: 'umd',
    name: 'arcana.auth',
    compact: true,
    sourcemap: true,
  },
}
