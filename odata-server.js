const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
// const ODataServer = require('simple-odata-server');
// const Adapter = require('simple-odata-server-mongodb');
// const { odata2mongoose } = require('odata2mongoose');
// const ODataServer = require("@randajan/odata-server");
// const mongoAdapter = require("@randajan/odata-server/mongoAdapter");

mongoose
    .connect('mongodb://localhost:27017/odata_demo')
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, min: 0 },
    email: { type: String, unique: true }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// const odataServer = ODataServer()
//     .model({
//         namespace: "nuku",
//         entityTypes: {
//             "User": {
//                 "_id": { "type": "Edm.String", key: true },
//                 "name": { "type": "Edm.String" },
//                 "age": { "type": "Edm.Int32" },
//                 "email": { "type": "Edm.String" }
//             }
//         },
//         entitySets: {
//             "Users": { entityType: "nuku.User" }
//         }
//     })
//     .adapter(Adapter(function (cb) {
//         mongoose.connection.db.collection('users', cb);
//     }));

const mongo = {
    url: "mongodb://localhost:27017",
}

const getMongo = async (context) => {
    if (!mongo.current) {
        mongo.current = await MongoClient.connect(mongo.url);
        mongo.current.on("close", _ => { delete mongo.current; });
        process.on("exit", _ => {
            if (mongo.current) { mongo.current.close(); }
        });
    }

    return mongo.current;
}

const config = {
    url: 'http://localhost:1337',
    cors: "*",
    model: {
        namespace: "main",
        entityTypes: {
            "UserType": {
                "_id": { "type": "Edm.String", key: true },
                "test": { "type": "Edm.String" },
            }
        },
        entitySets: {
            "users": {
                entityType: "main.UserType"
            }
        }
    },
    // adapter: mongoAdapter(getMongo),
    extender: (context, customServeArgument) => {
        context.customProperty = customServeArgument;
    },
    converter: (primitive, value, method) => {
        console.log(primitive, value, method);
        return value;
    },
    filter: (context, collectionName, propertyName) => {
        console.log(context.customProperty, collectionName, propertyName);
        return true;
    },
}

// const server = ODataServer(config);

// const app = express();
// app.use(bodyParser.json());

// app.use('/odata', (req, res) => odataServer.handle(req, res));

// app.get('/users', async (req, res) => {
//     try {
//         const filter = odata2mongoose(req.query.$filter || '');
//         const users = await User.find(filter);
//         res.json(users);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });

// app.listen(3000, () => {
//     console.log('🚀 Server running at http://localhost:3000');
//     console.log('📡 OData endpoint: http://localhost:3000/odata/Users');
// });

// How it works
// simple-odata-server: Handles OData protocol parsing and routing.
// simple-odata-server-mongodb: Connects OData queries to MongoDB collections.
// odata2mongoose: Converts $filter, $orderby, $top, $skip into Mongoose query objects.
// Mongoose: Defines schema, validation, and interacts with MongoDB.


// Example OData Queries
// Once running, you can query:
// HttpGET http://localhost:3000/odata/Users?$filter=age gt 25
// GET http://localhost:3000/odata/Users?$orderby=name desc
// GET http://localhost:3000/odata/Users?$top=5&$skip=10


var odata = require('node-odata');

var server = odata('mongodb://localhost/odata_demo');

server.resource('books', { title: String, price: Number });

server.listen(3000);