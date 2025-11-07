import { model, Schema } from "mongoose";
import { ICompany } from "../types/nuku";

const companySchema = new Schema<ICompany>(
  {
    name: String,
    ticker: String,
    description: String,
    industry: String,
    sector: String,
    key_people: Array,
    date_listed: Date, // ipo
    esteblished_date: Date,
    outstanding_shares: Number,
    pngx_profile_url: String,
    logo: {
      data: Buffer,
      contentType: String,
    },
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
    timestamps: true,
  }
);

companySchema.index({ ticker: 1 });

// companySchema.pre("find", (next) => {
//   delete this.__v;
//   delete this._id;
//   delete this.$createdAt;
//   delete this.$updatedAt;
//   next();
// });

companySchema.methods.findByCode = (cb: any) => {
  return this.find({ code: this.code }, cb);
};

companySchema.query.byName = (name: string) => {
  return this.where({ name: new RegExp(name, "i") });
};

companySchema.statics.findByName = (name) => {
  return this.find({ name: new RegExp(name, "i") });
};

const Company = model("company", companySchema);

export default Company;