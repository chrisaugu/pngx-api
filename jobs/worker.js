const mongoose = require("mongoose");
const celery = require("celery-node");
const tasks = require("../tasks");
const { initDatabase } = require("../database");
const Env = require("../config/env");

const worker = celery.createWorker(Env.redis.broker, Env.redis.backend);

initDatabase()
  .on("connected", async function () {
    console.log(
      "[Main_Thread]: Connected: Successfully connect to mongo server"
    );

    console.log(
      "Stocks info will be updated every morning at 30 minutes past 8 o'clock"
    );
    // cron.schedule("30 8 * * *", async () => {
    SYMBOLS.forEach(async (quote) => {
      const dbData = await fetchDataFromDB(quote);
      const sourceData = await fetchDataFromPNGX(quote);

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

// registering all tasks
worker.register("tasks.data_fetcher", tasks.data_fetcher);
worker.register("tasks.stock_fetcher", tasks.stock_fetcher);

// starts all workers
worker.start();

// tasks = registerTasks([])
// tasks.call('fetch_data_from_pngx', []).then(data => {

// });

function createWorker() {
  return new Promise(function (resolve, reject) {
    const worker = new Worker("./thread_workers.js", {
      workerData: { thread_count: THREAD_COUNT },
    });
    worker.on("message", (data) => {
      resolve(data);
    });
    worker.on("error", (msg) => {
      reject(`An error ocurred: ${msg}`);
    });
  });
}
