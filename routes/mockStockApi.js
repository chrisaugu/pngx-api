const { initDatabase } = require("../database");
const { Stock, Ticker } = require('../models/index')
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

function getStockData() {
  return SYMBOLS.map((ticker) => ({
    ticker,
    price: getRandomPrice(),
    timestamp: new Date().toISOString(),
  }));
}

async function getTickers() {
  try {
    const result = await Ticker.find({});
    return result;
  } catch (error) {
    console.error(error);
  }
}

async function getQuotes() {
  try {
    const result = await Stock.find({});
    return result;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getStockData,
  getQuotes,
  getTickers,
};
