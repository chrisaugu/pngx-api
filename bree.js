const Bree = require("bree");
const Cabin = require("cabin");
const Graceful = require("@ladjs/graceful");
const { Signale } = require("signale");
const { winstonLogger: logger } = require("./libs/logger");

// initialize cabin
const cabin = new Cabin({
  axe: {
    logger: new Signale(),
  },
});

const bree = new Bree({
  logger: cabin,
  jobs: [
    // {
    //     name: 'email',
    //     interval: '10s',
    //     // interval: 'on the last day of the month'
    //     // interval: 'every 2 days'
    //     // interval: 'at 10:15 am also at 5:15pm except on Tuesday',
    //     // cron: '15 10 ? * *'
    // },
    {
      name: "stock-consumer",
      // interval: 'at 8:30 am every day',
      //     interval: '10s',
      // path: 'jobs/stock-consumer.js',
    },
  ],
  errorHandler: (error, workerMetadata) => {
    // workerMetadata will be populated with extended worker information only if
    // Bree instance is initialized with parameter `workerMetadata: true`
    if (workerMetadata.threadId) {
      logger.info(
        `There was an error while running a worker ${workerMetadata.name} with thread ID: ${workerMetadata.threadId}`
      );
    } else {
      logger.info(
        `There was an error while running a worker ${workerMetadata.name}`
      );
    }

    logger.error(error);
    // errorService.captureException(error);
  },
});

// handle graceful reloads, pm2 support, and events like SIGHUP, SIGINT, etc.
const graceful = new Graceful({ brees: [bree] });
graceful.listen();

// start all jobs (this is the equivalent of reloading a crontab):
bree.start();
