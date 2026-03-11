const { MongoClient } = require('mongodb');
const { DB_NAME } = require("./constants");
const Env = require('./config/env');

async function removeDuplicates() {
    const uri = process.env.MONGODB_URI_PROD;
    const collectionName = Env.mongodb.collection.quotes;

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(DB_NAME);
        const collection = db.collection(collectionName);

        // Find duplicates based on code and date
        const duplicates = await collection.aggregate([
            // { $sort: { date: -1 } }, // Most recent first
            {
                $group: {
                    _id: { code: "$code", date: "$date" },
                    count: { $sum: 1 },
                    ids: { $push: "$_id" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 } // Only groups with duplicates
                }
            }
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
                    _id: { $in: idsToDelete }
                });

                deletedCount += result.deletedCount;
                console.log(`Deleted ${result.deletedCount} duplicates for code: ${duplicate._id.code}, date: ${duplicate._id.date}`);
            }
        }

        console.log(`Total duplicate documents removed: ${deletedCount}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}

async function createUniqueIndex() {
    const uri = 'your_mongodb_connection_string';
    const dbName = 'your_database_name';
    const collectionName = 'your_collection_name';

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Create unique compound index on code and date
        const result = await collection.createIndex(
            { code: 1, date: 1 },
            { unique: true }
        );

        console.log('Unique index created successfully:', result);

    } catch (error) {
        if (error.code === 11000) {
            console.error('Duplicate keys found! Run the cleanup script first.');
        } else {
            console.error('Error:', error);
        }
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}

// createUniqueIndex();

removeDuplicates();

async function removeDuplicatesBulk() {
    const uri = 'your_mongodb_connection_string';
    const dbName = 'your_database_name';
    const collectionName = 'your_collection_name';

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Get all unique combinations
        const pipeline = [
            {
                $group: {
                    _id: { code: "$code", date: "$date" },
                    ids: { $push: "$_id" },
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ];

        const duplicates = await collection.aggregate(pipeline).toArray();

        if (duplicates.length === 0) {
            console.log('No duplicates found');
            return;
        }

        // Prepare bulk operations
        const bulkOps = [];
        let totalToDelete = 0;

        for (const group of duplicates) {
            // Keep the first document, mark others for deletion
            const [keepId, ...deleteIds] = group.ids;

            deleteIds.forEach(id => {
                bulkOps.push({
                    deleteOne: {
                        filter: { _id: id }
                    }
                });
                totalToDelete++;
            });

            console.log(`Group (${group._id.code}, ${group._id.date}): Keeping ${keepId}, deleting ${deleteIds.length} documents`);
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
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}

// removeDuplicatesBulk();