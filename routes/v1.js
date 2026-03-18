const { Router } = require("express");
const router = Router();
const { SYMBOLS } = require("../constants");
const { Stock } = require("../models/index");

function deprecationMiddleware(req, res, next) {
  res.set("Deprecation", "@1688169599");
  next();
}

/**
 * @swagger
 
 * /api/v1/:
 *   tags:
 *    - company
 *   get:
 *     deprecated: true
 *     summary: Returns a list of stock codes/symbols
 *     responses:
 *       200:
 *         description: A successful response
 */
/**
 * GET /api/v1/
 */
router.get("/", function (req, res) {
  res.set("Deprecation", "@1688169599");
  res.setHeader("Sunset", "@1688169599");

  res.status(200).json({
    status: 200,
    message: "Ok",
    data: {
      api: "NUKU API",
      timestamp: new Date().getTime(),
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
 *     summary: Returns all historical data for a code/symbol
 *     description: Returns all historical data for a code/symbol
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
 *         description: code/symbol
 *         required: true
 *         schema:
 *           type: string
 *           enum: [BSP, CCP, CGA, CPL, KAM, KSL, NEM, NGP, NIU, SST, STO]
 */
/**
 * GET /api/v1/historicals/:code
 * See also /api/v1/stocks/:code/historicals
 * @param :code unique symbol of the stock
 */
router.get("/historicals/:code", function (req, res) {
  res.redirect(301, "/api/v2/historicals/" + req.params.code);
});

/**
 * @swagger
 *
 * /api/v1/stocks/:
 *   get:
 *     operationId: getStocks
 *     summary: Returns a list of quotes for the day
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
 * Retrieve quotes for all companies for the current day
 * Retrieve PNGX stock quotes stored in my own database
 * Retrieve stock quotes directly from the PNGX website
 * @query date - retrieve quotes for an exact date
 * @query start - start date in a range
 * @query end - end date in a range
 * @query limit -
 * @query offset -
 * @query sort -
 * @query skip -
 * @query fields - i.e. fields=id,name,address,contact
 *
 * @param: /api/v1/stocks?code=CODE, retrieve quotes from a specific company for the current day
 * @param: /api/v1/stocks?code=CODE&date=now, retrieve quotes from a specific company for a specific day
 * @param: /api/v1/stocks?code=CODE&date_from=DATE&date_to=DATE
 *
 * Date format: YYYY-MM-DD
 */
router.get("/stocks", function (req, res) {
  res.redirect(301, "/api/v2/stocks/tickers");
});

module.exports = router;
