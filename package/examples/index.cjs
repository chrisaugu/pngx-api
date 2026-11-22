// switch "type": "commonjs" in package.json
const { getStocks } = require('../dist/index.cjs');

getStocks().then(console.log);