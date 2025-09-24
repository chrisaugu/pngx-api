"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistoricals = getHistoricals;
exports.getStocks = getStocks;
exports.getStock = getStock;
exports.getCompanies = getCompanies;
exports.getCompany = getCompany;
exports.getTickers = getTickers;
exports.getTicker = getTicker;
exports.getDataFromServer = getDataFromServer;
const csv_parse_1 = require("csv-parse");
const DATA_URL = "https://www.pngx.com.pg/data";
// const API_URL = `https://api.nuku-api.io/api/v1`;
const API_URL = `http://locahost:5000/api/v1`;
var myHeaders = new Headers();
myHeaders.append("apikey", "OB030miTWcDD58KR8yeLIAMK9j9hVaYQ");
var requestOptions = {
  method: "GET",
  redirect: "follow",
  headers: myHeaders,
};
// utility function for fetching data
const fetcher = (url, options) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield fetch(`${API_URL}/${url}`, options);
  });
/**
 * getHistoricals
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
    return res.json();
  });
}
/**
 * getStocks
 * Get stocks for the current day
 * @param {TQuery} options
 * @returns {Object}
 */
function getStocks(options) {
  return __awaiter(this, void 0, void 0, function* () {
    let res = yield fetcher(`/stocks`, options);
    return res.json;
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
    return res.json();
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
    return res.json();
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
    return res.json();
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
    return res.json();
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
    return res.json();
  });
}
/**
 * Get raw stock data directly from PNGX
 * @param symbol
 * @param options
 * @returns
 */
function getDataFromServer(symbol, options) {
  return __awaiter(this, void 0, void 0, function* () {
    let data;
    Object.assign(requestOptions, {
      method: "GET",
      redirect: "follow",
      headers: {
        "Content-Type": "text/csv",
      },
      cache: "no-cache",
    });
    fetch(`${DATA_URL}/${symbol}.csv`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((result) => (data = (0, csv_parse_1.parse)(result)))
      .catch((error) => console.error(error));
    return data;
  });
}
// fetcher("https://api.apilayer.com/bank_data/banks_by_country?country_code=PG", requestOptions)
//   .then(response => response.text())
//   .then(result => console.log(result))
//   .catch(error => console.log('error', error));
getStocks()
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
  });
