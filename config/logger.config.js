require("winston-daily-rotate-file");
const pino = require("pino");
const chalk = require("chalk").default;
const { format, transports, config, addColors } = require("winston");

// Custom log format for console
const consoleFormat = format.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level.toString()}]: ${stack || message}`;
});

// Custom log format for files (more detailed)
const fileFormat = format.printf(
  ({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` | ${JSON.stringify(metadata)}`;
    }
    return msg;
  }
);

// Define log levels
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
  },
  colors: {
    critical: "red",
    error: "red",
    warn: "yellow",
    info: "green",
    debug: "blue",
  },
};

exports.winstonConfig = {
  levels: customLevels.levels, //config.syslog.levels,
  level: process.env.LOG_LEVEL || "debug",
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }),
        consoleFormat
      ),
    }),
    // Error log (only errors)
    new transports.File({
      filename: "./logs/error.log",
      level: "error",
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }),
        fileFormat
      ),
    }),
    // new transports.File({ filename: "./logs/combined.log" }),
    // Daily rotating file transport
    new transports.DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }),
        fileFormat
      ),
    }),
  ],
  exitOnError: false,
  format: format.combine(
    format.colorize(/*{ all: true }*/),
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
    // format.cli(),
    // format.align(),
    format.printf(
      (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
    )
  ),
  exceptionHandlers: [
    new transports.File({ filename: "./logs/exception.log" }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: "./logs/rejections.log" }),
  ],
};
addColors(customLevels.colors);

exports.apiUsageConfig = {
  level: "info",
  format: format.combine(
    format.timestamp(),
    // format.errors({ stack: true }),
    // format.json(),
    format.printf(
      (info) =>
        `${info.timestamp} | ${info.level.toUpperCase()} | ${info.message}`
    )
  ),
  transports: [
    new transports.Console({
      // format: format.combine(
      //   format.colorize(),
      //   format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      //   format.errors({ stack: true }),
      //   consoleFormat
      // ),
    }),
    new transports.File({ filename: "./logs/api-usage.log" }),
  ],
};

exports.pinoConfig = {
  level: process.env.LOG_LEVEL || "debug",
  transport: {
    // target: "./pino-pretty-transport.js",
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
  serializers: {
    err: pino.stdSerializers.err,
  },
};
