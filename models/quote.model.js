const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const quoteSchema = new Schema(
  {
    date: Date,
    code: String,
    short_name: String,
    bid: Number,
    offer: Number,
    last: Number,
    close: Number,
    high: Number,
    low: Number,
    open: Number,
    chg_today: Number,
    vol_today: Number,
    num_trades: Number,
  },
  {
    toJSON: {
      transform(doc, rest) {
        delete rest.__v;
        delete rest._id;
        delete rest.createdAt;
        delete rest.updatedAt;
      },
    },
    timestamps: {
      currentTime: () => Math.floor(Date.now() / 1000),
    },
  }
);
quoteSchema.index({ code: 1, date: 1 });
quoteSchema.methods.findSimilarTypes = function (cb) {
  return mongoose.model("quote").find({ code: this.code }).then(cb);
};

quoteSchema.statics.findBySymbol = function (symbol) {
  return this.find({
    code: symbol,
  });
};

const Quote = (module.exports = mongoose.model("quote", quoteSchema));
