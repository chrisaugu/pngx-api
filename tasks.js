const request = require("request");
const superagent = require("superagent");
const _ = require("lodash");
const needle = require("needle");
const Papa = require("papaparse");
const logger = require("./libs/logger").winstonLogger;

const { parse_csv_to_json, normalize_data } = require("./utils");
const {
  SYMBOLS,
  OLD_SYMBOLS,
  COMPANIES,
  PNGX_DATA_URL,
  PNGX_URL,
  LOCAL_TIMEZONE,
  LOCAL_TIMEZONE_FORMAT,
} = require("./constants");
const { Stock } = require("./models");

exports.fetch_data_from_pngx = function fetch_data_from_pngx(url) {
  return "fetching data from: " + url;
};

function hello() {
  const results = [];

  const csvDatasetUrl = "https://www.pngx.com.pg/data/BSP.csv";

  needle
    .get(csvDatasetUrl)
    .pipe(Papa.parse(Papa.NODE_STREAM_INPUT, csvOptions))
    //   .pipe(
    // 	csv({
    // 		mapHeaders: ({ header, index, value }) => {
    // 			if (index > 0) {
    // 			let dates = header.split(" ");
    // 			let month = "March";
    // 			let date = new Date(`${dates[0]} ${month} ${dates[1]} ${year}`);
    // 			return `${year}-${date.getMonth()}-${dates[1]}`;
    // 			} else {
    // 			return header;
    // 			}
    // 		},
    // 	})
    //   )
    .on("data", (data) => results.push(normalize_data(data)))
    .on("end", async () => {
      // console.log(results);
    });
}

/**
 * Hello
 */
function make_async_request(url, options) {
  Object.assign(options, {
    method: "GET",
    redirect: "follow",
    headers: {
      "Content-Type": "text/csv",
    },
    cache: "no-cache", // or 'force-cache', 'reload', 'default'
  });

  return new Promise(function (resolve, reject) {
    // console.debug(`Making request to ${url} with options:`, options);

    fetchWithRetry(url, options)
      .then(async (response) => {
        if (response.status >= 200 && response.status < 300) {
          return response.text();
        }
        console.debug(`Making request to ${url} with options:`, options);
        // if the response is not
        // reject if the response is not 2xx
        throw new Error(`HTTP error! status: ${url} ${response.status}`);
      })
      .then((csv) => parse_csv_to_json(csv))
      .then((json) => {
        resolve(json);
      })
      .catch((error) => {
        // console.error(`Failed to fetch data: ${error}`);
        reject(error);
      });
  });
}
exports.make_async_request = make_async_request;

const fetchWithRetry = async (url, options) => {
  const MAX_RETRIES = 3;
  let retries = 0;

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      // console.error(`Error: ${response.status} - ${response.statusText}`);
      throw new Error(`HTTP error! status: ${url} ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      retries++;
      console.log(`Retry attempt ${retries}`);
      return fetchWithRetry(url, options);
    }
    throw error;
  }
};

/**
 * hello
 */
function get_quotes_from_pngx(code) {
  let options = {};

  return new Promise(function (resolve, reject) {
    if (undefined !== typeof code) {
      let url = PNGX_DATA_URL + code + ".csv";
      make_async_request(url, options)
        .then(function (response) {
          // resolve(typeof callback == 'function' ? new callback(response) : response);
          resolve(response);
        })
        .catch(function (error) {
          reject(error);
        });
    } else {
      for (let j = 0; j < SYMBOLS.length; j++) {
        options["url"] = PNGX_DATA_URL + SYMBOLS[j] + ".csv";

        make_async_request(options)
          .then(function (response) {
            // resolve(typeof callback == 'function' ? new callback(response) : response);
            resolve(response);
          })
          .catch(function (error) {
            reject(error);
          });
      }
    }
  });
}
exports.get_quotes_from_pngx = get_quotes_from_pngx;

/**
 * Fetches Quotes from PNGX.com.pg
 */
async function data_fetcher() {
  console.debug(`Fetching csv data from ${PNGX_URL}\n`);

  console.time("timer"); //start time with name = timer
  const startTime = new Date();
  let reqTimes = 0; // number of times the loop runs to fetch data

  for (var i = 0; i < SYMBOLS.length; i++) {
    reqTimes++;
    let symbol = SYMBOLS[i];
    console.debug("Fetching quotes for " + symbol + " ...");
    /**
     * insert new data from pngx into the local database
     * get csv data from pngx.com
     * parse the csv to json
     * for each quote compare its date against the date of the ones that exist in the database
     * if the date compared does not match any existing quote then insert that quote into the database
     * else continue to next quote until all quotes are compared then exit the program
     */
    await get_quotes_from_pngx(symbol)
      .then((quotes) => quotes.map((quote) => normalize_data(quote)))
      .then((quotes) => {
        // console.debug("Fetched quotes for " + symbol);
        let totalCount = quotes.length,
          totalAdded = 0,
          index = totalCount - 1,
          recordExist = false;

        quotes = _.sortBy(quotes, (q) => q.date);

        // iterate through the dataset and add each data element to the db
        do {
          let quote = quotes[index]; // latest quote
          console.debug(
            `Querying db for existing quote for ${symbol} on ${quote.date.toLocaleDateString()} ...`
          );

          // check if the quote for that particular company at that particular date already exists
          Stock.findOne({
            date: quote.date,
            code: quote.code,
          })
            .then((result) => {
              if (result) {
                recordExist = true;
                console.debug("Results found");
                console.debug("Skip ...");
              } else {
                recordExist = false;
                console.debug("Results not found");
                console.debug("Adding quote for " + symbol + " ...");

                let stock = new Stock(quote);
                stock
                  .save()
                  .then(() => {
                    console.debug(
                      `Added quote for ${quote.date.toLocaleDateString()} \n`
                    );

                    totalAdded++;
                  })
                  .catch((error) => {
                    console.error(error + "\n");
                  });
              }
            })
            .catch((error) => {
              throw new Error(error);
            });

          index--;
        } while (recordExist && index >= 0);

        console.debug(`${totalAdded}/${totalCount} quotes were added.`);
        console.debug("stop\n");
      })
      .catch((error) => {
        console.error("Error fetching quotes for " + symbol, {
          error: error.message,
          stack: error.stack,
        });
      });
  }

  console.debug("Date Request Summary");
  console.debug(`Data fetched from ${PNGX_DATA_URL}\n`);
  console.timeEnd("timer"); // end timer and log time difference
  const endTime = new Date();
  const timeDiff = parseInt(
    (Math.abs(endTime.getTime() - startTime.getTime()) / 1000) % 60
  );
  console.debug("Start time " + startTime);
  console.debug("End time " + timeDiff + " secs\n");
  console.debug("Time difference " + timeDiff + " secs\n");
  console.debug("Total request time: " + reqTimes);
}
exports.data_fetcher = data_fetcher;

async function check_if_exist_in_database(code, date) {
  let result = await Stock.findOne({
    date: date,
    code: code,
  });

  return result > 0;
}
exports.check_if_exist_in_database = check_if_exist_in_database;

async function stock_fetcher() {
  let result = await Stock.find();
  return result;
}
exports.stock_fetcher = stock_fetcher;

exports.news_fetcher = async () => {
  return result;
}

exports.fixDateFormatOnProdDB = function fixDateFormatOnProdDB() {
  Stock.find({
    // _id: mongoose.mongo.ObjectId("633a925da76dd590ada1d70c"),
    // date: new Date("10/03/2022"),
    code: "STO",
  })
    .then((res) => {
      return Promise.all(
        res.map((data) => {
          // if (date)
          // data.date = new Date(data.date)
          // data.save()
          return data;
        })
      );
    })
    .then((res) => {
      console.log("Updated date format for " + res.length + " records");
      res.forEach((data) => {
        console.log(
          `Updated date for ${data.code} on ${data.date.toLocaleDateString()}`
        );
      });
    });
};
// fixDateFormatOnProdDB()
