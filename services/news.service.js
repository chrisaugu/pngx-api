const {
  Stock,
  Company,
  Ticker,
  Indices,
  NewsSource,
} = require("../models/index");

async function fetchNews(page = 1) {
  return new Promise((resolve, reject) => {
    logger.info("[Main_Thread]: Retrieving news");

    const payload = {
      page,
    };

    const worker = new Worker(childNewsWorkerPath);
    worker.postMessage(payload);

    worker.on("message", resolve);

    worker.on("error", reject);

    worker.on("exit", (exitCode) => {
      if (exitCode !== 0) {
        logger.error(`Worker stopped with exit code ${exitCode}`);
        reject(new Error(`Worker stopped with exit code ${exitCode}`));
      }
    });
  });
}

/**
 * /api/v2/news
 */
async function getNews(req, res) {
  const page = req.query.page;

  try {
    if (isMainThread) {
      fetchNews()
        .then((result) => {
          logger.debug("Completed: ", result);
          logger.debug("Retrieved news ", result);
          return res.send(result);
        })
        .catch((error) => {
          logger.error(`Error occured`, error);
          throw new Error(`Error occured`, error);
        });
    }
  } catch (error) {
    logger.error("An error whilte fetching news:", {
      error: error.message,
      stack: error.stack,
    });

    throw error;
  }
}

function getNewsSources(req, res) {
  NewsSource.find({})
    .then((result) => {
      return {
        status: 200,
        data: result,
      };
    })
    .catch((error) => {
      logger.error("Error retrieving news sources", {
        error: err.message,
        stack: err.stack,
        params: req.params,
        query: req.query,
      });
      throw error;
    });
}

function createNewsSources(req, res) {
  const { name, url } = req.body;
  logger.debug("Adding news source: ", name, url);

  if (!name) {
    return res.status(300).json({
      status: 300,
      message: "Name must be of type 'string' and cannot be empty",
    });
  }
  if (!url) {
    return res.status(300).json({
      status: 300,
      message: "URL must be of type 'string' and cannot be empty",
    });
  }

  const source = new NewsSource({
    name,
    url,
  });

  source
    .save()
    .then((result) => {
      logger.debug("News Source added: ", result);
      return { status: 201 };
    })
    .catch((error) => {
      logger.error("Error adding news source:", {
        error: error.message,
        stack: error.stack,
        body: req.body,
      });
      throw error;
    });
}

async function getNewsSource(req, res) {
  const { newsSourceId } = req.params;

  logger.debug("Retrieving News Source: ", newsSourceId);

  NewsSource.findById(newsSourceId)
    .then((result) => {
      logger.debug("News Source retrieved: ", result);
      return { status: 200, data: result };
    })
    .catch((error) => {
      logger.error("Error retrieving news source:", {
        error: error.message,
        stack: error.stack,
        body: req.body,
      });
      throw error;
    });
}

function updateNewsSource(req, res) {
  const { newsSourceId } = req.params;
  const { name, url } = req.body;
  const payload = {};

  if (!name) {
    payload["name"] = name;
  }

  if (!url) {
    payload["url"] = url;
  }

  NewsSource.findByIdAndUpdate(newsSourceId, payload)
    .then((result) => {
      logger.debug("News Source updated: ", result);
      return { status: 200, data: result };
    })
    .catch((error) => {
      logger.error("Error updating news source:", {
        error: error.message,
        stack: error.stack,
        body: req.body,
      });
      throw error;
    });
}

function partialUpdateNewsSource(req, res) {
  const { newsSourceId } = req.params;
  const { name, url } = req.body;
  const payload = {};

  if (!name) {
    payload["name"] = name;
  }

  if (!url) {
    payload["url"] = url;
  }

  NewsSource.findByIdAndUpdate(newsSourceId, payload)
    .then((result) => {
      logger.debug("News Source updated: ", result);
      return { status: 200, data: result };
    })
    .catch((error) => {
      logger.error("Error updating news source:", {
        error: error.message,
        stack: error.stack,
        body: req.body,
      });
      throw error;
    });
}

function deleteNewsUpdate(req, res) {
  const { newsSourceId } = req.params;

  NewsSource.findByIdAndDelete(newsSourceId)
    .then((result) => {
      logger.debug("News Source retrieved: ", result);
      return { status: 200, data: result };
    })
    .catch((error) => {
      logger.error("Error deleting news source:", {
        error: error.message,
        stack: error.stack,
        body: req.body,
      });
      throw error;
    });
}

module.exports = {
  getNews,
  getNewsSources,
  createNewsSources,
  getNewsSource,
  updateNewsSource,
  partialUpdateNewsSource,
  deleteNewsUpdate,
};
