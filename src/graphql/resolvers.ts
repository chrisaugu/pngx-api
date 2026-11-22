import {
  getQuote,
  getQuotes,
  getQuotesHistorical,
  getIndices,
  getIndexBySymbol,
  getStocksInIndex,
  getNews,
  getCompanies,
  getCompanyByCode,
} from "@/services/index";
import { winstonLogger as logger } from "@/libs/logger";
import {
  QueryQuotesResponse,
  QueryQuoteResponse,
  QueryIndicesResponse,
  QueryStockRequest,
  QueryCompaniesResponse,
} from "@/types/nuku";
import { CompanyService } from "@/services/company.service";
// const companyService = new CompanyService();

/**
 * Query quote by code
 * @param {Object} obj Parent object
 * @param {QueryStockRequest} args QueryStockRequest {id: string}
 * @param {Object} context Context object
 * @returns {Promise<QueryQuotesResponse>} Promise<QueryQuotesResponse>
 */
async function queryQuotes(
  obj: object,
  args: QueryStockRequest,
  context: object,
): Promise<QueryQuotesResponse> {
  try {
    const result = await getQuotes(args);

    return {
      success: true,
      errors: null,
      data: result?.data ?? [],
    };
  } catch (error: any) {
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
async function queryQuote(
  obj: object,
  args: QueryStockRequest,
  context: object,
): Promise<QueryQuoteResponse> {
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
  } catch (error: any) {
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
async function queryHistoricalQuotes(
  obj: object,
  args: object,
  context: object,
): Promise<QueryQuotesResponse> {
  try {
    const result = await getQuotesHistorical(args);
    console.log(result);

    return {
      success: true,
      errors: null,
      data: result.historical,
    };
  } catch (error: any) {
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
async function queryIndices(
  obj: object,
  args: object,
  context: object,
): Promise<QueryIndicesResponse> {
  try {
    const result = await getIndices(args);

    return {
      success: result?.status === 200,
      data: Array.isArray(result) ? result[0] : result,
      errors: null,
    };
  } catch (error: any) {
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
async function queryIndex(
  obj: object,
  args: object,
  context: object,
): Promise<QueryIndicesResponse> {
  try {
    const result = await getIndexBySymbol(args);
    return {
      success: true,
      errors: null,
      data: result,
    };
  } catch (error: any) {
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
 * @returns {Promise<QueryCompaniesResponse>}
 */
async function queryCompanies(
  obj: object,
  args: object,
  context: object,
): Promise<QueryCompaniesResponse> {
  try {
    const result = await getCompanies(args);
    return {
      success: true,
      errors: null,
      data: result.data,
    };
  } catch (error: any) {
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
async function queryCompanyByCode(
  obj: object,
  args: object,
  context: object,
): Promise<QueryIndicesResponse> {
  try {
    const result = await getCompanyByCode(args);
    return {
      success: true,
      errors: null,
      data: result.data,
    };
  } catch (error: any) {
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
 * @returns {Promise<QueryCompaniesResponse>}
 */
async function queryNews(
  obj: object,
  args: object,
  context: object,
): Promise<QueryCompaniesResponse> {
  try {
    const result = await getNews(args);
    return {
      success: true,
      errors: null,
      data: result,
    };
  } catch (error: any) {
    logger.error("Error fetching quotes:", error);
    return {
      success: false,
      errors: [{ message: error?.message, code: error?.code }],
      data: null,
    };
  }
}

export default {
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
