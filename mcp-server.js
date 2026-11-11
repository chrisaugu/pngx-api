const express = require("express");
const http = require("http");
const cors = require("cors");
const crypto = require("crypto");
const Env = require("./config/env");

/**
 *
 * @param {http.Server} httpServer
 */
async function createMCPServer(app, httpServer) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: Env.NODE_ENV !== "production",
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  // Health check endpoint for container orchestration
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  });

  app.use(
    "/graphql",
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
      credentials: true,
    }),
    express.json({ limit: "10mb" }),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const requestId = crypto.randomUUID();
        res.setHeader("X-Request-Id", requestId);

        return {
          requestId,
          token: req.headers.token,
          request: req,
          response: res,
        };
      },
    }),
  );

  return app;
}

module.exports = { createMCPServer };
