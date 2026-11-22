import express from "express";
import http from "http";
import cors from "cors";
import crypto from "crypto";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/typeDefs";
import ServerApp from "./Application";
import Env from "./config/env";

/**
 *
 * @param {express.Application} app
 * @param {http.Server} httpServer
 */
async function createGraphQLServer(
  app: express.Application,
  httpServer: http.Server,
) {
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

export { createGraphQLServer };
