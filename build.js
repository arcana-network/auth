/* eslint no-undef: 0 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const esbuild = require('esbuild');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const alias = require('esbuild-plugin-alias');

(async () => {
  console.time('Build time');
  const result = await esbuild
    .build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      target: ['chrome58', 'firefox57', 'safari11', 'edge18'],
      globalName: 'arcana.auth',
      plugins: [
        alias({
          assert: require.resolve('assert/'),
          buffer: require.resolve('buffer/'),
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
          util: require.resolve('util/'),
        }),
      ],
      define: {
        global: 'window',
      },
      format: 'iife',
      outfile: 'dist/standalone/auth.min.js',
      minify: true,
    })
    .catch((e) => {
      console.log({ error: e });
      process.exit(0);
    });
  console.timeEnd('Build time');
  if (result.errors && result.errors.length) {
    console.log({ errors: result.errors });
  } else {
    console.info('Compiled successfully!');
  }
  if (result.warnings && result.warnings.length) {
    console.log({ warnings: result.warnings });
  }
})();
