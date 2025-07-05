import { parse } from 'csv-parse';
import { TAPIResponse } from "./types";
import { METHODS } from 'http';

// const DATA_URL = 'https://www.pngx.com.pg/data';
// const API_URL = `https://api.nuku-api.io/api/v1`;
const API_URL = `http://locahost:5000/api/v1`;

enum Servers {
  PNGX = "pngx",
  NUKUAPI = "nuku"
}

const fetcher = async (url: string, options: any) => await fetch(`${API_URL}/${url}`, options)

type TQuery = {
  date?: string;
  start?: string;
  end?: string;
  limit?: number;
  sort?: number;
  skip?: number;
  fields?: []
}

/**
 * /api/historicals/:symbol
 * @param symbol 
 * @param query 
 * @returns 
 */
export async function getHistoricals(
  symbol: string,
  query?: TQuery
) {
  let {
  date,
  start,
  end,
  limit,
  sort,
  skip,
  fields
  } = query || {};

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
    }
  }

  let res = await fetcher(`/historicals/${symbol}`, options)

  return res.json()
}

/**
 * 
 * @param options 
 * @returns 
 */
export async function getStocks(options?: TQuery) {
  let res = await fetcher(`/stocks`, options);

  return res.json;
}

/**
 * 
 * @param symbol 
 * @param options 
 * @returns 
 */
export async function getStock(symbol: string, options?: TQuery) {
  let opt = {
    METHOD: 'GET',
  }

  let res = await fetcher(`/stocks/${symbol}`, opt);

  return res.json();
}


export async function getCompanies(options?: TQuery) {
  let opt = {
    METHOD: 'GET',
  }

  let res = await fetcher(`/companies`, opt);

  return res.json();
}

export async function getCompany(symbol: string, options?: TQuery) {
  let res = await fetcher(`/companies/${symbol}`, options);

  return res.json();
}

export async function getTickers(options?: TQuery) {
  let res = await fetcher(`/tickers`, options);

  return res.json();
}

export async function getTicker(symbol: string, options?: TQuery) {
  let res = await fetcher(`/companies/${symbol}`, options);

  return res.json();
}

export async function getDataFromServer(symbol: string, options?: TQuery) {
  // let res = await fetch(`${DATA_URL}/${symbol}.csv`);
  // let data = await res.text();
  let data;
  
  const requestOptions: RequestInit = {
    method: "GET"
  };

  fetch("https://www.pngx.com.pg/data/BSP.csv", requestOptions)
  .then((response) => response.text())
  .then((result) => data = parse(result))
  .catch((error) => console.error(error));
  
  // let d = parse(data);

  console.log(data)

  return data;
}