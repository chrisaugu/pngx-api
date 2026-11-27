import { Request, Response } from "express";
import _ from "lodash";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Papa from "papaparse";
import csv from "csv-parser";
import needle from "needle";
import { format, parse, formatDate } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import {
  SYMBOLS,
  OLD_SYMBOLS,
  PNGX_DATA_URL,
  PNGX_URL,
  LOCAL_TIMEZONE,
  LOCAL_TIMEZONE_FORMAT,
} from "../constants";
import Env from "../config/env";
import { IQuote } from "../types/nuku";
import { Stock } from "../models";
import { winstonLogger as logger } from "../libs/logger";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { createReadStream, PathLike } from "node:fs";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

const csvOptions = {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: "greedy",
  newline: "\r\n",
  worker: true,
};

function date_split(date: string) {
  const regex = /^\d{4}[-/]\d{2}[-/]\d{2}$/;
  const regex2 = /^\d{4}[-/]\d{2}[-/]\d{2}$/;

  if (regex.test(date)) {
    if (regex2.test(date)) {
      const [month, day, year] = date.split("/");
      const result = [year, month, day].join("-");
      const normalizedDate = date.replace(/\//g, "-");

      return result;
    } else {
      return date;
    }
  }
}

/**
 * This function takes in date of dd/MM/yyyy format and spits out the Date
 */
function format_date(date: string) {
  // only for STO's date i.e. 30/09/2024 - dd/MM/yyyy

  if (
    date.match(
      new RegExp(
        "^((0[1-9]|[12][0-9]|3[01])/(01|03|05|07|08|10|12)/([0-9]{4}))|((0[1-9]|[12][0-9]|30)/(04|06|09|11)/([0-9]{4}))|((0[1-9]|1[0-9]|2[0-8])/02/([0-9]{4}))|(29/02/([0-9]{2}(0[48]|[2468][048]|[13579][26])|([048][048]|[13579][26])00))$",
      ),
    )
  ) {
    const parseDate = parse(date, "dd/MM/yyyy", new Date());
    // fixing timezone issues on clever-cloud.io
    const localTime = formatInTimeZone(
      parseDate,
      LOCAL_TIMEZONE,
      LOCAL_TIMEZONE_FORMAT,
    );
    return new Date(parseDate);
  }
  // rest of the quotes 2019/11/18 - yyyy/MM/dd
  // else if (date.match(/\d{2,4}-\d{1,2}-\d{1,2}/)) {

  // }
  else {
    return new Date(date);
  }
}

function normalize_data(data: any) {
  let quote: IQuote = {
    id: "",
    date: new Date(),
    code: "",
    short_name: "",
    bid: 0,
    offer: 0,
    last: 0,
    close: 0,
    high: 0,
    low: 0,
    open: 0,
    chg_today: 0,
    vol_today: 0,
    num_trades: 0,
  };
  let formattedDate = format_date(data["Date"]);

  quote["date"] = formattedDate;
  quote["code"] = data["Short Name"]?.trim();
  quote["short_name"] = data["Short Name"]?.trim();
  quote["bid"] = convertStringToNumber(data["Bid"]);
  quote["offer"] = convertStringToNumber(data["Offer"]);
  quote["last"] = convertStringToNumber(data["Last"]);
  quote["close"] = convertStringToNumber(data["Close"]);
  quote["high"] = convertStringToNumber(data["High"]);
  quote["low"] = convertStringToNumber(data["Low"]);
  quote["open"] = convertStringToNumber(data["Open"]);
  quote["chg_today"] =
    convertStringToNumber(data["Chg. Today"]) ??
    convertStringToNumber(data["Chg.Today"]);
  quote["vol_today"] = convertStringToNumber(
    data["Vol. Today"] ?? data["Vol.Today"],
  );
  quote["num_trades"] = convertStringToNumber(
    data["Num. Trades"] ?? data["Num.Trades"],
  );

  return quote;
}

/**
 * this util function addresses what papa parse fails, when infering the data type when parsing csv data stream
 * from data source as they are not always consistency in their format
 * @param {String} str
 * @returns {Number}
 */
function convertStringToNumber(str: string): number {
  if (_.isString(str)) {
    if (str.includes(",")) {
      const num = Number(str.split(",").join(""));
      return num;
    } else {
      return Number(str);
    }
  } else {
    return str;
  }
}

async function parallel(arr: number[], fn: (x: number) => void, threads = 2) {
  const result = [];

  while (arr.length) {
    const res = await Promise.all(arr.splice(0, threads).map((x) => fn(x)));
    result.push(res);
  }
  return result.flat();
}

/**
 * Parses CSV format to JSON format for easy manipulation of data
 */
function parse_csv_to_json2(body: string) {
  logger.debug("parsing csv to json");
  var i = [];
  // split the data into array by whitespaces
  // var o = body.split(/\r\n|\n/);

  // split the first row of that array only by comma (,) to get headers
  // var a = o[0].split(",");

  // loop through the other rows to obtain data
  for (
    var o = body.split(/\r\n|\n/), a = o[0].split(","), s = 1;
    s < o.length;
    s++
  ) {
    // split each row by comma
    var l = o[s].split(",");
    // compare the splited row with the first/header row
    if (l.length == a.length) {
      // run through the header row
      // attaches splited row to the header row
      // then store it on variable d
      // create array by pushing the stored data to the variable i
      for (var d: Record<string, any> = {}, u = 0; u < a.length; u++)
        d[a[u]] = l[u];
      i.push(d);
    }
  }
  // i[i.length -1]
  return i;
}

type CsvRow = Record<string, string>;

interface CsvParseOptions {
  header?: boolean;
  skipEmptyLines?: boolean | "greedy";
  dynamicTyping?: boolean;
  // ...etc, mirror the subset of Papa.ParseConfig you allow
}
function parse_csv_to_json(
  csv: string,
  csvOptions: CsvParseOptions = { header: true, skipEmptyLines: "greedy" },
): CsvRow[] {
  if (typeof csv !== "string" || csv.trim() === "") {
    throw new Error("CSV content is required");
  }

  const { data, errors, meta } = Papa.parse<CsvRow>(csv, {
    ...csvOptions,
    // sync parse of a string; do not use step/chunk/complete here
  });

  if (meta.aborted) {
    throw new Error("CSV parsing was aborted");
  }

  if (errors.length > 0) {
    const formatted = errors
      .map(
        (e) => `${e.type}${e.row != null ? `@row ${e.row}` : ""}: ${e.message}`,
      )
      .join("; ");
    throw new Error(`CSV parse failed: ${formatted}`);
  }

  // Drop columns whose header is blank (this replaces the dead `complete` logic)
  return data.map((row) => {
    const cleaned: CsvRow = {};
    for (const [key, value] of Object.entries(row)) {
      if (key.trim() !== "") cleaned[key.trim()] = value;
    }
    return cleaned;
  });
}

const keyGenerator = (request: Request, response: Response) => {
  if (!request.ip) {
    logger.error("Warning: request.ip is missing!");
    return request.socket.remoteAddress;
  }

  return request.ip.replace(/:\d+[^:]*$/, "");
};

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Function to verify the signature
const verifySignature = (
  secret: string,
  payload: string,
  signature: string,
) => {
  if (!secret || !payload || !signature) return false;
  // if (!secret || !payload || !signature) {
  //   throw new Error("Secret, payload or signature is missing.");
  // }

  const digest = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(digest, "utf-8"),
    Buffer.from(signature, "utf-8"),
  );
};

function generateSignature(
  secret: string,
  method: string,
  url: string,
  timestamp: string,
  body: string,
) {
  if (!secret) {
    throw new Error("Secret is missing.");
  }

  const hmac = crypto.createHmac("SHA256", secret);
  if (body) {
    hmac.update(JSON.stringify(body));
  } else {
    hmac.update(`${method.toUpperCase()}${url}${timestamp}`);
  }

  return hmac.digest("hex");
}

function issueToken(userId: string, secret: string) {
  if (!userId || !secret) {
    throw new Error("userId and secret are required to issue a token");
  }
  return jwt.sign({ id: userId }, secret, { expiresIn: "1h" });
}

/**
 * returns env-var if available else returns default value
 * @param {*} envVar
 * @param {*} deafult_value
 * @returns
 */
function env(envVar: string, deafult_value: string = "") {
  if (Env[envVar]) {
    return Env[envVar];
  } else {
    return deafult_value;
  }
}

async function countFileLines(file: PathLike): Promise<number> {
  return 0;
}

const processLargeFile = async (file: PathLike) => {
  const totalLines = await countFileLines(file);
  let processedLines = 0;

  const readStream = createReadStream(file);
  readStream.on("data", (chunk) => {
    processedLines += chunk.toString().split("\n").length;

    // Send progress update
    // res.write(
    //   `data: ${JSON.stringify({
    //     type: "progress",
    //     percentage: (processedLines / totalLines) * 100,
    //     message: `Processing line ${processedLines} of ${totalLines}`,
    //   })}\n\n`,
    // );
  });
};

export const sleep = (delay: number) =>
  new Promise<void>((resolve, reject) =>
    setTimeout(() => resolve, delay * 1000),
  );

// Generate random callbackId
export function generateCallbackId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * explode req.query objects into map
 * @param queryObj
 * @returns
 * @todo
 * type queryMap = {
            filter: 'sms' | 'email' | 'push'
            sort: [-1, 1]
        }
 */
export function toQueryMap(queryObj: any) {
  return new Map(Object.entries(queryObj));
}

export async function generateSessionId() {
  return Math.random().toString(36).substring(2, 9);
}

const trim_code_name = async () => {
  const stocks = await Stock.find();
  for (const stock of stocks) {
    console.log(stock);
    stock.short_name = stock.short_name.trim();
    stock.code = stock.code.trim();
    stock.save();
  }
  console.log("Updated");
};

/**
 *
 * @param {Array<number>} priceArray
 * @returns
 * @see https://medium.com/@mcraepetrey/algorithms-in-javascript-solving-the-stock-market-problem-2ca3321f9eda
 */
// @flow
const stockMarket = (priceArray: number[]) => {
  // first check to make sure there's more than 1 value in the stock list!
  if (priceArray.length < 2) {
    return -1;
  }

  // initialize the "current minimum" or initial "buy" price - our first opportunity to buy!
  let currentMin = priceArray[0];

  // initialize the maxProfit at -1, which will be the return if our stock price list allows for no profit
  let maxProfit = -1;

  // loop through the array starting with the value at the 1st index (we're skipping the 0th index since that has been claimed as our initial "buy" price and can never be our "sell" price
  for (let i = 1; i < priceArray.length; i++) {
    const currentPrice = priceArray[i];

    // initially assume the "current price" is the "sell" price - and determine a potential profit based on that transaction
    const currentProfit = currentPrice - currentMin;

    // if this potential profit is greater than the "max profit" we've been tracking, re-assign the max profit to this current profit
    if (currentProfit > maxProfit) {
      maxProfit = currentProfit;
    }

    // we're also still hunting for the best purchase price, so we're comparing each price in the array to the "current min"
    if (currentPrice < currentMin) {
      currentMin = currentPrice;
    }
  }

  // after looping through every value in the array, we return the maximum profit!
  return maxProfit;
};

const makeFilter = (filter: string) => {
  const key = filter.split("-")[0];
  const value = filter.split("-")[1];

  return {
    [key]: value,
  };
};

export {
  makeFilter,
  parse_csv_to_json,
  parallel,
  normalize_data,
  format_date,
  date_split,
  keyGenerator,
  uuidv4,
  verifySignature,
  generateSignature,
  issueToken,
  env,
  convertStringToNumber,
  trim_code_name,
};
