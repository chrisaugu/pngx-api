const router = require('express').Router();
const Grid = require("gridfs-stream");
const fs = require("fs");

const { Company } = require('../../models');

/**
 * @swagger
 *
 * /api/v3/company/{code}:
 *   get:
 *     tags:
 *      - company
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 *     parameters:
 *       - name: code
 *         in: path
 *         description: unique code representing a stock in PNGX
 *         required: true
 *         schema:
 *           type: string
 *           enum: [BSP, CCP, CGA, CPL, KAM, KSL, NEM, NGP, NIU, SST, STO]
 *
 */
/**
 * GET /api/v3/company/:code
 * Get a specific company info using stock quote
 * @param :code unique code of the comapny
 */
router.get("/company/:code", function (req, res) {
    const stockTicker = req.params.code;

    logger.info("Retrieving companies on PNGX");

    // Stock.findByName(stockQuote, req.)

    logger.debug("Companies retrieved", COMPANIES);
    res.json(COMPANIES);
});

/**
 * @swagger
 *
 * /api/v3/companies:
 *   get:
 *     tags:
 *      - company
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 *
 */
/**
 * /api/v3/companies
 */
router
    .route("/companies")
    /**
     * GET
     */
    .get(async function (req, res) {
        try {
            logger.info("Retrieving companies on PNGX");

            const companies = await Company.find({});

            logger.debug("Companies retrieved", companies);
            res.json(companies);
        } catch (error) {
            logger.error("Error retrieving stocks", {
                error: error.message,
                stack: error.stack,
                params: req.params,
                query: req.query,
            });
        }
    });
// .post(async function(req, res) {
// 	let update = req.body;

// 	try {
// 		let company = await Company.create(update);

// 		res.json(company);
// 	} catch (error) {
// 		return res.json({
// 			status: "Error",
// 			message: error
// 		});
// 	}
// })

/**
 * @swagger
 *
 * /api/v3/companies/:id:
 *   get:
 *     tags:
 *      - company
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 *
 */
router
    .route("/companies/:code")
    .get(async function (req, res) {
        const { code } = req.params;

        try {
            logger.info("Retrived company details");
            const company = await Company.findByCode(code, function (err, company) {
                if (err) {
                    logger.error("Error retrieving stocks", {
                        error: err.message,
                        stack: err.stack,
                        params: req.params,
                        query: req.query,
                    });
                    return res.status(500).json({
                        status: 500,
                        message: "Internal Server Error",
                    });
                }
                return company;
            });

            logger.debug("Retrived company details", company);
            res.json(company);
        } catch (error) {
            logger.error("Error retrieving stocks", {
                error: error.message,
                stack: error.stack,
                params: req.params,
                query: req.query,
            });
        }
    })
    .post(async function (req, res) {
        const update = req.body;

        try {
            logger.info("Adding company");
            // const gfs = new Grid(mongoose.connection.db, mongoose.mongo);
            // const writeStream = gfs.createWriteStream({
            //   filename: req.file.originalname,
            //   mode: "w",
            //   content_type: req.file.mimetype,
            // });
            // fs.createReadStream(req.file.path).pipe(writeStream);
            // writeStream.on("close", (file) => {
            //   fs.unlink(req.file.path, (err) => {
            //     if (err) throw err;
            //     return res.json({ file });
            //   });
            // });

            const company = await Company.create(update);

            logger.debug("Company added", company);
            res.json(company);
        } catch (error) {
            logger.error("Error adding company", {
                error: error.message,
                stack: error.stack,
                body: req.body,
            });
            return res.json({
                status: "Error",
                message: error,
            });
        }
    })
    .put(async function (req, res) {
        const { id } = req.params;
        const update = req.body;

        try {
            logger.info("Updating company");
            const company = await Company.findByIdAndUpdate(id, update);

            logger.debug("Company added", company);
            res.json(company);
        } catch (error) {
            logger.error("Error updating company", {
                error: error.message,
                stack: error.stack,
                body: req.body,
            });
            return res.json({
                status: "Error",
                message: error,
            });
        }
    });
// .delete(async function(req, res) {
// 	let {id} = req.params;

// 	try {
// 		await Company.findOneAndDelete(id);

// 		return res.statusCode(204).json({
// 			status: "Error",
// 			message: error
// 		});
// 	} catch (error) {
// 		// throw new Error(error);
// 		return res.json({
// 			status: "Error",
// 			message: error
// 		});
// 	}
// });

/**
 * @swagger
 *
 * /api/v3/companies/:code/code:
 *   get:
 *     tags:
 *      - company
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 *
 * /api/v3/company/{code}:
 *   get:
 *     tags:
 *      - company
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 */
/**
 * GET /api/v3/company/:code
 * Get a specific company info using stock quote
 * @param :ticker unique ticker of the comapny
 */
router.route("/companies/:code/code").get(async function (req, res) {
    const { code } = req.params;

    const company = await Company.findOne({ ticker: new RegExp(code, "i") });

    res.json(company);
});

router.get("/company/:code", async function (req, res) {
    const stockTicker = req.params.ticker;

    const company = await Company.findOne({ ticker: stockTicker });

    const data = {
        ...data,
    };

    res.json(data);
});

module.exports = router;