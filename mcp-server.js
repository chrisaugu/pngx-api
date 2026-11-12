"use strict";

const express = require("express");
const { randomUUID } = require("crypto");
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const {
  StdioServerTransport,
} = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  StreamableHTTPServerTransport,
} = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const axios = require("axios");
const { z } = require("zod");

const NUKU_API_BASE = "http://localhost:5000/api/v2";
const USER_AGENT = "nuku-mcp-server/1.0";
const HTTP_PORT = 3000;

// Status mapping helpers
const statusConfig = {
  open: { icon: "🟢", label: "OPEN" },
  closed: { icon: "🔴", label: "CLOSED" },
};

const sessionConfig = {
  "pre-market": { label: "Pre-Market", emoji: "🌅" },
  "post-market": { label: "After-Hours", emoji: "🌙" },
};

async function makeApiRequest(url) {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/json",
    "X-API-Credentials": "",
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error making API request:", error);
    return null;
  }
}

function formatQuote(quote) {
  return [
    `Code: ${quote.code || "Unknown"}`,
    `Short Name: ${quote.short_name || "Unknown"}`,
    `Last Price: ${quote.last || "Unknown"}`,
    `Bid: ${quote.bid || "Unknown"}`,
    `Offer: ${quote.offer || "Unknown"}`,
    `High: ${quote.high || "Unknown"}`,
    `Low: ${quote.low || "Unknown"}`,
    `Open: ${quote.open || "Unknown"}`,
    `Close: ${quote.close || "Unknown"}`,
    `Change Today: ${quote.chg_today || "Unknown"}`,
    `Volume Today: ${quote.vol_today || "Unknown"}`,
    `Number of Trades: ${quote.num_trades || "Unknown"}`,
    "---",
  ].join("\n");
}

function formatIndex(index) {
  return `
        Code: ${index.code}
        Currency: ${index.currency}
        Current Value: ${index.currentValue}
        Exchange: ${index.exchange}
        History: ${index.history.map((h) => `${h}`).join(", ")}
        Is Active: ${index.isActive}
        Last Updated: ${index.lastUpdated}
        Percent Change: ${index.percentChange}
        Previous Close: ${index.previousClose}
        Components: ${index.components
          .map((r) => `${r.stockSymbol} ${r.weight}`)
          .join(", ")}
    `;
}

/**
 * Attach a stateful MCP endpoint to an existing Express app.
 * The shared mcpServer instance is connected once; all requests
 * are forwarded to it via the same transport.
 *
 * @param {import("express").Application} app
 * @returns {Promise<import("express").Application>}
 */
async function createMCPServer(app) {
  const mcpServer = new McpServer({
    name: "nuku-mcp-server",
    version: "1.0.0",
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  mcpServer.registerPrompt(
    "review-code",
    {
      title: "Code Review",
      description:
        "Review a snippet of code for bugs, security, and best practices",
      argsSchema: {
        language: z
          .string()
          .describe("Programming language (e.g., JavaScript, Python)"),
        code: z.string().describe("The source code to review"),
        focus: z
          .string()
          .optional()
          .describe("Optional focus area like performance or readability"),
      },
    },
    ({ language, code, focus }) => {
      const focusInstruction = focus
        ? ` Pay special attention to ${focus}.`
        : "";

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Please review the following ${language} code.${focusInstruction}\n\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\``,
            },
          },
        ],
      };
    },
  );

  mcpServer.registerTool(
    "list_symbols",
    {
      description: "List stock symbols",
    },
    async () => {
      const data = await makeApiRequest(`${NUKU_API_BASE}/`);

      if (!data) {
        return {
          content: [
            { type: "text", text: "Failed to retrieve stock listing data." },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text:
              "Currently listed stocks: " +
              data.data.codes.map((s) => `${s}`).join("\n"),
          },
        ],
      };
    },
  );

  mcpServer.registerTool(
    "list_stocks",
    {
      description: "List stocks quotes of the day",
    },
    async () => {
      const data = await makeApiRequest(`${NUKU_API_BASE}/stocks`);

      if (!data) {
        return {
          content: [
            { type: "text", text: "Failed to retrieve stock listing data." },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text:
              `Stocks traded on ${data.last_updated}:\n` +
              data.data.map(formatQuote).join("\n"),
          },
        ],
      };
    },
  );

  mcpServer.registerTool(
    "get_quotes",
    {
      description: "Get quote for a stock code/ticker/symbol",
      inputSchema: z.object({
        code: z.string().min(1).describe("Ticker symbol (e.g. BSP, KAM)"),
      }),
    },
    async ({ code }) => {
      const data = await makeApiRequest(`${NUKU_API_BASE}/stocks/${code}`);

      if (!data) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to retrieve stock quote for: ${code}.`,
            },
          ],
        };
      }

      const stockText = `Quote for ${code}:\n\n${data.data
        .map(formatQuote)
        .join("\n")}`;
      return { content: [{ type: "text", text: stockText }] };
    },
  );

  mcpServer.registerTool(
    "list_historicals",
    {
      description: "Get historical stock data for a ticker symbol",
      inputSchema: z.object({
        code: z.string().min(1).describe("Ticker symbol (e.g. BSP, KAM)"),
        start: z
          .string()
          .min(10)
          .max(10)
          .optional()
          .describe("Start date in YYYY-MM-DD format"),
        end: z
          .string()
          .min(10)
          .max(10)
          .optional()
          .describe("End date in YYYY-MM-DD format"),
        date: z
          .string()
          .refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid date format. Please provide a valid date string.",
          })
          .optional(),
      }),
    },
    async ({ code, start, end }) => {
      let url = `${NUKU_API_BASE}/stocks/historicals/${code}`;
      const params = [];
      if (start) params.push(`start=${start}`);
      if (end) params.push(`end=${end}`);
      if (params.length) url += `?${params.join("&")}`;

      const data = await makeApiRequest(url);

      if (!data) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to retrieve historical stock data for: ${code}${
                start ? `, start: ${start}` : ""
              }${end ? `, end: ${end}` : ""}.`,
            },
          ],
        };
      }

      const historicalInfo = data.historical
        .map(
          (r) =>
            `Date: ${r.date}\nCode: ${r.code}\nOpen: ${r.open}\nHigh: ${r.high}\nLow: ${r.low}\nClose: ${r.close}\nVolume: ${r.vol_today}`,
        )
        .join("\n---\n");

      return {
        content: [
          {
            type: "text",
            text: `Historical quotes for ${code}:\n\n${historicalInfo}`,
          },
        ],
      };
    },
  );

  mcpServer.registerTool(
    "list_indices",
    {
      description: "List stock market indices",
    },
    async () => {
      const data = await makeApiRequest(`${NUKU_API_BASE}/indices`);

      if (!data) {
        return {
          content: [
            { type: "text", text: "Failed to retrieve stock market indices." },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Stock Market Indices:\n${data.data
              .map(formatIndex)
              .join("\n---\n")}`,
          },
        ],
      };
    },
  );

  mcpServer.registerTool(
    "get_index",
    {
      description: "Get stock market index details",
      inputSchema: z.object({
        code: z.string().min(3).describe("Index code (e.g. PNGXD, PNGXI)"),
      }),
    },
    async ({ code }) => {
      const data = await makeApiRequest(`${NUKU_API_BASE}/indices/${code}`);

      if (!data) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to retrieve index data for: ${code}.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Index data for ${code}:\n${data.data
              .map(formatIndex)
              .join("\n---\n")}`,
          },
        ],
      };
    },
  );

  mcpServer.registerTool(
    "list_companies",
    {
      description: "List companies currently trading on the exchange",
    },
    async () => {
      const data = await makeApiRequest(`${NUKU_API_BASE}/companies`);

      if (!data) {
        return {
          content: [
            { type: "text", text: "Failed to retrieve companies data." },
          ],
        };
      }

      const companyList = data.map((c) => `${c.name} (${c.ticker})`).join("\n");
      return {
        content: [
          {
            type: "text",
            text: `Currently listed companies:\n\n${companyList}`,
          },
        ],
      };
    },
  );

  mcpServer.registerTool(
    "get_company",
    {
      description: "Get company details",
      inputSchema: z.object({
        code: z.string().min(1).describe("Ticker symbol/code (e.g. BSP, KAM)"),
      }),
    },
    async ({ code }) => {
      const data = await makeApiRequest(`${NUKU_API_BASE}/companies/${code}`);

      if (!data || data.length < 0) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to retrieve company data for: ${code}.`,
            },
          ],
        };
      }

      const info = [
        `Name: ${data[0].name}`,
        `Ticker: ${data[0].ticker}`,
        `Description: ${data[0].description}`,
        `Industry: ${data[0].industry}`,
        `Sector: ${data[0].sector}`,
        `Key People: ${data[0].key_people.join(", ")}`,
        `Date Listed: ${data[0].date_listed}`,
        `Established Date: ${data[0].established_date}`,
        `Outstanding Shares: ${data[0].outstanding_shares}`,
        `PNGX Profile URL: ${data[0].pngx_profile_url}`,
      ].join("\n");

      return {
        content: [
          { type: "text", text: `Company details for ${code}:\n\n${info}` },
        ],
      };
    },
  );

  mcpServer.registerTool(
    "get_market_status",
    {
      description: "Get current market status",
    },
    async () => {
      const data = await makeApiRequest(`${NUKU_API_BASE}/market/status`);

      if (!data) {
        return {
          content: [
            { type: "text", text: "Failed to retrieve market status." },
          ],
        };
      }
      console.log(data);

      const statusIcon = statusConfig[data.marketStatus]
        ? statusConfig[data.marketStatus].icon
        : "❓";
      const sessionLabel = sessionConfig[data.session]
        ? sessionConfig[data.session].label
        : data.session;

      const statusInfo = [
        `🎯 STOCK MARKET STATUS (${data.exchange} Exchange)`,
        "──────────────────────────────────",
        `${statusIcon} MARKET: ${data.marketStatus} • ${sessionLabel} Session`,
        `🕒 Last Updated: ${new Date(data.t).toISOString()}`,
        "",
        `• Exchange: ${data.exchange}`,
        `• Timezone: ${data.timezone}`,
        `• Holiday: ${data.holiday || "None"}`,
        `• Source: ${data.source}`,
        "──────────────────────────────────",
        "📊 Next Update: Real-time monitoring",
      ].join("\n");

      return { content: [{ type: "text", text: statusInfo }] };
    },
  );

  mcpServer.registerTool(
    "get_market_holidays",
    {
      description: "Get market holidays",
    },
    async () => {
      const data = await makeApiRequest(`${NUKU_API_BASE}/market/holidays`);

      if (!data) {
        return {
          content: [
            { type: "text", text: "Failed to retrieve market holidays." },
          ],
        };
      }

      const holidaysInfo = data
        .map((h) =>
          [
            "📊 MARKET HOLIDAY",
            "────────────────",
            `Date: ${h.date}`,
            `Description: ${h.description}`,
            `Business Day: ${h.business_day}`,
            `Trading Day: ${h.trading_day}`,
            `Settlement Activity: ${h.settlement_activity}`,
          ].join("\n"),
        )
        .join("\n---\n");

      return {
        content: [{ type: "text", text: `Market Holidays:\n${holidaysInfo}` }],
      };
    },
  );

  mcpServer.registerTool(
    "get_news",
    {
      description: "Get latest news articles",
    },
    async () => {
      const data = await makeApiRequest(`${NUKU_API_BASE}/news`);

      if (!data) {
        return {
          content: [
            { type: "text", text: "Failed to retrieve news articles." },
          ],
        };
      }

      const newsInfo = data
        .map((article) =>
          [
            `Title: ${article.title.rendered}`,
            `Date: ${article.date}`,
            `Link: ${article.link}`,
            `Excerpt: ${article.excerpt.rendered.replace(/<[^>]+>/g, "")}`,
          ].join("\n"),
        )
        .join("\n---\n");

      return {
        content: [{ type: "text", text: `Latest News Articles:\n${newsInfo}` }],
      };
    },
  );

  await mcpServer.connect(transport);

  app.post("/mcp", async (req, res) => {
    try {
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("MCP request error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  });

  return app;
}

// ---------------------------------------------------------------------------
// OKXServer — low-level Server wrapper for OKX crypto market data
// ---------------------------------------------------------------------------

// class OKXServer {
//     constructor() {
//         console.error("[Setup] Initializing OKX MCP server...");

//         this.server = new Server(
//             { name: "nuku-mcp-server", version: "0.1.0" },
//             {
//                 capabilities: {
//                     tools: {},
//                     resources: {},
//                     prompts: {},
//                     completions: {},
//                 },
//             },
//         );

//         this.axiosInstance = axios.create({
//             baseURL: "https://www.okx.com/api/v5",
//             timeout: 5000,
//             headers: {
//                 Accept: "application/json",
//                 "Content-Type": "application/json",
//             },
//         });

//         this._setupToolHandlers();

//         this.server.onerror = (error) => console.error("[OKXServer Error]", error);

//         process.on("SIGINT", async () => {
//             await this.server.close();
//             process.exit(0);
//         });
//     }

//     _setupToolHandlers() {
//         this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
//             tools: [
//                 {
//                     name: "get_price",
//                     description: "Get latest price for an OKX instrument",
//                     inputSchema: {
//                         type: "object",
//                         properties: {
//                             instrument: { type: "string", description: "Instrument ID (e.g. BTC-USDT)" },
//                         },
//                         required: ["instrument"],
//                     },
//                 },
//                 {
//                     name: "get_candlesticks",
//                     description: "Get candlestick data for an OKX instrument",
//                     inputSchema: {
//                         type: "object",
//                         properties: {
//                             instrument: { type: "string", description: "Instrument ID (e.g. BTC-USDT)" },
//                             bar: { type: "string", description: "Time interval (e.g. 1m, 5m, 1H, 1D)", default: "1m" },
//                             limit: { type: "number", description: "Number of candlesticks (max 100)", default: 100 },
//                         },
//                         required: ["instrument"],
//                     },
//                 },
//             ],
//         }));

//         this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
//             const { name, arguments: args } = request.params;

//             if (!["get_price", "get_candlesticks"].includes(name)) {
//                 throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
//             }

//             if (!args || !args.instrument) {
//                 throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: instrument");
//             }

//             try {
//                 if (name === "get_price") {
//                     console.error(`[OKX API] Fetching price for instrument: ${args.instrument}`);

//                     const response = await this.axiosInstance.get("/market/ticker", {
//                         params: { instId: args.instrument },
//                     });

//                     if (response.data.code !== "0") {
//                         throw new Error(`OKX API error: ${response.data.msg}`);
//                     }
//                     if (!response.data.data || response.data.data.length === 0) {
//                         throw new Error("No data returned from OKX API");
//                     }

//                     const ticker = response.data.data[0];
//                     return {
//                         content: [{
//                             type: "text",
//                             text: JSON.stringify({
//                                 instrument: ticker.instId,
//                                 lastPrice: ticker.last,
//                                 bid: ticker.bidPx,
//                                 ask: ticker.askPx,
//                                 high24h: ticker.high24h,
//                                 low24h: ticker.low24h,
//                                 volume24h: ticker.vol24h,
//                                 timestamp: new Date(parseInt(ticker.ts)).toISOString(),
//                             }, null, 2),
//                         }],
//                     };
//                 }

//                 // get_candlesticks
//                 console.error(`[OKX API] Fetching candlesticks for: ${args.instrument}, bar: ${args.bar || "1m"}, limit: ${args.limit || 100}`);

//                 const response = await this.axiosInstance.get("/market/candles", {
//                     params: {
//                         instId: args.instrument,
//                         bar: args.bar || "1m",
//                         limit: args.limit || 100,
//                     },
//                 });

//                 if (response.data.code !== "0") {
//                     throw new Error(`OKX API error: ${response.data.msg}`);
//                 }
//                 if (!response.data.data || response.data.data.length === 0) {
//                     throw new Error("No data returned from OKX API");
//                 }

//                 return {
//                     content: [{
//                         type: "text",
//                         text: JSON.stringify(
//                             response.data.data.map(([time, open, high, low, close, vol, volCcy]) => ({
//                                 timestamp: new Date(parseInt(time)).toISOString(),
//                                 open,
//                                 high,
//                                 low,
//                                 close,
//                                 volume: vol,
//                                 volumeCurrency: volCcy,
//                             })),
//                             null,
//                             2,
//                         ),
//                     }],
//                 };
//             } catch (error) {
//                 console.error("[OKX Error] Failed to fetch data:", error);
//                 throw new McpError(
//                     ErrorCode.InternalError,
//                     `Failed to fetch data: ${error instanceof Error ? error.message : String(error)}`,
//                 );
//             }
//         });

//         this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
//             resources: [{
//                 uri: "hello://world",
//                 name: "Hello World Message",
//                 description: "A simple greeting message",
//                 mimeType: "text/plain",
//             }],
//         }));

//         this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
//             if (request.params.uri === "hello://world") {
//                 return {
//                     contents: [{
//                         uri: "hello://world",
//                         text: "Hello, World! This is my first MCP resource.",
//                     }],
//                 };
//             }
//             throw new McpError(ErrorCode.InvalidRequest, "Resource not found");
//         });
//     }

//     run(transport) {
//         if (!transport) throw new Error("transport attribute cannot be empty");
//         return this.server.connect(transport);
//     }
// }

// async function startStdio() {
//     try {
//         const transport = new StdioServerTransport();
//         await mcpServer.connect(transport);
//         console.error("NUKU MCP server running on stdio");
//     } catch (error) {
//         console.error("Fatal error starting stdio transport:", error);
//         throw error;
//     }
// }

// // ---------------------------------------------------------------------------
// // Auto-start when run directly:  node mcp-server.js [--http | --stdio]
// // ---------------------------------------------------------------------------
// if (require.main === module) {
//     const mode = process.argv[2] || "--stdio";

//     if (mode === "--http") {
//         startHTTP().catch((err) => {
//             console.error("Fatal error:", err);
//             process.exit(1);
//         });
//     } else {
//         startStdio().catch((err) => {
//             console.error("Fatal error:", err);
//             process.exit(1);
//         });
//     }
// }

module.exports = { createMCPServer };
