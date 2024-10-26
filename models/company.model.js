const {model, Schema} = require('mongoose');

const companySchema = new Schema({
	name: String,
	ticker: String,
	description: String,
	industry: String,
	sector: String,
	key_people: Array,
	date_listed: Date, // ipo
	esteblished_date: Date,
	outstanding_shares: Number
});
companySchema.index({'ticker' : 1});

const Company = module.exports = model('company', companySchema);

exports.findByName = function(name) {
    return Company.find({'name': name})
}