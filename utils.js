const Papa = require("papaparse");
const csv = require("csv-parser");
const needle = require("needle");
const { format, parse, formatDate } = require("date-fns");
const { formatInTimeZone } = require("date-fns-tz");
const {
  SYMBOLS,
  OLD_SYMBOLS,
  LISTED_COMPANIES,
  PNGX_DATA_URL,
  PNGX_URL,
  LOCAL_TIMEZONE,
  LOCAL_TIMEZONE_FORMAT,
} = require("./constants");
const _ = require('lodash');

const csvOptions = {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  worker: true,
};

function date_split(date) {
  const [month, day, year] = date.split("/");
  const result = [year, month, day].join("-");

  return result;
}

/**
 * This function takes in date of any format and spits out the desired format `yyyy/MM/dd` used here
 * @param {*} date
 * @returns Date
 */
function format_date(date) {
  // only for STO's date i.e. 30/09/2024 - dd/MM/yyyy
  if (
    date.match(
      new RegExp(
        "^((0[1-9]|[12][0-9]|3[01])/(01|03|05|07|08|10|12)/([0-9]{4}))|((0[1-9]|[12][0-9]|30)/(04|06|09|11)/([0-9]{4}))|((0[1-9]|1[0-9]|2[0-8])/02/([0-9]{4}))|(29/02/([0-9]{2}(0[48]|[2468][048]|[13579][26])|([048][048]|[13579][26])00))$"
      )
    )
  ) {
    let parseDate = parse(date, "dd/MM/yyyy", new Date());
    // fixing timezone issues on clever-cloud.io
    let localTime = formatInTimeZone(
      parseDate,
      LOCAL_TIMEZONE,
      LOCAL_TIMEZONE_FORMAT
    );
    return new Date(localTime);
  }
  // rest of the quotes 2019/11/18 - yyyy/MM/dd
  // else if (date.match(/\d{2,4}-\d{1,2}-\d{1,2}/)) {

  // }
  else {
    return new Date(date);
  }
}

function normalize_data(data) {
  let quote = {};
  let formattedDate = format_date(data["Date"]);

  quote["date"] = formattedDate;
  quote["code"] = data["Short Name"];
  quote["short_name"] = data["Short Name"];
  quote["bid"] = convertStringToNumber(data["Bid"]);
  quote["offer"] = convertStringToNumber(data["Offer"]);
  quote["last"] = convertStringToNumber(data["Last"]);
  quote["close"] = convertStringToNumber(data["Close"]);
  quote["high"] = convertStringToNumber(data["High"]);
  quote["low"] = convertStringToNumber(data["Low"]);
  quote["open"] = convertStringToNumber(data["Open"]);
  quote["chg_today"] = convertStringToNumber(data["Chg. Today"]);
  quote["vol_today"] = convertStringToNumber(data["Vol. Today"]);
  quote["num_trades"] = convertStringToNumber(data["Num. Trades"]);

  return quote;
}

/**
 *
 * @param {String} str
 * @returns {Number}
 */
function convertStringToNumber(str) {
	if (_.isString(str)) {
		if (str.includes(",")) {
			let num = Number(str.split(",").join(""));
			return num;
		}
		else {
			return Number(str);
		}
	}
	else {
		return str;
	}
}

async function parallel(arr, fn, threads = 2) {
  const result = [];

  while (arr.length) {
    const res = await Promise.all(arr.splice(0, threads).map((x) => fn(x)));
    result.push(res);
  }
  return result.flat();
}

/**
 * Parses CSV format to JSON format for easy manipulation of data
 */
function parse_csv_to_json2(body) {
  console.log("parsing csv to json");
  var i = [];
  // split the data into array by whitespaces
  // var o = body.split(/\r\n|\n/);

  // split the first row of that array only by comma (,) to get headers
  // var a = o[0].split(",");

  // loop through the other rows to obtain data
  for (
    var o = body.split(/\r\n|\n/), a = o[0].split(","), s = 1;
    s < o.length;
    s++
  ) {
    // split each row by comma
    var l = o[s].split(",");
    // compare the splited row with the first/header row
    if (l.length == a.length) {
      // run through the header row
      // attaches splited row to the header row
      // then store it on variable d
      // create array by pushing the stored data to the variable i
      for (var d = {}, u = 0; u < a.length; u++) d[a[u]] = l[u];
      i.push(d);
    }
  }
  // i[i.length -1]
  return i;
}

function parse_csv_to_json(csv) {
  // Parse local CSV file
  // Stream big file in worker thread
  let { errors, data, meta } = Papa.parse(csv, {
    ...csvOptions,
    // step: function(results) {
    // 	results['data'] = normalize_data(results.data)
    // },
    // chunk: function(chunks) {
    // 	console.log(chunks)
    // },
    // complete: function(results) {
    // 	console.log("Finished:", results.data);
    // }
  });

  if (errors.length > 0) throw new Error(errors);

  return data;
}

module.exports = {
  parse_csv_to_json,
  parallel,
  normalize_data,
  format_date,
  date_split,
};
