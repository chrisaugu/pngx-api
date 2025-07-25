const express = require("express");
const cron = require("node-cron");
const path = require("path");
const crypto = require("crypto");
const compression = require("compression");
// const boxen = require('boxen');
// const ora = require('ora');
// const spinner = ora('Connecting to the database...').start();
const helmet = require("helmet");
const { specs, swaggerUi } = require("./config/swagger.config");
const { winstonLogger: logger, pinoLogger } = require("./libs/logger");
const { startMonitoring, client } = require("./libs/monitoring");
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
  morganDevMiddlware,
  morganMiddlware,
  morganCommonMiddlware,
  morganCombinedMiddlware,
  morganFileMiddlware,
  morganBodyMiddlware,
  apiUsageLogMiddlware,
} = require("./middlewares");
const { WORKER_SCHEDULE_TIME } = require("./constants");

// Creating express app
const app = express();

app.use(express.static(path.join(__dirname, "docs")));
app.use("/demo", express.static(path.join(__dirname, "demo")));
app.use(express.static(path.join(__dirname, "images")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("trust proxy", 1 /* number of proxies between user and server */);
app.disable("x-powered-by");

// Middleware to log the start time of each request
app.use((req, res, next) => {
  req.startTime = process.hrtime();
  next();
});

// TODO: compression middleware causes issues with some responses from sse, need to investigate further
// app.use(compression());
app.use(helmet());
app.use(corsMiddleware);
app.use(allowCrossDomain);
app.use(allowMethodOverride);

// catch 404 and forward to error handler
app.use(error404Handler);
app.use(errorHandler);
app.use(errorLogHandler);

// Morgan configuration
app.use(morganFileMiddlware);
app.use(morganBodyMiddlware);
if (process.env.NODE_ENV === "production") {
  // app.use(morganCommonMiddlware);
  app.use(morganFileMiddlware);
} else {
  if (process.env.NODE_ENV !== "test") {
    app.use(morganMiddlware);
    app.use(morganDevMiddlware);
  } else {
  }
}

app.use(apiUsageLogMiddlware);

app.use("/api", rateLimitMiddleware);
app.use("/events", require("./routes/sse"));

// middleware to check data is present in cache
// app.use(checkCache);

// Middleware to log request details using Pino
// app.use((req, res, next) => {
//   pinoLogger.debug({
//     method: req.method,
//     path: req.path,
//     query: req.query,
//     body: req.body,
//   });
//   next();
// });

initDatabase()
  .on("connected", function () {
    logger.debug(
      "[Main_Thread]: Connected: Successfully connect to mongo server"
    );
    /**
     * Schedule task to requests data from PNGX datasets every 30 minutes past 8 o'clock
     */
    logger.debug(
      "Stocks info will be updated every morning at 30 minutes past 8 o'clock"
    );
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
            logger.debug("completed: ", result);
          });

          worker.on("error", (error) => {
            logger.error(`Error occured`, error);
            throw new Error(`Error occured`, error);
          });

          worker.on("exit", (exitCode) => {
            if (exitCode !== 0) {
              logger.error(`Worker stopped with exit code ${exitCode}`);
              throw new Error(`Worker stopped with exit code ${exitCode}`);
            }
          });
        }
      } catch (error) {
        logger.error("Error creating user", {
          error: error.message,
          stack: error.stack,
          // body: req.body
        });
      }

      // const response = await myQueue.add({
      //   type: "register",
      //   data: { date: "07/04/2024" },
      // });

      // res.json({message: response.message});
    });
  })
  .on("error", function () {
    logger.error(
      "[Main_Thread]: Error: Could not connect to MongoDB. Did you forget to run 'mongod'?"
    );
  });

app.use((req, res, next) => {
  req.ctx = {
    userId: 123,
    requestId: crypto.randomUUID(), // Unique ID per request
    // db: getDatabaseConnection(), // Request-scoped DB connection
  };
  next();
});

/**
 * /api/docs
 */
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));

/**
 * /api
 */
app.use("/api", require("./routes/index"));
app.get("/health", (req, res) => {
  res.send("OK");
});
app.get("/ip", (request, response) => response.send(request.ip));

app.use(startMonitoring);
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  // Log the time taken to process the request
  const diff = process.hrtime(req.startTime);
  console.log(
    `Request took ${diff[0]} seconds and ${diff[1] / 1e6} milliseconds`
  );
  res.end(await client.register.metrics());
});

module.exports = app;
