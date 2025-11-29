import { TCompany, TQuote, TTicker } from "./types";

const API_VERSION = "v2";
const API_URL = `https://nuku.zeabur.app/api/${API_VERSION}`;
// const API_URL = `http://localhost:5000/api/${API_VERSION}`;

var NUKU_HEADERS = new Headers();
NUKU_HEADERS.append("api_key", "OB030miTWcDD58KR8yeLIAMK9j9hVaYQ");

var requestOptions: RequestInit = {
  method: "GET",
  redirect: "follow",
  headers: NUKU_HEADERS,
};

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

// utility function for fetching data
export const fetcher = (url: string, options?: any): Promise<any> => fetch(`${API_URL}${url}`, options).then(r => r.json());

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
export async function getHistoricals(symbol: string, query?: TQuery): Promise<TQuote[]> {
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

  let res = await fetcher(`/historicals/${symbol}`, options);

  return res;
}

/**
 * Get stocks for the current day
 * @param {TQuery} options
 * @returns {Promise<TQuote[]>}
 */
export async function getStocks(options?: TQuery): Promise<TQuote[]> {
  let res = await fetcher(`/stocks`, options);

  return res.data;
}

/**
 * Get a single stock by symbol
 * @param symbol
 * @param options
 * @returns {Promise<TQuote>}
 */
export async function getStock(symbol: string, options?: TQuery): Promise<TQuote> {
  let opt = {
    METHOD: "GET",
  };

  let res = await fetcher(`/stocks/${symbol}`, opt);

  return res.data;
}

/**
 * Get list of companies currently listed on PNGX
 * @param options
 * @returns {Promise<TCompany[]>}
 */
export async function getCompanies(options?: TQuery): Promise<TCompany[]> {
  let res = await fetcher(`/companies`);

  return res;
}

// /**
//  * Get a single company by symbol
//  * @param symbol
//  * @param options
//  * @returns {Promise<TCompany>}
//  */
// export async function getCompany(symbol: string, options?: TQuery): Promise<TCompany> {
//   let res = await fetcher(`/companies/${symbol}`, options);

//   return res;
// }

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
export async function getTickers(options?: TQuery): Promise<TTicker[]> {
  let res = await fetcher(`/tickers`, options);

  return res.data;
}

/**
 * Get a single ticker given symbol
 * @param symbol
 * @param options
 * @returns {Promise<TTicker[]>}
 */
export async function getTicker(symbol: string, options?: TQuery): Promise<TTicker[]> {
  let res = await fetcher(`/tickers/${symbol}`, options);

  return res.ticker as TTicker[];
}