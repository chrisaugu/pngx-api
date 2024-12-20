exports.allowCrossDomain = function allowCrossDomain(req, res, next) {
  // let allowHeaders = DEFAULT_ALLOWED_HEADERS;

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  // res.header('Access-Control-Allow-Headers', allowHeaders);
  res.header(
    "Access-Control-Expose-Headers",
    "X-Parse-Job-Status-Id, X-Parse-Push-Status-Id"
  ); // intercept OPTIONS method

  if ("OPTIONS" == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
};

exports.allowMethodOverride = function allowMethodOverride(req, res, next) {
  if (req.method === "POST" && req.body._method) {
    req.originalMethod = req.method;
    req.method = req.body._method;
    delete req.body._method;
  }

  next();
};

exports.error404Handler = function error404Handler(error, req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err) || next(createError(404));
};

exports.errorHandler = function errorHandler(err, req, res, next) {
  // render the error page
  res.status(err.status || 500);

  var html = "<!DOCTYPE html>";
  html += "<html>";
  html += "  <head>";
  html += "    <title></title>";
  html += "  </head>";
  html += "  <body>";
  html += "    <h1>" + err.message + "</h1>";
  html += "    <h2>" + err.status + "</h2>";
  html += "    <h2>More information: hello@christianaugustyn.me</h2>";
  html += "    <pre>" + err.stack + "</pre>";
  html += "  </body>";
  html += "</html>";
  res.send(html);
};

exports.errorLogHandler = function errorLogHandler(err, req, res, next) {
  logger.error(
    `${req.method} - ${err.message}  - ${req.originalUrl} - ${req.ip}`
  );
  next(err);
};

exports.fixDateFormatOnProdDB = function fixDateFormatOnProdDB() {
  Stock.find({
    // _id: mongoose.mongo.ObjectId("633a925da76dd590ada1d70c"),
    // date: new Date("10/03/2022"),
    code: "STO",
  })
    .then((res) => {
      return Promise.all(
        res.map((data) => {
          // if (date)
          // data.date = new Date(data.date)
          // data.save()
          return data;
        })
      );
    })
    .then((res) => {
      console.table(res);
    });
};

// fixDateFormatOnProdDB()

exports.parallel = async function parallel(arr, fn, threads = 2) {
  const result = [];

  while (arr.length) {
    const res = await Promise.all(arr.splice(0, threads).map((x) => fn(x)));
    result.push(res);
  }
  return result.flat();
};
