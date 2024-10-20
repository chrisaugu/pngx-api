const mongoose = require('mongoose');
require('dotenv').config();
const celery = require('celery-node');
const tasks = require("./tasks");

const worker = celery.createWorker(
    "redis://127.0.0.1:6379", 
    "redis://127.0.0.1:6379"
);

// Creating an instance for MongoDB
mongoose
.set('strictQuery', false)
.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
mongoose.connection.on("connected", function() {
	console.log("[Worker]: Connected: Successfully connect to mongo server on the worker");
});
mongoose.connection.on('error', function() {
	console.log("[Worker]: Error: Could not connect to MongoDB. Did you forget to run 'mongod'?");
});

// registering all tasks
worker.register("tasks.data_fetcher", tasks.data_fetcher);
worker.register("tasks.stock_fetcher", tasks.stock_fetcher);

// starts all workers
worker.start();

// tasks = registerTasks([])
// tasks.call('fetch_data_from_pngx', []).then(data => {
	
// });