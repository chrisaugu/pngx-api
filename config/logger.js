const winston = require("winston");

module.exports = {
  level: "info",
  transports: [
    new winston.transports.File({
      filename: "./logs/error.log",
      level: "error",
    }),
  ],
  exitOnError: false,
};
