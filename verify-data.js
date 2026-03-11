const crypto = require("crypto");
const { MongoClient } = require("mongodb");
const { DB_NAME } = require("./constants");
require('dotenv/config')

// function hashCollection(db, name) {
//     const cursor = db[name].find({}, { _id: 1 }).sort({ _id: 1 });
//     const hash = crypto.createHash("sha256");
//     cursor.forEach(doc => hash.update(doc._id.valueOf().toString()));
//     return hash.digest("hex");
// }

// const srcDB = new Mongo("mongodb://localhost:27017").getDB(DB_NAME);
// const destDB = new Mongo(process.env.MONGODB_URI).getDB(DB_NAME);
// srcDB.getCollectionNames().forEach(name => {
//     const srcHash = hashCollection(srcDB, name);
//     const destHash = hashCollection(destDB, name);
//     print(`${name}: ${srcHash === destHash ? 'MATCH ✅' : 'MISMATCH ⚠️'}`);
// });

async function verify() {
  const src = new MongoClient(process.env.MONGODB_URI_LOCAL);
  const dest = new MongoClient(process.env.MONGODB_URI_PROD);

  console.log("Connecting");

  await src.connect();
  await dest.connect();

  console.log("Connected");

  const srcDB = src.db(DB_NAME);
  const destDB = dest.db(DB_NAME);

  console.log("Retrieving collections");

  const collections = await srcDB.listCollections().toArray();
  for (const { name } of collections) {
    const srcDocs = await srcDB
      .collection(name)
      .find({})
      .sort({ _id: 1 })
      .toArray();
    const destDocs = await destDB
      .collection(name)
      .find({})
      .sort({ _id: 1 })
      .toArray();
    console.log(destDocs);

    if (srcDocs.length !== destDocs.length) {
      console.log(
        `${name}: COUNT MISMATCH (${srcDocs.length} vs ${destDocs.length})`
      );
      continue;
    }

    const allMatch = srcDocs.every(
      (doc, i) => JSON.stringify(doc) === JSON.stringify(destDocs[i])
    );
    console.log(`${name}: ${allMatch ? "MATCH ✅" : "MISMATCH ⚠️"}`);
  }

  await src.close();
  await dest.close();
}

verify().catch(console.log);
