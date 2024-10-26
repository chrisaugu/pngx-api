const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
	symbol: String,
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
		granularity: "hours"
	},
	autoCreate: false,
// },
// {
// 	timestamps: {
// 		currentTime: () => Math.floor(Date.now() / 1000)
// 	}
});
tickerSchema.index({ 'symbol' : 1, 'date' : 1});

const Ticker = module.exports = mongoose.model('ticker', tickerSchema);

exports.findBySymbol = function(symbol) {
	return Ticker.find({symbol: symbol});
}