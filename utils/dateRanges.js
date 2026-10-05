function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function subDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() - n);
  return x;
}

function subMonths(d, n) {
  const x = new Date(d);
  const day = x.getDate();
  x.setDate(1);
  x.setMonth(x.getMonth() - n);
  const lastDay = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate();
  x.setDate(Math.min(day, lastDay));
  return x;
}

function subYears(d, n) {
  const x = new Date(d);
  x.setFullYear(x.getFullYear() - n);
  return x;
}

/**
 * Returns { start, end } for a given frame.
 * `now` defaults to current time — pass a fixed date in tests.
 */
function getRange(frame, now = new Date()) {
  const end = endOfDay(now);

  switch (frame) {
    // ---- Rolling / trailing ----
    // case '5d':
    //     return { start: startOfDay(subDays(now, 4)), end };  // today + 4 back = 5 days
    case "1d":
      return { start: startOfDay(subDays(now, 1)), end }; // today + 1 back = 2 days
    case "5d":
      return { start: startOfDay(subDays(now, 4)), end }; // today + 4 back = 5 days
    case "1m":
      return { start: startOfDay(subMonths(now, 1)), end };
    case "6m":
      return { start: startOfDay(subMonths(now, 6)), end };
    case "1y":
      return { start: startOfDay(subYears(now, 1)), end };
    case "5y":
      return { start: startOfDay(subYears(now, 5)), end };
    case "10y":
      return { start: startOfDay(subYears(now, 10)), end };

    // ---- Period-to-date ----
    case "mtd": {
      // month-to-date
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfDay(s), end };
    }
    case "qtd": {
      // quarter-to-date (bonus)
      const q = Math.floor(now.getMonth() / 3) * 3;
      const s = new Date(now.getFullYear(), q, 1);
      return { start: startOfDay(s), end };
    }
    case "ytd": {
      // year-to-date
      const s = new Date(now.getFullYear(), 0, 1);
      return { start: startOfDay(s), end };
    }

    // ---- Everything ----
    case "all":
      return { start: null, end };

    default:
      throw new Error(`Unknown frame: ${frame}`);
  }
}

const FRAMES = {
  // Rolling
  "5d": () => getRange("5d"),
  "1m": () => getRange("1m"),
  "6m": () => getRange("6m"),
  "1y": () => getRange("1y"),
  "5y": () => getRange("5y"),
  "10y": () => getRange("10y"),

  // Period-to-date
  mtd: () => getRange("mtd"),
  qtd: () => getRange("qtd"),
  ytd: () => getRange("ytd"),

  // Everything
  all: () => getRange("all"),
};

/**
 * @params {String} date
 * @params {Number} num
 * @params {String} type
 * @returns {Date} date
 */
function calculateStartDate(date, num, type) {
  let types = ["min", "h", "d", "m", "y"];
  if (!date) throw new Error("No required params: date");
  if (!num) throw new Error("No required params: num");
  if (!type) throw new Error("No required params: type");
  if (!types.includes(type))
    throw new Error("Type must be one of the following " + types.join(","));
  if (typeof date == "string" || typeof date == "number") date = new Date(date);
  let _date = new Date(date);

  switch (type) {
    case types[0]:
      _date.setMinutes(date.getMinutes() - num);
      break;
    case types[1]:
      _date.setHours(date.getHours() - num);
      break;
    case types[2]:
      _date.setDate(date.getDate() - num);
      break;
    case types[3]:
      _date.setMonth(date.getMonth() - num);
      break;
    case types[4]:
      _date.setFullYear(date.getFullYear() - num);
      break;
  }

  return _date;
}

module.exports = { getRange, startOfDay, endOfDay, FRAMES, calculateStartDate };
