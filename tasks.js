const request = require("request");
// const fetch = require('node-fetch');
const superagent = require("superagent");

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

/**
 * Hello
 */
function make_async_request(url, options) {
  Object.assign(options, {
    method: "GET",
    redirect: "follow",
    // "headers": {
    // 	'Content-Type': 'text/csv'
    // }
  });

  return new Promise(function (resolve, reject) {
    fetch(url, options)
      // .retry(2)
      // .on('progress', event => {
      // 	/* the event is:
      // 	{
      // 	  direction: "upload" or "download"
      // 	  percent: 0 to 100 // may be missing if file size is unknown
      // 	  total: // total file size, may be missing
      // 	  loaded: // bytes downloaded or uploaded so far
      // 	} */
      // 	console.log(event)
      // })
      // .withCredentials()
      // .redirects(2)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((csv) => {
        return parse_csv_to_json(csv);
      })
      .then((json) => {
        resolve(json);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
exports.make_async_request = make_async_request;

/**
 * hello
 */
function get_quotes_from_pngx(code) {
  var options = {};

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
      for (var j = 0; j < SYMBOLS.length; j++) {
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
  console.log(`Fetching csv data from ${PNGX_URL}\n`);

  console.time("timer"); //start time with name = timer
  const startTime = new Date();
  let reqTimes = 0; // number of times the loop runs to fetch data

  for (var i = 0; i < SYMBOLS.length; i++) {
    reqTimes++;
    let symbol = SYMBOLS[i];
    console.log("Fetching quotes for " + symbol + " ...");
    /**
     * insert new data from pngx into the local database
     * get csv data from pngx.com
     * parse the csv to json
     * for each quote compare its date against the date of the ones that exist in the database
     * if the date compared does not match any existing quote then insert that quote into the database
     * else continue to next quote until all quotes are compared then exit the program
     */
    await get_quotes_from_pngx(symbol)
      .then((quotes) => {
        console.log("Fetched quotes for " + symbol);
        let totalCount = quotes.length,
          totalAdded = 0,
          index = totalCount - 1,
          recordExist = false;

        // iterate through the dataset and add each data element to the db
        do {
          let quote = normalize_data(quotes[index]); // latest quote
          console.log(`Querying db for existing quote for ${symbol} on ${quote.date.toLocaleDateString()} ...`);

          // check if the quote for that particular company at that particular date already exists
          Stock
            .findOne({
              date: quote.date,
              code: quote.code,
            })
            .then((result) => {
              if (result) {
                recordExist = true;
                console.log("Results found");
                console.log("Skip ...");
              } else {
                recordExist = false;
                console.log("Results not found");
                console.log("Adding quote for " + symbol + " ...");

                let stock = new Stock(quote);
                stock
                  .save()
                  .then(() => {
                    console.log(`Added quote for ${quote.date.toLocaleDateString()} \n`);

                    totalAdded++;
                  })
                  .catch((error) => {
                    console.log(error + "\n");
                  });
              }
            })
            .catch((error) => {
              throw new Error(error);
            });

          index--;
        }  while (recordExist && index >= 0);

        console.log(`${totalAdded}/${totalCount} quotes were added.`);
        console.log("stop\n");
      })
      .catch((error) => {
        // throw new Error(error);
        console.error(error);
      });
  }

  console.log("Date Request Summary");
  console.log(`Data fetched from ${PNGX_DATA_URL}\n`);
  console.timeEnd("timer"); // end timer and log time difference
  const endTime = new Date();
  const timeDiff = parseInt((Math.abs(endTime.getTime() - startTime.getTime()) / 1000) % 60);
  console.log("Start time " + startTime);
  console.log("End time " + timeDiff + " secs\n");
  console.log("Time difference " + timeDiff + " secs\n");
  console.log("Total request time: " + reqTimes);
}
exports.data_fetcher = data_fetcher;

async function checkIfExistInDatabase(code, date) {
  let result = await Stock
    .findOne({
      date: date,
      code: code,
    })

  return result > 0;
}

async function stock_fetcher() {
  let result = await Stock.find();
  return result;
}
exports.stock_fetcher = stock_fetcher;

/**
 * reverse run down
 */
