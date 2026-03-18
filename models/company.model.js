const { model, Schema } = require("mongoose");

const companySchema = new Schema(
  {
    company_name: String,
    ticker: String,
    code: String,
    description: String,
    industry: String,
    sector: String,
    key_people: Array,
    date_listed: Date, // ipo
    esteblished_date: Date,
    is_foreign_entity: Boolean,
    share_registry: String,
    head_office: String,
    outstanding_shares: Number,
    pngx_profile_url: String,
    logo_url: String,
    logo: {
      data: Buffer,
      contentType: String,
    },
    market_cap_history: [
      {
        date: Date, // ISODate("2026-03-18"),
        value: Number, // 520000000,
        shares_outstanding: Number, // 260000000,
        price: Number, // 2.0,
      },
    ],
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

companySchema.index({ ticker: 1 });

// companySchema.pre("find", (next) => {
//   delete this.__v;
//   delete this._id;
//   delete this.$createdAt;
//   delete this.$updatedAt;
//   next();
// });

/**
 * Update company data by ticker code/symbol
 * @param {*} cb
 * @returns
 * @usage: company.updateData((err, res) => {})
 */
companySchema.methods.updateData = function (cb) {
  return this.find({ code: this.code }, cb);
};

/**
 * byName query helper
 * @param {*} name
 * @returns
 * @usage: Company.find().byName('name').exec((err, res) => {})
 */
companySchema.query.byName = function (name) {
  return this.where({ name: new RegExp(name, "i") });
};

/**
 * find company by ticker code/symbol
 * @param {*} cb
 * @returns
 * @usage: Company.findByCode((err, res) => {})
 */
companySchema.statics.findByCode = function (cb) {
  return this.find({ code: this.code }, cb);
};

/**
 * find company by name
 * @param {*} name
 * @returns
 * @usage: Company.findByName('name').then((res) => {}).catch((err) => {})
 */
companySchema.statics.findByName = function (name) {
  return this.find({ name: new RegExp(name, "i") });
};

const Company = (module.exports = model("company", companySchema));
