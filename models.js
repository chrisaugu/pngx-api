const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// models
const quoteSchema = new Schema({
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
	num_trades: Number
});
quoteSchema.index({'code' : 1, 'date' : 1});
quoteSchema.methods.findSimilarTypes = function(cb) {
	return mongoose.model('quote').find({ code: this.code }, cb);
};
const Stock = mongoose.model('quote', quoteSchema);

const companySchema = new Schema({
	name: String,
	code: String,
	description: String,
	industry: String,
	sector: String,
	key_people: Array,
	date_listed: Date, // ipo
	esteblished_date: Date,
	outstanding_shares: Number
});
companySchema.index({'code' : 1});
companySchema.methods.findByCode = function(cb) {
	return this.find({ code: this.code }, cb);
};
companySchema.query.byName = function(name) {
	return this.where({ name: new RegExp(name, 'i') });
  };
const Company = mongoose.model('company', companySchema);


// {
//   date: ISODate("2020-01-03T05:00:00.000Z"),
//   symbol: 'AAPL',
//   volume: 146322800,
//   open: 74.287498,
//   adjClose: 73.486023,
//   high: 75.144997,
//   low: 74.125,
//   close: 74.357498
// }
const tickerSchema = new Schema({
	date: Date,
	code: String,
	bid: Number,
	offer: Number,
	last: Number,
	close: Number,
	high: Number,
	low: Number,
	open: Number,
	change: Number,
	volume: Number,
	num_trades: Number
},
{
	timeseries: { 
		timeField: "date", 
		metaField: "symbol",
		granularity: "days"
	},
	autoCreate: false,
// },
// {
// 	timestamps: {
// 		currentTime: () => Math.floor(Date.now() / 1000)
// 	}
});
tickerSchema.index({ 'symbol' : 1, 'date' : 1});
const Ticker = mongoose.model('ticker', tickerSchema);

module.exports = {
    Stock,
    Ticker,
    Company
}