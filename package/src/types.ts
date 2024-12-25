export type Stock = {

}

export type Quote = {
	date: Date;
	code: string;
	short_name: string;
	bid: number;
	offer: number;
	last: number;
	close: number;
	high: number;
	low: number;
	open: number;
	chg_today: number;
	vol_today: number;
	num_trades: number;
};

export type Company = {
	name: String,
	ticker: String,
	description: String,
	industry: String,
	sector: String,
	key_people: [],
	date_listed: Date, // ipo
	esteblished_date: Date,
	outstanding_shares: Number
};

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

export type Ticker = {
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
}

enum QUOTES {
	'BSP',
	'CCP',
	'CGA',
	'COY',
	'CPL',
	'KAM',
	'KSL',
	'NEM',
	'NGP',
	'NIU',
	'SST',
	'STO'
};

enum OLD_QUOTES {
	'NCM',
	'OSH'
};

export type TAPIResponse = {
	status: number;
	message: string;
	symbols: string;
	data: any;
	api: string;
	time: Date;
};

export type TAPIResult = {
	status: number;
	date: Date;
	last_updated: Date;
	data: []
}