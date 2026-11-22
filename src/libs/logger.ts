import winston from "winston";
import pino from "pino";
import pinoHttp from "pino-http";
import chalk from "chalk";
import { randomUUID } from "node:crypto";
import { ElasticsearchTransport } from "winston-elasticsearch";
import {
  winstonConfig,
  pinoConfig,
  apiUsageConfig,
} from "../config/logger.config";

const { combine, colorize, label, printf, splat, timestamp } = winston.format;

const winstonLogger = winston.createLogger(winstonConfig);
const apiUsageLogger = winston.createLogger(apiUsageConfig);

const esTransport = new ElasticsearchTransport({
  clientOpts: { node: "http://localhost:9200" },
});
winstonLogger.add(esTransport);
// winstonLogger.info("User login successful", { user_id: "12345" });
// winstonLogger.error("Failed to fetch user data", { user_id: "12345", error: "Database unavailable" });

const pinoLogger = pino(pinoConfig);
// pinoLogger.debug("A debug message with structured data.", { user: "JohnDoe" });

const httpLogger = pinoHttp({
  // Reuse an existing logger instance
  logger: pinoLogger,

  // Define a custom request id function
  genReqId: function (req: any, res: any) {
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
  customLogLevel: function (req: Request, res: Response, err: any) {
    if (res.status >= 400 && res.status < 500) {
      return "warn";
    } else if (res.status >= 500 || err) {
      return "error";
    } else if (res.status >= 300 && res.status < 400) {
      return "silent";
    }
    return "info";
  },

  // Define a custom success message
  customSuccessMessage: function (req: Request, res: Response) {
    if (res.status === 404) {
      return "resource not found";
    }
    return `${req.method} completed`;
  },

  // Define a custom receive message
  customReceivedMessage: function (req: Request, res: Response) {
    return "request received: " + req.method;
  },

  // Define a custom error message
  customErrorMessage: function (req: Request, res: Response, err: any) {
    return "request errored with status code: " + res.status;
  },

  // Override attribute keys for the log object
  customAttributeKeys: {
    req: "request",
    res: "response",
    err: "error",
    responseTime: "timeTaken",
  },

  // Define additional custom request properties
  customProps: function (req: Request, res: Response) {
    return {
      customProp: req.customProp,
      // user request-scoped data is in res.locals for express applications
      customProp2: res.locals.myCustomData,
    };
  },
});

// function handle(req: Request, res: Response) {
//   // pinoLogger(req, res);
//   req.log.info("something else");
//   res.log.info(
//     "just in case you need access to logging when only the response is in scope",
//   );
//   res.end("hello world");
// }

const logFormat = (loggerLabel: string) =>
  combine(
    timestamp(),
    splat(),
    colorize(),
    label({ label: loggerLabel }),
    printf(
      (info) =>
        `${info.timestamp} ${chalk.cyan(info.label)} ${info.level}: ${
          info.message
        }`,
    ),
  );

const createLoggerWithLabel = (label: string) =>
  winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    transports: [new winston.transports.Console({})],
    format: logFormat(label),
  });

const gateway = createLoggerWithLabel("[NUKU:gateway]");
const policy = createLoggerWithLabel("[NUKU:policy]");
const config = createLoggerWithLabel("[NUKU:config]");
const db = createLoggerWithLabel("[NUKU:db]");
const admin = createLoggerWithLabel("[NUKU:admin]");
const plugins = createLoggerWithLabel("[NUKU:plugins]");

export {
  gateway,
  policy,
  config,
  db,
  admin,
  plugins,
  pinoLogger,
  httpLogger,
  winstonLogger,
  apiUsageLogger,
};
