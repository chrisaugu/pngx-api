const { Router } = require("express");
const router = Router();

let clients = [];
let facts = [];

function eventsHandler(req, res, next) {
  // Set headers to keep the connection alive and tell the client we're sending event-stream data
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (data) => {
    return res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send an initial message
  sendEvent("Connected to server");

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    res,
  };

  clients.push(newClient);

  // Simulate sending updates from the server
  let counter = 0;
  const intervalId = setInterval(() => {
    counter++;
    // Write the event stream format
    sendEvent(`Message ${counter}`);
  }, 2000);

  // When client closes connection, stop sending events
  req.on("close", () => {
    console.log(`${clientId} Connection closed`);
    clients.filter((client) => client.id !== clientId);

    clearInterval(intervalId);
    res.end();
  });
}

function sendEventsToAll(newFact) {
  clients.forEach((client) =>
    client.response.write(`data: ${JSON.stringify(newFact)}\n\n`)
  );
}

async function addFact(request, response, next) {
  const newFact = request.body;
  facts.push(newFact);
  return sendEventsToAll(newFact);
}

router.get("/", eventsHandler);
router.post("/fact", addFact);

module.exports = router;
