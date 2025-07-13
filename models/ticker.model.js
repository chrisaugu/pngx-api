const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * this model is used to store tickers of stocks. It is a time-series data. The collection is populated by
 * etl process which runs on a cron job every morning.
 */
const TickerSchema = new Schema(
  {
    date: Date,
    symbol: String,
    close: Number,
    high: Number,
    low: Number,
    open: Number,
    change: Number,
    volume: Number,
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
TickerSchema.index({
  symbol: 1,
  date: 1,
});

const Ticker = mongoose.model("ticker", TickerSchema);

exports.findBySymbol = function (symbol) {
  return Ticker.find({ symbol: symbol });
};

// Ticker.watch().on("change", (data) => {
//   console.log("Ticker changed", data);
// });

// // Insert a doc, will trigger the change stream handler above
// await Ticker.create({
//   date: new Date(),
//   symbol: 'AAPL',
//   close: 150.00,
//   high: 155.00,
//   low: 145.00,
//   open: 148.00,
//   change: 5.00,
//   volume: 1000000,
// });

// class MyClass {

//   myMethod() {
//     return 42;
//   }

//   static myStatic() {
//     return 42;
//   }

//   get myVirtual() {
//     return 42;
//   }
// }

// const schema = new Schema();
// schema.loadClass(MyClass);

module.exports = Ticker;
