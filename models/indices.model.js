const mongoose = require("mongoose");
const { Schema } = mongoose;

const IndexSchema = new Schema(
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
    // Core identification
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 10,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Composition data
    components: [
      {
        stockSymbol: {
          type: String,
          required: true,
          uppercase: true,
          trim: true,
        },
        weight: {
          type: Number,
          min: 0,
          max: 100,
        },
      },
    ],

    // Pricing information
    currentValue: {
      type: Number,
      min: 0,
    },
    previousClose: Number,
    open: Number,
    high: Number,
    low: Number,

    // Metadata
    exchange: {
      type: String,
      enum: ["NYSE", "NASDAQ", "NSE", "HKEX", "LSE", "TSE", "OTHER"],
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "JPY", "INR", "CNY"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Timestamps
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    history: [
      {
        date: Date,
        value: Number,
        volume: Number,
      },
    ],
  },
  {
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform(doc, rest) {
        delete rest.__v;
        delete rest._id;
        delete rest.createdAt;
        delete rest.updatedAt;
      },
    },
    timestamps: true,
  }
);

IndexSchema.index({ code: 1, date: 1 });
IndexSchema.methods.findSimilarTypes = function (cb) {
  return mongoose.model("indices").find({ code: this.code }).then(cb);
};

IndexSchema.statics.findBySymbol = function (symbol) {
  return this.find({
    code: symbol,
  });
};

// Indexes for performance
IndexSchema.index({ symbol: 1 });
IndexSchema.index({ name: "text" });
IndexSchema.index({ exchange: 1, isActive: 1 });

// Virtual for percentage change
IndexSchema.virtual("percentChange").get(function () {
  if (!this.previousClose || !this.currentValue) return null;
  return ((this.currentValue - this.previousClose) / this.previousClose) * 100;
});

// Pre-save hook for data validation
IndexSchema.pre("save", function (next) {
  if (this.components && this.components.length > 0) {
    const totalWeight = this.components.reduce(
      (sum, comp) => sum + (comp.weight || 0),
      0
    );
    if (Math.abs(totalWeight - 100) > 0.01) {
      console.warn(
        `Index ${this.symbol} components weights sum to ${totalWeight}%`
      );
    }
  }
  next();
});

// Static method for finding by exchange
IndexSchema.statics.findByExchange = function (exchange) {
  return this.find({ exchange });
};

// Instance method for getting recent performance
IndexSchema.methods.getRecentPerformance = function (days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return this.history
    .filter((entry) => entry.date >= cutoffDate)
    .sort((a, b) => b.date - a.date);
};

const Indices = mongoose.model("indices", IndexSchema);
module.exports = Indices;

async function main() {
  // Create a new index
  const sp500 = new Indices({
    symbol: "^GSPC",
    name: "S&P 500",
    exchange: "NYSE",
    components: [
      { stockSymbol: "AAPL", weight: 6.1 },
      { stockSymbol: "MSFT", weight: 5.8 },
      // ... other components
    ],
    currentValue: 4532.76,
    previousClose: 4514.07,
  });

  // Save to database
  await sp500.save();

  // Query usage
  const nyseIndices = await Indices.findByExchange("NYSE");
  const index = await Indices.findOne({ symbol: "^GSPC" });
  console.log(index); // Virtual property
}
main();
