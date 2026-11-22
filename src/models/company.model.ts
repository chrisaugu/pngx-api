import { HydratedDocument, model, Schema } from "mongoose";
import { ICompany } from "../types/nuku";

const companySchema = new Schema<ICompany>(
  {
    name: String,
    symbol: String,
    description: String,
    industry: String,
    sector: String,
    key_people: Array,
    date_listed: Date, // ipo
    established_date: Date,
    outstanding_shares: Number,
    exempt_foregin_entity: Boolean,
    pngx_profile_url: String,
    logo_src: String,
    internet_address: String,
    registered_office_address: String,
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
  },
);

companySchema.index({ symbol: 1 });

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

/**
 * Update company data by symbol code/symbol
 * @param {VoidFunction} cb
 * @returns
 * @usage: company.updateData((err, res) => {})
 */
companySchema.methods.updateData = function (cb: VoidFunction) {
  return this.find({ code: this.code }, cb);
};

/**
 * byName query helper
 * @param {string} name
 * @returns
 * @usage: Company.find().byName('name').exec((err, res) => {})
 */
companySchema.query.byName = function (name: string) {
  return this.where({ name: new RegExp(name, "i") });
};

/**
 * find company by symbol code/symbol
 * @param {VoidFunction} cb
 * @returns
 * @usage: Company.findByCode((err, res) => {})
 */
companySchema.statics.findByCode = function (cb: VoidFunction) {
  return this.find({ code: this.code }, cb);
};

/**
 * find company by name
 * @param {string} name
 * @returns
 * @usage: Company.findByName('name').then((res) => {}).catch((err) => {})
 */
companySchema.statics.findByName = function (name: string) {
  return this.find({ name: new RegExp(name, "i") });
};

// export type ICompany = InferSchemaType<typeof companySchema>;
export type WebhookDocument = HydratedDocument<ICompany>;
const Company = model<ICompany>("companies", companySchema);

export default Company;
