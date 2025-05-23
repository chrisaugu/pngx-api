const express = require("express");
const morgan = require("morgan");
const cron = require("node-cron");
const path = require("path");
// const boxen = require('boxen');
// const ora = require('ora');
// const spinner = ora('Connecting to the database...').start();
const { specs, swaggerUi } = require("./config/swagger");
const logger = require("./config/logger");
require("./constants");
require("./models/index");
const { initDatabase } = require("./database");
const {
  allowCrossDomain,
  allowMethodOverride,
  error404Handler,
  errorHandler,
  corsMiddleware,
  rateLimitMiddleware,
  errorLogHandler,
} = require("./middlewares");
const tasks = require("./tasks");
const myQueue = require("./queue");

// Creating express app
const app = express();

// Redis client
// let redisClient = redis.createClient({
// 	host: '127.0.0.1',
// 	port: 6379,
// }).on('error', (err) => {
// 	console.error('Redis connection error:', err);
// }).on('connect', () => {
// 	console.log('Connected to Redis');
// });
// If authentication is required, use the 'auth' method on the client
// redisClient.auth('your-redis-password');

// Celery client
// const celeryClient = celery.createClient(
// 	"redis://127.0.0.1:6379",
// 	"redis://127.0.0.1:6379"
// );

// const task = celeryClient.createTask("tasks.add");
// const result = task.applyAsync([1, 2]);
// result.get().then(data => {
// //   console.log(data);
// //   celeryClient.disconnect();
// });
// const taskKwargs = celeryClient.createTask("tasks.fetch_data_from_pngx");
// Promise.all([
//   task
//     .delay(1, 2)
//     .get()
//     .then(console.log),
//   task
//     .applyAsync([1, 2])
//     .get()
//     .then(console.log),
//   taskKwargs
//     .delay(1, 2, { c: 3, d: 4 })
//     .get()
//     .then(console.log),
//   taskKwargs
//     .applyAsync([1, 2], { c: 3, d: 4 })
//     .get()
//     .then(console.log)
// ]).then(() => celeryClient.disconnect());
// const task = celeryClient.createTask("tasks.stock_fetcher");
// const result = task.applyAsync([]);
// result.get().then(data => {
//   console.log(data);
//   celeryClient.disconnect();
// });

app.use(express.static(path.join(__dirname, "docs")));
app.use("/demo", express.static(path.join(__dirname, "demo")));
app.use(express.static(path.join(__dirname, "images")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({}));
app.use(morgan("combined", { stream: logger.stream.write }));
app.set('trust proxy', 1 /* number of proxies between user and server */)

// app.use(helmet);
app.use(corsMiddleware);
app.use(allowCrossDomain);
app.use(allowMethodOverride);

// catch 404 and forward to error handler
app.use(error404Handler);
// error handler
app.use(errorHandler);
app.use(errorLogHandler);

app.use("/api", rateLimitMiddleware);
app.use("/events", require("./routes/sse"));

// middleware to check data is present in cache
// app.use(checkCache);

initDatabase()
  .on("connected", function () {
    console.log(
      "[Main_Thread]: Connected: Successfully connect to mongo server"
    );
    /**
     * Schedule task to requests data from PNGX datasets every 2 minutes
     * The task requests and models the data them stores those data in db
     * Fetch data from PNGX.com every 2 minutes
     */

    // console.log('This script will run every 2 minutes to update stocks info.');
    // cron.schedule("*/2 * * * *", () => {
    console.log(
      "Stocks info will be updated every morning at 30 minutes past 8 o'clock"
    );
    cron.schedule("30 8 * * *", async () => {
      // tasks.data_fetcher();
      // const fetch_data_from_pngx = celeryClient.createTask("tasks.fetch_data_from_pngx")
      // 								 .applyAsync(["https://www.pngx.com.pg/data/BSP.csv"]);
      // const data_fetcher = celeryClient.createTask("tasks.data_fetcher")
      // 								 .applyAsync([]);

      // data_fetcher.get().then(data => {
      // 	console.log(data)
      // 	celeryClient.disconnect();
      // });
      const { Worker } = require("node:worker_threads");
      const childWorkerPath = path.resolve(process.cwd(), "thread_workers.js");

      // const workerPromises = [];
      // for (let i = 0; i < THREAD_COUNT; i++) {
      // 	workerPromises.push(createWorker());
      // }
      // const thread_results = await Promise.all(workerPromises);
      // const total =
      // 	thread_results[0] +
      // 	thread_results[1] +
      // 	thread_results[2] +
      // 	thread_results[3];

      try {
        let worker = new Worker(childWorkerPath);

        worker.once("message", (result) => {
          console.log("completed: ", result);
        });
        worker.on("error", (error) => {
          throw new Error(`Error occured`, error);
        });
        worker.on("exit", (exitCode) => {
          if (exitCode !== 0) {
            throw new Error(`Worker stopped with exit code ${exitCode}`);
          }
        });
      } catch (erorr) {
        console.log(erorr);
      }

      // const response = await myQueue.add({
      //   type: "register",
      //   data: { date: "07/04/2024" },
      // });

      // res.json({message: response.message});
    });
  })
  .on("error", function () {
    console.log(
      "[Main_Thread]: Error: Could not connect to MongoDB. Did you forget to run 'mongod'?"
    );
  });

/**
 * /api/docs
 */
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));

/**
 * /api
 */
app.use("/api", require("./routes/index"));
app.get('/ip', (request, response) => response.send(request.ip))

module.exports = app;
