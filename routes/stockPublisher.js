const Redis = require("ioredis");
const { getStockData, getQuotes, getTickers } = require("./mockStockApi");

const publisher = new Redis(6379);
const TIMEOUT = 2000;

publisher.on("error", async (err) => {
  console.error("Redis error:", err);
  await publisher.quit();
  process.exit();
});
process.on("SIGINT", async () => {
  await publisher.quit();
  process.exit();
});

setInterval(() => {
  const stocks = getStockData();
  stocks.forEach((stock) => {
    publisher.publish(`stocks:${stock.ticker}`, JSON.stringify(stock));
  });
}, TIMEOUT);

setInterval(async () => {
  let tickers = await getTickers();
  tickers.forEach((ticker) => {
    publisher.publish(`tickers:${ticker.symbol}`, JSON.stringify(ticker));
  });
}, TIMEOUT);

setInterval(async () => {
  let quotes = await getQuotes();
  // publisher.publish("quotes:*", JSON.stringify({ ticker: "PNGX", price: 12.45 }));
  quotes.forEach((quote) => {
    publisher.publish(`quotes:${quote.code}`, JSON.stringify(quote));
  });
}, TIMEOUT);