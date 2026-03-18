const { MongoClient } = require("mongodb");
const crypto = require("node:crypto");
const { DB_NAME } = require("./constants");
const Env = require("./config/env");
const Quote = require("./models/quote.model");

// const aggregate = Quote.aggregate([{ $project: { a: 1, b: 1 } }, { $skip: 5 }]);

// Quote.aggregate([{ $match: { age: { $gte: 21 } } }])
//   .unwind("tags")
//   .exec();

async function removeDuplicates() {
  const uri = process.env.MONGODB_URI_PROD;
  const collectionName = Env.mongodb.collection.quotes;

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(DB_NAME);
    const collection = db.collection(collectionName);

    // Find duplicates based on code and date
    const duplicates = await collection
      .aggregate([
        // { $sort: { date: -1 } }, // Most recent first
        {
          $group: {
            _id: { code: "$code", date: "$date" },
            count: { $sum: 1 },
            ids: { $push: "$_id" },
          },
        },
        {
          $match: {
            count: { $gt: 1 }, // Only groups with duplicates
          },
        },
      ])
      // .limit(10)
      .toArray();

    console.log(`Found ${duplicates.length} duplicate groups`);

    let deletedCount = 0;

    // For each duplicate group, keep the first document and delete the rest
    for (const duplicate of duplicates) {
      // Keep the first ID, delete the others
      const [firstId, ...idsToDelete] = duplicate.ids;

      if (idsToDelete.length > 0) {
        const result = await collection.deleteMany({
          _id: { $in: idsToDelete },
        });

        deletedCount += result.deletedCount;
        console.log(
          `Deleted ${result.deletedCount} duplicates for code: ${duplicate._id.code}, date: ${duplicate._id.date}`,
        );
      }
    }

    console.log(`Total duplicate documents removed: ${deletedCount}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

async function createUniqueIndex() {
  const uri = "your_mongodb_connection_string";
  const dbName = "your_database_name";
  const collectionName = "your_collection_name";

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Create unique compound index on code and date
    const result = await collection.createIndex(
      { code: 1, date: 1 },
      { unique: true },
    );

    console.log("Unique index created successfully:", result);
  } catch (error) {
    if (error.code === 11000) {
      console.error("Duplicate keys found! Run the cleanup script first.");
    } else {
      console.error("Error:", error);
    }
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

// createUniqueIndex();

removeDuplicates();

async function removeDuplicatesBulk() {
  const uri = "your_mongodb_connection_string";
  const dbName = "your_database_name";
  const collectionName = "your_collection_name";

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Get all unique combinations
    const pipeline = [
      {
        $group: {
          _id: { code: "$code", date: "$date" },
          ids: { $push: "$_id" },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ];

    const duplicates = await collection.aggregate(pipeline).toArray();

    if (duplicates.length === 0) {
      console.log("No duplicates found");
      return;
    }

    // Prepare bulk operations
    const bulkOps = [];
    let totalToDelete = 0;

    for (const group of duplicates) {
      // Keep the first document, mark others for deletion
      const [keepId, ...deleteIds] = group.ids;

      deleteIds.forEach((id) => {
        bulkOps.push({
          deleteOne: {
            filter: { _id: id },
          },
        });
        totalToDelete++;
      });

      console.log(
        `Group (${group._id.code}, ${group._id.date}): Keeping ${keepId}, deleting ${deleteIds.length} documents`,
      );
    }

    // Execute bulk operations
    if (bulkOps.length > 0) {
      const result = await collection.bulkWrite(bulkOps);
      console.log(`\nBulk delete completed:`);
      console.log(`- Documents deleted: ${result.deletedCount}`);
      console.log(`- Total duplicate groups: ${duplicates.length}`);
      console.log(`- Total duplicates removed: ${totalToDelete}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

// removeDuplicatesBulk();

function hashCollection(db, name) {
  const cursor = db[name].find({}, { _id: 1 }).sort({ _id: 1 });
  const hash = crypto.createHash("sha256");
  cursor.forEach((doc) => hash.update(doc._id.valueOf().toString()));
  return hash.digest("hex");
}

let localDB;

new MongoClient(process.env.MONGODB_URI_LOCAL)
  .connect()
  .then((conn) => {
    console.log("Connected");
    localDB = conn.db(DB_NAME);
  })
  .catch(console.error);

// const srcDB = new Mongo("mongodb://localhost:27017").getDB(DB_NAME);
// const destDB = new Mongo(process.env.MONGODB_URI).getDB(DB_NAME);
// srcDB.getCollectionNames().forEach(name => {
//     const srcHash = hashCollection(srcDB, name);
//     const destHash = hashCollection(destDB, name);
//     print(`${name}: ${srcHash === destHash ? 'MATCH ✅' : 'MISMATCH ⚠️'}`);
// });

async function main() {
  // const src = new MongoClient(process.env.MONGODB_URI_LOCAL);
  // const dest = new MongoClient(process.env.MONGODB_URI_PROD);

  // console.log("Connecting");

  // await src.connect();
  // await dest.connect();

  // console.log("Connected");

  // const srcDB = src.db(DB_NAME);
  // const destDB = dest.db(DB_NAME);

  // console.log("Retrieving collections");

  // const collections = await srcDB.listCollections().toArray();
  // for (const { name } of collections) {
  //   const srcDocs = await srcDB
  //     .collection(name)
  //     .find({})
  //     .sort({ _id: 1 })
  //     .toArray();
  //   const destDocs = await destDB
  //     .collection(name)
  //     .find({})
  //     .sort({ _id: 1 })
  //     .toArray();
  //   console.log(destDocs);

  //   if (srcDocs.length !== destDocs.length) {
  //     console.log(
  //       `${name}: COUNT MISMATCH (${srcDocs.length} vs ${destDocs.length})`,
  //     );
  //     continue;
  //   }

  //   const allMatch = srcDocs.every(
  //     (doc, i) => JSON.stringify(doc) === JSON.stringify(destDocs[i]),
  //   );
  //   console.log(`${name}: ${allMatch ? "MATCH ✅" : "MISMATCH ⚠️"}`);
  // }

  // await src.close();
  // await dest.close();

  // db.stocks.aggregate([
  //   {
  //     $match: {
  //       // Filter for a specific stock and date range first to optimize performance
  //       symbol: "MDB",
  //       date: {
  //         $gte: new ISODate("2024-01-01T00:00:00Z"),
  //         $lte: new ISODate("2024-12-31T23:59:59Z"),
  //       },
  //     },
  //   },
  //   {
  //     $group: {
  //       // Group by month and year
  //       _id: {
  //         year: { $year: "$date" },
  //         month: { $month: "$date" },
  //         symbol: "$symbol",
  //       },
  //       averageClosingPrice: { $avg: "$closePrice" }, // Calculate the average closing price
  //     },
  //   },
  //   {
  //     $sort: { "_id.year": 1, "_id.month": 1 }, // Sort the results chronologically
  //   },
  // ]);

  // Ticker.aggregate([
  //   {
  //     $match: {
  //       code: "BSP",
  //     },
  //   },
  //   // {
  //   // 	$group: {
  //   // 		_id: {
  //   // 			symbol: "$symbol",
  //   // 			time: {
  //   // 				$dateTrunc: {
  //   // 					date: "$time",
  //   // 					unit: "minute",
  //   // 					binSize: 5
  //   // 				},
  //   // 			},
  //   // 		},
  //   // 		high: { $max: "$price" },
  //   // 		low: { $min: "$price" },
  //   // 		open: { $first: "$price" },
  //   // 		close: { $last: "$price" },
  //   // 	},
  //   // },
  //   // {
  //   // 	$sort: {
  //   // 		"_id.time": 1,
  //   // 	},
  //   // },
  // ]).then(function (tickers) {
  //   res.json(tickers);
  // });

  // // Remove duplicate stock quotes based on date and code
  // db.quotes.aggregate([
  //   // First Stage
  //   {
  //     $match: {
  //       date: {
  //         $gte: new ISODate("2014-01-01"),
  //         $lt: new ISODate("2015-01-01"),
  //       },
  //     },
  //   },
  //   // Second Stage
  //   {
  //     $group: {
  //       _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
  //       totalSaleAmount: { $sum: { $multiply: ["$price", "$quantity"] } },
  //       averageQuantity: { $avg: "$quantity" },
  //       count: { $sum: 1 },
  //     },
  //   },
  //   // Third Stage
  //   {
  //     $sort: { totalSaleAmount: -1 },
  //   },
  // ]);

  const duplicates = localDB
    .collection("quotes")
    .aggregate(
      [
        // {
        //   $addFields: {
        //     // Convert to consistent date format if needed
        //     normalizedDate: {
        //       $cond: {
        //         if: { $type: "$date" },
        //         then: {
        //           $dateToString: {
        //             format: "%Y-%m-%d",
        //             date: "$date",
        //           },
        //         },
        //         else: "$date",
        //       },
        //     },
        //   },
        // },
        {
          $sort: { date: -1 }, // Sort by date descending (newest first)
        },
        {
          $group: {
            //   _id: "$code", // Field to check for duplicates
            _id: {
              code: "$code",
              date: "$date",
              // If date is ISO string, extract just the date part
              // date: {
              //   $dateToString: {
              //     format: "%Y-%m-%d",
              //     date: "$date",
              //   },
              // },
              // date: "$normalizedDate",
            },
            // _id: {
            //   email: "$email", // Example: remove duplicate emails
            //   name: "$name", // While keeping same name
            // },
            ids: { $push: "$_id" },
            count: { $sum: 1 },
            // docs: { $push: "$$ROOT" },
            doc: { $first: "$$ROOT" }, // Keep the first document
          },
        },
        {
          $match: {
            count: { $gt: 1 },
          },
        },
        // {
        //   $replaceRoot: { newRoot: "$doc" }, // Restore original document structure
        // },
        // {
        //   $out: "collection_deduplicated", // Output to new collection
        // },
        // {
        //   $sort: { "_id.code": 1, "_id.date": 1 },
        // },
        // {
        //   $project: { normalizedDate: 0 }, // Remove temporary field
        // },
      ],
      { allowDiskUse: true },
    )
    .toArray();

  console.log(await duplicates);

  // db.collection.aggregate([
  //   {
  //     $group: {
  //       _id: null,
  //       uniqueDocs: { $addToSet: "$$ROOT" },
  //     },
  //   },
  //   {
  //     $unwind: "$uniqueDocs",
  //   },
  //   {
  //     $replaceRoot: { newRoot: "$uniqueDocs" },
  //   },
  // ]);

  // // First, identify duplicates
  // var duplicates = db.collection
  //   .aggregate([
  //     {
  //       $group: {
  //         _id: "$fieldName",
  //         ids: { $push: "$_id" },
  //         count: { $sum: 1 },
  //       },
  //     },
  //     {
  //       $match: {
  //         count: { $gt: 1 },
  //       },
  //     },
  //   ])
  //   .toArray();

  // Then delete duplicates (keeping one)
  // let deletedCount = 0;
  // duplicates.forEach(function (doc) {
  //   // Keep the first ID, remove the rest
  //   doc.ids.shift();
  //   db.collection.deleteMany({
  //     _id: { $in: doc.ids },
  //   });
  //   // // Keep the first ID, remove the rest
  //   // const idsToDelete = doc.ids.slice(1);

  //   // if (idsToDelete.length > 0) {
  //   //   const result = db.collection.deleteMany({
  //   //     _id: { $in: idsToDelete },
  //   //   });
  //   //   deletedCount += result.deletedCount;
  //   // }
  // });

  // print(`Deleted ${deletedCount} duplicate documents`);

  // verify();
}

function verify() {
  db.collection.aggregate([
    {
      $group: {
        _id: {
          code: "$code",
          date: "$date",
        },
        count: { $sum: 1 },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
  ]);
}

main().catch(console.log);
