const Redis = require("ioredis");
const { getStockData, getQuotes, getTickers } = require("./mockStockApi");
const publisher = new Redis();
const TIMEOUT = 2000;

setInterval(() => {
  const stocks = getStockData();
  stocks.forEach((stock) => {
    publisher.publish(`stocks:${stock.ticker}`, JSON.stringify(stock));
  });
}, TIMEOUT);

setInterval(async () => {
  let tickers = await getTickers();
  tickers.forEach((ticker) => {
    publisher.publish(`tickers:${ticker}`, JSON.stringify(ticker));
  });
}, TIMEOUT);

setInterval(async () => {
  let quotes = await getQuotes();
  publisher.publish("quotes:*", JSON.stringify({ ticker: "PNGX", price: 12.45 }));
}, TIMEOUT);
