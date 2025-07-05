const serverless = require("serverless-http");
const app = require("./app");

console.log("Starting NUKU API serverless...");
module.exports.handler = serverless(app);

// const handler = serverless(app, { provider: "azure" });
// module.exports.handler = async (context, req) => {
//   context.res = await handler(context, req);
// };