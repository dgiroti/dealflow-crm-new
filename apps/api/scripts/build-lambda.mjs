// Builds the API into ONE file for AWS Lambda: dist-lambda/index.js
import { build } from 'esbuild';
import { rm, writeFile } from 'node:fs/promises';

// Start from an empty folder, so no old files sneak into the upload
await rm('dist-lambda', { recursive: true, force: true });

await build({
  entryPoints: ['src/lambda.ts'], // start here, and follow every import
  bundle: true, // put everything into one file
  platform: 'node', // the code runs on Node.js, not in a browser
  target: 'node22', // the Node.js version we'll pick for the Lambda
  format: 'cjs', // CommonJS: the module format Lambda loads from a plain index.js
  outfile: 'dist-lambda/index.js',
  sourcemap: true, // a "map" back to your TypeScript, for readable error messages
  external: ['pg-native'], // an optional add-on of the pg library that we don't use
});

// Our package.json says "type": "module", which would make Node read this file the wrong way.
// This tiny file tells Node: "the files in this folder are CommonJS".
await writeFile('dist-lambda/package.json', JSON.stringify({ type: 'commonjs' }));

console.log('Built dist-lambda/index.js');
