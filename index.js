'use strict';
const express = require("express");
const request = require('request');
const mongoose = require('mongoose');
const cron = require('node-cron');
const cors = require("cors");
const fs = require('fs');
const bodyParser = require("body-parser");
require("dotenv").config();

// Creating express app
const app = express();
const router = express.Router();
const PORT = process.env.PORT;

app.set('port', PORT);
app.set('env', process.env.ENV);
// enables cors
app.use(cors({
	'allowedHeaders': ['sessionId', 'Content-Type'],
	'exposedHeaders': ['sessionId'],
	'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({}));

// create server and listen on the port
app.listen(app.get('port'), function(req, res) {
	console.log(`Server running on port ${PORT}.`);
});

// Creating an instance for MongoDB
if (app.get('env') == "development") {
	mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true });
}
else if (app.get('env') == "production") {
	mongoose.connect(process.env.MONGODB_ADDON_URI, { useNewUrlParser: true, useUnifiedTopology: true });
}
mongoose.Promise = global.Promise;
mongoose.connection.on("connected", function(){
	console.log("Connected: Successfully connect to mongo server");
});
mongoose.connection.on('error', function(){
	console.log("Error: Could not connect to MongoDB. Did you forget to run 'mongod'?");
});

// models
const Schema = mongoose.Schema;

var quoteSchema = new Schema({
	date: {type: Date},
	code: String,
	short_name: String,
	bid: Number,
	offer: Number,
	last: Number,
	close: Number,
	high: Number,
	low: Number,
	open: Number,
	chg_today: Number,
	vol_today: Number,
	num_trades: Number
});

const Stock = mongoose.model('stockquote', quoteSchema);

// const Parse = require('parse');

// Parse.initialize("YOUR_APP_ID", "YOUR_JAVASCRIPT_KEY");
// Parse.serverURL = 'http://YOUR_PARSE_SERVER:1337/parse';

// const GameScore = Parse.Object.extend("GameScore");

// const gameScore = new GameScore();

// gameScore.set("score", 1337);
// gameScore.set("playerName", "Sean Plott");
// gameScore.set("cheatMode", false);

// gameScore.save()
// 		.then((gameScore) => {
// 			// Execute any logic that should take place after the object is saved.
// 		 	alert('New object created with objectId: ' + gameScore.id);
// 		}, (error) => {
// 		// Execute any logic that should take place if the save fails.
// 		// error is a Parse.Error with an error code and message.
// 		alert('Failed to create new object, with error code: ' + error.message);
// 	});

// const query = new Parse.Query(GameScore);
// query.get("playerName")
// 	.then((gameScore) => {
// 		// The object was retrieved successfully.
// 	}, (error) => {
// 		// The object was not retrieved successfully.
// 		// error is a Parse.Error with an error code and message.
// 	});

const QUOTES = ['BSP','CCP','CGA','COY','CPL','KAM','KSL','NCM','NGP','NIU','OSH','SST'];
const DATAURL = "http://www.pngx.com.pg/data/";

/**
 * Schedule task to requests data from PNGX datasets and model them and stores them in db
 * Fetch data from PNGX.com every 5 minutes
 */
cron.schedule('*/2 * * * *', () => {
	console.log('running a task every 5 minutes');

	// dataFetcher();
});

// /v1
app.use('/v1', router);

app.get('/', function(req, res) {
	res.json({
		"status": 200,
		"data": {}
	});
});

router.get('/', function(req, res) {
	res.json({
		"symbols": QUOTES
	});
});

/**
 * GET /api/v1/historicals/:symbol
 * @param :symbol unique symbol of the stock
 */
router.get('/historicals/:symbol', function(req, res, next) {
	let symbol = req.params.symbol
	let date = req.query.date;
	let start = req.query.start;
	let end = req.query.end;
	let limit = req.query.limit;
	let sort = req.query.sort;
	let skip = req.query.skip;

	let stock = Stock.find()
	stock.where({ 'code': symbol });
	// /^vonderful/i)

	if (date) {
		stock.where('date', new Date(date));
	}
	if (start) {
		stock.where({ 'date': { $gte: new Date(start) } });
	}
	if (end) {
		stock.where({ 'date': { $lte: new Date(end) } })
	}

	if (sort) {
		stock.sort({ 'date': sort });
	}

	if (limit) {
		stock.limit(limit);
	}

	if (skip) {
		stock.skip(skip);
	}

	stock.exec(function(err, stocks){
		if (err) {
			console.log(err);
		}
		if (stocks) {
			res.json({
				'status': 302,
				'symbol': symbol,
				'historical': stocks
			});
		}
		else {
			res.sendStatus(404);
		}
	});
});

/**
 * GET /api/v1/stocks
 * Retrieve quotes for all the companies for the current day
 * Retrieve PNGX stock quotes stored in the my own database
 * Retrieve Stock Quotes directly from PNGX website
 * @query date - retrieve quote for the exact date
 * @query start - start date in a range
 * @query end - end date in a range
 * @query limit - 
 * @query offset - 
 * @query sort - 
 * @query skip - 
 * @query fields - i.e. fields=id,name,address,contact
 *
 * @param: /api/v1/stocks?code=CODE, retreive quotes from a specific company for the current day
 * @param: /api/v1/stocks?code=CODE&date=now, retreive quotes from a specific company for the specific day
 * @param: /api/v1/stocks?code=CODE&from=DATE&to=DATE
 */
router.get('/stocks', function(req, res) {
	let date = req.query.date;
	let start = req.query.start;
	let end = req.query.end;
	let limit = req.query.limit;
	let sort = req.query.sort;
	let skip = req.query.skip;

	let stock = Stock.find({});

	var dateStr = {
		date: new Date().toDateString()
	};

	if (date) {
		dateStr['date'] = new Date(date).toDateString();
		if (Number.isInteger(Number(date))) {
			stock.where({ date: date });
		}
		else {
			stock.where({ date: new Date(date) });
		}
	}

	if (start) {
		dateStr['start'] = new Date(start).toDateString();
		if (Number.isInteger(Number(start))) {
			stock.where({ date: { $gte: start } });
		}
		else {
			stock.where({ date: { $gte: new Date(start) } });
		}
	}

	if (end) {
		dateStr['end'] = new Date(start).toDateString();
		if (Number.isInteger(Number(end))) {
			stock.where({ date: { $lte: end } });
		}
		else {
			stock.where({ date: { $lte: new Date(end) } });
		}
	}

	if (sort) {
		stock.sort({ date: sort });
	}
	else {
		stock.sort({ date: 1 });
	}

	if (limit) {
		stock.limit(limit);
	}

	if (skip) {
		stock.skip(skip);
	}

	stock.exec(function(err, stocks) {
		if (err) {
			console.log(err);
		}
		if (stocks) {
			res.json({
				'status': 200,
				dateStr,
				'data': stocks
			});
		}
		else {
			res.json({
				"status": 404,
				"reason": "NotFound"
			});
		}
	});
});

/**
 * POST /api/v1/stocks
 * Manually add sample data for testing
 */
router.post('/stocks', function(req, res) {
	let data = req.body;

	let query = Stock.findOne({
		date: data[0]['date'],
		short_name: data[0]['short_name'] 
	});
	query.lean()
	query.exec(function(error, result) {
		if (error) {
			console.error("Error: " + error);
			res.send("Error: " + error);
		}
		else if (result == null) {
			console.log("Match not found.");
			console.log("Adding it to the db");
			
			let quote = new Stock();
			quote['date'] = new Date(data[0]['date']);
			quote['code'] = data[0]['code'];
			quote['short_name'] = data[0]['short_name'];
			quote['bid'] = Number(data[0]['bid']);
			quote['offer'] = Number(data[0]['offer']);
			quote['last'] = Number(data[0]['last']);
			quote['close'] = Number(data[0]['close']);
			quote['high'] = Number(data[0]['high']);
			quote['low'] = Number(data[0]['low']);
			quote['open'] = Number(data[0]['open']);
			quote['chg_today'] = Number(data[0]['chg_today']);
			quote['vol_today'] = Number(data[0]['vol_today']);
			quote['num_trades'] = Number(data[0]['num_trades']);

			quote.save(function(err) {
				if (err) {
					console.error(err);
				} else {
					console.log('added quote for ' + data['date']);
					res.sendStatus(201);
				}
			});
		}
		else {
			console.log("Match found! Cannot add quote");
			res.send("Match found! Cannot add quote");
		}
	});
});

/**
 * GET /api/v1/stocks/:quote_id
 * Get a specific quote from the database
 * @param :quote_id unique id of the quote
 */
router.get('/stocks/:quote_id', function(req, res) {
	let stockId = req.params.quote_id;

	Stock.findById(stockId, function(error, result) {
		if (error) {
			console.error("Error: " + error);
		}
		if (result) {
			console.log("Match found!: ", result);
			res.json({
				'status': 302,
				'data': result
			});
		}
		else {
			res.sendStatus(404);
		}
	});
});

/**
 * DELETE /api/v1/stocks/:quote_id
 * Delete a specific quote from the database
 * @param :quote_id unique id of the quote
 */
router.delete('/stocks/:quote_id', function(req, res) {
	let stockId = req.params.quote_id;

	Stock.findByIdAndRemove(stockId, function(error, result) {
		if (error) {
			console.error("Error: " + error);
		}
		else {
			console.log("Removed Quote : ", result);
			res.sendStatus(200);
		}
	});
});

function get_quotes_from_pngx(code) {
	var options = {};
	Object.assign(options, {
		"method": 'GET',
		"json": true
	});

	return new Promise(function(resolve, reject) {
		if (undefined !== typeof code) {
			options['url'] = DATAURL + code +".csv";
			getData(options).then(function(response){
				// resolve(typeof callback == 'function' ? new callback(response) : response);
				resolve(response);
			})
			.catch(function(error) {
				reject(error);
			});
		}
		else {
			for (var j = 0; j < QUOTES.length; j++) {

				options['url'] = DATAURL + QUOTES[j] +".csv";

				getData(options).then(function(response){
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

/**
 * Parses CSV format to JSON format for easy manipulation of data
 */
function parse_csv_to_json(body) {
	var i = [];
	// split the data into array by whitespaces
	// var o = body.split(/\r\n|\n/);

	// split the first row of that array only by comma (,) to get headers
	// var a = o[0].split(",");

	// loop through the other rows to obtain data
	for (var o = body.split(/\r\n|\n/), a = o[0].split(","), s = 1; s < o.length; s++) {
		// split each row by comma
		var l = o[s].split(",")
		// compare the splited row with the first/header row
		if (l.length == a.length) {
			// run through the header row
			// attaches splited row to the header row
			// then store it on variable d
			// create array by pushing the stored data to the variable i
			for(var d = {}, u = 0; u < a.length; u++) d[a[u]] = l[u]; i.push(d)
		}
	}
	// i[i.length -1]
	return i;
}

function getData(options) {
	return new Promise(function(resolve, reject) {
		request(options, function(error, response, body) {
			if (error) reject(error);
			if (response && response.statusCode == 200) {
				resolve(parse_csv_to_json(body));
			}
		});
	});
}

async function dataFetcher() {
	console.log('Fetching data from https://www.pngx.com.pg');
	var startTime = new Date();
	var reqTime = 0;

	for (var i = 0; i < QUOTES.length; i++) {
		let quote = QUOTES[i];
		// insert new data from pngx into the local database
		// get csv data from pngx.com
		// parse the csv to json
		// for each quote compare its date against the date of the ones that exist in the database
		// if the date compared does not match any existing quote then insert that quote into the database
		// else continue to next quote until all quotes are compared then exit the program
		await get_quotes_from_pngx(quote).then(function(response) {
			var totalCount = response.length, totalAdded = 0;
			console.log("start");
			console.log("Adding quotes for " + quote + " ...");

			response[totalCount-1];

			for (var j = 0; j < response.length; j++) {
				let data = response[j];
				// console.log(data)

				// check if the quote for that particular company at that particular date already exists
				Stock.findOne({
					'date': data['Date'],
					'short_name': data['Short Name']
				})
				.then(function(result) {
					reqTime++;
					if (result == null) {
						console.log("Match not found.");
						console.log("Adding it to the db");
						let quote = new Stock();

						quote['date'] = new Date(data['Date']);
						quote['code'] = data['Short Name'];
						quote['short_name'] = data['Short Name'];
						quote['bid'] = Number(data['Bid']);
						quote['offer'] = Number(data['Offer']);
						quote['last'] = Number(data['Last']);
						quote['close'] = Number(data['Close']);
						quote['high'] = Number(data['High']);
						quote['low'] = Number(data['Low']);
						quote['open'] = Number(data['Open']);
						quote['chg_today'] = Number(data['Chg. Today']);
						quote['vol_today'] = Number(data['Vol. Today']);
						quote['num_trades'] = Number(data['Num. Trades']);

						quote.save(function(err) {
							if (err) {
								console.log(err);
							} else {
								console.log('added quote for ' + data['Date']);
								totalAdded++;
							}
						});
					}
				})
				.catch(function(error) {
					throw new Error(error);
				});
			};

			console.log(totalAdded + "/" + totalCount + " quotes were added.");
			console.log("stop");
		})
		.catch(function(error) {
			console.log(error);
		});
	};

	console.log('Data fetched from https://www.pngx.com.pg');
	var endTime = new Date();
	console.log(startTime + " - " + endTime)
	console.log("total request itme: " + reqTime)
}
