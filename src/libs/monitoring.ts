import client from "prom-client";

export * as client from "prom-client";

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route"],
});

export const startMonitoring = (req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => end({ method: req.method, route: req.path }));
  next();
};
