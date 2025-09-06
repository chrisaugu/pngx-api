const { initDatabase } = require("../database");
const { Stock, Ticker } = require("../models/index");
const { SYMBOLS } = require("../constants");

initDatabase()
  .on("connected", function () {
    console.log(
      "[Main_Thread]: Connected: Successfully connect to mongo server"
    );
  })
  .on("error", function () {
    console.log(
      "[Main_Thread]: Error: Could not connect to MongoDB. Did you forget to run 'mongod'?"
    );
  });

function getRandomPrice() {
  return (Math.random() * 1000 + 100).toFixed(2);
}

function getRandomNumber() {
  return (Math.random() * 1000 + 100).toFixed(0);
}

function getStockData() {
  return SYMBOLS.map((ticker) => ({
    ticker,
    price: getRandomPrice(),
    timestamp: new Date().toISOString(),
  }));
}

async function getTickers() {
  // try {
  //   const result = await Ticker.find({});
  //   return result;
  // } catch (error) {
  //   console.error(error);
  // }

  return SYMBOLS.map((ticker) => {
    let close = getRandomPrice();
    let open = getRandomPrice();
    let change = open - close;

    return {
      date: new Date().toISOString(),
      symbol: ticker,
      high: getRandomPrice(),
      low: getRandomPrice(),
      open: open,
      close: close,
      change: change,
      volume: getRandomNumber(),
    };
  });
}

async function getQuotes() {
  // try {
  //   const result = await Stock.find({});
  //   return result;
  // } catch (error) {
  //   console.error(error);
  // }

  return SYMBOLS.map((quote) => {
    let close = getRandomPrice();
    let open = getRandomPrice();
    let change = open - close;

    return {
      date: new Date().toISOString(),
      code: quote,
      bid: getRandomPrice(),
      offer: getRandomPrice(),
      last: getRandomPrice(),
      close: close,
      high: getRandomPrice(),
      low: getRandomPrice(),
      open: open,
      chg_today: change,
      vol_today: getRandomNumber(),
      num_trades: getRandomNumber(),
    };
  });
}


let randomFactor = 25 + Math.random() * 25;
const samplePoint = (i) => (
  i *
  (0.5 +
      Math.sin(i / 1) * 0.2 +
      Math.sin(i / 2) * 0.4 +
      Math.sin(i / randomFactor) * 0.8 +
      Math.sin(i / 50) * 0.5) +
  200 +
  i * 2);

function generateData(
  numberOfCandles = 500,
  updatesPerCandle = 5,
  startAt = 100
) {
  const createCandle = (val, time) => ({
      time,
      open: val,
      high: val,
      low: val,
      close: val,
  });

  const updateCandle = (candle, val) => ({
      time: candle.time,
      close: val,
      open: candle.open,
      low: Math.min(candle.low, val),
      high: Math.max(candle.high, val),
  });

  randomFactor = 25 + Math.random() * 25;
  const date = new Date(Date.UTC(2018, 0, 1, 12, 0, 0, 0));
  const numberOfPoints = numberOfCandles * updatesPerCandle;
  const initialData = [];
  const realtimeUpdates = [];
  let lastCandle;
  let previousValue = samplePoint(-1);
  for (let i = 0; i < numberOfPoints; ++i) {
      if (i % updatesPerCandle === 0) {
          date.setUTCDate(date.getUTCDate() + 1);
      }
      const time = date.getTime() / 1000;
      let value = samplePoint(i);
      const diff = (value - previousValue) * Math.random();
      value = previousValue + diff;
      previousValue = value;
      if (i % updatesPerCandle === 0) {
          const candle = createCandle(value, time);
          lastCandle = candle;
          if (i >= startAt) {
              realtimeUpdates.push(candle);
          }
      } else {
          const newCandle = updateCandle(lastCandle, value);
          lastCandle = newCandle;
          if (i >= startAt) {
              realtimeUpdates.push(newCandle);
          } else if ((i + 1) % updatesPerCandle === 0) {
              initialData.push(newCandle);
          }
      }
  }

  return {
      initialData,
      realtimeUpdates,
  };
}
const data = generateData(2500, 20, 1000);

// simulate real-time data
function* getNextRealtimeUpdate(realtimeData) {
  for (const dataPoint of realtimeData) {
      yield dataPoint;
  }
  return null;
}
const streamingDataProvider = getNextRealtimeUpdate(data.realtimeUpdates);


  // const intervalID = setInterval(() => {
  //     const update = streamingDataProvider.next();
  //     if (update.done) {
  //         clearInterval(intervalID);
  //         return;
  //     }
  //     series.update(update.value);
  // }, 100);

module.exports = {
  getStockData,
  getQuotes,
  getTickers,
};
