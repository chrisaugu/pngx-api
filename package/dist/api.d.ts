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
 * @returns {Promise<TQuote[]>}
 */
export declare function getHistoricals(symbol: string, query?: TQuery): Promise<TQuote[]>;
/**
 * Get stocks for the current day
 * @param {TQuery} options
 * @returns {Promise<TQuote[]>}
 */
export declare function getStocks(options?: TQuery): Promise<TQuote[]>;
/**
 * Get a single stock by symbol
 * @param symbol
 * @param options
 * @returns {Promise<TQuote>}
 */
export declare function getStock(symbol: string, options?: TQuery): Promise<TQuote>;
/**
 * Get list of companies currently listed on PNGX
 * @param options
 * @returns {Promise<TCompany[]>}
 */
export declare function getCompanies(options?: TQuery): Promise<TCompany[]>;
/**
 * Get a single company by symbol
 * @param symbol
 * @param options
 * @returns {Promise<TCompany>}
 */
export declare function getCompany(symbol: string, options?: TQuery): Promise<TCompany>;
/**
 * List stock tickers for all companies currently listed on PNGX
 * Retrieves a list of stock tickers for all companies currently listed on PNGX
 *
 * @param {TQuery} [options] - Optional query parameters for filtering, pagination, etc.
 * @returns {Promise<TTicker[]>} Promise that resolves to an array of ticker objects
 *
 * @example
 * // Get all tickers
 * const tickers = await getTickers();
 *
 * @example
 * // Get tickers with pagination
 * const tickers = await getTickers({ page: 1, limit: 50 });
 *
 * @throws {Error} When the API request fails or returns an error
 */
export declare function getTickers(options?: TQuery): Promise<TTicker[]>;
/**
 * Get a single ticker given symbol
 * @param symbol
 * @param options
 * @returns {Promise<TTicker>}
 */
export declare function getTicker(symbol: string, options?: TQuery): Promise<TTicker>;
export {};
