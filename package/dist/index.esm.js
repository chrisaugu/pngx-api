/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const API_VERSION = "v2";
const API_URL = `https://nuku.zeabur.app/api/${API_VERSION}`;
// const API_URL = `http://localhost:5000/api/${API_VERSION}`;
var NUKU_HEADERS = new Headers();
NUKU_HEADERS.append("apikey", "OB030miTWcDD58KR8yeLIAMK9j9hVaYQ");
// utility function for fetching data
const fetcher = (url, options) => fetch(`${API_URL}${url}`, options).then(r => r.json());
/**
 * getHistoricals
 * /api/historicals/:symbol
 * Fetch historical data for given symbol
 * Makes HTTP call to https://api.nuku.com.pg/v2/historical/{symbol}
 * @param {string} symbol
 * @param query
 * @returns
 */
function getHistoricals(symbol, query) {
    return __awaiter(this, void 0, void 0, function* () {
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
                fields,
            };
        }
        let res = yield fetcher(`/historicals/${symbol}`, options);
        return res.data;
    });
}
/**
 * getStocks
 * Get stocks for the current day
 * @param {TQuery} options
 * @returns {Object}
 * @param symbol
 * @param options
 * @returns
 */
function getStocks(options) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield fetcher(`/stocks`, options);
        return res.data;
    });
}
/**
 * Get a single stock by symbol
 * @param symbol
 * @param options
 * @returns
 */
function getStock(symbol, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let opt = {
            METHOD: "GET",
        };
        let res = yield fetcher(`/stocks/${symbol}`, opt);
        return res.data;
    });
}
/**
 * Get list of companies currently listed on PNGX
 * @param options
 * @returns
 */
function getCompanies(options) {
    return __awaiter(this, void 0, void 0, function* () {
        let opt = {
            METHOD: "GET",
        };
        let res = yield fetcher(`/companies`, opt);
        return res.data;
    });
}
/**
 * Get a single company by symbol
 * @param symbol
 * @param options
 * @returns
 */
function getCompany(symbol, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield fetcher(`/companies/${symbol}`, options);
        return res.data;
    });
}
/**
 * List stock tickers for all companies currently listed on PNGX
 * @param options
 * @returns
 */
function getTickers(options) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield fetcher(`/tickers`, options);
        return res.data;
    });
}
/**
 * Get a single ticker given symbol
 * @param symbol
 * @param options
 * @returns
 */
function getTicker(symbol, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield fetcher(`/companies/${symbol}`, options);
        return res.data;
    });
}

var QUOTES;
(function (QUOTES) {
    QUOTES[QUOTES["BSP"] = 0] = "BSP";
    QUOTES[QUOTES["CCP"] = 1] = "CCP";
    QUOTES[QUOTES["CGA"] = 2] = "CGA";
    QUOTES[QUOTES["COY"] = 3] = "COY";
    QUOTES[QUOTES["CPL"] = 4] = "CPL";
    QUOTES[QUOTES["KAM"] = 5] = "KAM";
    QUOTES[QUOTES["KSL"] = 6] = "KSL";
    QUOTES[QUOTES["NEM"] = 7] = "NEM";
    QUOTES[QUOTES["NGP"] = 8] = "NGP";
    QUOTES[QUOTES["NIU"] = 9] = "NIU";
    QUOTES[QUOTES["SST"] = 10] = "SST";
    QUOTES[QUOTES["STO"] = 11] = "STO";
})(QUOTES || (QUOTES = {}));
var OLD_QUOTES;
(function (OLD_QUOTES) {
    OLD_QUOTES[OLD_QUOTES["NCM"] = 0] = "NCM";
    OLD_QUOTES[OLD_QUOTES["OSH"] = 1] = "OSH";
})(OLD_QUOTES || (OLD_QUOTES = {}));
// {
//   date: ISODate("2020-01-03T05:00:00.000Z"),
//   symbol: 'AAPL',
//   volume: 146322800,
//   open: 74.287498,
//   adjClose: 73.486023,
//   high: 75.144997,
//   low: 74.125,
//   close: 74.357498
// }

export { OLD_QUOTES, QUOTES, fetcher, getCompanies, getCompany, getHistoricals, getStock, getStocks, getTicker, getTickers };
