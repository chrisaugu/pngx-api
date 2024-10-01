"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistoricals = getHistoricals;
exports.getStocks = getStocks;
exports.getStock = getStock;
exports.getCompanies = getCompanies;
exports.getCompany = getCompany;
exports.getDataFromServer = getDataFromServer;
const DATAURL = 'http://www.pngx.com.pg/data';
const API_URL = `https://api.pngx-api.io/api`;
const fetcher = (url, options) => __awaiter(void 0, void 0, void 0, function* () { return yield fetch(`${API_URL}/${url}`, options); });
/**
 * /api/historicals/:symbol
 * @param symbol
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
                fields
            };
        }
        console.log(options);
        let res = yield fetcher(`/historicals/${symbol}`, options);
        return res.json();
    });
}
/**
 *
 * @param options
 * @returns
 */
function getStocks(options) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield fetcher(`/stocks`, options);
        return res.json;
    });
}
/**
 *
 * @param symbol
 * @param options
 * @returns
 */
function getStock(symbol, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield fetcher(`/stocks/${symbol}`, options);
        return res.json();
    });
}
function getCompanies(options) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield fetcher(`/companies`, options);
        return res.json();
    });
}
function getCompany(symbol, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield fetcher(`/companies/${symbol}`, options);
        return res.json();
    });
}
function getDataFromServer(symbol, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield fetcher(`${DATAURL}/${symbol}`, options);
        return res.json();
    });
}
