import { parse } from 'csv-parse';
const DATA_URL = "https://www.pngx.com.pg/data";
const API_URL = `http://locahost:5000/api/v2`;
var myHeaders = new Headers();
myHeaders.append("apikey", "OB030miTWcDD58KR8yeLIAMK9j9hVaYQ");
var requestOptions = {
    method: 'GET',
    redirect: 'follow',
    headers: myHeaders
};
// utility function for fetching data
const fetcher = async (url, options) => await fetch(`${API_URL}/${url}`, options);
/**
 * getHistoricals
 * Fetch historical data for given symbol
 * Makes HTTP call to https://api.nuku.com.pg/v2/historical/{symbol}
 * @param {string} symbol
 * @param query
 * @returns
 */
export async function getHistoricals(symbol, query) {
    let { date, start, end, limit, sort, skip, fields } = query || {};
    let options = {};
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
 * getStocks
 * Get stocks for the current day
 * @param {TQuery} options
 * @returns {Object}
 */
export async function getStocks(options) {
    let res = await fetcher(`/stocks`, options);
    return res.json();
}
/**
 * Get a single stock by symbol
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
/**
 * Get list of companies currently listed on PNGX
 * @param options
 * @returns
 */
export async function getCompanies(options) {
    let opt = {
        METHOD: 'GET',
    };
    let res = await fetcher(`/companies`, opt);
    return res.json();
}
/**
 * Get a single company by symbol
 * @param symbol
 * @param options
 * @returns
 */
export async function getCompany(symbol, options) {
    let res = await fetcher(`/companies/${symbol}`, options);
    return res.json();
}
/**
 * List stock tickers for all companies currently listed on PNGX
 * @param options
 * @returns
 */
export async function getTickers(options) {
    let res = await fetcher(`/tickers`, options);
    return res.json();
}
/**
 * Get a single ticker given symbol
 * @param symbol
 * @param options
 * @returns
 */
export async function getTicker(symbol, options) {
    let res = await fetcher(`/companies/${symbol}`, options);
    return res.json();
}
/**
 * Get raw stock data directly from PNGX
 * @param symbol
 * @param options
 * @returns
 */
export async function getDataFromServer(symbol, options) {
    let data;
    Object.assign(requestOptions, {
        method: "GET",
        redirect: "follow",
        headers: {
            "Content-Type": "text/csv",
        },
        cache: "no-cache"
    });
    fetch(`${DATA_URL}/${symbol}.csv`, requestOptions)
        .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
        .then((result) => data = parse(result))
        .catch((error) => console.error(error));
    return data;
}
// fetcher("https://api.apilayer.com/bank_data/banks_by_country?country_code=PG", requestOptions)
//   .then(response => response.text())
//   .then(result => console.log(result))
//   .catch(error => console.log('error', error));
getStocks()
    .then(result => {
    console.log(result);
})
    .catch(error => {
    console.error(error);
});
//# sourceMappingURL=index.js.map