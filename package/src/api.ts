import { QUOTES, TCompany, TQuote, TQuotes, TTicker } from "./types";

const API_VERSION = "v2";
const API_URL = `https://nuku.zeabur.app/api/${API_VERSION}`;
// const API_URL = `http://localhost:5000/api/${API_VERSION}`;

var NUKU_HEADERS = new Headers();
NUKU_HEADERS.append("apikey", "OB030miTWcDD58KR8yeLIAMK9j9hVaYQ");

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
export const fetcher = <T extends any>(url: string, options?: any): Promise<TAPIResponse<T>> => fetch(`${API_URL}${url}`, options).then(r => r.json() as unknown as TAPIResponse<T>);

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

  let res = await fetcher<TQuote[]>(`/historicals/${symbol}`, options);

  return res.data;
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
export async function getStocks(options?: TQuery): Promise<TQuote[]> {
  let res = await fetcher<TQuote[]>(`/stocks`, options);

  return res.data;
}

/**
 * Get a single stock by symbol
 * @param symbol
 * @param options
 * @returns
 */
export async function getStock(symbol: string, options?: TQuery): Promise<TQuote> {
  let opt = {
    METHOD: "GET",
  };

  let res = await fetcher<TQuote>(`/stocks/${symbol}`, opt);

  return res.data;
}

/**
 * Get list of companies currently listed on PNGX
 * @param options
 * @returns
 */
export async function getCompanies(options?: TQuery): Promise<TCompany[]> {
  let opt = {
    METHOD: "GET",
  };

  let res = await fetcher<TCompany[]>(`/companies`, opt);

  return res.data;
}

/**
 * Get a single company by symbol
 * @param symbol
 * @param options
 * @returns
 */
export async function getCompany(symbol: string, options?: TQuery): Promise<TCompany> {
  let res = await fetcher<TCompany>(`/companies/${symbol}`, options);

  return res.data;
}

/**
 * List stock tickers for all companies currently listed on PNGX
 * @param options
 * @returns
 */
export async function getTickers(options?: TQuery): Promise<TTicker[]> {
  let res = await fetcher<TTicker[]>(`/tickers`, options);

  return res.data;
}

/**
 * Get a single ticker given symbol
 * @param symbol
 * @param options
 * @returns
 */
export async function getTicker(symbol: string, options?: TQuery): Promise<TTicker> {
  let res = await fetcher<TTicker>(`/companies/${symbol}`, options);

  return res.data;
}