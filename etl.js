const { EventEmitter } = require("node:events");
const { format } = require("date-fns/format");
const cron = require("node-cron");
const _ = require("lodash");
const { initDatabase } = require("./database");
const { Stock, Ticker } = require("./models");
const { get_quotes_from_pngx } = require("./tasks");
const { normalize_data } = require("./utils");
const { SYMBOLS } = require("./constants");
const logger = require("./libs/logger");

/**
 * TODO: change the way this etl works
 * instead of;
 * 1. looping thru each symbols
 * 2. fetch their csv file and records from db
 * 3. transform the csv data into JSON
 * 4. remove duplicates
 * 5. find missing data
 * 6. insert missing data into the database.
 * 7. repeat for next symbol.
 *
 * A better approach would to;
 * 1. loop thru each symbols
 * 2. fetch their csv file and records from db
 * 3. store all the data on a temporary variable
 * 4. transform all the data
 * 5. reconcile or remove duplicates and
 * 6. find missing
 * 7. aggregate all missing data
 * 8. insert all aggregated missing data at once
 */
initDatabase()
  .on("connected", async function () {
    console.log(
      "[Main_Thread]: Connected: Successfully connect to mongo server"
    );

    logger.info("Informational message");
    logger.info("Server started on port 3000");
    logger.error("Database connection failed");

    console.log(
      "Stocks info will be updated every morning at 30 minutes past 8 o'clock"
    );
    // cron.schedule("30 8 * * *", async () => {
    SYMBOLS.forEach(async (quote) => {
      let dbData = await fetchDataFromDB(quote);
      let sourceData = await fetchDataFromPNGX(quote);

      if (!_.isArray(dbData) && !_.isArray(sourceData)) {
        throw new Error("dbData and sourceData must be both arrays");
      }

      run(dbData, sourceData);
    });
    // });
  })
  .on("error", function () {
    console.log(
      "[Main_Thread]: Error: Could not connect to MongoDB. Did you forget to run 'mongod'?"
    );
  });

/**
 * Fetch data from db
 * @param {*} quote
 * @returns
 */
async function fetchDataFromDB(quote) {
  console.log("Fetching quotes for", quote, "from DB");
  return new Promise((resolve, reject) => {
    Stock.findBySymbol(quote).then(resolve).catch(reject);
  });
}

/**
 * Fetch data from data-source
 * @param {*} quote
 * @returns
 */
async function fetchDataFromPNGX(quote) {
  console.log("Fetching quotes for", quote, "from PNGX");
  return new Promise((resolve, reject) => {
    get_quotes_from_pngx(quote)
      .then((quotes) => quotes.map((quote) => normalize_data(quote)))
      .then(resolve)
      .catch(reject);
  });
}

const dataComparatorAsc = (a, b) =>
  new Date(a.date).getTime() - new Date(b.date).getTime();

function load(data) {
  Stock.insertMany(data)
    .then(() => {
      console.log("Quotes inserted into");
    })
    .catch((error) => {
      console.log(error);
    });

  Ticker.insertMany(data)
    .then(() => {
      console.log("Data inserted");
    })
    .catch((error) => {
      console.log(error);
    });
}

function run(dbData = [], source = []) {
  const duplicates = [];
  const missingInDb = [];
  const uniqueInSource = [];
  dbData.sort(dataComparatorAsc);
  source.sort(dataComparatorAsc);

  const dbDataMap = new Map(
    dbData.map((item) => [format(item.date, "yyyy-MM-dd"), item])
  );

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
    load(missingInDb);
  }
}

/**
 * This etc process uses event-emitter to invoke methods
 */
class ETL {
  #event;
  #dataSources = [];

  constructor() {
    this.#event = new EventEmitter();

    this.#event.on("extract", this.#extract);
    this.#event.on("transform", this.#transform);
    this.#event.on("reconcile", this.#_reconcile);
    this.#event.on("load", this.#load);
  }

  addSource(source) {
    this.#dataSources.push(source);
  }

  addSources(sources) {
    this.#dataSources.push(...sources);
  }

  run() {
    if (!this.#dataSources.length > 0) {
      throw new Error("Atleast one data-source is required.");
    }

    this.#event.emit("extract");
  }

  /**
   * Fetch csv
   */
  #_fetch() {}

  /**
   * Extract csv data from data data-source
   */
  #extract(source) {
    this.#event.emit("transform", data);
  }

  /**
   * Transform csv data into
   */
  #transform(data) {
    this.#event.emit("reconcile", data);
  }

  /**
   * Reconciliation process
   * removes duplicates
   * aggregate missing data
   */
  #_reconcile(data) {
    this.#event.emit("load", data);
  }

  /**
   * Load data into respective data-store
   */
  #load() {
    this.#event.emit("load", data);
  }
}

// let etl = new ETL();
// etl.addSources(["https://www.pngx.com.pg/data"]);
// etl.run();
