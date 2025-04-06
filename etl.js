const { mongoose } = require("mongoose");
const _ = require("lodash");
const { initDatabase } = require("./database");
const { Stock } = require("./models");
const { get_quotes_from_pngx } = require("./tasks");
const { normalize_data } = require("./utils");
const { format } = require("date-fns/format");
const { SYMBOLS } = require("./constants");

initDatabase()
  .on("connected", async function () {
    console.log(
      "[Main_Thread]: Connected: Successfully connect to mongo server"
    );

    SYMBOLS.forEach(async (quote) => {
      // let quote = "NGP"
      let dbData = await fetchDataFromDB(quote);
      let sourceData = await fetchDataFromPNGX(quote);

      if (!_.isArray(dbData) && !_.isArray(sourceData))
        throw new Error("dbData and sourceData must be both arrays");

      runSideBySide(dbData, sourceData);
    });
  })
  .on("error", function () {
    console.log(
      "[Main_Thread]: Error: Could not connect to MongoDB. Did you forget to run 'mongod'?"
    );
  });

async function fetchDataFromDB(quote) {
  console.log("Fetching quotes for", quote, "from DB");
  return new Promise((resolve, reject) => {
    Stock.findBySymbol(quote).then(resolve).catch(reject);
  });
}

async function fetchDataFromPNGX(quote) {
  console.log("Fetching quotes for", quote, "from PNGX");
  return new Promise((resolve, reject) => {
    get_quotes_from_pngx(quote)
      .then((quotes) => quotes.map((quote) => normalize_data(quote)))
      .then(resolve)
      .catch(reject);
  });
}

const dataComparatorAsc = (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime();

function runSideBySide(dbData = [], source = []) {
  let dups = {}; // are ones common on both dataset
  let toBeStored = []; // are the ones not preset on dateset taken from DB
  dbData.sort(dataComparatorAsc);
  source.sort(dataComparatorAsc);

  const dbDataMap = new Map(
    dbData.map((item) => [format(item.date, "yyyy-MM-dd"), item])
  );
  const duplicates = [];
  const missingInDb = [];
  const uniqueInSource = [];

  for (let i = 0; i < source.length; i++) {
    let sourceItem = source[i];
    let key = format(sourceItem["date"], "yyyy-MM-dd");
    const dbItem = dbDataMap.get(key);
    if (dbItem) {
      //   source.filter((d) => d.date != dbItem.date);
      // Compare all properties to check if it's an exact duplicate
      const isExactDuplicate = Object.keys(sourceItem).every(
        (prop) =>
          JSON.stringify(sourceItem[prop]) === JSON.stringify(dbItem[prop])
      );

      if (isExactDuplicate) {
        duplicates.push(sourceItem);
      } else {
        uniqueInSource.push(sourceItem);
      }
    } else {
      missingInDb.push(sourceItem);
    }
  }

  console.log(missingInDb);

  if (missingInDb.length > 0) {
    Stock.insertMany(missingInDb)
      .then(() => {
        console.log("Data inserted");
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
