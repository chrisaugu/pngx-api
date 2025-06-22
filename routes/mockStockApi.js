const { initDatabase } = require("../database");
const { Stock, Ticker } = require("../models/index");
const { SYMBOLS } = require("../constants");

initDatabase()
  .on("connected", function () {
    console.log(
      "[Main_Thread]: Connected: Successfully connect to mongo server"
    );
  })
  .on("error", function () {
    console.log(
      "[Main_Thread]: Error: Could not connect to MongoDB. Did you forget to run 'mongod'?"
    );
  });

function getRandomPrice() {
  return (Math.random() * 1000 + 100).toFixed(2);
}

function getRandomNumber() {
  return (Math.random() * 1000 + 100).toFixed(0);
}

function getStockData() {
  return SYMBOLS.map((ticker) => ({
    ticker,
    price: getRandomPrice(),
    timestamp: new Date().toISOString(),
  }));
}

async function getTickers() {
  // try {
  //   const result = await Ticker.find({});
  //   return result;
  // } catch (error) {
  //   console.error(error);
  // }

  return SYMBOLS.map((ticker) => {
    let close = getRandomPrice();
    let open = getRandomPrice();
    let change = open - close;

    return {
      date: new Date().toISOString(),
      symbol: ticker,
      high: getRandomPrice(),
      low: getRandomPrice(),
      open: open,
      close: close,
      change: change,
      volume: getRandomNumber(),
    };
  });
}

async function getQuotes() {
  // try {
  //   const result = await Stock.find({});
  //   return result;
  // } catch (error) {
  //   console.error(error);
  // }

  return SYMBOLS.map((quote) => {
    let close = getRandomPrice();
    let open = getRandomPrice();
    let change = open - close;

    return {
      date: new Date().toISOString(),
      code: quote,
      bid: getRandomPrice(),
      offer: getRandomPrice(),
      last: getRandomPrice(),
      close: close,
      high: getRandomPrice(),
      low: getRandomPrice(),
      open: open,
      chg_today: change,
      vol_today: getRandomNumber(),
      num_trades: getRandomNumber(),
    };
  });
}

module.exports = {
  getStockData,
  getQuotes,
  getTickers,
};
