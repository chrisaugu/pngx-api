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
const { WORKER_SCHEDULE_TIME } = require("./constants");

// Creating express app
const app = express();

app.use(express.static(path.join(__dirname, "docs")));
app.use("/demo", express.static(path.join(__dirname, "demo")));
app.use(express.static(path.join(__dirname, "images")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("combined", { stream: logger.stream.write }));
app.set("trust proxy", 1 /* number of proxies between user and server */);

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
     * Schedule task to requests data from PNGX datasets every 30 minutes past 8 o'clock
     */
    console.log("Stocks info will be updated every morning at 30 minutes past 8 o'clock");
    cron.schedule(WORKER_SCHEDULE_TIME, () => {
      const { Worker, isMainThread } = require("node:worker_threads");
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
        if (isMainThread) {
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
        }
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
app.get("/ip", (request, response) => response.send(request.ip));

module.exports = app;
