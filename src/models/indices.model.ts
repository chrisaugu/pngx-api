import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import { IIndex } from "@/types/nuku";

interface IIndexMethods {
  getRecentPerformance(days?: number): IIndex["history"];
  findSimilarTypes(): Promise<HydratedDocument<IIndex>[]>;
}

// interface IndexVirtuals {
//   percentChange: string;
// }

// type UserModelType = Model<IIndex, {}, {}, IndexVirtuals>; // <-- add virtuals here...

// const schema = new Schema<IIndex, UserModelType, {}, {}, IndexVirtuals>({ // <-- and here
//   firstName: String,
//   lastName: String
// });

// schema.virtual('percentChange').get(function () {
//   return `${this.firstName} ${this.lastName}`;
// });

interface IIndexModel extends Model<IIndex, {}, IIndexMethods> {
  findByCode(code: string): Promise<HydratedDocument<IIndex> | null>;
  findByExchange(exchange: string): Promise<HydratedDocument<IIndex>[]>;
  findActive(): Promise<HydratedDocument<IIndex>[]>;
}

const IndexSchema = new Schema<IIndex, IIndexModel, IIndexMethods>(
  {
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

    components: [
      {
        _id: false,
        stockSymbol: {
          type: String,
          required: true,
          uppercase: true,
          trim: true,
        },
        weight: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
      },
    ],

    currentValue: {
      type: Number,
      min: 0,
    },

    previousClose: {
      type: Number,
      min: 0,
    },

    open: Number,
    high: Number,
    low: Number,

    exchange: {
      type: String,
      enum: ["PNGX", "OTHER"],
      default: "PNGX",
    },

    currency: {
      type: String,
      enum: ["PGK", "USD", "EUR", "GBP", "JPY", "INR", "CNY"],
      default: "PGK",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },

    history: [
      {
        _id: false,
        date: {
          type: Date,
          default: Date.now,
        },
        value: {
          type: Number,
          min: 0,
        },
        volume: {
          type: Number,
          min: 0,
        },
      },
    ],
    // // Core identification
    // code: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   uppercase: true,
    //   trim: true,
    //   maxlength: 10,
    // },
    // name: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },

    // // Composition data
    // components: [
    //   {
    //     stockSymbol: {
    //       type: String,
    //       required: true,
    //       uppercase: true,
    //       trim: true,
    //     },
    //     weight: {
    //       type: Number,
    //       min: 0,
    //       max: 100,
    //     },
    //   },
    // ],

    // // Pricing information
    // currentValue: {
    //   type: Number,
    //   min: 0,
    // },
    // previousClose: Number,
    // open: Number,
    // high: Number,
    // low: Number,

    // // Metadata
    // exchange: {
    //   type: String,
    //   enum: ["PNGX", "OTHER"],
    // },
    // currency: {
    //   type: String,
    //   default: "PGK",
    //   enum: ["PGK", "USD", "EUR", "GBP", "JPY", "INR", "CNY"],
    // },
    // isActive: {
    //   type: Boolean,
    //   default: true,
    // },

    // // Timestamps
    // lastUpdated: {
    //   type: Date,
    //   default: Date.now,
    // },
    // history: [
    //   {
    //     date: Date,
    //     value: Number,
    //     volume: Number,
    //   },
    // ],
  },
  {
    timestamps: true,

    toObject: {
      virtuals: true,
    },

    toJSON: {
      virtuals: true,
      transform(doc, rest) {
        // delete rest.__v;
        // delete rest._id;
        // delete rest.createdAt;
        // delete rest.updatedAt;

        rest.components = rest.components.map((c) => ({
          stockSymbol: c.stockSymbol,
          weight: c.weight,
        }));
      },
    },
    // methods: {
    //   findSimilarTypes: function (cb: (value: any[]) => Promise<void>) {
    //     return this.model('indices').find({ code: this.code }).then(cb);
    //   },

    //   // Instance method for getting recent performance
    //   getRecentPerformance: function (days = 30) {
    //     const cutoffDate = new Date();
    //     cutoffDate.setDate(cutoffDate.getDate() - days);

    //     return this.history
    //       .filter((entry) => entry.date >= cutoffDate)
    //       .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    //   }
    // },
    // statics: {
    //   findBySymbol: function (code) {
    //     return this.find({
    //       code: code,
    //     });
    //   },
    //   // Static method for finding by exchange
    //   findByExchange: function (exchange) {
    //     return this.find({ exchange });
    //   }
    // },
    // virtuals: {
    //   // Virtual for percentage change
    //   percentChange: {
    //     get() {
    //       if (!this.previousClose || !this.currentValue) return null;
    //       return ((this.currentValue - this.previousClose) / this.previousClose) * 100;
    //     }
    //   }
    // }
  },
);

// -------------------- Virtuals --------------------
IndexSchema.virtual("percentChange").get(function () {
  if (
    this.previousClose == null ||
    this.previousClose === 0 ||
    this.currentValue == null
  ) {
    return null;
  }

  return ((this.currentValue - this.previousClose) / this.previousClose) * 100;
});

// -------------------- Instance Methods --------------------
IndexSchema.methods.getRecentPerformance = function (days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return this.history
    .filter((entry) => new Date(entry.date).getTime() >= cutoffDate.getTime())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

IndexSchema.methods.findSimilarTypes = function () {
  return this.model("indices").find({
    exchange: this.exchange,
    code: { $ne: this.code },
  });
};

// -------------------- Static Methods --------------------
IndexSchema.statics.findByCode = function (code: string) {
  return this.findOne({
    code: code.trim().toUpperCase(),
  });
};

IndexSchema.statics.findByExchange = function (exchange: string) {
  return this.find({
    exchange: exchange.toUpperCase(),
  });
};

IndexSchema.statics.findActive = function () {
  return this.find({
    isActive: true,
  });
};

// -------------------- Database Indexes --------------------
IndexSchema.index({ code: 1, date: 1 });
IndexSchema.index({ name: "text" });
IndexSchema.index({ exchange: 1, isActive: 1 });
IndexSchema.index({ "history.date": -1 });

// -------------------- Validation Hook --------------------
IndexSchema.pre("validate", function () {
  if (!this.components?.length) return;

  const totalWeight = this.components.reduce(
    (sum, component) => sum + (component.weight ?? 0),
    0,
  );

  if (Math.abs(totalWeight - 100) > 0.01) {
    this.invalidate(
      "components",
      `Component weights must total 100%. Current total: ${totalWeight.toFixed(
        2,
      )}%`,
    );
  }
});

// Pre-save hook for data validation
IndexSchema.pre("save", function (next) {
  if (this.components && this.components.length > 0) {
    const totalWeight = this.components.reduce(
      (sum, comp) => sum + (comp.weight || 0),
      0,
    );
    if (Math.abs(totalWeight - 100) > 0.01) {
      console.warn(
        `Index ${this.code} components weights sum to ${totalWeight}%`,
      );
    }
  }
  next();
});

export type IndexDocument = HydratedDocument<IIndex>;
const Indices =
  (mongoose.models.indices as IIndexModel) ||
  mongoose.model<IIndex, IIndexModel>("indices", IndexSchema);

export default Indices;
