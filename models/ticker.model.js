const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * this model is used to store tickers of stocks. It is a time-series data. The collection is populated by
 * etl process which runs on a cron job every morning.
 */
const tickerSchema = new Schema(
  {
    date: Date,
    symbol: String,
    close: Number,
    high: Number,
    low: Number,
    open: Number,
    change: Number,
    volume: Number
  },
  {
    timeseries: {
      timeField: "date",
      metaField: "symbol",
      granularity: "hours",
    },
    autoCreate: false,
  }
);
tickerSchema.index({
  symbol: 1,
  date: 1,
});

const Ticker = (module.exports = mongoose.model("ticker", tickerSchema));

exports.findBySymbol = function (symbol) {
  return Ticker.find({ symbol: symbol });
};
