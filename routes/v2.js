const express = require("express");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const fs = require("fs");
const router = express.Router();
const { isToday } = require("date-fns/isToday");
const { isWeekend } = require("date-fns/isWeekend");
const {
  SYMBOLS,
  OLD_SYMBOLS,
  COMPANIES,
  PNGX_DATA_URL,
  PNGX_URL,
  BASE_URL,
  LOCAL_TIMEZONE,
} = require("../constants");
const { Stock, Company, Ticker, Indices } = require("../models/index");
const logger = require("../libs/logger").winstonLogger;

/**
 * @swagger
 *
 *
 * /api/v2/:
 *   get:
 *     summary: Returns list of stock codes
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
      api: "NUKU API",
      timestamp: new Date().getTime(),
      codes: SYMBOLS,
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
 *         description: unique code representing a stock in PNGX
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

  logger.info("Retrieving companies on PNGX");

  // Stock.findByName(stockQuote, req.)

  logger.debug("Companies retrieved", COMPANIES);
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
    try {
      logger.info("Retrieving companies on PNGX");

      let companies = await Company.find({});

      logger.debug("Companies retrieved", companies);
      res.json(companies);
    } catch (error) {
      logger.error("Error retrieving stocks", {
        error: error.message,
        stack: error.stack,
        params: req.params,
        query: req.query,
      });
    }
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

    try {
      logger.info("Retrived company details");
      let company = await Company.findById(id);

      logger.debug("Retrived company details", company);
      res.json(company);
    } catch (error) {
      logger.error("Error retrieving stocks", {
        error: error.message,
        stack: error.stack,
        params: req.params,
        query: req.query,
      });
    }
  })
  .post(async function (req, res) {
    let update = req.body;

    try {
      logger.info("Adding company");
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

      logger.debug("Company added", company);
      res.json(company);
    } catch (error) {
      logger.error("Error adding company", {
        error: error.message,
        stack: error.stack,
        body: req.body,
      });
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
      logger.info("Updating company");
      let company = await Company.findByIdAndUpdate(id, update);

      logger.debug("Company added", company);
      res.json(company);
    } catch (error) {
      logger.error("Error updating company", {
        error: error.message,
        stack: error.stack,
        body: req.body,
      });
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
 * GET /api/v2/company/:code
 * Get a specific company info using stock quote
 * @param :ticker unique ticker of the comapny
 */
router.route("/companies/:code/code").get(async function (req, res) {
  let { code } = req.params;

  let company = await Company.findOne({ ticker: new RegExp(code, "i") });

  res.json(company);
});

router.get("/company/:code", async function (req, res) {
  let stockTicker = req.params.ticker;

  let company = await Company.findOne({ ticker: stockTicker });

  let data = {
    ...data,
  };

  res.json(data);
});

/**
 * @swagger
 *
 *
 * /api/v2/historicals/{code}:
 *   get:
 *     tags:
 *      - historical
 *     summary: Returns past quotes for a code
 *     responses:
 *       200:
 *         description: A successful response
 *       300:
 *         description: Code required
 *       400:
 *         description: Code not found
 *       500:
 *         description: Server error
 *     parameters:
 *       - name: code
 *         in: path
 *         description: Date
 *         required: true
 *         schema:
 *           type: string
 *           enum: [BSP, CCP, CGA, CPL, KAM, KSL, NEM, NGP, NIU, SST, STO]
 *       - name: date
 *         in: path
 *         description: code
 *         schema:
 *            type: date
 */
/**
 * GET /api/stocks/historicals/:code
 * see also /api/v2/stocks/:code/historicals
 * @param :code unique code of the stock
 * @param ?date={date}
 * @param ?start={date}
 * @param ?end={date}
 * @param ?limit=1
 * @param ?sort=1|-1
 * @param ?skip=1
 * @param ?fields=[]
 */
router.get("/historicals/:code", (req, res) => {
  res.redirect(301, `/api/v2/stocks/historicals/${req.params.code}`);
});
router.get("/stocks/historicals/:code", function (req, res) {
  if (!req.params.code) {
    return res.status(400).json({
      status: 400,
      message: "`code` is required",
    });
  }
  let code = req.params.code;
  let date = req.query.date;
  let start = req.query.start;
  let end = req.query.end;
  let limit = parseInt(req.query.limit);
  let sort = parseInt(req.query.sort);
  let skip = parseInt(req.query.skip);
  let fields = req.query.fields;

  let stock = Stock.find();
  stock.where({ code: code });
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
          symbol: code,
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
 * /api/v2/stocks/historicals/:code/essentials:
 *   get:
 *     tags:
 *      - quote
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 */
/**
 * GET /api/v2/stocks/historicals/:code/essentials
 * Retrieves
 * @param {string} :code
 */
router.get("/historicals/:code/essentials", (req, res) => {
  res.redirect(301, `/api/v2/stocks/historicals/${req.params.code}/essentials`);
});
router.get("/stocks/historicals/:code/essentials", function (req, res) {
  let code = req.params.code;

  let stock = Stock.find({});
  // stock.where({ 'code': code });
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

  logger.info("Retriving today's quotes");

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
        logger.debug("Quotes retrieved", stocks);
        res.json({
          status: 200,
          ...dateStr,
          last_updated: stocks[0].date,
          count: stocks.length,
          data: stocks,
        });
      } else {
        logger.debug("No content");
        res.json({
          status: 204,
          reason: "No Content",
        });
      }
    })
    .catch((error) => {
      logger.error("Error retrieving stocks", {
        error: error.message,
        stack: error.stack,
        params: req.params,
        query: req.query,
      });
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

  logger.info(`Retriving stocks for ${code}`);

  Stock.find({
    code: code,
  })
    .then(function (result) {
      if (result) {
        logger.info(`${code} stocks `, result);
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
      logger.error("Error retrieving stocks", {
        error: error.message,
        stack: error.stack,
        params: req.params,
        query: req.query,
      });
    });
});

/**
 * OHLCV
 */
router.get("/stocks/:code/ohlcv/", async function (req, res) {
  const code = req.params.code;

  Stock.find({ code: code }).then((stocks) => {
    let history = stocks
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((stock) => ({
        date: stock.date,
        open: stock.open,
        high: stock.high,
        low: stock.low,
        close: stock.close,
        volume: stock.vol_today,
      }));

    if (history) {
      res.status(200).json({
        status: "success",
        results: history.length,
        data: history,
      });
    }
  });
});

/**
 * /api/stocks/ohlcv/history
 * OHLCV
 */
router.get("/stocks/:code/ohlcv/history", async function (req, res) {
  const code = req.params.code;
  const limit = parseInt(req.query["limit"]) || 100;
  const sort = parseInt(req.query["sort"]) || 1;
  const skip = parseInt(req.query["skip"]) || 0;

  // const filters = req.query;
  // const filteredUsers = data.filter((user) => {
  //   let isValid = true;
  //   for (key in filters) {
  //     console.log(key, user[key], filters[key]);
  //     isValid = isValid && user[key] == filters[key];
  //   }
  //   return isValid;
  // });

  let query = Stock.find({ code: code });

  if (limit) {
    query.limit(limit);
  }

  if (sort) {
    query.sort({ date: sort });
  }

  if (skip) {
    query.skip(skip);
  }

  query.exec().then((stocks) => {
    let history = stocks.map((stock) => ({
      open: stock.open,
      high: stock.high,
      low: stock.low,
      close: stock.close,
      volume: stock.vol_today,
    }));

    if (history) {
      res.status(200).json({
        status: "success",
        results: history.length,
        data: { history },
        meta: {
          limit,
          sort,
          skip,
        },
      });
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
 * GET /api/v2/stocks/tickers
 * Retrieves tickers/codes for all the stocks
 */
router.get("/tickers", (req, res) => {
  res.redirect(301, "/api/v2/stocks/tickers");
});
router.get("/stocks/tickers", async function (req, res) {
  logger.info("Retriving tickers");

  try {
    let tickers = await Ticker.find({});

    logger.debug("Tickers retrieved ", tickers);

    res.json(tickers);
  } catch (error) {
    logger.error("Error retrieving stocks", {
      error: error.message,
      stack: error.stack,
      params: req.params,
      query: req.query,
    });
  }

  // Ticker.aggregate([
  //   {
  //     $match: {
  //       code: "BSP",
  //     },
  //   },
  //   // {
  //   // 	$group: {
  //   // 		_id: {
  //   // 			symbol: "$symbol",
  //   // 			time: {
  //   // 				$dateTrunc: {
  //   // 					date: "$time",
  //   // 					unit: "minute",
  //   // 					binSize: 5
  //   // 				},
  //   // 			},
  //   // 		},
  //   // 		high: { $max: "$price" },
  //   // 		low: { $min: "$price" },
  //   // 		open: { $first: "$price" },
  //   // 		close: { $last: "$price" },
  //   // 	},
  //   // },
  //   // {
  //   // 	$sort: {
  //   // 		"_id.time": 1,
  //   // 	},
  //   // },
  // ]).then(function (tickers) {
  //   res.json(tickers);
  // });

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

/**
 *
 */
router.get("/tickers/:code", (req, res) => {
  res.redirect(301, `/api/v2/stocks/tickers/${req.params.code}`);
});
router.get("/stocks/tickers/:code", async (req, res) => {
  const code = req.params.code;

  // Ticker.find({ code: code }).then((ticker) => {
  //   console.log(ticker)

  //   // if (ticker) {
  res.status(200).json({
    ticker: "hel",
  });
  // }
  // });
});

/**
 * /api/v2/news
 */
router.get("/news", async function (req, res) {
  let page = req.query.page;

  logger.info("Retrieving news");

  let headers = new Headers();
  headers.set("User-Agent", "");

  // let NEWS_URL = 'https://www.pngx.com.pg/feed/';
  let NEWS_URLS = [
    "https://www.pngx.com.pg/wp-json/wp/v2/posts",
    "https://www.postcourier.com.pg/wp-json/wp/v2/posts",
    "https://www.thenational.com.pg/wp-json/wp/v2/posts",
  ];
  let news_posts = [];

  try {
    const jsons = await Promise.all(
      NEWS_URLS.map(async (url) => {
        if (page) {
          url += "?page=" + page;
        }
        const r = await fetch(url, {
          method: "GET",
          mode: "cors",
        });
        return await r.json();
      })
    );

    jsons.forEach((json) => news_posts.push(...json));
    news_posts.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    logger.debug("Retrieved news ", news_posts);

    res.json(news_posts);
  } catch (error) {
    logger.error("An error occurred:", {
      error: error.message,
      stack: error.stack,
      body: req.body,
      params: req.params,
      query: req.query,
    });
    res.json({ message: "An error occurred:", error });
  }
});

let clients = [];
let facts = [{ info: "hello", source: "world" }];

function eventsHandler(req, res, next) {
  // Set headers to keep the connection alive and tell the client we're sending event-stream data
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (data) => {
    return res.write(`data: ${JSON.stringify(data)}\n`);
  };

  // Send an initial message
  sendEvent("Connected to server");

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    res,
  };

  clients.push(newClient);

  // Simulate sending updates from the server
  let counter = 0;
  const intervalId = setInterval(() => {
    counter++;
    // Write the event stream format
    sendEvent(`Message ${counter}`);
  }, 2000);

  // When client closes connection, stop sending events
  req.on("close", () => {
    console.log(`${clientId} Connection closed`);
    clients.filter((client) => client.id !== clientId);

    clearInterval(intervalId);
    res.end();
  });
}

function sendEventsToAll(newFact) {
  clients.forEach((client) =>
    client.response.write(`data: ${JSON.stringify(newFact)}\n`)
  );
}

async function addEndpoint(request, response, next) {
  const newFact = request.body;
  facts.push(newFact);
  return sendEventsToAll(newFact);
}

router.get("/feeds", eventsHandler);
router.post("/endpoints", addEndpoint);

/**
 *
 */
router.get("/market/status", async (req, res) => {
  try {
    const holidays = require("../data/trade_holidays.json");

    // if current day matches holiday's date
    const status = holidays.find((holiday) => isToday(new Date(holiday.date)));
    const is_weekend = isWeekend(new Date());

    const data = {
      marketStatus: is_weekend ? "close" : "open",
      lastUpdated:
        new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
      exchange: "PG",
      holiday: status != null,
      isOpen: !is_weekend ? status != null : false,
      session: "pre-market",
      timezone: LOCAL_TIMEZONE,
      t: new Date().getTime(),
      source: "PNGX",
      status,
    };

    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ error: "Market status not found" });
    }
  } catch (error) {
    logger.error("Error fetching market status:", {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 *
 */
router.get("/market/holidays", async (req, res) => {
  try {
    const holidays = require("../data/trade_holidays.json");
    res.status(200).json(holidays);
  } catch (error) {
    logger.error("Error fetching market holidays:", {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 *
 */
router.get("/indices", (req, res) => {
  Indices.find({}).then((indices) => {
    res.json({
      status: "success",
      results: indices.length,
      data: indices,
    });
  });
});

/**
 *
 */
router.get("/indices/:code", (req, res) => {
  const code = req.params["code"];
  if (!code) {
    return res.status(401).json({
      error: "NOT Code",
      message: "",
    });
  }

  Indices.find({}).then((index) => {
    res.json({
      status: "success",
      results: index.length,
      data: { index },
    });
  });
});

module.exports = router;
