const http = require("http");
const express = require("express");
const request = require('request');
const mongoose = require('mongoose');
const cron = require('node-cron');
const cors = require("cors");
const fs = require('fs');
const bodyParser = require("body-parser");
const boxen = require('boxen');
require("dotenv").config();
// const escapeHtml = require('escape-html');
const marked = require('marked');
const path = require('path');

// Creating express app
const app = express();
const router = express.Router();
const PORT = process.env.PORT;
const Schema = mongoose.Schema;

app.set('port', PORT);
// app.engine('md', function(path, options, fn){
//   fs.readFile(path, 'utf8', function(err, str){
//     if (err) return fn(err);
//     var html = marked.parse(str).replace(/\{([^}]+)\}/g, function(_, name){
//       return escapeHtml(options[name] || '');
//     });
//     fn(null, html);
//   });
// });
// app.set('views', path.join(__dirname, './'));
// app.set('view engine', 'md');
app.use(express.static(path.join(__dirname, 'docs')));

app.use(cors({
	'allowedHeaders': ['sessionId', 'Content-Type'],
	'exposedHeaders': ['sessionId'],
	'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({}));

// const os = require('os');
// const interfaces = os.networkInterfaces();
// const getNetworkAddress = () => {
// 	for (const name of Object.keys(interfaces)) {
// 		for (const interface of interfaces[name]) {
// 			const {address, family, internal} = interface;
// 			if (family === 'IPv4' && !internal) {
// 				return address;
// 			}
// 		}
// 	}
// };

let server = http.createServer(app);

// create server and listen on the port
server.listen(app.get('port'), function(req, res) {
	// const details = server.address();
	// let localAddress = null;
	// let networkAddress = null;

	// if (typeof details === 'string') {
	// 	localAddress = details;
	// } else if (typeof details === 'object' && details.port) {
	// 	const address = details.address === '::' ? 'localhost' : details.address;
	// 	const ip = getNetworkAddress();

	// 	localAddress = `http://${address}:${details.port}`;
	// 	networkAddress = `http://${ip}:${details.port}`;
	// }

	// log = "\n----------------------------------------------------------\n";

	// if (localAddress) {
	// 	log += `Server running on port ${localAddress}.\n`;
	// }
	// if (networkAddress) {
	// 	log += `Server running on port ${networkAddress}.`;
	// }

	// log += "\n----------------------------------------------------------\n";

	// console.log(log);
	console.log(`Server running on port http://localhost:${app.get('port')}`);
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
const quoteSchema = new Schema({
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

const companySchema = new Schema({
	name: String,
	code: String,
	description: String,
	industry: String,
	date_listed: Date
});
const Company = mongoose.model('company', companySchema);

const QUOTES = ['BSP','CCP','CGA','COY','CPL','KAM','KSL','NCM','NGP','NIU','OSH','SST'];
const DATAURL = "http://www.pngx.com.pg/data/";

/**
 * Schedule task to requests data from PNGX datasets every 2 minutes
 * The task requests and models the data them stores those data in db
 * Fetch data from PNGX.com every 2 minutes
 */
// cron.schedule('*/2 * * * *', () => {
// 	console.log('running a task every 2 minutes');

// 	dataFetcher();
// });

// /v1
app.get('/', function(req, res) {
  res.render('index.html', { title: 'PNGX-Api Doc' });
});

app.use('/v1', router);

router.get('/', function(req, res) {
	res.json({
		"status": 200,
		"symbols": QUOTES,
		"data": {}
	});
});

/**
 * GET /api/v1/historicals/:symbol
 * @param :symbol unique symbol of the stock
 */
router.get('/historicals/:symbol', function(req, res) {
	let symbol = req.params.symbol
	let date = req.query.date;
	let start = req.query.start;
	let end = req.query.end;
	let limit = parseInt(req.query.limit);
	let sort = parseInt(req.query.sort);
	let skip = parseInt(req.query.skip);
	let fields = req.query.fields;

	let stock = Stock.find();
	stock.where({ 'code': symbol });
	stock.select('date code close high low open vol_today');

	var dateStr = {
		date: new Date().toDateString()
	};

	if (date) {
		dateStr['date'] = new Date(date).toDateString();
		
		if (Number.isInteger(Number(date))) {
			// stock.where({ date: date });
			stock.where('date', date);
		}
		else {
			// stock.where({ date: new Date(date) });
			stock.where('date', new Date(date));
		}
	}

	if (start) {
		Object.assign(dateStr['date'], { start: new Date(start).toDateString() });
		
		if (Number.isInteger(Number(start))) {
			// stock.where({ date: { $gte: start } });
			stock.where({ 'date': { $gte: start } });
		}
		else {
			// stock.where({ date: { $gte: new Date(start) } });
			stock.where({ 'date': { $gte: new Date(start) } });
		}
	}
	if (end) {
		Object.assign(dateStr['date'], { end: new Date(end).toDateString() });
		
		if (Number.isInteger(Number(end))) {
			// stock.where({ date: { $lte: end } });
			stock.where({ 'date': { $lte: end } })
		}
		else {
			// stock.where({ date: { $lte: new Date(end) } });
			stock.where({ 'date': { $lte: new Date(end) } })
		}
	}

	if (sort) {
		stock.sort({ 'date': sort });
	}
	else {
		// default sort descendence
		stock.sort({ 'date': 1 });
	}

	if (limit) {
		stock.limit(limit);
	}

	if (skip) {
		stock.skip(skip);
		// dateStr['date'] = new Date(`2021-10-${new Date().getDate() + skip}`).toDateString();
	}

	if (fields) {
		stock.select(fields.split(','));
	}

	stock.exec(function(err, stocks) {
		const count = stocks.length == limit ? limit : stocks.length;

		if (err) {
			console.log(err);
		}
		if (stocks && stocks.length > 0) {
			res.json({
				'status': 302,
				// ...dateStr,
				'last_updated': stocks[0].date,
				'symbol': symbol,
				'total_count': count,
				'historical': stocks
			});
		}
		else {
			res.status(404).json({
				"status": 404,
				"reason": "Not Found"
			});
		}
	});
});

// router.get('/historicals/:symbol/essentials', function(req, res) {});

router.get('/historicals/:symbol/essentials', function(req, res) {
	let symbol = req.params.symbol

	let stock = Stock.find();
	stock.where({ 'code': symbol });
	stock.select('date bid offer code close high low open vol_today');

	stock.exec(function(err, stocks) {
		const count = stocks.length;
		var dates = [];
		var bids = [];
		var offers = [];

		if (err) {
			console.log(err);
		}
		if (stocks && stocks.length > 0) {

			stocks.forEach(function(stock) {
				dates.push(new Date(stock.date).getTime());
				bids.push(stock.bid);
				offers.push(stock.offer);
			});

			res.status(302).json({
				"columns": {
					"x": dates,
					"y1": bids,
					"y2": offers
				},
				"types":{"y0":"line","y1":"line","x":"x"},
				"names":{"y0":"#0","y1":"#1"},
				"colors":{"y0":"#3DC23F","y1":"#F34C44"}
			});
		}
		else {
			res.status(404).json({
				"status": 404,
				"reason": "Not Found"
			});
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
	let limit = parseInt(req.query.limit) || 12; // default limit is 11 - currently the number of companies listed on PNGX.com.pg
	let sort = parseInt(req.query.sort);
	let skip = parseInt(req.query.skip); // skip number of days behind: 3: go 3 days behind
	let fields = req.query.fields;

	let query = Stock.find({});

	var dateStr = {
		date: new Date().toDateString()
	};

	if (date) {
		dateStr['date'] = new Date(date).toDateString();
		
		if (Number.isInteger(Number(date))) {
			query.where({ date: date });
		}
		else {
			query.where({ date: new Date(date) });
		}
	}

	if (start) {
		Object.assign(dateStr['date'], { start: new Date(start).toDateString() });
		
		if (Number.isInteger(Number(start))) {
			query.where({ date: { $gte: start } });
		}
		else {
			query.where({ date: { $gte: new Date(start) } });
		}
	}

	if (end) {
		Object.assign(dateStr['date'], { end: new Date(end).toDateString() });
		
		if (Number.isInteger(Number(end))) {
			query.where({ date: { $lte: end } });
		}
		else {
			query.where({ date: { $lte: new Date(end) } });
		}
	}

	if (fields) {
		query.select(fields.split(','));
	}

	if (sort) {
		query.sort({ date: sort });
	}
	else {
		// default sort descendence
		query.sort({ date: -1 });
	}

	if (limit) {
		query.limit(limit);
	}
	else {
		// default limit is 11 - currently the number of companies listed on PNGX.com.pg
		query.limit(11);
	}

	if (skip) {
		query.skip(skip);
	}

	query.exec(function(err, stocks) {
		if (err) {
			console.log(err);
		}
		if (stocks && stocks.length > 0) {
			res.json({
				'status': 200,
				...dateStr,
				'last_updated': stocks[0].date,
				'data': stocks
			});
		}
		else {
			res.json({
				"status": 404,
				"reason": "Not Found"
			});
		}
	});
});

/**
 * POST /api/v1/stocks
 * Manually add sample data for testing
 */
// router.post('/stocks', function(req, res) {
// 	let data = req.body;

// 	let query = Stock.findOne({
// 		date: data[0]['date'],
// 		short_name: data[0]['short_name'] 
// 	});
// 	query.lean();
// 	query.exec(function(error, result) {
// 		if (error) {
// 			console.error("Error: " + error);
// 			res.send("Error: " + error);
// 		}
// 		else if (result == null) {
// 			console.log("Match not found.");
// 			console.log("Adding it to the db");
			
// 			let quote = new Stock();
// 			quote['date'] = new Date(data[0]['date']);
// 			quote['code'] = data[0]['code'];
// 			quote['short_name'] = data[0]['short_name'];
// 			quote['bid'] = Number(data[0]['bid']);
// 			quote['offer'] = Number(data[0]['offer']);
// 			quote['last'] = Number(data[0]['last']);
// 			quote['close'] = Number(data[0]['close']);
// 			quote['high'] = Number(data[0]['high']);
// 			quote['low'] = Number(data[0]['low']);
// 			quote['open'] = Number(data[0]['open']);
// 			quote['chg_today'] = Number(data[0]['chg_today']);
// 			quote['vol_today'] = Number(data[0]['vol_today']);
// 			quote['num_trades'] = Number(data[0]['num_trades']);

// 			quote.save(function(err) {
// 				if (err) {
// 					console.error(err);
// 				} else {
// 					console.log('added quote for ' + data['date']);
// 					res.sendStatus(201);
// 				}
// 			});
// 		}
// 		else {
// 			console.log("Match found! Cannot add quote");
// 			res.send("Match found! Cannot add quote");
// 		}
// 	});
// });

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
				'last_updated': result.date,
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
// router.delete('/stocks/:quote_id', function(req, res) {
// 	let stockId = req.params.quote_id;

// 	Stock.findByIdAndRemove(stockId, function(error, result) {
// 		if (error) {
// 			console.error("Error: " + error);
// 		}
// 		else {
// 			console.log("Removed Quote : ", result);
// 			res.sendStatus(200);
// 		}
// 	});
// });

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
	console.log("parsing csv to json");
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
	console.log('Fetching csv data from https://www.pngx.com.pg');
	console.time("timer");   //start time with name = timer
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

			// for (var j = 0; j < response.length; j++) {
				let data = response[totalCount-1];
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
			// };

			console.log(totalAdded + "/" + totalCount + " quotes were added.");
			console.log("stop");
		})
		.catch(function(error) {
			console.log(error);
		});
	};

	console.log('Data fetched from https://www.pngx.com.pg');
	console.timeEnd("timer"); //end timer and log time difference
	var endTime = new Date();
	const timeDiff = parseInt(Math.abs(endTime.getTime() - startTime.getTime()) / (1000) % 60); 
	console.log(timeDiff + " secs");
	console.log("total request itme: " + reqTime)
}