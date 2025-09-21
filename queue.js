const Queue = require("bullmq");
const { redisConfig } = require("./config/redis");

const myQueue = new Queue("myQueueName", {
  redis: redisConfig,
});

myQueue.process(async (job) => {
  console.log(job.data);

  switch (job.data.type) {
    case "register":
      // Process the user registration
      // ...
      break;
    case "reset-password":
      // Process the password reset
      // ...
      break;
    default:
      console.log("Unknown job type");
  }
});

module.exports = myQueue;
