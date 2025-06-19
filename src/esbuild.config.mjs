import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['main.ts'],
  bundle: true,
  outfile: 'main.js',
  minify: true,
  sourcemap: true,
  platform: 'node',
  external: ['obsidian']
});