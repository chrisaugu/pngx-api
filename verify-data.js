const crypto = require("crypto");
const { MongoClient } = require("mongodb");

// function hashCollection(db, name) {
//     const cursor = db[name].find({}, { _id: 1 }).sort({ _id: 1 });
//     const hash = crypto.createHash("sha256");
//     cursor.forEach(doc => hash.update(doc._id.valueOf().toString()));
//     return hash.digest("hex");
// }

// const srcDB = new Mongo("mongodb://localhost:27017").getDB("pngx-db");
// const destDB = new Mongo("mongodb://mongo:7jwWt40aFifdQ5N8U1xRHhJ3MYBn692P@cgk1.clusters.zeabur.com:32312").getDB("pngx-db");

// srcDB.getCollectionNames().forEach(name => {
//     const srcHash = hashCollection(srcDB, name);
//     const destHash = hashCollection(destDB, name);
//     print(`${name}: ${srcHash === destHash ? 'MATCH ✅' : 'MISMATCH ⚠️'}`);
// });

async function verify() {
  const src = new MongoClient("mongodb://localhost:27017");
  const dest = new MongoClient(
    "mongodb://mongo:7jwWt40aFifdQ5N8U1xRHhJ3MYBn692P@cgk1.clusters.zeabur.com:32312/?authSource=admin"
  );

  console.log("Connecting");

  await src.connect();
  await dest.connect();

  console.log("Connected");

  const srcDB = src.db("pngx-db");
  const destDB = dest.db("pngx-db");

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
