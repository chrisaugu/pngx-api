# Test CommonJS
node -e "const { QUOTES } = require('./dist/index.cjs.js'); console.log(QUOTES)"

# Test ES Modules (if you have .mjs file or type: module)
node -e "import('./dist/index.esm.js').then(module => console.log(module.QUOTES))"