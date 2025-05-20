import { parse } from 'csv-parse';
// const DATA_URL = 'https://www.pngx.com.pg/data';
// const API_URL = `https://api.nuku-api.io/api/v1`;
const API_URL = `http://locahost:5000/api/v1`;
var Servers;
(function (Servers) {
    Servers["PNGX"] = "pngx";
    Servers["NUKUAPI"] = "nuku";
})(Servers || (Servers = {}));
const fetcher = async (url, options) => await fetch(`${API_URL}/${url}`, options);
/**
 * /api/historicals/:symbol
 * @param symbol
 * @param query
 * @returns
 */
export async function getHistoricals(symbol, query) {
    let { date, start, end, limit, sort, skip, fields } = query || {};
    let options = {
    // "body": null,
    // "method": "GET"
    };
    if (date || start || end || limit || sort || skip || fields) {
        options = {
            symbol,
            date,
            start,
            end,
            limit,
            sort,
            skip,
            fields
        };
    }
    let res = await fetcher(`/historicals/${symbol}`, options);
    return res.json();
}
/**
 *
 * @param options
 * @returns
 */
export async function getStocks(options) {
    let res = await fetcher(`/stocks`, options);
    return res.json;
}
/**
 *
 * @param symbol
 * @param options
 * @returns
 */
export async function getStock(symbol, options) {
    let opt = {
        METHOD: 'GET',
    };
    let res = await fetcher(`/stocks/${symbol}`, opt);
    return res.json();
}
export async function getCompanies(options) {
    let opt = {
        METHOD: 'GET',
    };
    let res = await fetcher(`/companies`, opt);
    return res.json();
}
export async function getCompany(symbol, options) {
    let res = await fetcher(`/companies/${symbol}`, options);
    return res.json();
}
export async function getTickers(options) {
    let res = await fetcher(`/tickers`, options);
    return res.json();
}
export async function getTicker(symbol, options) {
    let res = await fetcher(`/companies/${symbol}`, options);
    return res.json();
}
export async function getDataFromServer(symbol, options) {
    // let res = await fetch(`${DATA_URL}/${symbol}.csv`);
    // let data = await res.text();
    let data;
    const requestOptions = {
        method: "GET"
    };
    fetch("https://www.pngx.com.pg/data/BSP.csv", requestOptions)
        .then((response) => response.text())
        .then((result) => data = parse(result))
        .catch((error) => console.error(error));
    // let d = parse(data);
    console.log(data);
    return data;
}
//# sourceMappingURL=api.js.map