const Company = require("./company.model");
// TODO: rename Stock to Quote for consistency in Stock terminologies
const Stock = require("./quote.model");
const Indices = require("./indices.model");
const Ticker = require("./ticker.model");
const Webhook = require("./webhook.model");
const { NewsSource, News } = require("./news-source.model");

module.exports = {
  Ticker,
  Stock,
  Quote: Stock,
  Indices,
  Company,
  Webhook,
  News,
  NewsSource,
};
