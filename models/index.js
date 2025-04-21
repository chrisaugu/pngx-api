const Company = require("./company.model");
// TODO rename Stock to Quote for consistency in Stock terminologies
const Stock = require("./quote.model");
const Ticker = require("./ticker.model");

module.exports = {
  Ticker,
  Stock,
  Company,
};
