const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tickerSchema = new Schema(
  {
    date: Date,
    symbol: String,
    bid: Number,
    offer: Number,
    last: Number,
    close: Number,
    high: Number,
    low: Number,
    open: Number,
    change: Number,
    volume: Number,
    num_trades: Number,
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
tickerSchema.index({ symbol: 1, date: 1 });

const Ticker = (module.exports = mongoose.model("ticker", tickerSchema));

exports.findBySymbol = function (symbol) {
  return Ticker.find({ symbol: symbol });
};