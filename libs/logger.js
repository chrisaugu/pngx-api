const winston = require("winston");
const { format, transports } = require("winston");
const { combine, colorize, label, printf, splat, timestamp } = format;
const pino = require("pino");
const { randomUUID } = require("node:crypto");
const { ElasticsearchTransport } = require("winston-elasticsearch");
const {
  winstonConfig,
  pinoConfig,
  apiUsageConfig,
} = require("../config/logger.config");

// creates a new Winston Logger
const winstonLogger = new winston.createLogger(winstonConfig);
// exports.winstonLogger = winstonLogger;

const apiUsageLogger = new winston.createLogger(apiUsageConfig);
// exports.apiUsageLogger = apiUsageLogger;

const esTransport = new ElasticsearchTransport({
  clientOpts: { node: "http://localhost:9200" },
});

winstonLogger.add(esTransport);
// winstonLogger.info('Informational message');
// winstonLogger.info("User login successful", { user_id: "12345" });
// winstonLogger.error("Failed to fetch user data", { user_id: "12345", error: "Database unavailable" });

const pinoLogger = pino(pinoConfig);
// exports.pinoLogger = pinoLogger;
// pinoLogger.debug("A debug message with structured data.", { user: "JohnDoe" });

const httpLogger = require("pino-http")({
  // Reuse an existing logger instance
  logger: pinoLogger,

  // Define a custom request id function
  genReqId: function (req, res) {
    const existingID = req.id ?? req.headers["x-request-id"];
    if (existingID) return existingID;
    const id = randomUUID();
    res.setHeader("X-Request-Id", id);
    return id;
  },

  // Define custom serializers
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },

  // Set to `false` to prevent standard serializers from being wrapped.
  wrapSerializers: true,

  // Logger level is `info` by default
  // useLevel: "info",

  // Define a custom logger level
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return "warn";
    } else if (res.statusCode >= 500 || err) {
      return "error";
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return "silent";
    }
    return "info";
  },

  // Define a custom success message
  customSuccessMessage: function (req, res) {
    if (res.statusCode === 404) {
      return "resource not found";
    }
    return `${req.method} completed`;
  },

  // Define a custom receive message
  customReceivedMessage: function (req, res) {
    return "request received: " + req.method;
  },

  // Define a custom error message
  customErrorMessage: function (req, res, err) {
    return "request errored with status code: " + res.statusCode;
  },

  // Override attribute keys for the log object
  customAttributeKeys: {
    req: "request",
    res: "response",
    err: "error",
    responseTime: "timeTaken",
  },

  // Define additional custom request properties
  customProps: function (req, res) {
    return {
      customProp: req.customProp,
      // user request-scoped data is in res.locals for express applications
      customProp2: res.locals.myCustomData,
    };
  },
});
exports.httpLogger = httpLogger;

function handle(req, res) {
  pinoLogger(req, res);
  req.log.info("something else");
  res.log.info(
    "just in case you need access to logging when only the response is in scope"
  );
  res.end("hello world");
}

const logFormat = (loggerLabel) =>
  combine(
    timestamp(),
    splat(),
    colorize(),
    label({ label: loggerLabel }),
    printf(
      (info) =>
        `${info.timestamp} ${chalk.cyan(info.label)} ${info.level}: ${
          info.message
        }`
    )
  );
const createLoggerWithLabel = (label) =>
  winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    transports: [new transports.Console({})],
    format: logFormat(label),
  });

module.exports = {
  gateway: createLoggerWithLabel("[NUKU:gateway]"),
  policy: createLoggerWithLabel("[NUKU:policy]"),
  config: createLoggerWithLabel("[NUKU:config]"),
  db: createLoggerWithLabel("[NUKU:db]"),
  admin: createLoggerWithLabel("[NUKU:admin]"),
  plugins: createLoggerWithLabel("[NUKU:plugins]"),
  pinoLogger,
  winstonLogger,
  apiUsageLogger,
};
