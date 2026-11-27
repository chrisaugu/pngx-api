import mongoose, {
  HydratedDocument,
  model,
  Model,
  Query,
  QueryWithHelpers,
  Schema,
} from "mongoose";
import { ICompany } from "../types/nuku";

export interface ICompanyMethods {
  updateData(cb?: (err: any, res?: any) => void): any;
}

export interface ICompanyQueryHelpers {
  byName(
    name: string,
  ): QueryWithHelpers<any, HydratedDocument<ICompany>, ICompanyQueryHelpers>;
}

export interface ICompanyModel
  extends Model<ICompany, ICompanyQueryHelpers, ICompanyMethods> {
  findByCode(code: string, cb?: (err: any, res?: any) => void): any;
  findByName(name: string): any;
}

const companySchema = new Schema<
  ICompany,
  ICompanyModel,
  ICompanyMethods,
  ICompanyQueryHelpers
>(
  {
    name: String,
    symbol: String,
    ticker: String,
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
      transform(doc, rest: any) {
        delete rest.__v;
        delete rest._id;
        delete rest.createdAt;
        delete rest.updatedAt;
        return rest;
      },
    },
    toObject: {
      transform(_doc, ret: any) {
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
      },
    },
    timestamps: true,
  },
);

companySchema.index({ symbol: 1 });
companySchema.index({ ticker: 1 });

companySchema.pre<Query<any, HydratedDocument<ICompany>>>(
  /^find/,
  function (next) {
    this.select("-createdAt -updatedAt");
    next();
  },
);

/**
 * Update company data by symbol code/symbol
 * @param {Function} [cb]
 * @returns
 * @usage: company.updateData((err, res) => {})
 */
companySchema.methods.updateData = function (
  this: HydratedDocument<ICompany, ICompanyMethods>,
  cb?: (err: any, res?: any) => void,
) {
  const query = this.model("companies").find({ symbol: this.symbol });
  if (cb && typeof cb === "function") {
    query.then((res: any) => cb(null, res)).catch((err: any) => cb(err));
  }
  return query;
};

/**
 * byName query helper
 * @param {string} name
 * @returns
 * @usage: Company.find().byName('name').exec((err, res) => {})
 */
companySchema.query.byName = function (
  this: QueryWithHelpers<any, HydratedDocument<ICompany>, ICompanyQueryHelpers>,
  name: string,
) {
  return this.where({ name: new RegExp(name, "i") });
};

/**
 * find company by symbol code/symbol
 * @param {string} code
 * @param {Function} [cb]
 * @returns
 * @usage: Company.findByCode('BSP', (err, res) => {})
 */
companySchema.statics.findByCode = function (
  this: ICompanyModel,
  code: string,
  cb?: (err: any, res?: any) => void,
) {
  const query = this.find({
    $or: [{ symbol: code }, { ticker: code }],
  });
  if (cb && typeof cb === "function") {
    query.then((res: any) => cb(null, res)).catch((err: any) => cb(err));
  }
  return query;
};

/**
 * find company by name
 * @param {string} name
 * @returns
 * @usage: Company.findByName('name').then((res) => {}).catch((err) => {})
 */
companySchema.statics.findByName = function (
  this: ICompanyModel,
  name: string,
) {
  return this.find({ name: new RegExp(name, "i") });
};

export type CompanyDocument = HydratedDocument<ICompany, ICompanyMethods>;
export type WebhookDocument = CompanyDocument;
const Company: ICompanyModel =
  (mongoose.models.companies as ICompanyModel) ||
  model<ICompany, ICompanyModel>("companies", companySchema);

export default Company;
