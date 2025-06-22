const winston = require("winston");
const loggerConfig = require("../config/logger");

// creates a new Winston Logger
const logger = new winston.createLogger(loggerConfig);
module.exports = logger;


logger.info('Informational message');
logger.info("Server started on port 3000");
logger.error("Database connection failed");