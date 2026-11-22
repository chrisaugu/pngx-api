import { Queue, Worker } from "bullmq";
import { createRedisIoClient } from "./libs/redis";

const connection = createRedisIoClient({
  maxRetriesPerRequest: null,
});

const myQueue = new Queue("myQueueName", {
  connection,
});

myQueue.add("foo", {
  bar: "foo",
});

export default myQueue;

const worker = new Worker(
  "foo",
  async (job) => {
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
  },
  { connection },
);
worker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
});

const webhookQueue = new Queue("webhook", {
  connection: createRedisIoClient(),
});

const webhookWorker = new Worker(
  "webhook",
  async (job) => {
    // Process the job data (webhook event)
    console.log("Processing webhook event:", job.data);

    // Perform the necessary operations
    // ...
  },
  { connection },
);
