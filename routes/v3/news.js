const router = require('express').Router();
const { NewsSource } = require("../../models");

/**
 * /api/v3/news
 */
router.get("/news", cache(10), async function (req, res) {
    const page = req.query.page;

    try {
        if (isMainThread) {
            logger.info("[Main_Thread]: Retrieving news");

            const payload = {
                page: page,
            };

            const worker = new Worker(childWorkerPath);
            worker.postMessage(payload);

            worker.on("message", (result) => {
                logger.debug("completed: ", result);
                logger.debug("Retrieved news ", result);
                return res.send(result);
            });

            worker.on("error", (error) => {
                logger.error(`Error occured`, error);
                throw new Error(`Error occured`, error);
            });

            worker.on("exit", (exitCode) => {
                if (exitCode !== 0) {
                    logger.error(`Worker stopped with exit code ${exitCode}`);
                    throw new Error(`Worker stopped with exit code ${exitCode}`);
                }
            });
        }
    }
    catch (error) {
        logger.error("An error whilte fetching news:", {
            error: error.message,
            stack: error.stack,
        });

        res.json({ message: "An error whilte fetching news:", error });
    }
});

router.get("/news/sources", function (req, res) {
    NewsSource
        .find({})
        .then((result) => {
            res.status(200).json({
                status: 200,
                data: result,
            });
        })
        .catch((err) => {
            logger;
            res.json({
                status: 1,
                reason: "",
            });
        });
});

router.post("/news/sources", function (req, res) {
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
            res.sendStatus(201);
        })
        .catch((error) => {
            logger.error("Error adding news source:", {
                error: error.message,
                stack: error.stack,
                body: req.body,
            });
            res.status(500).json({
                status: 500,
                message: "Error occurred while adding news source. Please try again",
            });
        });
});

router.get("/news/sources/:newsSourceId", function (req, res) {
    const { newsSourceId } = req.params;

    logger.debug("Retrieving News Source: ", newsSourceId);

    NewsSource
        .findById(newsSourceId)
        .then((result) => {
            logger.debug("News Source retrieved: ", result);
            res.json(result);
        })
        .catch((error) => {
            logger.error("Error retrieving news source:", {
                error: error.message,
                stack: error.stack,
                body: req.body,
            });
            res.status(500).json({
                error: "Internal server error",
                message:
                    "Error occurred while retrieving news source. Please try again",
            });
        });
});

router.put("/news/sources/:newsSourceId", function (req, res) {
    const { newsSourceId } = req.params;
    const { name, url } = req.body;
    const payload = {};

    if (!name) {
        payload["name"] = name;
    }

    if (!url) {
        payload["url"] = url;
    }

    NewsSource
        .findByIdAndUpdate(newsSourceId, payload)
        .then((result) => {
            logger.debug("News Source updated: ", result);
            res.json(result);
        })
        .catch((error) => {
            logger.error("Error updating news source:", {
                error: error.message,
                stack: error.stack,
                body: req.body,
            });
            res.status(500).json({
                status: 500,
                message: "Error occurred while updating news source. Please try again",
            });
        });
});

router.patch("/news/sources/:newsSourceId", function (req, res) {
    const { newsSourceId } = req.params;
    const { name, url } = req.body;
    const payload = {};

    if (!name) {
        payload["name"] = name;
    }

    if (!url) {
        payload["url"] = url;
    }

    NewsSource
        .findByIdAndUpdate(newsSourceId, payload)
        .then((result) => {
            logger.debug("News Source updated: ", result);
            res.json(result);
        })
        .catch((error) => {
            logger.error("Error updating news source:", {
                error: error.message,
                stack: error.stack,
                body: req.body,
            });
            res.status(500).json({
                status: 500,
                message: "Error occurred while updating news source. Please try again",
            });
        });
});

router.delete("/news/sources/:newsSourceId", function (req, res) {
    const { newsSourceId } = req.params;

    NewsSource
        .findByIdAndDelete(newsSourceId)
        .then((result) => {
            logger.debug("News Source retrieved: ", result);
            res.json(result);
        })
        .catch((error) => {
            logger.error("Error deleting news source:", {
                error: error.message,
                stack: error.stack,
                body: req.body,
            });
            res.status(500).json({
                status: 500,
                message: "Error occurred while deleting news source. Please try again",
            });
        });
});
