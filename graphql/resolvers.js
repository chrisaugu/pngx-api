/**
 * @typedef {Object} QueryQuoteResponse
 * @property {boolean} success - Success status
 * @property {ErrorInfo} errors - Error information
 * @property {Quote} data - Quote data
 */
/**
 * @typedef {Object} QueryQuotesResponse
 * @property {boolean} success - Success status
 * @property {ErrorInfo} errors - Error information
 * @property {Array<Quote>} data - Quotes data
 */
/**
 * @typedef {Object} QueryIndicesResponse
 * @property {boolean} success - Success status
 * @property {ErrorInfo} errors - Error information
 * @property {Array<Index>} data - Quotes data
 */
/**
 * @typedef {Object} Company
 * @property {number} id - Unique identifier
 * @property {string} name - Job role
 * @property {string} ticker -
 * @property {string} description -
 * @property {string} industry -
 * @property {string} sector -
 * @property {Array} key_people -
 * @property {Date} date_listed -
 * @property {Date} established_date -
 * @property {string} outstanding_shares -
 * @property {string} pngx_profile_url -
 * @property {string} logo_src -
 * @property {string} internet_address -
 * @property {string} registered_office_address -
 */
/**
 * @typedef {Object} Quote
 * @property {string} code - Stock ticker
 * @property {string} short_name - Company name
 * @property {number} bid - Bid price
 * @property {number} offer - Offer price
 * @property {number} last - Last price
 * @property {number} close - Closing price
 * @property {number} high - High price
 * @property {number} low - Low price
 * @property {number} open - Opening price
 * @property {number} chg_today - Change today
 * @property {number} vol_today - Volume today
 * @property {number} num_trades - Number of trades
 */

const {
  getQuote,
  getQuotes,
  getQuotesHistorical,
  getIndices,
  getIndexBySymbol,
  getStocksInIndex,
  getNews,
  getCompanies,
  getCompanyByCode,
} = require("../services/index");
const { CompanyService } = require("../services/company.service");
const logger = require("../libs/logger").winstonLogger;
// const companyService = new CompanyService();

/**
 * Query quote by code
 * @param {Object} obj Parent object
 * @param {QueryStockRequest} args QueryStockRequest {id: string}
 * @param {Object} context Context object
 * @returns {Promise<QueryQuotesResponse>} Promise<QueryQuotesResponse>
 */
async function queryQuotes(obj, args, context) {
  try {
    const result = await getQuotes(args);

    return {
      success: true,
      errors: null,
      data: result?.data ?? [],
    };
  } catch (error) {
    logger.error("Error fetching quotes:", error);
    return {
      success: false,
      errors: [{ message: error?.message, code: error?.code }],
      data: null,
    };
  }
}

/**
 * Query quote by code
 * @param {Object} obj Parent object
 * @param {QueryStockRequest} args QueryStockRequest {id: string}
 * @param {Object} context Context object
 * @returns {Promise<QueryQuoteResponse>} QueryQuoteResponse
 */
async function queryQuote(obj, args, context) {
  if (!args.code) {
    return {
      success: false,
      errors: [{ message: "`code` is required" }],
      data: null,
    };
  }

  try {
    const result = await getQuote(args);
    return {
      success: result.status == 200,
      errors: null,
      data: Array.isArray(result) ? result[0] : result,
    };
  } catch (error) {
    logger.error("Error fetching quote by code:", error);
    return {
      success: false,
      errors: [{ message: error?.message, code: error?.code }],
      data: null,
    };
  }
}

/**
 * Query historical quotes
 * @param {Object} obj Parent object
 * @param {Object} args Arguments
 * @param {Object} context Context object
 * @returns {Promise<QueryQuotesResponse>}
 */
async function queryHistoricalQuotes(obj, args, context) {
  try {
    const result = await getQuotesHistorical(args);
    console.log(result);

    return {
      success: true,
      errors: null,
      data: result.historical,
    };
  } catch (error) {
    logger.error("Error fetching historical quotes:", error);
    return {
      success: false,
      errors: [{ message: "Internal server error" }],
      data: null,
    };
  }
}

/**
 * Query indices
 * @param {Object} obj Parent object
 * @param {Object} args Arguments
 * @param {Object} context Context object
 * @returns {Promise<QueryIndicesResponse>}
 */
async function queryIndices(obj, args, context) {
  try {
    const result = await getIndices(args);

    return {
      success: result?.status === 200,
      data: Array.isArray(result) ? result[0] : result,
      errors: null,
    };
  } catch (error) {
    logger.error("Error fetching indices:", error);
    return {
      success: false,
      errors: [{ message: "Internal server error" }],
      data: null,
    };
  }
}

/**
 * Query index
 * @param {Object} obj Parent object
 * @param {Object} args Arguments
 * @param {Object} context Context object
 * @returns {Promise<QueryIndicesResponse>}
 */
async function queryIndex(obj, args, context) {
  try {
    const result = await getIndexBySymbol(args);
    return {
      success: true,
      errors: null,
      data: result,
    };
  } catch (error) {
    logger.error("Error fetching quotes:", error);
    return {
      success: false,
      errors: [{ message: error?.message, code: error?.code }],
      data: null,
    };
  }
}

/**
 * Query indices
 * @param {Object} obj Parent object
 * @param {Object} args Arguments
 * @param {Object} context Context object
 * @returns {Promise<QueryIndicesResponse>}
 */
async function queryCompanies(obj, args, context) {
  try {
    const result = await getCompanies(args);
    return {
      success: true,
      errors: null,
      data: result,
    };
  } catch (error) {
    logger.error("Error fetching quotes:", error);
    return {
      success: false,
      errors: [{ message: error?.message, code: error?.code }],
      data: null,
    };
  }
}

/**
 * Query companies
 * @param {Object} obj Parent object
 * @param {Object} args Arguments
 * @param {Object} context Context object
 * @returns {Promise<QueryIndicesResponse>}
 */
async function queryCompanyByCode(obj, args, context) {
  try {
    const result = await getCompanyByCode(args);
    return {
      success: true,
      errors: null,
      data: result,
    };
  } catch (error) {
    logger.error("Error fetching quotes:", error);
    return {
      success: false,
      errors: [{ message: error?.message, code: error?.code }],
      data: null,
    };
  }
}

/**
 * Query news
 * @param {Object} obj Parent object
 * @param {Object} args Arguments
 * @param {Object} context Context object
 * @returns {Promise<QueryIndicesResponse>}
 */
async function queryNews(obj, args, context) {
  try {
    const result = await getNews(args);
    return {
      success: true,
      errors: null,
      data: result,
    };
  } catch (error) {
    logger.error("Error fetching quotes:", error);
    return {
      success: false,
      errors: [{ message: error?.message, code: error?.code }],
      data: null,
    };
  }
}

const resolvers = {
  Query: {
    quotes: queryQuotes,
    quoteByCode: queryQuote,
    historicalQuotes: queryHistoricalQuotes,
    // tickers: queryTickers,
    // tickerByCode: queryTickerByCode,
    indices: queryIndices,
    indexByCode: queryIndex,
    companies: queryCompanies,
    company: queryCompanyByCode,
    news: queryNews,
  },
  Mutation: {
    // async register(_, { login, password }) {
    //   const user = await User.create({
    //     login,
    //     password: await bcrypt.hash(password, 10),
    //   });
    //   return jsonwebtoken.sign({ id: user.id, login: user.login }, JWT_SECRET, {
    //     expiresIn: "3m",
    //   });
    // },
    // async login(_, { login, password }) {
    //   const user = await User.findOne({ where: { login } });
    //   if (!user) {
    //     throw new Error(
    //       "This user doesn't exist. Please, make sure to type the right login.",
    //     );
    //   }
    //   const valid = await bcrypt.compare(password, user.password);
    //   if (!valid) {
    //     throw new Error("You password is incorrect!");
    //   }
    //   return jsonwebtoken.sign({ id: user.id, login: user.login }, JWT_SECRET, {
    //     expiresIn: "1d",
    //   });
    // },
  },
};

module.exports = resolvers;
