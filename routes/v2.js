const express = require("express");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const fs = require("fs");
const router = express.Router();
const {
  SYMBOLS,
  OLD_SYMBOLS,
  COMPANIES,
  PNGX_DATA_URL,
  PNGX_URL,
  BASE_URL,
} = require("../constants");
const { Stock, Company, Ticker } = require("../models/index");

/**
 * @swagger
 *
 *
 * /api/v2/:
 *   get:
 *     summary: Returns list of stock codes/symbols
 *     responses:
 *       200:
 *         description: A successful response
 */
/**
 * GET /api/v2/
 */
router.get("/", function (req, res) {
  res.status(200).json({
    status: 200,
    message: `Welcome to the Nuku API! Documentation is available at ${BASE_URL.protocol}//${BASE_URL.host}/docs/`,
    data: {
      api: "PNGX API",
      time: new Date().toDateString(),
      symbols: SYMBOLS,
    },
  });
});

/**
 * @swagger
 *
 * /api/v2/company/{code}:
 *   get:
 *     tags:
 *      - company
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 *     parameters:
 *       - name: code
 *         in: path
 *         description: code symbol
 *         required: true
 *         schema:
 *           type: string
 *           enum: [BSP, CCP, CGA, CPL, KAM, KSL, NEM, NGP, NIU, SST, STO]
 *
 */
/**
 * GET /api/v2/company/:ticker
 * Get a specific company info using stock quote
 * @param :ticker unique ticker of the comapny
 */
router.get("/company", function (req, res) {
  let stockTicker = req.params.ticker;

  // Stock.findByName(stockQuote, req.)

  res.json(COMPANIES);
});

/**
 * @swagger
 *
 * /api/v2/companies:
 *   get:
 *     tags:
 *      - company
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 *
 */
/**
 * /api/v2/companies
 */
router
  .route("/companies")
  /**
   * GET
   */
  .get(async function (req, res) {
    let companies = await Company.find({});

    res.json(companies);
  });
// .post(async function(req, res) {
// 	let update = req.body;

// 	try {
// 		let company = await Company.create(update);

// 		res.json(company);
// 	} catch (error) {
// 		return res.json({
// 			status: "Error",
// 			message: error
// 		});
// 	}
// })

/**
 * @swagger
 *
 * /api/v2/companies/:id:
 *   get:
 *     tags:
 *      - company
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 *
 */
router
  .route("/companies/:id")
  .get(async function (req, res) {
    let { id } = req.params;

    let company = await Company.findById(id);

    res.json(company);
  })
  .post(async function (req, res) {
    let update = req.body;

    try {
      // const gfs = new Grid(mongoose.connection.db, mongoose.mongo);
      // const writeStream = gfs.createWriteStream({
      //   filename: req.file.originalname,
      //   mode: "w",
      //   content_type: req.file.mimetype,
      // });
      // fs.createReadStream(req.file.path).pipe(writeStream);
      // writeStream.on("close", (file) => {
      //   fs.unlink(req.file.path, (err) => {
      //     if (err) throw err;
      //     return res.json({ file });
      //   });
      // });

      let company = await Company.create(update);
      res.json(company);
    } catch (error) {
      return res.json({
        status: "Error",
        message: error,
      });
    }
  })
  .put(async function (req, res) {
    let { id } = req.params;
    let update = req.body;

    try {
      let company = await Company.findByIdAndUpdate(id, update);

      res.json(company);
    } catch (error) {
      return res.json({
        status: "Error",
        message: error,
      });
    }
  });
// .delete(async function(req, res) {
// 	let {id} = req.params;

// 	try {
// 		await Company.findOneAndDelete(id);

// 		return res.statusCode(204).json({
// 			status: "Error",
// 			message: error
// 		});
// 	} catch (error) {
// 		// throw new Error(error);
// 		return res.json({
// 			status: "Error",
// 			message: error
// 		});
// 	}
// });

/**
 * @swagger
 *
 * /api/v2/companies/:code/code:
 *   get:
 *     tags:
 *      - company
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 *
 */
router.route("/companies/:code/code").get(async function (req, res) {
  let { code } = req.params;

  let company = await Company.findOne({ ticker: new RegExp(code, "i") });

  res.json(company);
});

/**
 * @swagger
 *
 *
 * /api/v2/company/{code}:
 *   get:
 *     tags:
 *      - company
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 */
/**
 * GET /api/v2/company/:ticker
 * Get a specific company info using stock quote
 * @param :ticker unique ticker of the comapny
 */
router.get("/company/:ticker", async function (req, res) {
  let stockTicker = req.params.ticker;

  let company = await Company.findOne({ ticker: stockTicker });

  res.json(company);
});

/**
 * @swagger
 *
 *
 * /api/v2/historicals/{symbol}:
 *   get:
 *     tags:
 *      - historical
 *     summary: Returns past quotes for a symbol
 *     responses:
 *       200:
 *         description: A successful response
 *       300:
 *         description: Symbol required
 *       400:
 *         description: Symbol not found
 *       500:
 *         description: Server error
 *     parameters:
 *       - name: symbol
 *         in: path
 *         description: Date
 *         required: true
 *         schema:
 *           type: string
 *           enum: [BSP, CCP, CGA, CPL, KAM, KSL, NEM, NGP, NIU, SST, STO]
 *       - name: date
 *         in: path
 *         description: symbol
 *         schema:
 *            type: date
 */
/**
 * GET /api/historicals/:symbol
 * see also /api/v2/stocks/:symbol/historicals
 * @param :symbol unique symbol of the stock
 * @param ?date={date}
 * @param ?start={date}
 * @param ?end={date}
 * @param ?limit=1
 * @param ?sort=1|-1
 * @param ?skip=1
 * @param ?fields=[]
 */
router.get("/historicals/:symbol", function (req, res) {
  if (!req.params.symbol) {
    return res.status(300).json({
      status: 300,
      message: "`symbol` is required",
    });
  }
  let symbol = req.params.symbol;
  let date = req.query.date;
  let start = req.query.start;
  let end = req.query.end;
  let limit = parseInt(req.query.limit);
  let sort = parseInt(req.query.sort);
  let skip = parseInt(req.query.skip);
  let fields = req.query.fields;

  let stock = Stock.find();
  stock.where({ code: symbol });
  stock.select("date code close high low open vol_today");

  var dateStr = {
    date: new Date().toDateString(),
  };

  if (date) {
    dateStr["date"] = new Date(date).toDateString();

    if (Number.isInteger(Number(date))) {
      // stock.where({ date: date });
      stock.where("date", date);
    } else {
      // stock.where({ date: new Date(date) });
      stock.where("date", new Date(date));
    }
  }

  if (start) {
    Object.assign(dateStr["date"], { start: new Date(start).toDateString() });

    if (Number.isInteger(Number(start))) {
      stock.where({ date: { $gte: start } });
    } else {
      stock.where({ date: { $gte: new Date(start) } });
    }
  }
  if (end) {
    Object.assign(dateStr["date"], {
      end: new Date(end).toDateString(),
    });

    if (Number.isInteger(Number(end))) {
      stock.where({ date: { $lte: end } });
    } else {
      stock.where({ date: { $lte: new Date(end) } });
    }
  }

  if (sort) {
    stock.sort({ date: sort });
  } else {
    // default sort descendence
    stock.sort({ date: 1 });
  }

  if (limit) {
    stock.limit(limit);
  }

  if (skip) {
    stock.skip(skip);
    // dateStr['date'] = new Date(`2021-10-${new Date().getDate() + skip}`).toDateString();
  }

  if (fields) {
    stock.select(fields.split(","));
  }

  stock
    .exec()
    .then(function (stocks) {
      const count = stocks.length == limit ? limit : stocks.length;

      // caching received data using redis
      // redisClient.setEx(search, 600, JSON.stringify(stocks));

      if (stocks && stocks.length > 0) {
        res.json({
          status: 200,
          // ...dateStr,
          last_updated: stocks[0].date,
          symbol: symbol,
          total_count: count,
          historical: stocks,

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
          // 			"url": "https://router.apilayer.com/bank_data/banks_by_country?page=1"
          // 		},
          // 		{
          // 			"active": false,
          // 			"label": "Next »",
          // 			"url": null
          // 		}
          // 	],
          // 	"path": "https://router.apilayer.com/bank_data/banks_by_country",
          // 	"per_page": 10,
          // 	"to": 6,
          // 	"total": 6
          // }
        });
      } else {
        res.status(204).json({
          status: 204,
          reason: "No Content",
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

/**
 * @swagger
 *
 *
 * /api/v2/historicals/:symbol/essentials:
 *   get:
 *     tags:
 *      - quote
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 */
/**
 * GET /api/v2/historicals/:symbol/essentials
 * Retrieves
 * @param {string} :symbol
 */
router.get("/historicals/:symbol/essentials", function (req, res) {
  let symbol = req.params.symbol;

  let stock = Stock.find({});
  // stock.where({ 'code': symbol });
  // stock.select('date bid offer code close high low open vol_today');

  stock
    .exec()
    .then(function (stocks) {
      const count = stocks.length;
      let dates = [];
      let bids = [];
      let offers = [];

      if (stocks && stocks.length > 0) {
        stocks.forEach(function (stock) {
          dates.push(new Date(stock.date).getTime());
          bids.push(stock.bid);
          offers.push(stock.offer);
        });

        res.status(200).json([
          {
            columns: [
              ["x", ...dates],
              ["y1", ...bids],
              ["y2", ...offers],
            ],
            types: { y0: "line", y1: "line", x: "x" },
            names: { y0: "#0", y1: "#1" },
            colors: { y0: "#3DC23F", y1: "#F34C44" },
          },
        ]);
      } else {
        res.status(204).json({
          status: 204,
          reason: "No Content",
        });
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

/**
 * @swagger
 *
 *
 * /api/v2/stocks:
 *   get:
 *     tags:
 *      - quote
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 */
/**
 * GET /api/v2/stocks
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
 * @param: /api/v2/stocks?code=CODE, retreive quotes from a specific company for the current day
 * @param: /api/v2/stocks?code=CODE&date=now, retreive quotes from a specific company for the specific day
 * @param: /api/v2/stocks?code=CODE&date_from=DATE&date_to=DATE
 *
 * Date form
 */
router.get("/stocks", function (req, res) {
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
    date: new Date().toDateString(),
  };

  if (date) {
    if (Number.isInteger(Number(date))) {
      date = Number(date);
    }
    let $date = new Date(date);

    dateStr["date"] = $date.toDateString();
    query.where({ date: $date });
  }

  // TODO: Fix date range
  if (start) {
    if (Number.isInteger(Number(start))) {
      start = Number(start);
    }
    let $start = new Date(start);
    console.log($start);

    Object.assign(dateStr["date"], { start: $start.toDateString() });
    query.where({ date: { $gte: $start } });
  }

  if (end) {
    if (Number.isInteger(Number(end))) {
      end = Number(end);
    }
    let $end = new Date(end);

    Object.assign(dateStr["date"], { end: $end.toDateString() });
    query.where({ date: { $lte: $end } });
  }

  // ?fields=bid,open
  if (fields) {
    query.select(fields.split(","));
  }

  // ?sort=1
  if (sort) {
    query.sort({ date: sort });
  } else {
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

  if (code != null) {
    query.where({ code: code });
  }

  query
    .exec()
    .then(function (stocks) {
      if (stocks && stocks.length > 0) {
        res.json({
          status: 200,
          ...dateStr,
          last_updated: stocks[0].date,
          count: stocks.length,
          data: stocks,
        });
      } else {
        res.json({
          status: 204,
          reason: "No Content",
        });
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

// /**
//  * @swagger
//  *
//  *
//  * /api/v2/stocks:
//  *   post:
//  *     tags:
//  *      - quote
//  *     summary: Returns a sample message
//  *     responses:
//  *       200:
//  *         description: A successful response
//  */
// /**
//  * POST /api/v2/stocks
//  * Add new quote
//  */
// router.post("/stocks", function (req, res) {
//   let data = req.body;

//   if (Array.isArray(data)) {
//     for (let i = 0; i < data.length; i++) {
//       const element = utils.normalize_data(array[i]);

//       let query = Stock.findOne({
//         date: element["date"],
//         short_name: element["short_name"],
//       });
//       // query.lean();
//       query
//         .exec()
//         .then(function (result) {
//           if (result == null) {
//             console.log("Match No Content.");
//             console.log("Adding it to the db");

//             let quote = new Stock(element);
//             quote
//               .save()
//               .then(() => {
//                 console.log("added quote for " + element["date"]);
//                 res.sendStatus(201);
//               })
//               .catch(function (err) {
//                 console.error(err);
//               });
//           } else {
//             console.log("Match found! Cannot add quote");
//             res.send("Match found! Cannot add quote");
//           }
//         })
//         .catch((err) => {
//           console.error("Error: " + err);
//           res.send("Error: " + err);
//         });
//     }
//   }
// });

/**
 * @swagger
 *
 *
 * /api/v2/stocks/:code:
 *   get:
 *     tags:
 *      - quote
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 */
/**
 * GET /api/v2/stocks/:code
 * Get a specific quote by code
 * @param :code - a unique code that represents the quote/stock of a public company on PNGX
 */
router.get("/stocks/:code", function (req, res) {
  let code = req.params.code;

  Stock.find({
    code: code,
  })
    .then(function (result) {
      if (result) {
        console.log("Match found!: ", result);
        res.json({
          status: 200,
          last_updated: result.date,
          data: result,
        });
      } else {
        res.sendStatus(204);
      }
    })
    .catch((error) => {
      if (error) {
        console.error("Error: " + error);
      }
    });
});

/**
 * @swagger
 *
 *
 * /api/v2/tickers:
 *   get:
 *     tags:
 *      - ticker
 *     description: Welcome to swagger-jsdoc!
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 */
/**
 * GET /api/v2/tickers
 * Retrieves tickers/codes for all the stocks
 */
router.get("/tickers", async function (req, res) {
  let tickers = await Ticker.find({});

  res.json(tickers);
});

/**
 * @swagger
 *
 *
 * /api/v2/tickersx:
 *   get:
 *     tags:
 *      - ticker
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 */
/**
 * GET /api/v2/tickersx
 */
router.get("/tickersx", (req, res) => {
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
  ]).then(function (tickers) {
    res.json(tickers);
  });

  // db.sales.aggregate([
  // 	// First Stage
  // 	{
  // 	  $match : { "date": { $gte: new ISODate("2014-01-01"), $lt: new ISODate("2015-01-01") } }
  // 	},
  // 	// Second Stage
  // 	{
  // 	  $group : {
  // 		 _id : { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
  // 		 totalSaleAmount: { $sum: { $multiply: [ "$price", "$quantity" ] } },
  // 		 averageQuantity: { $avg: "$quantity" },
  // 		 count: { $sum: 1 }
  // 	  }
  // 	},
  // 	// Third Stage
  // 	{
  // 	  $sort : { totalSaleAmount: -1 }
  // 	}
  //    ])
});

module.exports = router;
