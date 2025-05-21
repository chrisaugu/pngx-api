const { format, transports } = require("winston");

module.exports = {
  level: "info",
  transports: [
    new transports.Console(),
    new transports.File({
      filename: "./logs/error.log",
      level: "error",
    }),
    new transports.File({ filename: "./logs/combined.log" }),
  ],
  exitOnError: false,
  format: format.combine(format.timestamp(), format.json()),
};
