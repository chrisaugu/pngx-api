import * as NukuAPI from '../dist/index.esm';

console.log(NukuAPI.getStocks({}).then((r) => console.log(r[0])));
