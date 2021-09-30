const express = require("express");
const request = require('request');
const mongoose = require('mongoose');
const cron = require('node-cron');
const fs = require('fs');
require("dotenv").config();

// Creating express app
const app = express();
const router = express.Router();
const PORT = process.env.PORT;

app.set('port', PORT);
app.use('/v1', router);

// create server and listen on the port
app.listen(app.get('port'), function(req, res) {
	console.log(`Server running on port ${PORT}.`);
});

// Creating an instance for MongoDB
mongoose.connect(process.env.MONGODB_ADDON_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
mongoose.connection.on("connected", function(){
	console.log("Connected: Successfully connect to mongo server");
});
mongoose.connection.on('error', function(){
	console.log("Error: Could not connect to MongoDB. Did you forget to run 'mongod'?");
});

// models
const Schema = mongoose.Schema;

function convertDate(e) {
	return e;
}

var quoteSchema = new Schema({
	date: {type: Date, default: Date.now, index: true, get: convertDate},
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

// var kitty = new Stock({
// 	date: "2021-09-01",
// 	code: "BSP",
// 	short_name: "BSP",
// 	bid: 0,
// 	offer: 12.6,
// 	last: 12.6,
// 	close: 12.6,
// 	high: 13.05,
// 	low: 12,
// 	open: 13.05,
// 	chg_today:0.3,
// 	vol_today: 2000,
// 	num_trades: 4
// });
// kitty.save(function (err) {
// 	if (err) {
// 		console.log(err);
// 	} else {
// 		console.log('meow');
// 	}
// });


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

// http://www.pngx.com.pg/wp-content/uploads/wp-responsive-images-thumbnail-slider/BSP_150_150.png
// fetch("http://www.pngx.com.pg/data/BSP.csv", {"credentials":"include","headers":{"accept":"text/plain, */*; q=0.01","accept-language":"en-US,en;q=0.9","cache-control":"no-cache","pragma":"no-cache","x-requested-with":"XMLHttpRequest"},"referrer":"http://www.pngx.com.pg/","referrerPolicy":"no-referrer-when-downgrade","body":null,"method":"GET","mode":"cors"}); ;
const QUOTES = ['BSP','CCP','CGA','COY','CPL','KAM','KSL','NCM','NGP','NIU','OSH','SST'];
const DATAURL = "http://www.pngx.com.pg/data/";
// const DATAURL = "http://christianaugustyn.localhost/ajax/";

/**
 * Schedule task to requests data from PNGX datasets and model them and stores them in db
 * Fetch data from PNGX.com every 5 minutes
 */
cron.schedule('* 5 * * *', function() {
// cron.schedule('5 * * * *', function() {
	console.log('running a task every 5 minutes');

	console.log('Fetching data from https://www.pngx.com.pg');
	get_quotes_from_pngx(DATAURL);
	console.log('Data fetched from https://www.pngx.com.pg');
});
// Remove the error.log file every twenty-first day of the month.
cron.schedule('0 0 21 * *', function() {
	console.log('---------------------');
	console.log('Running Cron Job');
	fs.unlink('./error.log', err => {
		if (err) throw err;
		console.log('Error file successfully deleted');
	});
});

// get_quotes_from_pngx(DATAURL, QUOTES[0]).then(function(response) {
// 	console.log("start")
// 	response.forEach(function(data) {
// 		// check if the quote for that particular company at that particular date already exists
// 		Stock.findOne({
// 			'date': data['Date'],
// 			'short_name': data['Short Name']
// 		})
// 		.lean()
// 		.exec()
// 		.then(function(result) {
// 			if (result == null) {
// 				let quote = new Stock();

// 				quote['date'] = data['Date'];
// 				quote['code'] = data['Short Name'];
// 				quote['short_name'] = data['Short Name'];
// 				quote['bid'] = data['Bid'];
// 				quote['offer'] = data['Offer'];
// 				quote['last'] = data['Last'];
// 				quote['close'] = data['Close'];
// 				quote['high'] = data['High'];
// 				quote['low'] = data['Low'];
// 				quote['open'] = data['Open'];
// 				quote['chg_today'] = data['Chg. Today'];
// 				quote['vol_today'] = data['Vol. Today'];
// 				quote['num_trades'] = data['Num. Trades'];

// 				quote.save(function(err) {
// 					if (err) {
// 						console.log(err);
// 					} else {
// 						console.log('saved');
// 					}
// 				});

// 			}
// 		});
// 	});
// 	console.log("end")
// })
// .catch(function(error) {
// 	console.log(error);
// });

// const schedule = require('node-schedule');

// const job = schedule.scheduleJob('42 * * * *', function(){
//   console.log('The answer to life, the universe, and everything!');
// });

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
 * GET /api/pngx/stocks
 * Retrieve PNGX stock quotes stored in the my own database
 * Retrieve Stock Quotes directly from PNGX website
 * @query code - Code/short name of company listed on PNGX
 * @query date - specific date to retrieve quote
 * @query start - start date in a range
 * @query end - end date in a range
 *
 * @param: /pngx, retrieve quotes from all the companies for the current day
 * @param: /pngx?code=CODE, retreive quotes from a specific company for the current day
 * @param: /pngx?code=CODE&date=now, retreive quotes from a specific company for the specific day
 * @param: /pnx?code=CODE&from=DATE&to=DATE
 */
router.get('/stocks', function(req, res, next) {
	// let code = req.query.code || '';
	let date = req.query.date || '';
	let start = req.query.start || '';
	let end = req.query.end || '';

	// let date = new Date(req.query.date);

	// `${date.getFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;

	// insert new data from pngx into the local database
	// get csv data from pngx.com
	// parse the csv to json
	// for each quote compare its date against the date of the ones that exist in the database
	// if the date compared does not match any existing quote then insert that quote into the database
	// else continue to next quote until all quotes are compared then exit the program
	// let options = {};
	// getData().then(function(err, data) {
	// 	// iterate through the data
	// 	for (var i = 0; i < data.length; i++) {
	// 		// check if the quote for that particular company at that particular date already exists
	// 		Stock.findOne({
	// 			'date': data['Date'],
	// 			'short_name': data['Short Name']
	// 		})
	// 		.then(function(result) {
	// 			if (data['Date'] == 0) {
	// 				let quote = new Stock();
	// 				quote['date'] = new Date(data['Date']);
	// 				quote['short_name'] = data['Short Name'];
	// 				quote['bid'] = data['Bid'];
	// 				quote['offer'] = data['Offer'];
	// 				quote['last'] = data['Last'];
	// 				quote['close'] = data['Close'];
	// 				quote['high'] = data['High'];
	// 				quote['low'] = data['Low'];
	// 				quote['open'] = data['Open'];
	// 				quote['chg_today'] = data['Chg. Today'];
	// 				quote['vol_today'] = data['Vol. Today'];
	// 				quote['num_trades'] = data['Num. Trades'];

	// 				quote.save(function(err) {
	// 					if (err) {
	//						console.log(err);
	//					} else {
	// 						console.log('saved');
	// 					}
	// 				});

	// 			}
	// 		});
	// 	}
	// });

	let stock = Stock.find({});

	// if (code) {
	// 	stock.where('code', `/${code}/i`);
	// }
	if (date) {
		stock.where('date', new Date(date));
	}
	if (start) {
		stock.where('date').gte(new Date(start));
	}
	if (end) {
		stock.where('date').lte(new Date(end));
	}

	stock.limit(100)

	stock.exec(function(err, stocks) {
		if (err) {
			console.log(error);
		}
		if (stocks) {
			res.json(stocks);
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
 * /api/stocks/:symbol
 * @param :symbol unique symbol of the quote
 */
router.get('/stocks/:symbol', function(req, res, next) {
	let symbol = req.params.symbol
	let code = req.query.code || '';
	let date = req.query.date || '';
	let start = req.query.start || '';
	let end = req.query.end || '';

	let stock = Stock.find()
	stock.where({ code: symbol })
	// /^vonderful/i)

	if (code) {
		stock.where('code', `/${code}/i`);
	}
	if (date) {
		stock.where('date', new Date(date));
	}
	if (start) {
		stock.where('date').gte(new Date(start));
	}
	if (end) {
		stock.where('date').lte(new Date(end));
	}

	stock.limit(100)
	stock.exec(function(err, stocks){
		if (err) {
			console.log(err);
		}
		if (stocks) {
			res.json({
				'symbol': symbol,
				'limit': 100,
				'historical': stocks
			});
		}
	});
});

function get_quotes_from_pngx(url, code) {
	var i = [];
	var options = {};
	Object.assign(options, {
		"method": 'GET',
		"json": true,
		// 'body': {
		// 	'username': req.body.username,
		// 	'password': req.body.password
		// }
	});

	return new Promise(function(resolve, reject) {
		if (undefined !== typeof code) {
			options['url'] = DATAURL + code +".csv";
			getData(options).then(function(response){
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
					resolve(response);
				})
				.catch(function(error) {
					reject(error);
				});
			}
		}
	});
}

function read_csv(filename) {
	// let file = new File("./BSP.csv");
	// let json = parse_csv_to_json(file);
	fs.unlink('./error.log', err => {
		if (err) throw err;
		console.log('Error file successfully deleted');
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
