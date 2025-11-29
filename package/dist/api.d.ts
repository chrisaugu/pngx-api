import { TCompany, TQuote, TTicker } from "./types";
export type TAPIRequest = {};
export type TAPIResponse<T> = {
    status: number;
    message: string;
    symbols: string;
    api: string;
    time: number;
    date: Date;
    last_updated: Date;
    data: T;
};
export declare const fetcher: <T extends any>(url: string, options?: any) => Promise<TAPIResponse<T>>;
type TQuery = {
    date?: string;
    start?: string;
    end?: string;
    limit?: number;
    sort?: number;
    skip?: number;
    fields?: [];
};
/**
 * getHistoricals
 * /api/historicals/:symbol
 * Fetch historical data for given symbol
 * Makes HTTP call to https://api.nuku.com.pg/v2/historical/{symbol}
 * @param {string} symbol
 * @param query
 * @returns
 */
export declare function getHistoricals(symbol: string, query?: TQuery): Promise<TQuote[]>;
/**
 * getStocks
 * Get stocks for the current day
 * @param {TQuery} options
 * @returns {Object}
 * @param symbol
 * @param options
 * @returns
 */
export declare function getStocks(options?: TQuery): Promise<TQuote[]>;
/**
 * Get a single stock by symbol
 * @param symbol
 * @param options
 * @returns
 */
export declare function getStock(symbol: string, options?: TQuery): Promise<TQuote>;
/**
 * Get list of companies currently listed on PNGX
 * @param options
 * @returns
 */
export declare function getCompanies(options?: TQuery): Promise<TCompany[]>;
/**
 * Get a single company by symbol
 * @param symbol
 * @param options
 * @returns
 */
export declare function getCompany(symbol: string, options?: TQuery): Promise<TCompany>;
/**
 * List stock tickers for all companies currently listed on PNGX
 * @param options
 * @returns
 */
export declare function getTickers(options?: TQuery): Promise<TTicker[]>;
/**
 * Get a single ticker given symbol
 * @param symbol
 * @param options
 * @returns
 */
export declare function getTicker(symbol: string, options?: TQuery): Promise<TTicker>;
export {};
