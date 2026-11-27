import express, { Request, Response } from "express";
import cron from "node-cron";
import path from "path";
import crypto from "crypto";
import compression from "compression";
import { Worker, isMainThread } from "node:worker_threads";
import fs from "fs";
import Cabin from "cabin";
// const requestId = require('express-request-id');
import requestReceived from "request-received";
import responseTime from "response-time";
// import { Signale } from "signale";
// const boxen = require('boxen');
// const ora = require('ora');
// const spinner = ora('Connecting to the database...').start();
import helmet from "helmet";
import { specs, swaggerUi } from "./config/swagger.config";
import { winstonLogger as logger, pinoLogger } from "./libs/logger";
import { startMonitoring, client } from "./libs/monitoring";
require("./constants");
require("./models/index");
import { initDatabase } from "./database";
import {
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
} from "./middlewares";
import { QUOTE_FETCH_WORKER_SCHEDULE_TIME } from "./constants";

const app = express();

app.use(express.static(path.join(import.meta.dirname, "docs")));
app.use("/demo", express.static(path.join(import.meta.dirname, "demo")));
app.use(express.static(path.join(import.meta.dirname, "images")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("trust proxy", 1 /* number of proxies between user and server */);
app.disable("x-powered-by");

// Middleware to log the start time of each request
app.use((req: Request, res: Response, next) => {
  req.startTime = process.hrtime();
  next();
});

const queueFile = path.join(import.meta.dirname, "queue.json");
if (!fs.existsSync(queueFile)) fs.writeFileSync(queueFile, JSON.stringify([]));

// initialize cabin
const cabin = new Cabin({
  axe: {
    // logger: new Signale(),
  },
});

// TODO: compression middleware causes issues with some responses from sse, need to investigate further
// app.use(compression());
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       "img-src": ["'self'", "data:", "https://apollo-server-landing-page.cdn.apollographql.com"],
//       "script-src": ["'self'", "data:", "https://embeddable-sandbox.cdn.apollographql.com"],
//       "frame-ancestors": ["'self'", "", "https://sandbox.embed.apollographql.com"]
//     },
//   },
//   contentSecurityPolicy: false,
//   xDownloadOptions: false,
// }));
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

// adds request received hrtime and date symbols to request object
// (which is used by Cabin internally to add `request.timestamp` to logs
app.use(requestReceived);

// adds `X-Response-Time` header to responses
app.use(responseTime());

// adds or re-uses `X-Request-Id` header
// app.use(requestId());

// use the cabin middleware (adds request-based logging and helpers)
app.use(cabin.middleware);

// middleware to check data is present in cache
// app.use(checkCache);

// Middleware to log request details using Pino
// app.use((req: Request, res: Response, next) => {
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
      "[Main_Thread]: Connected: Successfully connect to mongo server",
    );
    /**
     * Schedule task to requests data from PNGX datasets every 30 minutes past 8 o'clock
     */
    logger.debug(
      "Stocks info will be updated every morning at 30 minutes past 8 o'clock",
    );
    cron.schedule(QUOTE_FETCH_WORKER_SCHEDULE_TIME, () => {
      // cron.schedule("*/1 * * * *", () => {
      const childWorkerPath = path.resolve(
        process.cwd(),
        "./jobs/thread_workers.js",
      );

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
          const worker = new Worker(childWorkerPath);
          // const worker = new Worker(new URL('./worker.js', import.meta.url), {
          //   workerData,
          // });
          worker.once("message", (result) => {
            logger.debug("completed: ", result);
          });

          worker.on("error", (error: any) => {
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
      } catch (error: any) {
        logger.error("Error fetching stock quotes", {
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
      "[Main_Thread]: Error: Could not connect to MongoDB. Did you forget to run 'mongod'?",
    );
  });

app.use((req: Request, res: Response, next) => {
  req.ctx = {
    userId: 123,
    requestId: crypto.randomUUID(), // Unique ID per request
    // db: getDatabaseConnection(), // Request-scoped DB connection
  };
  next();
});

/**
 * /api
 */
app.use("/api", rateLimitMiddleware, require("./routes/index"));

/**
 * /api/docs
 */
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));

// Attach Apps
app.use("/webhook", require("./routes/webhooks"));
app.use("/events", require("./routes/sse"));

app.get("/ip", (request, response) => response.send(request.ip));

var pets = [
  { id: 1, name: "Tobi" },
  { id: 2, name: "Jane" },
  { id: 3, name: "Loki" },
];
var petActions = {
  index: function (req: Request, res: Response) {
    res.send(pets);
  },
  show: function (req: Request, res: Response) {
    var pet = pets.find((p) => p.id == req.params.pet);
    if (pet) {
      res.send(pet);
    } else {
      res.status(404).send("Pet not found");
    }
  },
  create: function (req: Request, res: Response) {
    // ... logic to create a new pet
    res.status(201).send("Pet created");
  },
  update: function (req: Request, res: Response) {
    // ... logic to update a pet
    res.send("Pet updated");
  },
  destroy: function (req: Request, res: Response) {
    // ... logic to delete a pet
    res.status(204).send();
  },
};
// app.resource('pets', petActions);

// res.set('Accept', 'application/json');
// res.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });

app.use(startMonitoring);

app.get("/metrics", async (req: Request, res: Response) => {
  res.set("Content-Type", client.register.contentType);
  // Log the time taken to process the request
  const diff = process.hrtime(req.startTime);
  console.log(
    `Request took ${diff[0]} seconds and ${diff[1] / 1e6} milliseconds`,
  );
  res.end(await client.register.metrics());
});

export default app;
