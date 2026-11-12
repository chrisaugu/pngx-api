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

  // ---------------------------------------------------------------------------
  // NUKU MCP PROMPTS — STOCK MARKET & INVESTMENT RESEARCH
  // ---------------------------------------------------------------------------

  // 1. Individual Stock Analysis
  mcpServer.registerPrompt(
    "stock-analysis",
    {
      title: "Stock Analysis",
      description: "Perform a comprehensive analysis of a PNGX-listed stock.",
      argsSchema: {
        code: z.string().min(1).describe("Stock ticker symbol, e.g. BSP"),
      },
    },
    ({ code }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Perform a comprehensive analysis of ${code}, listed on PNGX.

Use the available MCP tools to retrieve:
- Current stock quote using get_quotes.
- Historical stock prices using list_historicals.
- Company information using get_company.

Analyse the following:
1. Current market price and trading activity.
2. Daily price movement and percentage change.
3. Trading volume and liquidity.
4. Historical price performance.
5. Price trends and volatility.
6. Company background and industry.
7. Potential investment opportunities.
8. Key risks and limitations.

Conclude with an objective investment research summary.

Clearly distinguish available facts from your own analysis. Do not invent financial information or provide unsupported price targets.`,
          },
        },
      ],
    }),
  );

  // 2. Compare Multiple Stocks
  mcpServer.registerPrompt(
    "compare-stocks",
    {
      title: "Compare Stocks",
      description: "Compare multiple PNGX-listed stocks.",
      argsSchema: {
        codes: z
          .string()
          .min(3)
          .describe("Comma-separated ticker symbols, e.g. BSP,KAM"),
      },
    },
    ({ codes }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Compare the following PNGX-listed stocks: ${codes}.

Retrieve the latest quotes and company information for each stock.

Compare:
1. Current share prices.
2. Daily price movements.
3. Trading volumes.
4. Bid and offer prices.
5. Historical performance.
6. Trading liquidity.
7. Company industries and business operations.
8. Relative strengths and weaknesses.
9. Investment risks.

Present the results in a comparison table.

Identify which stocks demonstrate stronger historical performance and explain the differences.

Do not automatically interpret past performance as an indication of future returns. Identify any unavailable data.`,
          },
        },
      ],
    }),
  );

  // 3. PNGX Market Overview
  mcpServer.registerPrompt(
    "market-overview",
    {
      title: "PNGX Market Overview",
      description: "Generate an overview of the current PNGX stock market.",
      argsSchema: {},
    },
    () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Prepare a comprehensive PNGX stock market overview.

Use the available tools:
- get_market_status
- list_stocks
- list_symbols
- list_indices
- list_companies
- get_market_holidays

Cover:
1. Current market status.
2. Trading session.
3. Overall market activity.
4. Listed companies and available stock symbols.
5. Stocks with the strongest positive movements.
6. Stocks with the strongest negative movements.
7. Trading volumes and activity.
8. Current market indices.
9. Upcoming market holidays.
10. Important market observations.

Present the information in clearly organised sections.

Only describe movements supported by retrieved data. Identify missing information rather than making assumptions.`,
          },
        },
      ],
    }),
  );

  // 4. Technical Analysis
  mcpServer.registerPrompt(
    "technical-analysis",
    {
      title: "Technical Analysis",
      description: "Analyse historical stock prices and technical trends.",
      argsSchema: {
        code: z.string().min(1).describe("Stock ticker symbol"),
        start: z.string().optional().describe("Start date YYYY-MM-DD"),
        end: z.string().optional().describe("End date YYYY-MM-DD"),
      },
    },
    ({ code, start, end }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Perform technical analysis on PNGX stock ${code}.

Analysis period:
Start: ${start || "Use available historical data"}
End: ${end || "Latest available data"}

Retrieve historical prices using list_historicals.

Analyse:
1. Overall price trend.
2. Support and resistance levels, where sufficient data exists.
3. Price volatility.
4. Daily and period-over-period returns.
5. Moving averages (20-day, 50-day and 200-day where sufficient observations exist).
6. Relative Strength Index (RSI), where calculable.
7. MACD, where calculable.
8. Trading volume patterns.
9. Potential bullish and bearish signals.

Explain the calculations and assumptions.

Do not manufacture indicators when insufficient historical observations are available.

Conclude with a technical outlook, including the limitations of the analysis.`,
          },
        },
      ],
    }),
  );

  // 5. Company Research
  mcpServer.registerPrompt(
    "company-research",
    {
      title: "Company Research",
      description: "Research a PNGX-listed company's profile and business.",
      argsSchema: {
        code: z.string().min(1).describe("Company ticker symbol"),
      },
    },
    ({ code }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Prepare a company research report for PNGX-listed company ${code}.

Retrieve company information using get_company.

Research the following areas using available data:
1. Company name and background.
2. Business description.
3. Industry and sector.
4. Key people.
5. Establishment date.
6. PNGX listing date.
7. Outstanding shares.
8. Current stock price.
9. Market trading activity.
10. Company's position within its industry.

Identify information that is unavailable through the current API.

Do not infer revenue, profitability, debt, earnings or valuation metrics unless reliable supporting data is available.`,
          },
        },
      ],
    }),
  );

  // 6. Financial News Analysis
  mcpServer.registerPrompt(
    "market-news-analysis",
    {
      title: "Market News Analysis",
      description:
        "Analyse financial news and potential PNGX market implications.",
      argsSchema: {
        code: z.string().optional().describe("Optional company ticker symbol"),
      },
    },
    ({ code }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Analyse the latest available PNGX financial and market news.

${code ? `Pay particular attention to news concerning ${code}.` : ""}

Retrieve articles using get_news.

For each relevant article:
1. Identify its headline and publication date.
2. Summarise the key development.
3. Identify the companies or sectors affected.
4. Explain potential positive market implications.
5. Explain potential negative market implications.
6. Identify possible investor concerns.
7. Distinguish confirmed developments from speculation.

Where relevant, compare the news with available stock quotes and historical prices.

Do not claim that a news event caused a price movement without supporting evidence.`,
          },
        },
      ],
    }),
  );

  // 7. Historical Performance Analysis
  mcpServer.registerPrompt(
    "historical-performance",
    {
      title: "Historical Performance",
      description:
        "Evaluate a stock's historical price and trading performance.",
      argsSchema: {
        code: z.string().min(1).describe("Stock ticker symbol"),
        start: z.string().optional().describe("Start date YYYY-MM-DD"),
        end: z.string().optional().describe("End date YYYY-MM-DD"),
      },
    },
    ({ code, start, end }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Evaluate the historical performance of PNGX stock ${code}.

Period:
Start: ${start || "Earliest available historical date"}
End: ${end || "Latest available date"}

Retrieve historical data using list_historicals.

Calculate and analyse:
1. Starting and ending share prices.
2. Absolute price change.
3. Percentage return.
4. Highest and lowest recorded prices.
5. Average trading volume.
6. Periodic price movements.
7. Volatility.
8. Maximum drawdown, where calculable.
9. General historical price trend.

Explain the methodology and any limitations caused by missing trading days or incomplete records.

Present the findings in a structured report.`,
          },
        },
      ],
    }),
  );

  // 8. Market Index Analysis
  mcpServer.registerPrompt(
    "index-analysis",
    {
      title: "Market Index Analysis",
      description: "Analyse PNGX stock market indices and their components.",
      argsSchema: {
        code: z.string().min(3).describe("Index code, e.g. PNGXD"),
      },
    },
    ({ code }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Analyse the PNGX market index ${code}.

Retrieve index information using get_index.

Analyse:
1. Current index value.
2. Previous closing value.
3. Percentage change.
4. Historical index movements.
5. Index components.
6. Individual component weights.
7. Concentration among major constituents.
8. Market exposure and sector representation, where available.

Explain what the index movements indicate about the broader PNGX market.

Clearly identify unavailable component and historical information.`,
          },
        },
      ],
    }),
  );

  // 9. Investment Research Report
  mcpServer.registerPrompt(
    "investment-research",
    {
      title: "Investment Research Report",
      description:
        "Generate a structured investment research report for a PNGX stock.",
      argsSchema: {
        code: z.string().min(1).describe("Stock ticker symbol"),
        investment_horizon: z
          .enum(["short-term", "medium-term", "long-term"])
          .default("long-term"),
      },
    },
    ({ code, investment_horizon }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Prepare an investment research report for ${code}, a PNGX-listed stock.

Investment horizon: ${investment_horizon}.

Retrieve all relevant available market and company information.

Structure the report as follows:

1. Executive Summary
2. Company Overview
3. Industry and Sector
4. Current Stock Valuation Data
5. Historical Stock Performance
6. Trading Activity and Liquidity
7. Technical Analysis
8. Investment Opportunities
9. Key Investment Risks
10. Bull Case
11. Bear Case
12. Information Gaps
13. Overall Investment Assessment

Where financial statements, earnings, dividends, cash flows and valuation multiples are unavailable, explicitly identify these limitations.

Do not fabricate financial ratios, intrinsic values or target prices.

This is an analytical research report, not personalised financial advice.`,
          },
        },
      ],
    }),
  );

  // 10. Market Risk Analysis
  mcpServer.registerPrompt(
    "market-risk-analysis",
    {
      title: "Market Risk Analysis",
      description:
        "Evaluate historical trading and market risks for a PNGX stock.",
      argsSchema: {
        code: z.string().min(1).describe("Stock ticker symbol"),
      },
    },
    ({ code }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Conduct a market risk analysis for PNGX-listed stock ${code}.

Retrieve its current quote, company profile and available historical prices.

Evaluate:
1. Historical price volatility.
2. Maximum historical drawdown, where calculable.
3. Trading liquidity.
4. Bid-ask spread.
5. Trading volume consistency.
6. Price concentration and unusual movements.
7. Sensitivity to broader market movements, where benchmark data permits.
8. Data availability and reliability risks.
9. Potential downside scenarios.
10. Factors investors should monitor.

Classify identified risks as low, moderate or high only where sufficient evidence supports the classification.

Explain the assumptions and limitations of each assessment.

Do not present historical volatility as a prediction of future losses.`,
          },
        },
      ],
    }),
  );

  //     mcpServer.registerResource(
  //         "market-reference-guide",
  //         "nuku://reference/market-guide",
  //         {
  //             title: "NUKU PNGX Market Reference Guide",
  //             description:
  //                 "Reference guide describing PNGX market data concepts and available NUKU resources.",
  //             mimeType: "text/markdown",
  //         },
  //         async (uri) => ({
  //             contents: [
  //                 {
  //                     uri: uri.href,
  //                     mimeType: "text/markdown",
  //                     text: `# NUKU PNGX Market Reference Guide

  // ## Purpose
  // NUKU provides access to Papua New Guinea Exchange
  // market information through its API and MCP interface.

  // ## Available market information
  // - Listed stock symbols.
  // - Current stock quotes.
  // - Historical stock prices.
  // - Company profiles.
  // - Market indices.
  // - Market status and holidays.
  // - Market news.

  // ## Interpretation guidelines
  // 1. Treat API data as the source of truth.
  // 2. Identify the retrieval date where available.
  // 3. Distinguish facts from calculations and assumptions.
  // 4. Do not fabricate financial information.
  // 5. Historical performance does not guarantee future returns.
  // 6. Disclose missing or stale data.

  // ## Resource URI patterns
  // - nuku://market/status
  // - nuku://market/holidays
  // - nuku://market/indices
  // - nuku://market/companies
  // - nuku://market/symbols
  // - nuku://market/news
  // - nuku://stocks/{code}/quote
  // - nuku://stocks/{code}/historicals
  // - nuku://companies/{code}
  // - nuku://indices/{code}
  // `,
  //                 },
  //             ],
  //         })
  //     );

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
