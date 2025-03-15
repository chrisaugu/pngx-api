const { model, Schema } = require("mongoose");

const companySchema = new Schema({
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
});
companySchema.index({ ticker: 1 });
companySchema.methods.findByCode = function (cb) {
  return this.find({ code: this.code }, cb);
};
companySchema.query.byName = function (name) {
  return this.where({ name: new RegExp(name, "i") });
};

const Company = module.exports = model("company", companySchema);

exports.findByName = function (name) {
  return Company.find({ name: name });
};
