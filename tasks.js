const { parse_csv_to_json, normalize_data } = require("./utils")
const { 
    SYMBOLS, 
    OLD_SYMBOLS, 
    LISTED_COMPANIES, 
    PNGX_DATA_URL, 
    PNGX_URL, 
    LOCAL_TIMEZONE, 
    LOCAL_TIMEZONE_FORMAT
} = require("./constants");
const { Stock } = require("./models");

exports.fetch_data_from_pngx = function fetch_data_from_pngx(url) {
    return "fetching data from: " + url;
}

/**
 * Hello
 */
function make_async_request(url, options) {
	Object.assign(options, {
		"method": 'GET',
		"headers": {
			'Content-Type': 'text/csv'
		}
	});

	return new Promise(function(resolve, reject) {
		fetch(url, options)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.text();
		})
		.then((csv) => {
			resolve(parse_csv_to_json(csv));
		})
		.catch((error) => {
			reject(error);
		})
	});
}
exports.make_async_request = make_async_request;

/**
 * hello
 */
function get_quotes_from_pngx(code) {
	var options = {};

	return new Promise(function(resolve, reject) {
		if (undefined !== typeof code) {
			let url = PNGX_DATA_URL + code +".csv";
			console.log(url)
			make_async_request(url, options).then(function(response){
				// resolve(typeof callback == 'function' ? new callback(response) : response);
				resolve(response);
			})
			.catch(function(error) {
				reject(error);
			});
		}
		else {
			for (var j = 0; j < SYMBOLS.length; j++) {

				options['url'] = PNGX_DATA_URL + SYMBOLS[j] +".csv";

				make_async_request(options).then(function(response){
					// resolve(typeof callback == 'function' ? new callback(response) : response);
					resolve(response);
				})
				.catch(function(error) {
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
	console.time("timer");   //start time with name = timer
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
		await get_quotes_from_pngx(symbol).then((quotes) => {
			console.log("Fetched quotes for " + symbol);
			let totalCount = quotes.length, 
			    totalAdded = 0,
				j = 0;

			// iterate through the dataset and add each data element to the db
			while (j < totalCount) {
				let quote = normalize_data(quotes[j]);
				console.log("Querying db for existing quote for " + symbol + " on " + quote.date.toLocaleDateString() + " ...");
				// let data = quotes[totalCount-1]; // latest
			
				// check if the quote for that particular company at that particular date already exists
				Stock.findOne({
					'date': quote.date,
					'short_name': quote.short_name
				})
				.then(result => {
					if (result == null) {
						console.log("Results not found");
						console.log("Adding quote for " + symbol + " ...");
						
						let stock = new Stock(quote);
						stock.save((error) => {
							if (error) {
								console.log(error + "\n");
							} else {
								console.log('Added quote for ' + quote.date.toLocaleDateString() + "\n");
								totalAdded = totalAdded + 1;
							}
						});
					}
					else {
						console.log("Results found: ")
						console.log("Skip ...")
					}
				})
				.catch((error) => {
					throw new Error(error);
				});

				j++;
			};

			console.log(totalAdded + "/" + totalCount + " quotes were added.");
			console.log("stop\n");
		})
		.catch((error) => {
			throw new Error(error);
		});
	};

	initialFetch = false;
	console.log('Date Request Summary');
	console.log(`Data fetched from ${PNGX_DATA_URL}\n`);
	console.timeEnd("timer"); // end timer and log time difference
	const endTime = new Date();
	const timeDiff = parseInt(Math.abs(endTime.getTime() - startTime.getTime()) / (1000) % 60); 
	console.log('Start time '+ startTime);
	console.log('End time '+ timeDiff + " secs\n");
	console.log('Time difference'+ timeDiff + " secs\n");
	console.log("Total request time: " + reqTimes);
}
exports.data_fetcher = data_fetcher;

async function stock_fetcher() {
	let result = await Stock.find().then(res => res)
	return result;
}
exports.stock_fetcher = stock_fetcher;