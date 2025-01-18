const express = require("express");
const router = express.Router();
const { SYMBOLS } = require("../constants");
const { Stock } = require("../models/index");

/**
 * @swagger
 *
 *
 * /api/v1/:
 *   tags: 
 *    - company
 *   get:
 *     summary: Returns list of stock codes/symbols
 *     responses:
 *       200:
 *         description: A successful response
 */
/**
 * GET /api/v1/
 */
router.get("/", function (req, res) {
  res.status(200).json({
    status: 200,
    message: "Ok",
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
 *
 * /api/v1/historicals/{code}:
 *   get:
 *     summary: Returns all the historical data for code/symbol
 *     description: Returns all the historical data for code/symbol
 *     operationId: getHistoricals
 *     responses:
 *       200:
 *         description: A successful response
 *       204:
 *         description: No Content
 *       500:
 *         description: Server error
 *     parameters:
 *       - name: code
 *         in: path
 *         description: code symbol
 *         required: true
 *         schema:
 *           type: string
 *           enum: [BSP, CCP, CGA, CPL, KAM, KSL, NEM, NGP, NIU, SST, STO]
 */
/**
 * GET /api/v1/historicals/:code
 * see also /api/v1/stocks/:code/historicals
 * @param :code unique symbol of the stock
 */
router.get("/historicals/:code", function (req, res) {
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
      // stock.where({ date: { $gte: start } });
      stock.where({ date: { $gte: start } });
    } else {
      // stock.where({ date: { $gte: new Date(start) } });
      stock.where({ date: { $gte: new Date(start) } });
    }
  }
  if (end) {
    Object.assign(dateStr["date"], {
      end: new Date(end).toDateString(),
    });

    if (Number.isInteger(Number(end))) {
      // stock.where({ date: { $lte: end } });
      stock.where({ date: { $lte: end } });
    } else {
      // stock.where({ date: { $lte: new Date(end) } });
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
        res.status(200).json({
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
      res.status(500).json({
        status: 500,
        reason: "Error occurred when ",
      });
    });
});

/**
 * @swagger
 *
 * /api/v1/stocks/:
 *   get:
 *     operationId: getStocks
 *     summary: Returns list of quotes for the day
 *     responses:
 *       200:
 *         description: A successful response
 *       204:
 *         description: No Content
 *       500:
 *         description: Server error
 */
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
 * @param: /api/v1/stocks?code=CODE&date_from=DATE&date_to=DATE
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
        res.status(204).json({
          status: 204,
          reason: "No Content",
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        status: 500,
        reason: "Error occured",
      });
    });
});

module.exports = router;
