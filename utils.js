const _ = require("lodash");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Papa = require("papaparse");
const csv = require("csv-parser");
const needle = require("needle");
const { format, parse, formatDate } = require("date-fns");
const { formatInTimeZone } = require("date-fns-tz");
const {
  SYMBOLS,
  OLD_SYMBOLS,
  LISTED_COMPANIES,
  PNGX_DATA_URL,
  PNGX_URL,
  LOCAL_TIMEZONE,
  LOCAL_TIMEZONE_FORMAT,
} = require("./constants");
const Env = require("./config/env");
const logger = require("./libs/logger").winstonLogger;

const csvOptions = {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: "greedy",
  newline: "\r\n",
  worker: true,
};

function date_split(date) {
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
 * @param {String} date
 * @returns Date
 */
function format_date(date) {
  // only for STO's date i.e. 30/09/2024 - dd/MM/yyyy

  if (
    date.match(
      new RegExp(
        "^((0[1-9]|[12][0-9]|3[01])/(01|03|05|07|08|10|12)/([0-9]{4}))|((0[1-9]|[12][0-9]|30)/(04|06|09|11)/([0-9]{4}))|((0[1-9]|1[0-9]|2[0-8])/02/([0-9]{4}))|(29/02/([0-9]{2}(0[48]|[2468][048]|[13579][26])|([048][048]|[13579][26])00))$"
      )
    )
  ) {
    const parseDate = parse(date, "dd/MM/yyyy", new Date());
    // fixing timezone issues on clever-cloud.io
    const localTime = formatInTimeZone(
      parseDate,
      LOCAL_TIMEZONE,
      LOCAL_TIMEZONE_FORMAT
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

function normalize_data(data) {
  const quote = {};
  const formattedDate = format_date(data["Date"]);

  quote["date"] = formattedDate;
  quote["code"] = data["Short Name"];
  quote["short_name"] = data["Short Name"];
  quote["bid"] = convertStringToNumber(data["Bid"]);
  quote["offer"] = convertStringToNumber(data["Offer"]);
  quote["last"] = convertStringToNumber(data["Last"]);
  quote["close"] = convertStringToNumber(data["Close"]);
  quote["high"] = convertStringToNumber(data["High"]);
  quote["low"] = convertStringToNumber(data["Low"]);
  quote["open"] = convertStringToNumber(data["Open"]);
  quote["chg_today"] = convertStringToNumber(data["Chg. Today"]);
  quote["vol_today"] = convertStringToNumber(data["Vol. Today"]);
  quote["num_trades"] = convertStringToNumber(data["Num. Trades"]);

  return quote;
}

/**
 * this util function addresses what papa parse fails, when infering the data type when parsing csv data stream
 * from data source as they are not always consistency in their format
 * @param {String} str
 * @returns {Number}
 */
function convertStringToNumber(str) {
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

async function parallel(arr, fn, threads = 2) {
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
function parse_csv_to_json2(body) {
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
      for (var d = {}, u = 0; u < a.length; u++) d[a[u]] = l[u];
      i.push(d);
    }
  }
  // i[i.length -1]
  return i;
}

function parse_csv_to_json(csv) {
  // Parse local CSV file
  // Stream big file in worker thread
  const { errors, data, meta } = Papa.parse(csv, {
    ...csvOptions,
    // step: function(results) {
    // 	results['data'] = normalize_data(results.data)
    // },
    // chunk: function(chunks) {
    // 	logger.debug(chunks)
    // },
    // complete: function (results) {
    //   // Remove empty columns
    //   const cleanedData = results.data.map((row) => {
    //     const newRow = {};
    //     for (let key in row) {
    //       // Keep only columns with non-empty headers
    //       if (key.trim() !== "") {
    //         newRow[key] = row[key];
    //       }
    //     }
    //     return newRow;
    //   });

    //   logger.debug(cleanedData);
    // },
    // complete: function (results) {
    //   // Filter out empty columns (by checking the header row)
    //   const data = results.data;
    //   const header = data;

    //   // Get indexes of non-empty columns
    //   const validIndexes = header
    //     .map((col, index) => (col.trim() !== "" ? index : -1))
    //     .filter((i) => i !== -1);

    //   // Rebuild cleaned data
    //   const cleanedData = data.map((row) => validIndexes.map((i) => row[i]));

    //   logger.debug(cleanedData);
    //   return cleanedData;
    // },
    // transformHeader: function (header) {
    //   if (header.trim() !== "") return header;
    // },
    // complete: function (results) {
    //   logger.debug(results.data);
    // },
  });

  if (errors.length > 0) throw new Error(errors);

  return data;
}

/**
 *
 * @param {Request} request
 * @param {Response} _response
 * @returns string
 */
const keyGenerator = (request, _response) => {
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
const verifySignature = (secret, payload, signature) => {
  if (!secret || !payload || !signature) return false;

  const digest = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(digest, "utf-8"),
    Buffer.from(signature, "utf-8")
  );
};

function generateSignature(secret, method, url, timestamp, body) {
  if (!secret || !payload || !signature)
    throw new Error("Secret, payload or signature is missing.");

  const hmac = crypto.createHmac("SHA256", secret);
  if (body) {
    hmac.update(JSON.stringify(body));
  } else {
    hmac.update(`${method.toUpperCase()}${url}${timestamp}`);
  }

  return hmac.digest("hex");
}

function issueToken(userId, secret) {
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
function env(envVar, deafult_value) {
  if (Env[envVar]) {
    return Env[envVar];
  } else {
    return deafult_value;
  }
}

const processLargeFile = async (file) => {
  const totalLines = await countFileLines(file);
  let processedLines = 0;

  const readStream = createReadStream(file);
  readStream.on("data", (chunk) => {
    processedLines += chunk.toString().split("\n").length;

    // Send progress update
    res.write(
      `data: ${JSON.stringify({
        type: "progress",
        percentage: (processedLines / totalLines) * 100,
        message: `Processing line ${processedLines} of ${totalLines}`,
      })}\n\n`
    );
  });
};

/**
 *
 * @param {*} priceArray
 * @returns
 * @see https://medium.com/@mcraepetrey/algorithms-in-javascript-solving-the-stock-market-problem-2ca3321f9eda
 */
const stockMarket = (priceArray) => {
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

module.exports = {
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
};
