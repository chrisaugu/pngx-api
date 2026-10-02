const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuoteSchema = new Schema(
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
  },
);

QuoteSchema.index({ code: 1, date: 1 });

QuoteSchema.methods.findSimilarTypes = function (cb) {
  return mongoose.model("quote").find({ code: this.code }).then(cb);
};

QuoteSchema.statics.findBySymbol = function (symbol) {
  return this.find({
    code: symbol,
  });
};

// Static method for finding by code
QuoteSchema.statics.findByCode = function (code) {
  return this.find({ code });
};

const Quote = mongoose.model("quote", QuoteSchema);

// Quote.watch().on("change", (data) => {
//   console.log('Changed', data);
// });

// Insert a doc, will trigger the change stream handler above
// await Quote.create({ name: "Axl Rose" });
// await Quote.create({
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
// console.log(schema.methods); // { myMethod: [Function: myMethod] }
// console.log(schema.statics); // { myStatic: [Function: myStatic] }
// console.log(schema.virtuals); // { myVirtual: VirtualType { ... } }

module.exports = Quote;
