const Agenda = require("agenda");

const mongoConnectionString = process.env.MONGODB_URI;

const agenda = new Agenda({
  db: { address: mongoConnectionString, collection: "scheduledTasks" },
});

agenda.define("welcomeMessage", () => {
  console.log("Sending a welcome message every few seconds");
});

agenda.start();

agenda.every("5 seconds", "welcomeMessage");
