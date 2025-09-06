const client = require("prom-client");
exports.client = client;

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route"],
});

exports.startMonitoring = function startMonitoring(req, res, next) {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => end({ method: req.method, route: req.path }));
  next();
};
