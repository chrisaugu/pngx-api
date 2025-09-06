import serverless from "serverless-http";
import app from "./app";

console.log("Starting NUKU API serverless...");
module.exports.handler = serverless(app);

// const handler = serverless(app, { provider: "azure" });
// module.exports.handler = async (context, req) => {
//   context.res = await handler(context, req);
// };