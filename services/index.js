const { Worker, isMainThread } = require("node:worker_threads");
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
  News,
} = require("../models/index");
const logger = require("../libs/logger").winstonLogger;
const holidays = require("../data/trade_holidays.json");
const { isSameDay } = require("date-fns/isSameDay");

/**
 * @typedef {Object} QuoteFilters
 * @property {string} code - unique code of the stock
 * @property {string} date - date
 * @property {string} start - start date
 * @property {string} end - end date
 * @property {number} limit - limit of results
 * @property {number} sort - sort order
 * @property {number} skip - skip results
 * @property {string} fields - fields to include
 */

/**
 * @typedef {Object} NewsFilters
 * @property {string} text - text
 *
 * @typedef {Object} News
 * @property {string} title - title
 * @property {string} link -link
 * @property {string} summary - summary
 * @property {string} published - date
 */

/**
 * @typedef {Object<T>} APIResponse
 * @property {number} status - status
 * @property {string} message - message
 * @property {T} data - data
 */

/**
 * Get all companies
 * @param {QuoteFilters} filters
 * @returns {Promise<Company[]>}
 */
async function getCompanies(filters = {}) {
  logger.info("Retrieving companies on PNGX");

  logger.debug("Companies retrieved", COMPANIES);

  try {
    logger.info("Retrieving companies on PNGX");

    const query = Company.find();

    if (filters?.code) {
      query.where({ code: filters.code });
    }

    if (filters?.fields) {
      query.select(filters.fields);
    }

    if (filters?.sort) {
      query.sort(filters.sort);
    }

    if (filters?.skip) {
      query.skip(filters.skip);
    }

    const result = await query.exec();

    logger.debug("Companies retrieved", result);
    return { data: result };
  } catch (error) {
    logger.error("Error retrieving stocks", {
      error: error.message,
      stack: error.stack,
      params: filters,
      query: filters,
    });
    throw error;
  }
}

/**
 * Create company in database
 * @param {Object} update - Company object to update
 * @param {string} update.code - unique code of the stock
 * @param {string} update.name - name of the stock
 * @returns {Promise<Company>} - Company object
 */
async function createCompany(update = {}) {
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
    //     return { file });
    //   });
    // });

    const company = await Company.create(update);

    logger.debug("Company added", company);
    return { data: company };
  } catch (error) {
    logger.error("Error adding company", {
      error: error.message,
      stack: error.stack,
      body: filters,
    });

    throw error;
  }
}

/**
 * GET /api/v2/company/:code
 * Get a specific company info using stock quote
 * @param {QuoteFilters} filters
 */
async function getCompanyByTicker(filters = {}) {
  const stockTicker = filters.code;

  const company = await Company.findOne({ ticker: stockTicker });

  return { data: company };
}

/**
 * Get company by code
 * @param {Object} filters
 * @param {string} filters.code - unique code of the stock
 * @param {string} filters.date - date
 * @param {string} filters.start - start date
 * @param {string} filters.end - end date
 * @param {number} filters.limit - limit of results
 * @param {number} filters.sort - sort order
 * @param {number} filters.skip - skip results
 * @param {string} filters.fields - fields to include *
 * @returns {Promise<QuoteFilters} - fields
 */
async function getCompanyByCode(filters = {}) {
  const { code } = filters;
  if (!code) {
    throw new Error("Code is required");
  }

  try {
    logger.info("Retrived company details");
    const company = await Company.findByCode(code, function (err, company) {
      if (err) {
        logger.error("Error retrieving stocks", {
          error: err.message,
          stack: err.stack,
          params: filters,
          query: filters,
        });
        throw err;
      }

      logger.debug("Retrived company details", company);
      return company;
    });
    return { data: company };
  } catch (error) {
    logger.error("Error retrieving stocks", {
      error: error.message,
      stack: error.stack,
      params: filters,
      query: filters,
    });
    throw error;
  }
}

/**
 * Update company details
 * @param {Company} company - Company object to update
 * @param {Object} updateData - Updates object
 * @returns
 */
async function updateCompany(company = {}, updateData = {}) {
  const { id } = company;

  try {
    logger.info("Updating company");
    const updatedCompany = await Company.findByIdAndUpdate(id, updateData);

    logger.debug("Company updated", updatedCompany);
    return { data: updatedCompany };
  } catch (error) {
    logger.error("Error updating company", {
      error: error.message,
      stack: error.stack,
      body: updateData,
    });
    throw error;
  }
}

/**
 * Delete company details
 * @param {string} id - Company ID to delete
 * @returns
 */
async function deleteCompany(id = "") {
  if (!id) {
    throw new Error("ID is required");
  }

  try {
    logger.info("Deleting company");
    const deletedCompany = await Company.findByIdAndDelete(id);

    logger.debug("Company deleted", deletedCompany);
    return { data: deletedCompany };
  } catch (error) {
    logger.error("Error deleting company", {
      error: error.message,
      stack: error.stack,
      body: updateData,
    });
    throw error;
  }
}

/**
 * GET /api/stocks/historicals/:code
 * see also /api/v2/stocks/:code/historicals
 * @param {Object} filters
 * @param {string} filters.code - unique code of the stock
 * @param {string} filters.date - date
 * @param {string} filters.start - start date
 * @param {string} filters.end - end date
 * @param {number} filters.limit - limit of results
 * @param {number} filters.sort - sort order
 * @param {number} filters.skip - skip results
 * @param {string} filters.fields - fields to include
 */
function getQuotesHistorical(filters = {}) {
  const { code, date, start, end, limit, sort, skip, fields } = filters;
  if (!code) {
    throw new Error("`code` is required");
  }

  const stock = Stock.find();
  stock.where({ code: code });
  // stock.select("date code close high low open vol_today");

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

  return stock
    .exec()
    .then(function (stocks) {
      const count = stocks.length == limit ? limit : stocks.length;

      // caching received data using redis
      // redisClient.setEx(search, 600, JSON.stringify(stocks));

      if (stocks && stocks.length > 0) {
        return {
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
        };
      } else {
        return {
          status: 204,
          historical: [],
          reason: "No Content",
        };
      }
    })
    .catch((err) => {
      logger.error("Error retrieving stocks", {
        error: err.message,
        stack: err.stack,
        body: filters,
      });

      throw err;
    });
}

/**
 * Get stocks historical essentials
 * @param {Object} filters
 * @param {string} filters.code - unique code of the stock
 * @param {string} filters.date - date
 * @param {string} filters.start - start date
 * @param {string} filters.end - end date
 * @param {number} filters.limit - limit of results
 * @param {number} filters.sort - sort order
 * @param {number} filters.skip - skip results
 * @param {string} filters.fields - fields to include
 */
function getQuotesHistoricalEssentials(filters = {}) {
  const { code } = filters;

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
        throw new Error("No Content");
      }
    })
    .catch((error) => {
      throw error;
    });
}

/**
 * Get stocks
 * @param {Object} filters
 * @param {string} filters.date
 * @param {string} filters.start
 * @param {string} filters.end
 * @param {number} filters.limit
 * @param {number} filters.sort
 * @param {number} filters.skip
 * @param {string} filters.fields
 * @param {string} filters.code
 */
async function getQuotes(filters = {}) {
  const { date, start, end, fields, code } = filters;

  const limit = parseInt(filters.limit) || SYMBOLS.length; // default limit is 11 - current number of companies listed on PNGX.com.pg
  const sort = parseInt(filters.sort);
  const skip = parseInt(filters.skip); // skip number of days behind: 3: go 3 days behind

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

  try {
    const stocks = await query.exec();

    logger.debug("Quotes retrieved", stocks);
    return {
      status: 200,
      ...dateStr,
      last_updated: stocks[0]?.date,
      count: stocks.length,
      data: stocks,
    };
  } catch (error) {
    logger.error("Error retrieving stocks", {
      error: error.message,
      stack: error.stack,
      params: filters,
      query: filters,
    });

    throw error;
  }
}

/**
 * Get stock by code
 * @param {QuoteFilters} filters
 * @returns {Promise<APIResponse>}
 */
async function getQuote(filters = {}) {
  const { code, date, start, end, limit, sort, skip, fields } = filters;

  logger.info(`Retriving stocks for ${code}`);

  const query = Stock.find();

  var dateStr = {
    date: new Date().toDateString(),
  };

  if (date) {
    if (Number.isInteger(Number(date))) {
      date = Number(date);
    }
    const $date = new Date(date);

    // Check if date falls on a weekend or a public holiday
    const isHoliday = holidays.find((a, b) =>
      isSameDay($date, new Date(a.date)),
    );
    if (isHoliday) {
      return {
        status: 400,
        message: "Date falls on a holiday. Pick a different date",
      };
    }
    if (isWeekend($date)) {
      return {
        status: 400,
        message: "Date falls on a weekend. Pick a different date",
      };
    }
    query.where({ date: $date });
  }

  // TODO: Fix date range
  if (start) {
    if (Number.isInteger(Number(start))) {
      start = Number(start);
    }
    const $start = new Date(start);

    // Object.assign(dateStr["date"], { start: $start.toDateString() });
    query.where({ date: { $gte: $start } });
  }

  if (end) {
    if (Number.isInteger(Number(end))) {
      end = Number(end);
    }
    const $end = new Date(end);

    // Object.assign(dateStr["date"], { end: $end.toDateString() });
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

  if (code) {
    query.where({ code: code });
  }

  return query
    .then(function (result) {
      if (result && result.length > 0) {
        logger.info(`${code} stocks `, result);

        return {
          status: 200,
          last_updated: result[0].date,
          data: result,
        };
      } else {
        return { status: 204, data: [] };
      }
    })
    .catch((error) => {
      logger.error("Error retrieving stocks", {
        error: error.message,
        stack: error.stack,
        params: filters,
        query: filters,
      });
      throw error;
    });
}

/**
 * Get quote for a particular stock given date
 * @param {Object} filters
 * @param {string} filters.code
 * @param {string} filters.date
 */
function getQuoteByDate(filters = {}) {
  const { code, date } = filters;

  if (!code || !date) {
    return {
      status: 400,
      message: "code and date is required",
    };
  }

  // Check if date falls on a weekend or a public holiday
  const isHoliday = holidays.find((a, b) =>
    isSameDay(new Date(date), new Date(a.date)),
  );
  if (isHoliday) {
    return {
      status: 400,
      message: "Date falls on a holiday. Pick a different date",
    };
  }
  if (isWeekend(date)) {
    return {
      status: 400,
      message: "Date falls on a weekend. Pick a different date",
    };
  }

  logger.debug(`Retriving stocks for ${code}`);

  Stock.find({
    code: code,
    date: new Date(date),
  })
    .then(function (result) {
      if (result) {
        logger.info(`${code} stocks `, result);
        return {
          status: 200,
          last_updated: result.date,
          data: result,
        };
      } else {
        return { status: 204 };
      }
    })
    .catch((error) => {
      logger.error("Error retrieving stocks", {
        error: error.message,
        stack: error.stack,
        params: filters,
        query: filters,
      });
      throw error;
    });
}

/**
 * Get stock OHLCV
 * @param {Object} filters
 * @param {string} filters.code
 */
async function getQuoteOHLCV(filters = {}) {
  const { code } = filters;

  Stock.find({ code: code })
    .then((stocks) => {
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
        return {
          status: 200,
          message: "success",
          results: history.length,
          data: history,
        };
      }

      return {
        status: 404,
        message: "No history found",
      };
    })
    .catch((error) => {
      logger.error("Error retrieving stocks", {
        error: error.message,
        stack: error.stack,
        params: filters,
        query: filters,
      });
      throw error;
    });
}

/**
 * OHLCV
 */
async function getQuoteOHLCVHistory(filters = {}) {
  const { code } = filters;
  const limit = parseInt(filters["limit"]) || 100;
  const sort = parseInt(filters["sort"]) || 1;
  const skip = parseInt(filters["skip"]) || 0;

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

  query
    .exec()
    .then((stocks) => {
      const history = stocks.map((stock) => ({
        open: stock.open,
        high: stock.high,
        low: stock.low,
        close: stock.close,
        volume: stock.vol_today,
      }));

      if (history) {
        return {
          status: 200,
          message: "success",
          results: history.length,
          data: { history },
          meta: {
            limit,
            sort,
            skip,
          },
        };
      }

      return {
        status: 404,
        message: "No history found",
      };
    })
    .catch((error) => {
      logger.error("Error retrieving stocks", {
        error: error.message,
        stack: error.stack,
        params: filters,
        query: filters,
      });
      throw error;
    });
}

/**
 * Get market status
 * @param {Object} filters
 * @param {string} filters.code - unique code of the stock
 * @param {string} filters.date - date
 * @param {string} filters.start - start date
 * @param {string} filters.end - end date
 * @param {number} filters.limit - limit of results
 * @param {number} filters.sort - sort order
 * @param {number} filters.skip - skip results
 * @param {string} filters.fields - fields to include
 * @returns
 */
async function getMarketStatus(filters = {}) {
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
      return { status: 200, data };
    } else {
      return { status: 404, error: "Market status not found" };
    }
  } catch (error) {
    logger.error("Error fetching market status:", {
      error: error.message,
      stack: error.stack,
      body: filters,
    });
    throw error;
  }
}

/**
 * Get Market Holidays
 * @param {Object} filters
 * @param {string} filters.code - unique code of the stock
 * @param {string} filters.date - date
 * @param {string} filters.start - start date
 * @param {string} filters.end - end date
 * @param {number} filters.limit - limit of results
 * @param {number} filters.sort - sort order
 * @param {number} filters.skip - skip results
 * @param {string} filters.fields - fields to include
 */
async function getMarketHolidays(filters = {}) {
  try {
    return { status: 200, data: holidays };
  } catch (error) {
    logger.error("Error fetching market holidays:", {
      error: error.message,
      stack: error.stack,
      body: filters,
    });
    throw error;
  }
}

/**
 * Get indices
 * @param {Object} filters
 * @param {string} filters.code - unique code of the stock
 * @param {string} filters.date - date
 * @param {string} filters.start - start date
 * @param {string} filters.end - end date
 * @param {number} filters.limit - limit of results
 * @param {number} filters.sort - sort order
 * @param {number} filters.skip - skip results
 * @param {string} filters.fields - fields to include
 * @returns
 */
async function getIndices(filters = {}) {
  try {
    const indices = await Indices.find({});
    logger.debug("Indices retrieved: ", indices);

    return {
      status: 200,
      message: "success",
      results: indices.length,
      data: indices,
    };
  } catch (error) {
    logger.error("Error fetching market holidays:", {
      error: error.message,
      stack: error.stack,
      body: filters,
    });
    throw error;
  }
}

/**
 * Get index by symbol
 * @param {Object} filters
 * @param {string} filters.code - unique code of the stock
 * @param {string} filters.date - date
 * @param {string} filters.start - start date
 * @param {string} filters.end - end date
 * @param {number} filters.limit - limit of results
 * @param {number} filters.sort - sort order
 * @param {number} filters.skip - skip results
 * @param {string} filters.fields - fields to include
 * @returns
 */
async function getIndexBySymbol(filters = {}) {
  const { code } = filters;

  if (!code) {
    logger.error("Index code not provided");

    return {
      status: 401,
      error: "No Code",
      message: "Provide a code",
    };
  }

  logger.info("Retrieving stocks in index " + code);

  await Indices.findBySymbol(code)
    .then((index) => {
      logger.debug("Index retrieved");

      if (Array.isArray(index) && index.length > 0) {
        return {
          status: "success",
          results: index.length,
          data: index[0],
        };
      } else {
        return {
          status: "success",
          results: 1,
          data: index,
        };
      }
    })
    .catch((error) => {
      logger.error("Error fetching market holidays:", {
        error: error.message,
        stack: error.stack,
        body: filters,
      });
      throw error;
    });
}

async function createIndex() {}
async function updateIndex() {}
async function deleteIndex() {}

/**
 * Get stocks in an index
 * @param {Object} filters
 * @param {string} filters.code - unique code of the stock
 * @param {string} filters.date - date
 * @param {string} filters.start - start date
 * @param {string} filters.end - end date
 * @param {number} filters.limit - limit of results
 * @param {number} filters.sort - sort order
 * @param {number} filters.skip - skip results
 * @param {string} filters.fields - fields to include
 * @returns
 */
async function getStocksInIndex(filters = {}) {
  const { code } = filters;

  if (!code) {
    logger.error("Index code not provided");

    return {
      status: 401,
      error: "No Code",
      message: "Provide a code",
    };
  }

  logger.info("Retrieving stocks in index " + code);

  return await Indices.findBySymbol(code)
    .then((index) => {
      logger.debug("Index retrieved");

      if (Array.isArray(index) && index.length > 0) {
        return {
          status: "success",
          results: index.length,
          data: index[0],
        };
      } else {
        return {
          status: "success",
          results: 1,
          data: index,
        };
      }
    })
    .catch((error) => {
      logger.error("Error fetching market holidays:", {
        error: error.message,
        stack: error.stack,
        body: filters,
      });
      throw error;
    });
}

/**
 * Main filter function for quotes
 * @param {Object} filters
 * @param {string} filters.code - unique code of the stock
 * @param {string} filters.date - date
 * @param {string} filters.start - start date
 * @param {string} filters.end - end date
 * @param {number} filters.limit - limit of results
 * @param {number} filters.sort - sort order
 * @param {number} filters.skip - skip results
 * @param {string} filters.fields - fields to include
 */
async function filterQuotes(filters = {}) {
  const { code, date, start, end, limit, sort, skip, fields } = filters;

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
        return {
          status: 200,
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
        };
      } else {
        return {
          status: 204,
          historical: [],
          reason: "No Content",
        };
      }
    })
    .catch((err) => {
      logger.error("Error retrieving stocks", {
        error: err.message,
        stack: err.stack,
        body: filters,
      });

      throw err;
    });
}

/**
 *
 * @param {*} filters
 */
async function filterIndices(filters = {}) {
  const { code, date, start, end, limit, sort, skip, fields } = filters;

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

      if (stocks && stocks.length > 0) {
        return {
          status: 200,
          last_updated: stocks[0].date,
          symbol: code,
          total_count: count,
          historical: stocks,
        };
      } else {
        return {
          status: 204,
          historical: [],
          reason: "No Content",
        };
      }
    })
    .catch((err) => {
      logger.error("Error retrieving stocks", {
        error: err.message,
        stack: err.stack,
        body: filters,
      });

      throw err;
    });
}

/**
 * @param {NewsFilters} filters
 * @returns {Promise<News>}
 */
async function getNews(filters = {}) {
  let news;
  if (filters?.text) news = await News.findNewsArticles(filters.text);
  else news = await News.find({});
  return news ?? [];
}

module.exports = {
  // companies
  getCompanies,
  getCompanyByCode,
  createCompany,
  updateCompany,
  deleteCompany,

  // quotes
  getQuotes,
  getQuotesHistorical,
  getQuotesHistoricalEssentials,
  getQuote,
  // getQuotesBySymbol,
  getQuoteByDate,
  getQuoteOHLCV,
  getQuoteOHLCVHistory,
  // getQuoteTickers,
  // getQuoteTickersByCode,

  // market
  getMarketStatus,
  getMarketHolidays,

  // indices
  getIndices,
  getIndexBySymbol,
  createIndex,
  updateIndex,
  deleteIndex,
  getStocksInIndex,

  getNews,
};
