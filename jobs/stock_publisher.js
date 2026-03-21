const { parentPort } = require("node:worker_threads");
const {
  getStockData,
  getQuotes,
  getTickers,
} = require("../routes/mockStockApi");
const { createRedisIoClient } = require("../libs/redis");

const publisher = createRedisIoClient();
const TIMEOUT = 2000;
// const pRetry, { AbortError } = require('p-retry');

const run = async () => {
  const response = await fetch("https://sindresorhus.com/unicorn");

  // Abort retrying if the resource doesn't exist
  if (response.status === 404) {
    throw new AbortError(response.statusText);
  }

  return response.blob();
};

// console.log(await pRetry(run, { retries: 5 }));

const actualJob = () => {
  console.log("HEllo");
};

actualJob();

function cancel() {
  // do cleanup here
  // (if you're using @ladjs/graceful, the max time this can run by default is 5s)

  // send a message to the parent that we're ready to terminate
  // (you could do `process.exit(0)` or `process.exit(1)` instead if desired
  // but this is a bit of a cleaner approach for worker termination
  if (parentPort) parentPort.postMessage("cancelled");
  else process.exit(0);
}

// signal to parent that the job is done
if (parentPort) parentPort.postMessage("done");
// if (parentPort) {
//     parentPort.once('message', message => {
//         if (message === 'cancel') return cancel();
//     });
// }

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
  const tickers = await getTickers();
  tickers.forEach((ticker) => {
    publisher.publish(`tickers:${ticker.symbol}`, JSON.stringify(ticker));
  });
}, TIMEOUT);

setInterval(async () => {
  const quotes = await getQuotes();
  // publisher.publish("quotes:*", JSON.stringify({ ticker: "PNGX", price: 12.45 }));
  quotes.forEach((quote) => {
    publisher.publish(`quotes:${quote.code}`, JSON.stringify(quote));
  });
}, TIMEOUT);
