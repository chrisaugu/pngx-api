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

const Quote = module.exports = mongoose.model('quote', quoteSchema);

exports.findBySymbol = function(symbol) {
	return Quote.find({
		code: symbol
	});
}