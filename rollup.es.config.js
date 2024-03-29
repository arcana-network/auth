import baseConfig from './rollup.base.config'

export default {
  ...baseConfig,
  output: {
    dir: 'dist',
    // file: 'dist/standalone/auth.esm.js',
    format: 'esm',
    compact: true,
    chunkFileNames: '[name].chunk.js',
    inlineDynamicImports: true,
    // manualChunks: function (id) {
    //   if (id.includes('@solana/web3.js/lib')) {
    //     return 'solana'
    //   }
    //   if (id.includes('/node_modules/')) {
    //     return 'vendor'
    //   }
    // },
  },
}
