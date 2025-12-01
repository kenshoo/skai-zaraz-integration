require('esbuild').buildSync({
  entryPoints: ['src/skai_zaraz_mc.ts'],
  bundle: true,
  minify: true,
  format: 'esm',
  platform: 'node',
  target: ['esnext'],
  tsconfig: 'tsconfig.build.json',
  outfile: 'dist/index.js',
})
