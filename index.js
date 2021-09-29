#!/usr/bin/env node

const express = require("express");
const http = require('http');
const request = require('request');
const extend = require('extend');
const restful = require('node-restful');
const mongoose = require('mongoose');
const cron = require('node-cron');
const fs = require('fs');
require("dotenv").config();

// Creating express app
const app = express();
const router = express.Router();
const PORT = process.env.PORT || 5000;

const app = express();

app.set('port', PORT);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
	console.log("Hello World!");
	res.send("Hello WOrld")
});

// create server and listen on the port
app.listen(app.get('port'), function(req, res) {
	console.log("Server running on port 5000.");
	console.log(`API running on http://${ this.address().address }:${ this.address().port }`);
});

// models
const Stock = mongoose.model('stockquote');


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

// Stock.methods(['get', 'post', 'put', 'delete']);
// Stock.register(api, '/stocks');

// http://www.pngx.com.pg/wp-content/uploads/wp-responsive-images-thumbnail-slider/BSP_150_150.png
// fetch("http://www.pngx.com.pg/data/BSP.csv", {"credentials":"include","headers":{"accept":"text/plain, */*; q=0.01","accept-language":"en-US,en;q=0.9","cache-control":"no-cache","pragma":"no-cache","x-requested-with":"XMLHttpRequest"},"referrer":"http://www.pngx.com.pg/","referrerPolicy":"no-referrer-when-downgrade","body":null,"method":"GET","mode":"cors"}); ;
const QUOTES = ['BSP','CCP','CGA','COY','CPL','KAM','KSL','NCM','NGP','NIU','OSH','SST'];
// const DATAURL = "http://www.pngx.com.pg/data/";
const DATAURL = "http://christianaugustyn.localhost/ajax/";

/**
 * Schedule task to requests data from PNGX datasets and model them and stores them in db
 * Fetch data from PNGX.com every 5 minutes
 */
// cron.schedule('* 5 * * *', function() {
cron.schedule('1 * * * *', function() {
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
api.get('/pngx/stocks', function(req, res, next) {
	let code = req.query.code || '';
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

	// 				quote.save(function(err, res) {
	// 					console.log('saved');
	// 				});
	// 			}
	// 		});
	// 	}
	// });

	// Stock.insert();

	let stock = Stock.find({});
	// stock.where()
	// stock.where()
	// stock.where()
	stock.exec()
	stock.then(function(stocks){
		// if (stocks) {
			res.json(stocks);
		// }
	});
	stock.catch(function(error) {
		console.log(error);
	});
});

/**
 * /api/stocks/:symbol
 * @param :symbol unique symbol of the quote
 */
api.get('/pngx/stocks/:symbol', function(req, res, next) {
	let symbol = req.params.symbol
	let code = req.query.code || '';
	let date = req.query.date || '';
	let start = req.query.start || '';
	let end = req.query.end || '';
	
	let stock = Stock.find()
	// stock.where({ code: symbol })
	// /^vonderful/i)
	.exec(function(err, stocks){
		if (stocks) {
			res.json({
				'symbol': symbol,
				'historical': [stocks]
			});
		}
	});
});

function get_quotes_from_pngx(url) {
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

	if (undefined !== typeof code) {
		options['url'] = DATAURL + code +".csv";
		getData(options).then(function(response){
			res.json(response)
		});
	} 
	else {
		for (var j = 0; j < QUOTES.length; j++) {

			options['url'] = DATAURL + QUOTES[j] +".csv";

			getData(options).then(function(response){
				res.json(response)
			});
		}
	}
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