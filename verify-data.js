const crypto = require("crypto");
const { MongoClient } = require("mongodb");
const Env = require("./config/env");

// function hashCollection(db, name) {
//     const cursor = db[name].find({}, { _id: 1 }).sort({ _id: 1 });
//     const hash = crypto.createHash("sha256");
//     cursor.forEach(doc => hash.update(doc._id.valueOf().toString()));
//     return hash.digest("hex");
// }

// const srcDB = new Mongo(Env.mongodb.local).getDB(Env.mongodb.name);
// const destDB = new Mongo(Env.mongodb.remote).getDB(Env.mongodb.name);

// srcDB.getCollectionNames().forEach(name => {
//     const srcHash = hashCollection(srcDB, name);
//     const destHash = hashCollection(destDB, name);
//     print(`${name}: ${srcHash === destHash ? 'MATCH ✅' : 'MISMATCH ⚠️'}`);
// });

async function verify() {
  const src = new MongoClient(Env.mongodb.local);
  const dest = new MongoClient(Env.mongodb.remote);

  console.log("Connecting");

  await src.connect();
  await dest.connect();

  console.log("Connected");

  const srcDB = src.db(Env.mongodb.name);
  const destDB = dest.db(Env.mongodb.name);

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
        `${name}: COUNT MISMATCH (${srcDocs.length} vs ${destDocs.length})`,
      );
      continue;
    }

    const allMatch = srcDocs.every(
      (doc, i) => JSON.stringify(doc) === JSON.stringify(destDocs[i]),
    );
    console.log(`${name}: ${allMatch ? "MATCH ✅" : "MISMATCH ⚠️"}`);
  }

  await src.close();
  await dest.close();
}

verify().catch(console.log);
