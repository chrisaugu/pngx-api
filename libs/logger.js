const winston = require("winston");
const loggerConfig = require("../config/logger");

// creates a new Winston Logger
const logger = new winston.createLogger(loggerConfig);
module.exports = logger;


// logger.info('Informational message');
