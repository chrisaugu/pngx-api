const mongoose = require("mongoose");
const { Schema } = mongoose;

const IndexSchema = new Schema(
  {
    // Core identification
    code: {
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
      enum: ["PNGX", "OTHER"],
    },
    currency: {
      type: String,
      default: "PGK",
      enum: ["PGK", "USD", "EUR", "GBP", "JPY", "INR", "CNY"],
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

// Indexes for performance
IndexSchema.index({ code: 1, date: 1 });
IndexSchema.index({ name: "text" });
IndexSchema.index({ exchange: 1, isActive: 1 });

IndexSchema.methods.findSimilarTypes = function (cb) {
  return mongoose.model("indices").find({ code: this.code }).then(cb);
};

IndexSchema.statics.findBySymbol = function (code) {
  return this.find({
    code: code,
  });
};

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
        `Index ${this.code} components weights sum to ${totalWeight}%`
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
  // const sp500 = new Indices({
  //   code: "^GSPC",
  //   name: "S&P 500",
  //   exchange: "NYSE",
  //   components: [
  //     { stockSymbol: "AAPL", weight: 6.1 },
  //     { stockSymbol: "MSFT", weight: 5.8 },
  //     // ... other components
  //   ],
  //   currentValue: 4532.76,
  //   previousClose: 4514.07,
  // });
  // await sp500.save();

  // Query usage
  // const nyseIndices = await Indices.findByExchange("NYSE");
  // const index = await Indices.findOne({ code: "^GSPC" });
  // console.log(index); // Virtual property

  /* PNGX Index Instances with Approximate Weights (as of mid‑2025)
   * NOTE:
   * - Equal‑weight indices use exact equal percentages.
   * - Free‑float and total‑cap weights are illustrative, based on public estimates; update with official data when available.
   * - All weights are rounded to two decimal places.
   */

  // -------------------- PNGXD (Domestic Free‑Float Cap‑Weighted) --------------------
  const PNGXD = new Indices({
    code: "PNGXD",
    name: "PNGXD",
    exchange: "PNGX",
    components: [
      { stockSymbol: "BSP", weight: 65.34 },
      { stockSymbol: "CPL", weight: 4.54 },
      { stockSymbol: "COY", weight: 2.45 },
      { stockSymbol: "CCP", weight: 7.26 },
      { stockSymbol: "KAM", weight: 2.54 },
      { stockSymbol: "KSL", weight: 5.44 },
      { stockSymbol: "NGP", weight: 0.91 },
      { stockSymbol: "CGA", weight: 1.36 },
      { stockSymbol: "NIU", weight: 0.36 },
      { stockSymbol: "SST", weight: 9.8 },
    ],
  });
  await PNGXD.save();

  // -------------------- PNGXI (Market Free‑Float Cap‑Weighted) --------------------
  const PNGXI = new Indices({
    code: "PNGXI",
    name: "PNGXI",
    exchange: "PNGX",
    components: [
      { stockSymbol: "BSP", weight: 25.51 },
      { stockSymbol: "CPL", weight: 1.77 },
      { stockSymbol: "COY", weight: 0.96 },
      { stockSymbol: "CCP", weight: 2.83 },
      { stockSymbol: "KAM", weight: 0.99 },
      { stockSymbol: "KSL", weight: 2.13 },
      { stockSymbol: "NGP", weight: 0.35 },
      { stockSymbol: "CGA", weight: 0.53 },
      { stockSymbol: "NCM", weight: 8.5 },
      { stockSymbol: "NEM", weight: 9.92 },
      { stockSymbol: "NIU", weight: 0.14 },
      { stockSymbol: "SST", weight: 3.83 },
      { stockSymbol: "STO", weight: 42.52 },
    ],
  });
  await PNGXI.save();

  // -------------------- PNGXDC (Domestic Total‑Cap Weighted) --------------------
  const PNGXDC = new Indices({
    code: "PNGXDC",
    name: "PNGXDC",
    exchange: "PNGX",
    components: [
      { stockSymbol: "BSP", weight: 72.51 },
      { stockSymbol: "CPL", weight: 3.02 },
      { stockSymbol: "COY", weight: 1.81 },
      { stockSymbol: "CCP", weight: 6.04 },
      { stockSymbol: "KAM", weight: 2.42 },
      { stockSymbol: "KSL", weight: 3.63 },
      { stockSymbol: "NGP", weight: 1.21 },
      { stockSymbol: "CGA", weight: 1.51 },
      { stockSymbol: "NIU", weight: 0.6 },
      { stockSymbol: "SST", weight: 7.25 },
    ],
  });
  await PNGXDC.save();

  // -------------------- PNGXIC (Market Total‑Cap Weighted) --------------------
  const PNGXIC = new Indices({
    code: "PNGXIC",
    name: "PNGXIC",
    exchange: "PNGX",
    components: [
      { stockSymbol: "BSP", weight: 34.45 },
      { stockSymbol: "CPL", weight: 1.44 },
      { stockSymbol: "COY", weight: 0.87 },
      { stockSymbol: "CCP", weight: 2.87 },
      { stockSymbol: "KAM", weight: 1.15 },
      { stockSymbol: "KSL", weight: 1.73 },
      { stockSymbol: "NGP", weight: 0.58 },
      { stockSymbol: "CGA", weight: 0.72 },
      { stockSymbol: "NCM", weight: 8.61 },
      { stockSymbol: "NEM", weight: 11.49 },
      { stockSymbol: "NIU", weight: 0.29 },
      { stockSymbol: "SST", weight: 3.45 },
      { stockSymbol: "STO", weight: 32.35 },
    ],
  });
  await PNGXIC.save();

  // -------------------- PNGXDE (Domestic Equal‑Weighted) --------------------
  const PNGXDE = new Indices({
    code: "PNGXDE",
    name: "PNGXDE",
    exchange: "PNGX",
    components: [
      { stockSymbol: "BSP", weight: 10.0 },
      { stockSymbol: "CPL", weight: 10.0 },
      { stockSymbol: "COY", weight: 10.0 },
      { stockSymbol: "CCP", weight: 10.0 },
      { stockSymbol: "KAM", weight: 10.0 },
      { stockSymbol: "KSL", weight: 10.0 },
      { stockSymbol: "NGP", weight: 10.0 },
      { stockSymbol: "CGA", weight: 10.0 },
      { stockSymbol: "NIU", weight: 10.0 },
      { stockSymbol: "SST", weight: 10.0 },
    ],
  });
  await PNGXDE.save();

  // -------------------- PNGXIE (Market Equal‑Weighted) --------------------
  const PNGXIE = new Indices({
    code: "PNGXIE",
    name: "PNGXIE",
    exchange: "PNGX",
    components: [
      { stockSymbol: "BSP", weight: 7.69 },
      { stockSymbol: "CPL", weight: 7.69 },
      { stockSymbol: "COY", weight: 7.69 },
      { stockSymbol: "CCP", weight: 7.69 },
      { stockSymbol: "KAM", weight: 7.69 },
      { stockSymbol: "KSL", weight: 7.69 },
      { stockSymbol: "NGP", weight: 7.69 },
      { stockSymbol: "CGA", weight: 7.69 },
      { stockSymbol: "NIU", weight: 7.69 },
      { stockSymbol: "SST", weight: 7.69 },
      { stockSymbol: "STO", weight: 7.69 },
      { stockSymbol: "NCM", weight: 7.69 },
      { stockSymbol: "NEM", weight: 7.69 },
    ],
  });
  await PNGXIE.save();
}
// main();