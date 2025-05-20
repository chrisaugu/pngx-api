import { TQuotes } from "./types";
type TQuery = {
    date?: string;
    start?: string;
    end?: string;
    limit?: number;
    sort?: number;
    skip?: number;
    fields?: string[];
};
/**
 * getHistoricals
 * Fetch historical data for given symbol
 * Makes HTTP call to https://api.nuku.com.pg/v2/historical/{symbol}
 * @param {string} symbol
 * @param query
 * @returns
 */
export declare function getHistoricals(symbol: string, query?: TQuery): Promise<unknown>;
/**
 * getStocks
 * Get stocks for the current day
 * @param {TQuery} options
 * @returns {Object}
 */
export declare function getStocks(options?: TQuery): Promise<unknown>;
/**
 * Get a single stock by symbol
 * @param symbol
 * @param options
 * @returns
 */
export declare function getStock(symbol: TQuotes, options?: TQuery): Promise<unknown>;
/**
 * Get list of companies currently listed on PNGX
 * @param options
 * @returns
 */
export declare function getCompanies(options?: TQuery): Promise<unknown>;
/**
 * Get a single company by symbol
 * @param symbol
 * @param options
 * @returns
 */
export declare function getCompany(symbol: TQuotes, options?: TQuery): Promise<unknown>;
/**
 * List stock tickers for all companies currently listed on PNGX
 * @param options
 * @returns
 */
export declare function getTickers(options?: TQuery): Promise<unknown>;
/**
 * Get a single ticker given symbol
 * @param symbol
 * @param options
 * @returns
 */
export declare function getTicker(symbol: TQuotes, options?: TQuery): Promise<unknown>;
/**
 * Get raw stock data directly from PNGX
 * @param symbol
 * @param options
 * @returns
 */
export declare function getDataFromServer(symbol: TQuotes, options?: TQuery): Promise<undefined>;
export {};
