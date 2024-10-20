const http = require("http");
const debug = require('debug')('test');
const express = require("express");
const setRateLimit = require('express-rate-limit');
// const request = require('request-promise');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cron = require('node-cron');
const cors = require("cors");
const fs = require('fs');
const marked = require('marked');
const path = require('path');
const createError = require('http-errors');
const ip = require('ip');
// const boxen = require('boxen');
// const ora = require('ora');
// const spinner = ora('Connecting to the database...').start()
const os = require('os');
const helmet = require('helmet');
const redis = require('redis');
const celery = require('celery-node');
require('dotenv').config();
// require("./worker");

const { specs, swaggerUi } = require('./config/swagger');
const logger = require('./config/winston');
const utils = require('./utils');
const tasks = require('./tasks');
const { SYMBOLS, OLD_SYMBOLS, LISTED_COMPANIES, PNGX_DATA_URL, PNGX_URL } = require("./constants");
const { Stock, Company, Ticker } = require("./models");
const { initDatabase } = require("./database");

// Creating express app
const app = express();
const api = express.Router();

// Redis client
let redisClient = redis.createClient({
	host: '127.0.0.1',
	port: 6379,
}).on('error', (err) => {
	console.error('Redis connection error:', err);
}).on('connect', () => {
	console.log('Connected to Redis');
});
// If authentication is required, use the 'auth' method on the client
// redisClient.auth('your-redis-password');

// Celery client
const celeryClient = celery.createClient(
	"redis://127.0.0.1:6379", 
	"redis://127.0.0.1:6379"
);

// const task = celeryClient.createTask("tasks.add");
// const result = task.applyAsync([1, 2]);
// result.get().then(data => {
// //   console.log(data);
// //   celeryClient.disconnect();
// });
// const taskKwargs = celeryClient.createTask("tasks.fetch_data_from_pngx");
// Promise.all([
//   task
//     .delay(1, 2)
//     .get()
//     .then(console.log),
//   task
//     .applyAsync([1, 2])
//     .get()
//     .then(console.log),
//   taskKwargs
//     .delay(1, 2, { c: 3, d: 4 })
//     .get()
//     .then(console.log),
//   taskKwargs
//     .applyAsync([1, 2], { c: 3, d: 4 })
//     .get()
//     .then(console.log)
// ]).then(() => celeryClient.disconnect());
// const task = celeryClient.createTask("tasks.stock_fetcher");
// const result = task.applyAsync([]);
// result.get().then(data => {
//   console.log(data);
//   celeryClient.disconnect();
// });

const allowlist = ['192.168.0.56', '192.168.0.21'];
const rateLimitMiddleware = setRateLimit({
	windowMs: 60 * 1000,
	max: 5,
	message: "You have exceeded your 5 requests per minute limit.",
	headers: true,
	handler: function (req, res, next) {
		// applyFeesForConsumer()
    // next()
    return res.status(429).json({
      error: 'You sent too many requests. Please wait a while then try again'
    })
  },
	skip: (req, res) => allowlist.includes(req.ip)
});

app.set('port', process.env.PORT);
app.set('mongodb_uri', process.env.MONGODB_URI);

app.use(express.static(path.join(__dirname, 'docs')));
app.use("/demo", express.static(path.join(__dirname, 'demo')));
app.use("/assets", express.static(path.join(__dirname + 'docs/assets')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({}));
app.use(morgan("combined", { stream: logger.stream.write }));

// app.use(helmet);
app.use(cors({
	'origin': 'http://localhost:4000',
	'allowedHeaders': ['sessionId', 'Content-Type'],
	'exposedHeaders': ['sessionId'],
	'methods': 'GET,PUT,POST,DELETE',
}));
app.use(allowCrossDomain);
app.use(allowMethodOverride);

// catch 404 and forward to error handler
app.use(error404Handler);
// error handler
app.use(errorHandler);
// app.use(errorLogHandler);

app.use('/api', rateLimitMiddleware);

// middleware to check data is present in cache
var checkCache = (req, res, next) => {
	let search = req.params.search;
	redisClient.get(search, (err, data) => {
		if (err) throw err;
		if (!data) {
			return next();
		} else {
			return res.json({ data: JSON.parse(data), info: 'data from cache' });
		}
	});
};
// app.use(checkCache);

let server = http.createServer(app);

// create server and listen on the port
server.listen(app.get('port'), /*"localhost",*/ () => {
	const details = server.address();
	let localAddress = null;
	let networkAddress = null;
	
	const interfaces = os.networkInterfaces();
	const getNetworkAddress = () => {
		for (const name of Object.keys(interfaces)) {
			for (const interface of interfaces[name]) {
				const {address, family, internal} = interface;
				if (family === 'IPv4' && !internal) {
					return address;
				}
			}
		}
	};

	if (typeof details === 'string') {
		localAddress = details;
	} else if (typeof details === 'object' && details.port) {
		const address = details.address === '::' ? 'localhost' : details.address;
		const ip = getNetworkAddress();
		// const ip = ip.address();

		localAddress = `http://${address}:${details.port}`;
		networkAddress = `http://${ip}:${details.port}`;
	}

	let log = "\n--------------------------------------------------\n";

	if (localAddress) {
		log += `Server running on port ${localAddress}\n`;
	}
	if (networkAddress) {
		log += `Server running on port ${networkAddress}`;
	}

	log += "\n--------------------------------------------------\n";

	// console.debug(log);

	// console.debug(boxen(`Server running on ${localAddress}`));
	console.debug(`Server running on port ${localAddress}`);
});
server.on('error', function(error) {
	console.error(error);
});
server.on('end', function() {
	server.end();
	server.destroy();
});

initDatabase()
.on("connected", function(result) {
	console.log("[Main_Thread]: Connected: Successfully connect to mongo server");
	/**
	 * Schedule task to requests data from PNGX datasets every 2 minutes
	 * The task requests and models the data them stores those data in db
	 * Fetch data from PNGX.com every 2 minutes
	 */
	
	// console.log('This script will run every 2 minutes to update stocks info.');
	// cron.schedule('*/2 * * * *', () => {
	console.log('Stocks info will be updated every 2 hours.');
	cron.schedule('* */2 * * *', () => {
		// tasks.data_fetcher();
		// const fetch_data_from_pngx = celeryClient.createTask("tasks.fetch_data_from_pngx")
		// 								 .applyAsync(["https://www.pngx.com.pg/data/BSP.csv"]);
		// const data_fetcher = celeryClient.createTask("tasks.data_fetcher")
		// 								 .applyAsync([]);

		// data_fetcher.get().then(data => {
		// 	console.log(data)
		// 	celeryClient.disconnect();
		// });
		const { Worker } = require('node:worker_threads');
		const cpuCount = os.cpus().length; // 8
		const childWorkerPath = path.resolve(process.cwd(), 'threads.js');

		try {
			let worker = new Worker(childWorkerPath);
			worker.once('message', result => {
				console.log('completed: ', result);
			});
			worker.on('error', error => {
				throw new Error(`Error occured`, error);
			})
			worker.on('exit', exitCode => {
				if (exitCode !== 0) {
					throw new Error(`Worker stopped with exit code ${exitCode}`);
				}
			})
		}catch (erorr) {
			console.log(erorr)
		}
	});
})
.on('error', function(error) {
	console.log("[Main_Thread]: Error: Could not connect to MongoDB. Did you forget to run 'mongod'?");
});


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/api', api);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 */
api.get('/', function(req, res) {
	res.status(200).json({
		"status": 200,
		"message": "Ok",
		"symbols": SYMBOLS,
		"data": {},
		"api": "PNGX API",
		"time": new Date().toDateString()
	});
});

/**
 * GET /api/historicals/:symbol
 * see also /api/stocks/:symbol/historicals
 * @param :symbol unique symbol of the stock
 */
api.get('/historicals/:symbol', function(req, res) {
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
		
		// caching received data using redis
		// redisClient.setEx(search, 600, JSON.stringify(stocks));

		if (err) {
			console.log(err);
		}
		if (stocks && stocks.length > 0) {
			res.json({
				'status': 200,
				// ...dateStr,
				'last_updated': stocks[0].date,
				'symbol': symbol,
				'total_count': count,
				'historical': stocks,

				// "links": {},
				// "meta": {
				// 	"current_page": 1,
				// 	"from": 1,
				// 	"last_page": 1,
				// 	"links": [
				// 		{
				// 			"active": false,
				// 			"label": "« Previous",
				// 			"url": null
				// 		},
				// 		{
				// 			"active": true,
				// 			"label": "1",
				// 			"url": "https://api.apilayer.com/bank_data/banks_by_country?page=1"
				// 		},
				// 		{
				// 			"active": false,
				// 			"label": "Next »",
				// 			"url": null
				// 		}
				// 	],
				// 	"path": "https://api.apilayer.com/bank_data/banks_by_country",
				// 	"per_page": 10,
				// 	"to": 6,
				// 	"total": 6
				// }
			});
		}
		else {
			res.status(204).json({
				"status": 204,
				"reason": "No Content"
			});
		}
	});
});

api.get('/historicals/:symbol/essentials', function(req, res) {
	let symbol = req.params.symbol;

	let stock = Stock.find({});
	// stock.where({ 'code': symbol });
	// stock.select('date bid offer code close high low open vol_today');

	stock.exec(function(err, stocks) {
		const count = stocks.length;
		var dates = [];
		var bids = [];
		var offers = [];

		if (err) {
			console.error(err);
		}
		if (stocks && stocks.length > 0) {

			stocks.forEach(function(stock) {
				dates.push(new Date(stock.date).getTime());
				bids.push(stock.bid);
				offers.push(stock.offer);
			});

			res.status(200).json([{
				"columns": [
					["x", ...dates],
					["y1", ...bids],
					["y2", ...offers]
				],
				"types":{"y0":"line","y1":"line","x":"x"},
				"names":{"y0":"#0","y1":"#1"},
				"colors":{"y0":"#3DC23F","y1":"#F34C44"}
			}]);
		}
		else {
			res.status(204).json({
				"status": 204,
				"reason": "No Content"
			});
		}

	});
});

/**
 * GET /api/stocks
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
 * @param: /api/stocks?code=CODE, retreive quotes from a specific company for the current day
 * @param: /api/stocks?code=CODE&date=now, retreive quotes from a specific company for the specific day
 * @param: /api/stocks?code=CODE&date_from=DATE&date_to=DATE
 * 
 * Date form
 */
api.get('/stocks', function(req, res) {
	let date = req.query.date;
	let start = req.query.start;
	let end = req.query.end;
	let limit = parseInt(req.query.limit) || SYMBOLS.length; // default limit is 11 - current number of companies listed on PNGX.com.pg
	let sort = parseInt(req.query.sort);
	let skip = parseInt(req.query.skip); // skip number of days behind: 3: go 3 days behind
	let fields = req.query.fields;
	let code = req.query.code || req.query.symbol || req.query.ticker;

	let query = Stock.find();

	var dateStr = {
		date: new Date().toDateString()
	};

	if (date) {
		if (Number.isInteger(Number(date))) {
			date = Number(date);
		}
		let $date = new Date(date);

		dateStr['date'] = $date.toDateString();
		query.where({ date: $date });
	}

	// TODO: Fix date range
	if (start) {
		if (Number.isInteger(Number(start))) {
			start = Number(start);
		}
		let $start = new Date(start);
		console.log($start)
		
		Object.assign(dateStr['date'], { start: $start.toDateString() });
		query.where({ date: { $gte: $start } });
	}

	if (end) {
		if (Number.isInteger(Number(end))) {
			end = Number(end);
		}
		let $end = new Date(end);

		Object.assign(dateStr['date'], { end: $end.toDateString() });
		query.where({ date: { $lte: $end } });
	}

	// ?fields=bid,open
	if (fields) {
		query.select(fields.split(','));
	}

	// ?sort=1
	if (sort) {
		query.sort({ date: sort });
	}
	else {
		// default sort descendence
		query.sort({ date: -1 });
	}

	// ?limit=12
	if (limit) {
		query.limit(limit);
	}

	// skip=
	if (skip) {
		query.skip(skip);
	}

	if (code) {
		query.where({'code': code});
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
				'count': stocks.length,
				'data': stocks
			});
		}
		else {
			res.json({
				"status": 204,
				"reason": "No Content"
			});
		}
	});
});
// db.sales.aggregate([
//   // First Stage
//   {
//     $match : { "date": { $gte: new ISODate("2014-01-01"), $lt: new ISODate("2015-01-01") } }
//   },
//   // Second Stage
//   {
//     $group : {
//        _id : { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
//        totalSaleAmount: { $sum: { $multiply: [ "$price", "$quantity" ] } },
//        averageQuantity: { $avg: "$quantity" },
//        count: { $sum: 1 }
//     }
//   },
//   // Third Stage
//   {
//     $sort : { totalSaleAmount: -1 }
//   }
//  ])
/**
 * POST /api/stocks
 * import sample data for testing
 */
api.post('/stocks', function(req, res) {
	let data = req.body;

	let query = Stock.findOne({
		date: data[0]['date'],
		short_name: data[0]['short_name'] 
	});
	// query.lean();
	query.exec(function(error, result) {
		if (error) {
			console.error("Error: " + error);
			res.send("Error: " + error);
		}
		else if (result == null) {
			console.log("Match No Content.");
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
 * GET /api/stocks/:quote_id
 * Get a specific quote from the database
 * @param :quote_id unique id of the quote
 */
api.get('/stocks/:quote_id', function(req, res) {
	let stockId = req.params.quote_id;

	Stock.findById(stockId, function(error, result) {
		if (error) {
			console.error("Error: " + error);
		}
		if (result) {
			console.log("Match found!: ", result);
			res.json({
				'status': 200,
				'last_updated': result.date,
				'data': result
			});
		}
		else {
			res.sendStatus(204);
		}
	});
});

/**
 * GET /api/company/:ticker
 * Get a specific company info using stock quote
 * @param :ticker unique ticker of the comapny
 */
api.get('/company/:ticker', function(req, res) {
	let stockTicker = req.params.quote;

	// Stock.findByName(stockQuote, req.)

  return LISTED_COMPANIES[stockTicker];
});

api.get('/tickers', async function(req, res) {
	let tickers = await Ticker.find();
	res.send(tickers);
});

api.get('/tickersx', (req, res) => {
	Ticker.aggregate([
		{
			$match: {
				code: "BSP",
			},
		},
		// {
		// 	$group: {
		// 		_id: {
		// 			symbol: "$symbol",
		// 			time: {
		// 				$dateTrunc: {
		// 					date: "$time",
		// 					unit: "minute",
		// 					binSize: 5
		// 				},
		// 			},
		// 		},
		// 		high: { $max: "$price" },
		// 		low: { $min: "$price" },
		// 		open: { $first: "$price" },
		// 		close: { $last: "$price" },
		// 	},
		// },
		// {
		// 	$sort: {
		// 		"_id.time": 1,
		// 	},
		// },
	])
	.then(function(tickers) {
		res.json(tickers)
	});
});

// let s = parse_date("13/09/2024")
// console.log(s)


// Stock.findOne({
// 	'date': s,
// 	// 'short_name': data['Short Name']
// })
// .then(result => console.log(result))
// .catch(err => console.log(err))



// const getStream = require('get-stream');

// (async () => {
// 	const stream = fs.createReadStream("./data/SST.csv");

// 	let stockData = parse_csv_to_json(await getStream(stream));

// 	for (var j = 0; j < stockData.length; j++) {
// 		let data = stockData[j];

// 		Stock.findOne({
// 			'date': data['Date'],
// 			'short_name': data['Short Name']
// 		})
// 		.then(function(result) {
// 			if (result == null) {
// 				console.log("Match No Content.");
// 				console.log("Adding it to the db");
				
// 				let quote = new Stock();

// 				quote = prepare_data(quote, data)

// 				quote.save(function(err) {
// 					if (err) {
// 						console.log(err);
// 					} else {
// 						console.log('added quote for ' + data['Date']);
// 					}
// 				});
// 			}
// 		})
// 		// Ticker.findOne({
// 		// 	'date': data['Date'],
// 		// 	'symbol': data['Short Name']
// 		// })
// 		// .then(function(result) {
// 		// 	if (result == null) {
// 		// 		console.log("Match No Content.");
// 		// 		console.log("Adding it to the db");
				
// 		// 		let quote = new Ticker();

// 		// 		let localTime = momentTimezone.tz(new Date(data['Date']), LOCAL_TIMEZONE);	
// 		// 		quote['date'] = localTime;
// 		// 		console.log(quote)
// 		// 		console.log(new Date(data['Date']))

// 		// 		// quote['symbol'] = data['Short Name'];
// 		// 		// quote['bid'] = Number(data['Bid']);
// 		// 		// quote['offer'] = Number(data['Offer']);
// 		// 		// quote['last'] = Number(data['Last']);
// 		// 		// quote['close'] = Number(data['Close']);
// 		// 		// quote['high'] = Number(data['High']);
// 		// 		// quote['low'] = Number(data['Low']);
// 		// 		// quote['open'] = Number(data['Open']);
// 		// 		// quote['change'] = Number(data['Chg. Today']);
// 		// 		// quote['volume'] = Number(data['Vol. Today']);
// 		// 		// quote['num_trades'] = Number(data['Num. Trades']);

// 		// 		// quote.save(function(err) {
// 		// 		// 	if (err) {
// 		// 		// 		console.log(err);
// 		// 		// 	} else {
// 		// 		// 		console.log('added quote for ' + data['Date']);
// 		// 		// 	}
// 		// 		// 	console.log("\n");
// 		// 		// });
// 		// 	}
// 		// })
// 		.catch(function(error) {
// 			throw new Error(error);
// 		});
// 	};

// })()

// (async () => {
// 	let ticker = await Ticker.find();
// 	console.log("tickers: ", ticker)

	// new Ticker({
	// 	date: "2020-01-03T05:00:00.000Z",
	// 	symbol: 'AAPL',
	// 	bid: 0,
	// 	offer: 0,
	// 	last: 0,
	// 	close: 74.357498,
	// 	high: 75.144997,
	// 	low: 74.125,
	// 	open: 74.287498,
	// 	change: 0,
	// 	volume: 146322800,
	// 	num_trades: 0  
	// }).save()
// })()


function allowCrossDomain(req, res, next) {
  // let allowHeaders = DEFAULT_ALLOWED_HEADERS;

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // res.header('Access-Control-Allow-Headers', allowHeaders);
  res.header('Access-Control-Expose-Headers', 'X-Parse-Job-Status-Id, X-Parse-Push-Status-Id'); // intercept OPTIONS method

  if ('OPTIONS' == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
}

function allowMethodOverride(req, res, next) {
  if (req.method === 'POST' && req.body._method) {
    req.originalMethod = req.method;
    req.method = req.body._method;
    delete req.body._method;
  }

  next();
}

function error404Handler(error, req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err) || next(createError(404));
}

function errorHandler(err, req, res, next) {
  // render the error page
  res.status(err.status || 500);

  var html = '<!DOCTYPE html>';
  html+= '<html>';
  html+= '  <head>';
  html+= '    <title></title>';
  html+= '  </head>';
  html+= '  <body>';
  html+= '    <h1>'+err.message+'</h1>';
  html+= '    <h2>'+err.status+'</h2>';
  html+= '    <h2>More information: hello@christianaugustyn.me</h2>';
  html+= '    <pre>'+err.stack+'</pre>';
  html+= '  </body>';
  html+= '</html>';
  res.send(html);
}

function errorLogHandler(err, req, res, next) {
  logger.error(`${req.method} - ${err.message}  - ${req.originalUrl} - ${req.ip}`);
  next(err)
};

function fixDateFormatOnProdDB() {
	Stock
	.find({
		// _id: mongoose.mongo.ObjectId("633a925da76dd590ada1d70c"),
		// date: new Date("10/03/2022"),
		code: "STO"
	})
	.then(res => {
		return Promise.all(
			res.map(data => {
				// if (date)
				// data.date = new Date(data.date)
				// data.save()
				return data
			})
		)
	})
	.then(res => {
		console.table(res)
	})
}

// fixDateFormatOnProdDB()