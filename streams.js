// streams.mjs
const { pipeline } = require('node:stream/promises');
const { createReadStream, createWriteStream } = require('node:fs');
const { createGzip } = require('node:zlib');

// ensure you have a `package.json` file for this test!
await pipeline
(
  createReadStream('package.json'),
  createGzip(),
  createWriteStream('package.json.gz')
);

// run with `node streams.mjs`
