/* eslint no-undef: 0 */
/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild')
const plugin = require('node-stdlib-browser/helpers/esbuild/plugin')
const stdLibBrowser = require('node-stdlib-browser')
;(async () => {
  console.time('IIFE Build time')
  const result = await esbuild
    .build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      target: ['chrome58', 'firefox57', 'safari11', 'edge18'],
      globalName: 'arcana.auth',
      inject: [require.resolve('node-stdlib-browser/helpers/esbuild/shim')],
      plugins: [plugin(stdLibBrowser)],
      define: {
        global: 'window',
        process: 'process',
        Buffer: 'Buffer',
      },
      sourcemap: true,
      format: 'iife',
      outfile: 'dist/standalone/auth.min.js',
      minify: true,
    })
    .catch((e) => {
      console.log({ error: e })
      process.exit(0)
    })
  console.timeEnd('IIFE Build time')
  if (result.errors && result.errors.length) {
    console.log({ errors: result.errors })
  } else {
    console.info('Compiled successfully!')
  }
  if (result.warnings && result.warnings.length) {
    console.log({ warnings: result.warnings })
  }
})()
;(async () => {
  console.time('ESM Build time')
  const result = await esbuild
    .build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      target: ['chrome58', 'firefox57', 'safari11', 'edge18'],
      globalName: 'arcana.auth',
      inject: [require.resolve('node-stdlib-browser/helpers/esbuild/shim')],
      plugins: [plugin(stdLibBrowser)],
      define: {
        global: 'window',
        process: 'process',
        Buffer: 'Buffer',
      },
      format: 'esm',
      outfile: 'dist/standalone/auth.esm.js',
      minify: true,
    })
    .catch((e) => {
      console.log({ error: e })
      process.exit(0)
    })
  console.timeEnd('ESM Build time')
  if (result.errors && result.errors.length) {
    console.log({ errors: result.errors })
  } else {
    console.info('Compiled successfully!')
  }
  if (result.warnings && result.warnings.length) {
    console.log({ warnings: result.warnings })
  }
})()
