const express = require("express");
const cron = require("node-cron");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const compression = require("compression");
const Cabin = require("cabin");
// const requestId = require('express-request-id');
const requestReceived = require("request-received");
const responseTime = require("response-time");
const { Signale } = require("signale");
// const boxen = require('boxen');
// const ora = require('ora');
// const spinner = ora('Connecting to the database...').start();
const helmet = require("helmet");
const auditLog = require('audit-log');
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
const { QUOTE_FETCH_WORKER_SCHEDULE_TIME } = require("./constants");

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

const queueFile = path.join(__dirname, "queue.json");
if (!fs.existsSync(queueFile)) fs.writeFileSync(queueFile, JSON.stringify([]));

// initialize cabin
const cabin = new Cabin({
  axe: {
    logger: new Signale(),
  }
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
// app.use((req, res, next) => {
//   pinoLogger.debug({
//     method: req.method,
//     path: req.path,
//     query: req.query,
//     body: req.body,
//   });
//   next();
// });

// auditLog.addTransport("mongoose", { connectionString: "mongodb://localhost:27017/pngx-db" });
// either or both -- up to you where your messages are sent!
auditLog.addTransport("console");
auditLog.logEvent('user id or something', 'maybe script name or function', 'what just happened', 'the affected target name perhaps', 'target id', 'additional info, JSON, etc.');
auditLog.logEvent(95049, 'AppServer', 'Shutdown', 'Production-3 Instance', 'ec2-255-255-255-255', 'Terminated from web console.');
auditLog.log({
  logType: 'Warning',
  text: 'An error occurred and you should fix it.',
  datetime: '2013-01-31 13:15:02',
  traceData: '...'
});
// const auditLogExpress = auditLog.getPlugin('express', {
//   userIdPath: ['user', '_id'],
//   whiteListPaths: [/^\/some\/particular\/path.*$/]
// });
// app.use(auditLogExpress.middleware)

// git@github.com:coderooz/Mongoose-Structured-Audit-Logger.git
// import { createErrorLogger } from "@/lib/createErrorLogger";
// import { logAudit } from "@/lib/auditLogger";
// import { attachAuditLogging } from "@/lib/attachAuditLogging";
// import { logAudit } from "@/lib/auditLogger";
// import AuditLog from "@/models/AuditLog";
// import { AuditLogger } from "@/types/logging";

// export const logAudit: AuditLogger = async (event) => {
//   await AuditLog.create({
//     action: event.action,
//     user: event.userId,
//     details: event.details ?? {}
//   });
// };
// attachAuditLogging(ContentSchema, {
//   logger: logAudit,
//   hooks: [
//     {
//       hook: "create",
//       action: "content.created",
//       getActorId: (doc) => doc.author,
//       getDetails: (doc) => ({
//         title: doc.title,
//         slug: doc.slug
//       })
//     }
//   ]
// });
// export const ErrorLogging = createErrorLogger(logAudit);
// try {
//   await updateContent(id, data);
// } catch (error) {
//   await ErrorLogging({
//     error,
//     user: session.user.id,
//     context: "updateContent",
//     metadata: { contentId: id }
//   });
// }

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
    cron.schedule(QUOTE_FETCH_WORKER_SCHEDULE_TIME, () => {
      // cron.schedule("*/1 * * * *", () => {
      const { Worker, isMainThread } = require("node:worker_threads");
      const childWorkerPath = path.resolve(
        process.cwd(),
        "./jobs/thread_workers.js"
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
 * /api
 */
app.use("/api", rateLimitMiddleware, require("./routes/index"));

/**
 * /api/docs
 */
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/webhook", require("./routes/webhooks"));

app.use("/events", require("./routes/sse"));

// health check for docker
app.get("/health", (req, res) => {
  res.send("OK");
});

app.get("/ip", (request, response) => response.send(request.ip));

let pets = [
  { id: 1, name: "Tobi" },
  { id: 2, name: "Jane" },
  { id: 3, name: "Loki" },
];
let petActions = {
  index: function (req, res) {
    res.send(pets);
  },
  show: function (req, res) {
    var pet = pets.find((p) => p.id == req.params.pet);
    if (pet) {
      res.send(pet);
    } else {
      res.status(404).send("Pet not found");
    }
  },
  create: function (req, res) {
    res.status(201).send("Pet created");
  },
  update: function (req, res) {
    res.send("Pet updated");
  },
  destroy: function (req, res) {
    res.status(204).send();
  }
};
// app.resource('pets', petActions);

// res.set('Accept', 'application/json');
// res.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });

app.use(startMonitoring);

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  // Log the time taken to process the request
  const diff = process.hrtime(req.startTime);
  console.log(`Request took ${diff[0]} seconds and ${diff[1] / 1e6} milliseconds`);
  res.end(await client.register.metrics());
});

module.exports = app;