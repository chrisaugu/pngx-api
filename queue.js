const Queue = require("bull");

const myQueue = new Queue("myQueueName", {
  redis: {
    port: 6379,
    host: "127.0.0.1",
  },
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
