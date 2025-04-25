const winston = require("winston");

const LOG_LEVEL = process.env.LOG_LEVEL || "error";
const LOG_DESTINATION = process.env.LOG_DESTINATION || "./logs/error.log";

// creates a new Winston Logger
const logger = new winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.File({
      filename: LOG_DESTINATION,
      level: LOG_LEVEL,
    }),
  ],
  exitOnError: false,
});
module.exports = logger;
