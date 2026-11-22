import { EventEmitter } from "node:events";
import { format } from "date-fns/format";
import cron from "node-cron";
import _ from "lodash";
import { initDatabase } from "./database";
import { Stock, Ticker } from "./models";
import {
  get_quotes_from_pngx,
  get_quotes_from_internet_archive,
} from "./tasks";
import { normalize_data } from "./utils";
import { SYMBOLS, ALL_COMPANIES } from "./constants";
import { IQuote } from "./types/nuku";

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
      "[Main_Thread]: Connected: Successfully connect to mongo server",
    );

    console.log(
      "Stocks info will be updated every morning at 30 minutes past 8 o'clock",
    );
    SYMBOLS.forEach(async (quote) => {
      const dbData = await fetchDataFromDB(quote);
      const sourceData = await fetchDataFromPNGX(quote);
      // const sourceData = await fetchDataFromInternetArchive(quote);

      if (!_.isArray(dbData) && !_.isArray(sourceData)) {
        throw new Error("dbData and sourceData must be both arrays");
      }

      run(dbData, sourceData);
    });
  })
  .on("error", function () {
    console.error(
      "[Main_Thread]: Error: Could not connect to MongoDB. Did you forget to run 'mongod'?",
    );
  });

/**
 * Fetch data from db
 * @param {IQuote} quote
 * @returns
 */
async function fetchDataFromDB(quote: string) {
  console.log("Fetching quotes for " + quote + " from DB");
  return new Promise((resolve, reject) => {
    Stock.findBySymbol(quote).then(resolve).catch(reject);
  });
}

/**
 * Fetch data from data-source
 * @param {IQuote} quote
 * @returns
 */
async function fetchDataFromPNGX(quote: string) {
  console.log("Fetching quotes for " + quote + " from PNGX");
  return new Promise((resolve, reject) => {
    get_quotes_from_pngx(quote)
      .then((quotes) => quotes.map((quote) => normalize_data(quote)))
      .then(resolve)
      .catch(reject);
  });
}

async function fetchDataFromInternetArchive(quote: string) {
  console.log("Fetching quotes for " + quote + " from Internet Archive");
  return new Promise((resolve, reject) => {
    get_quotes_from_internet_archive(quote)
      .then((quotes) => quotes.map((quote) => normalize_data(quote)))
      .then(resolve)
      .catch(reject);
  });
}

const dataComparatorAsc = (a: any, b: any) =>
  new Date(a.date).getTime() - new Date(b.date).getTime();

function load(data: any) {
  Stock.insertMany(data)
    .then(() => {
      console.log("Quotes inserted into");
    })
    .catch((error) => {
      console.error(error);
    });

  Ticker.insertMany(data)
    .then(() => {
      console.log("Data inserted");
    })
    .catch((error) => {
      console.error(error);
    });
}

function run(dbData: IQuote[] = [], source: IQuote[] = []) {
  const duplicates: IQuote[] = [];
  const missingInDb: IQuote[] = [];
  const uniqueInSource: IQuote[] = [];
  dbData.sort(dataComparatorAsc);
  source.sort(dataComparatorAsc);

  const dbDataMap = new Map(
    dbData.map((item) => [format(item.date, "yyyy-MM-dd"), item]),
  );

  for (let i = 0; i < source.length; i++) {
    const sourceItem = source[i];
    const key = format(sourceItem["date"], "yyyy-MM-dd");
    const dbItem = dbDataMap.get(key);
    if (dbItem) {
      //   source.filter((d) => d.date != dbItem.date);
      // Compare all properties to check if it's an exact duplicate
      const isExactDuplicate = Object.keys(sourceItem).every(
        (prop) =>
          JSON.stringify(sourceItem[prop]) === JSON.stringify(dbItem[prop]),
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

  if (missingInDb.length > 0) {
    load(missingInDb);
  }
}

type DataEvent = {};
type Data = {};

/**
 * This etc process uses event-emitter to invoke methods
 */
class ETL {
  private event: EventEmitter<DataEvent>;
  private dataSources: Record<string, Data>[];

  constructor() {
    this.dataSources = [];
    this.event = new EventEmitter();

    this.event.on("extract", this.extract);
    this.event.on("transform", this.transform);
    this.event.on("reconcile", this._reconcile);
    this.event.on("load", this.load);
  }

  addSource(source: Data) {
    this.dataSources.push(source);
  }

  addSources(sources: Data[]) {
    this.dataSources.push(...sources);
  }

  run() {
    if (!(this.dataSources.length > 0)) {
      throw new Error("Atleast one data-source is required.");
    }

    this.event.emit("extract");
  }

  /**
   * Fetch csv
   */
  private _fetch() {}

  /**
   * Extract csv data from data data-source
   */
  private extract(source: Data) {
    this.event.emit("transform", source);
  }

  /**
   * Transform csv data into
   */
  private transform(data: Data) {
    this.event.emit("reconcile", data);
  }

  /**
   * Reconciliation process
   * removes duplicates
   * aggregate missing data
   */
  private _reconcile(data: Data) {
    this.event.emit("load", data);
  }

  /**
   * Load data into respective data-store
   */
  private load(data: Data) {
    this.event.emit("load", data);
  }
}

// let etl = new ETL();
// etl.addSources(["https://www.pngx.com.pg/data"]);
// etl.run();

// https://web.archive.org/web/20191211162040/http://www.pngx.com.pg/data/CCP.csv
