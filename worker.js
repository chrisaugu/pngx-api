const mongoose = require("mongoose");
const celery = require("celery-node");
require("dotenv").config();
const tasks = require("./tasks");
const { initDatabase } = require("./database");

const worker = celery.createWorker(
  process.env.REDIS_URL,
  "redis://127.0.0.1:6379"
);

// Creating an instance for MongoDB
initDatabase()
  .on("connected", function () {
    console.log(
      "[Celery_Worker]: Connected: Successfully connect to mongo server on the worker"
    );
  })
  .on("error", function () {
    console.log(
      "[Celery_Worker]: Error: Could not connect to MongoDB. Did you forget to run 'mongod'?"
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
