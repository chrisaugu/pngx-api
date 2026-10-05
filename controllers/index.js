const express = require("express");
const router = express.Router();
const { Worker, isMainThread } = require("node:worker_threads");
const path = require("path");
const axios = require("axios");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const fs = require("fs");
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
const {
  Stock,
  Company,
  Ticker,
  Indices,
  NewsSource,
} = require("../models/index");
const logger = require("../libs/logger").winstonLogger;
const redis = require("../libs/redis").createRedisIoClient;

const holidays = require("../data/trade_holidays.json");
const { isSameDay } = require("date-fns/isSameDay");

/**
 * GET /api/v2/companies
 * Get all companies
 */
async function getCompanies(req, res) {
  logger.info("Retrieving companies on PNGX");

  logger.debug("Companies retrieved", COMPANIES);

  try {
    logger.info("Retrieving companies on PNGX");

    const companies = await Company.find({});

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
}

async function createCompany(req, res) {
  const update = req.body;

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

    const company = await Company.create(update);

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
}

async function getCompanyByCode(req, res) {
  const { code } = req.params;

  try {
    logger.info("Retrived company details");
    const company = await Company.findByCode(code, function (err, company) {
      if (err) {
        logger.error("Error retrieving stocks", {
          error: err.message,
          stack: err.stack,
          params: req.params,
          query: req.query,
        });
        return res.status(500).json({
          status: 500,
          message: "Internal Server Error",
        });
      }
      return company;
    });

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
}

async function updateCompany(req, res) {
  const { id } = req.params;
  const update = req.body;

  try {
    logger.info("Updating company");
    const company = await Company.findByIdAndUpdate(id, update);

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
}

/**
 * GET /api/v2/company/:code
 * Get a specific company info using stock quote
 * @param :ticker unique ticker of the comapny
 */
async function getCompanyByTicker(req, res) {
  const stockTicker = req.params.ticker;

  // const company = await Company.findOne({ ticker: new RegExp(code, "i") });
  const company = await Company.findOne({ ticker: stockTicker });

  const data = {
    ...data,
  };

  res.json(data);
}

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
function getStocksHistorical(req, res) {
  if (!req.params.code) {
    return res.status(400).json({
      status: 400,
      message: "`code` is required",
    });
  }
  const code = req.params.code;
  const date = req.query.date;
  const start = req.query.start;
  const end = req.query.end;
  const limit = parseInt(req.query.limit);
  const sort = parseInt(req.query.sort);
  const skip = parseInt(req.query.skip);
  const fields = req.query.fields;

  const stock = Stock.find();
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
}

function getStocksHistoricalEssentials(req, res) {
  const code = req.params.code;

  const stock = Stock.find({});
  // stock.where({ 'code': code });
  // stock.select('date bid offer code close high low open vol_today');

  stock
    .exec()
    .then(function (stocks) {
      const count = stocks.length;
      const dates = [];
      const bids = [];
      const offers = [];

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
}

function getStocks(req, res) {
  const date = req.query.date;
  const start = req.query.start;
  const end = req.query.end;
  const limit = parseInt(req.query.limit) || SYMBOLS.length; // default limit is 11 - current number of companies listed on PNGX.com.pg
  const sort = parseInt(req.query.sort);
  const skip = parseInt(req.query.skip); // skip number of days behind: 3: go 3 days behind
  const fields = req.query.fields;
  const code = req.query.code || req.query.symbol || req.query.ticker;

  console.log(req);

  logger.info("Retriving today's quotes");

  const query = Stock.find();

  var dateStr = {
    date: new Date().toDateString(),
  };

  if (date) {
    if (Number.isInteger(Number(date))) {
      date = Number(date);
    }
    const $date = new Date(date);

    dateStr["date"] = $date.toDateString();
    query.where({ date: $date });
  }

  // TODO: Fix date range
  if (start) {
    if (Number.isInteger(Number(start))) {
      start = Number(start);
    }
    const $start = new Date(start);
    console.log($start);

    Object.assign(dateStr["date"], { start: $start.toDateString() });
    query.where({ date: { $gte: $start } });
  }

  if (end) {
    if (Number.isInteger(Number(end))) {
      end = Number(end);
    }
    const $end = new Date(end);

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
      logger.debug("Quotes retrieved", stocks);
      return res.json({
        status: 200,
        ...dateStr,
        last_updated: stocks[0]?.date,
        count: stocks.length,
        data: stocks,
      });
    })
    .catch((error) => {
      logger.error("Error retrieving stocks", {
        error: error.message,
        stack: error.stack,
        params: req.params,
        query: req.query,
      });
      return res.status(500).json({
        reason: error.message,
        stack: error.stack,
      });
    });
}

async function getStock(req, res) {
  const code = req.params.code;

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
}

/**
 * Get quote for a particular stock given date
 */
function getStockByDate(req, res) {
  const code = req.params.code;
  const date = req.params.date;

  if (!code || !date) {
    return res.json({
      status: 400,
      message: "code and date is required",
    });
  }

  // Check if date falls on a weekend or a public holiday
  const isHoliday = holidays.find((a, b) =>
    isSameDay(new Date(date), new Date(a.date)),
  );
  if (isHoliday) {
    return res.json({
      status: 400,
      message: "Date falls on a holiday. Pick a different date",
    });
  }
  if (isWeekend(date)) {
    return res.json({
      status: 400,
      message: "Date falls on a weekend. Pick a different date",
    });
  }

  logger.debug(`Retriving stocks for ${code}`);

  Stock.find({
    code: code,
    date: new Date(date),
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
}

/**
 * OHLCV
 */
async function getStockOHLCV(req, res) {
  const code = req.params.code;

  Stock.find({ code: code }).then((stocks) => {
    const history = stocks
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
}

/**
 * /api/stocks/ohlcv/history
 * OHLCV
 */
async function getStockOHLCVHistory(req, res) {
  const code = req.params.code;
  const limit = parseInt(req.query["limit"]) || 100;
  const sort = parseInt(req.query["sort"]) || 1;
  const skip = parseInt(req.query["skip"]) || 0;

  // const filters = req.query;
  // const filteredUsers = data.filter((user) => {
  //   const isValid = true;
  //   for (key in filters) {
  //     console.log(key, user[key], filters[key]);
  //     isValid = isValid && user[key] == filters[key];
  //   }
  //   return isValid;
  // });

  const query = Stock.find({ code: code });

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
    const history = stocks.map((stock) => ({
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
}

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
async function getStockTickers(req, res) {
  logger.info("Retriving tickers");

  try {
    const tickers = await Ticker.find({});

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
}

async function getStockTickersByCode(req, res) {
  const code = req.params.code;

  Ticker.find({ code: code }).then((ticker) => {
    console.log(ticker);

    if (ticker) {
      res.status(200).json({
        ticker,
      });
    }
  });
}

function fetchNews() {
  return new Promise((resolve, reject) => {
    logger.info("[Main_Thread]: Retrieving news");

    const payload = {
      page,
    };

    const worker = new Worker(childNewsWorkerPath);
    worker.postMessage(payload);

    worker.on("message", resolve);

    worker.on("error", reject);

    worker.on("exit", (exitCode) => {
      if (exitCode !== 0) {
        logger.error(`Worker stopped with exit code ${exitCode}`);
        reject(new Error(`Worker stopped with exit code ${exitCode}`));
      }
    });
  });
}

/**
 * /api/v2/news
 */
async function getNews(req, res) {
  const page = req.query.page;

  try {
    if (isMainThread) {
      fetchNews()
        .then((result) => {
          logger.debug("Completed: ", result);
          logger.debug("Retrieved news ", result);
          return res.send(result);
        })
        .catch((error) => {
          logger.error(`Error occured`, error);
          throw new Error(`Error occured`, error);
        });
    }
  } catch (error) {
    logger.error("An error whilte fetching news:", {
      error: error.message,
      stack: error.stack,
    });

    res.json({ message: "An error whilte fetching news:", error });
  }
}

function getNewsSources(req, res) {
  NewsSource.find({})
    .then((result) => {
      res.status(200).json({
        status: 200,
        data: result,
      });
    })
    .catch((err) => {
      logger;
      res.json({
        status: 1,
        reason: "",
      });
    });
}

function addNewsSources(req, res) {
  const { name, url } = req.body;
  logger.debug("Adding news source: ", name, url);

  if (!name) {
    return res.status(300).json({
      status: 300,
      message: "Name must be of type 'string' and cannot be empty",
    });
  }
  if (!url) {
    return res.status(300).json({
      status: 300,
      message: "URL must be of type 'string' and cannot be empty",
    });
  }

  const source = new NewsSource({
    name,
    url,
  });

  source
    .save()
    .then((result) => {
      logger.debug("News Source added: ", result);
      res.sendStatus(201);
    })
    .catch((error) => {
      logger.error("Error adding news source:", {
        error: error.message,
        stack: error.stack,
        body: req.body,
      });
      res.status(500).json({
        status: 500,
        message: "Error occurred while adding news source. Please try again",
      });
    });
}

function getNewsSource(req, res) {
  const { newsSourceId } = req.params;

  logger.debug("Retrieving News Source: ", newsSourceId);

  NewsSource.findById(newsSourceId)
    .then((result) => {
      logger.debug("News Source retrieved: ", result);
      res.json(result);
    })
    .catch((error) => {
      logger.error("Error retrieving news source:", {
        error: error.message,
        stack: error.stack,
        body: req.body,
      });
      res.status(500).json({
        error: "Internal server error",
        message:
          "Error occurred while retrieving news source. Please try again",
      });
    });
}

function updateNewsSource(req, res) {
  const { newsSourceId } = req.params;
  const { name, url } = req.body;
  const payload = {};

  if (!name) {
    payload["name"] = name;
  }

  if (!url) {
    payload["url"] = url;
  }

  NewsSource.findByIdAndUpdate(newsSourceId, payload)
    .then((result) => {
      logger.debug("News Source updated: ", result);
      res.json(result);
    })
    .catch((error) => {
      logger.error("Error updating news source:", {
        error: error.message,
        stack: error.stack,
        body: req.body,
      });
      res.status(500).json({
        status: 500,
        message: "Error occurred while updating news source. Please try again",
      });
    });
}

function partialUpdateNewsSource(req, res) {
  const { newsSourceId } = req.params;
  const { name, url } = req.body;
  const payload = {};

  if (!name) {
    payload["name"] = name;
  }

  if (!url) {
    payload["url"] = url;
  }

  NewsSource.findByIdAndUpdate(newsSourceId, payload)
    .then((result) => {
      logger.debug("News Source updated: ", result);
      res.json(result);
    })
    .catch((error) => {
      logger.error("Error updating news source:", {
        error: error.message,
        stack: error.stack,
        body: req.body,
      });
      res.status(500).json({
        status: 500,
        message: "Error occurred while updating news source. Please try again",
      });
    });
}

function removeNewsUpdate(req, res) {
  const { newsSourceId } = req.params;

  NewsSource.findByIdAndDelete(newsSourceId)
    .then((result) => {
      logger.debug("News Source retrieved: ", result);
      res.json(result);
    })
    .catch((error) => {
      logger.error("Error deleting news source:", {
        error: error.message,
        stack: error.stack,
        body: req.body,
      });
      res.status(500).json({
        status: 500,
        message: "Error occurred while deleting news source. Please try again",
      });
    });
}

async function getMarketStatus(req, res) {
  try {
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
}

/**
 *
 */
async function getMarketHolidays(req, res) {
  try {
    res.status(200).json(holidays);
  } catch (error) {
    logger.error("Error fetching market holidays:", {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 *
 * @param {*} req
 * @param {*} res
 */
function getIndices(req, res) {
  Indices.find({})
    .then((indices) => {
      res.json({
        status: "success",
        results: indices.length,
        data: indices,
      });
    })
    .catch((error) => {
      logger.error("Error fetching market holidays:", {
        error: error.message,
        stack: error.stack,
        body: req.body,
      });
      res.status(500).json({ error: "Internal server error" });
    });
}

/**
 *
 */
async function getIndexBySymbol(req, res) {
  const code = req.params["code"];

  if (!code) {
    logger.error("Index code not provided");

    return res.status(401).json({
      error: "No Code",
      message: "Provide a code",
    });
  }

  logger.info("Retrieving stocks in index " + code);

  await Indices.findBySymbol(code)
    .then((index) => {
      logger.debug("Index retrieved");

      if (Array.isArray(index) && index.length > 0) {
        res.json({
          status: "success",
          results: index.length,
          data: index[0],
        });
      } else {
        res.json({
          status: "success",
          results: 1,
          data: index,
        });
      }
    })
    .catch((error) => {
      logger.error("Error fetching market holidays:", {
        error: error.message,
        stack: error.stack,
        body: req.body,
      });
      res.status(500).json({ error: "Internal server error" });
    });
}

module.exports = {
  getCompanies,
  getCompanyByCode,
  createCompany,
  updateCompany,

  getStocks,
  getStocksHistorical,
  getStocksHistoricalEssentials,
  getStock,
  // getStocksBySymbol,
  getStockByDate,
  getStockOHLCV,
  getStockOHLCVHistory,
  getStockTickers,
  getStockTickersByCode,

  getNews,
  getNewsSources,
  addNewsSources,
  getNewsSource,
  updateNewsSource,
  partialUpdateNewsSource,
  removeNewsUpdate,

  getMarketStatus,
  getMarketHolidays,
  getIndices,
  getIndexBySymbol,
};
