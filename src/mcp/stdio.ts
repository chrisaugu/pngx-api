#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import mcpServer, { OKXServer } from "./server.js";

async function main() {
  try {
    // Start MCP server on stdio transport
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    // const OKXClient = new OKXServer();
    // await OKXClient.run(transport);
    console.error("OKX MCP server running on stdio");
  } catch (error) {
    throw error;
  }
}

main()
  .then((result) => {
    console.log("MCP server is running...");
    console.log("NUKU API MCP Server running on stdio");
  })
  .catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });
