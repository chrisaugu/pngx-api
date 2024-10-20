const mongoose = require("mongoose");
require("dotenv").config();

module.exports.initDatabase = function() {
//     return new Promise((resolve, reject) => {
        // Creating an instance for MongoDB
        mongoose
        .set('strictQuery', false)
        .connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // mongoose.connection.on("connected", function(result) {
        //     console.log("Connected: Successfully connect to mongo server");
        //     resolve(result)
        // })

        // mongoose.connection.on('error', function(error) {
        //     console.log("Error: Could not connect to MongoDB. Did you forget to run 'mongod'?");
        //     reject(error);
        // });

        return mongoose.connection;

//     })
}