import mongoose, { HydratedDocument, Model } from "mongoose";
import { IQuote } from "../types/nuku";

export interface IQuoteMethods {
  findSimilarTypes(cb?: (value: any[]) => Promise<void>): Promise<any>;
}

export interface IQuoteModel extends Model<IQuote, {}, IQuoteMethods> {
  findBySymbol(symbol: string): any;
  findByCode(code: string): any;
}

const QuoteSchema = new mongoose.Schema<IQuote, IQuoteModel, IQuoteMethods>(
  {
    date: Date,
    code: String, // code: ticker or symbol
    short_name: String,
    bid: Number, // bid: the highest price the buyer is willing to pay
    offer: Number, // offer: the lowest price the seller is will to accept
    last: Number, // last: the actual price of the most recent completed transaction
    close: Number, //
    high: Number,
    low: Number,
    open: Number,
    chg_today: Number,
    vol_today: Number,
    num_trades: Number,
  },
  {
    toJSON: {
      transform(doc, rest: any) {
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

QuoteSchema.methods.findSimilarTypes = function (
  this: HydratedDocument<IQuote, IQuoteMethods>,
  cb?: (value: any[]) => Promise<void>,
) {
  const query = mongoose.model("quote").find({ code: this.code });
  return cb ? query.then(cb) : query;
};

QuoteSchema.statics.findBySymbol = function (
  this: IQuoteModel,
  symbol: string,
) {
  return this.find({
    code: symbol,
  });
};

// Static method for finding by code
QuoteSchema.statics.findByCode = function (this: IQuoteModel, code: string) {
  return this.find({ code });
};

export type QuoteDocument = HydratedDocument<IQuote, IQuoteMethods>;
const Quote: IQuoteModel =
  (mongoose.models.quote as IQuoteModel) ||
  mongoose.model<IQuote, IQuoteModel>("quote", QuoteSchema);

export default Quote;
