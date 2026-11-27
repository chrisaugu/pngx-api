import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { completable } from "@modelcontextprotocol/sdk/server/completable.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListResourceTemplatesRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { z } from "zod";
import { stringFormat } from "zod/v4";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

const OKX_API_BASE = "https://www.okx.com/api/v5";
const OKX_USER_AGENT = "okx-mcp-server/1.0";

const NUKU_API_BASE = "http://localhost:5000/api/v2";
const USER_AGENT = "nuku-mcp-server/1.0";

interface OKXTickerResponse {
  code: string;
  msg: string;
  data: Array<{
    instId: string;
    last: string;
    askPx: string;
    bidPx: string;
    open24h: string;
    high24h: string;
    low24h: string;
    volCcy24h: string;
    vol24h: string;
    ts: string;
  }>;
}

interface OKXCandlesticksResponse {
  code: string;
  msg: string;
  data: Array<
    [
      time: string, // Open time
      open: string, // Open price
      high: string, // Highest price
      low: string, // Lowest price
      close: string, // Close price
      vol: string, // Trading volume
      volCcy: string, // Trading volume in currency
    ]
  >;
}

interface NukuResponse<T> {
  status: string; // error, success,
  code: number; // 200, 300, 400, 500
  message: string; // Retrieved stocks
  data: T;
}

type Tx = {
  api: string;
  timestamp: number;
  codes: string[];
};

interface NukuListSymbolsResponse extends NukuResponse<Tx> {}

interface NukuQuote {
  date: string;
  code: string;
  short_name: string;
  bid: number;
  offer: number;
  last: number;
  close: number;
  high: number;
  low: number;
  open: number;
  chg_today: number;
  vol_today: number;
  num_trades: number;
}

interface NukuIndexComponent {
  id: number;
  stockSymbol: string;
  weight: string;
}

interface NukuIndex {
  id: string;
  code: string;
  name: string;
  components: NukuIndexComponent[];
  currentValue: number;
  previousClose: number;
  exchange: string;
  currency: string;
  isActive: true;
  lastUpdated: Date | string;
  history: [];
  percentChange: number;
}

interface NukuIndexListResponse extends NukuResponse<Array<NukuIndex>> {
  results: number;
}

interface NukuIndexResponse extends NukuResponse<NukuIndex> {
  results: number;
}

interface NukuQuoteResponse extends NukuResponse<Array<NukuQuote>> {
  date: string;
  last_updated: string;
  count: number;
}

interface NukuStockQuoteResponse extends NukuResponse<Array<NukuQuote>> {}

interface NukuHistoricalQuote {
  date: string;
  code: string;
  close: number;
  high: number;
  low: number;
  open: number;
  vol_today: number;
}

interface NukuHistoricalQuoteResponse extends NukuResponse<Array<NukuQuote>> {
  date: string;
  last_updated: string;
  total_count: number;
  symbol: string;
  historical: Array<NukuHistoricalQuote>;
}

// Status mapping logic
const statusConfig = {
  open: { icon: "🟢", label: "OPEN" },
  closed: { icon: "🔴", label: "CLOSED" },
};

const sessionConfig = {
  "pre-market": { label: "Pre-Market", emoji: "🌅" },
  "post-market": { label: "After-Hours", emoji: "🌙" },
};

const getStatusDisplay = (data: NukuMarketStatusResponse) => ({
  statusIcon: data.isOpen ? "🟢" : "🔴",
  statusText: data.marketStatus.toUpperCase(),
  sessionEmoji: data.session === "pre-market" ? "🌅" : "🌙",
  holidayDisplay: data.holiday || "No Holiday",
  // timeAgo: getTimeAgo(data.lastUpdated)
});

interface NukuMarketStatusResponse {
  marketStatus: "open" | "closed";
  session: "pre-market" | "post-market";
  timezone: string;
  t: number;
  source: string;
  lastUpdated: string;
  exchange: "PG";
  holiday: string;
  isOpen: boolean;
}

interface NukuMarketHolidaysResponse {
  date: string;
  description: string;
  business_day: string;
  trading_day: string;
  settlement_activity: string;
}

interface NukuCompanyResponse {
  name: string;
  ticker: string;
  description: string;
  industry: string;
  sector: string;
  key_people: string[];
  date_listed: string;
  established_date: string;
  outstanding_shares: number;
  pngx_profile_url: string;
}

interface Link {
  href: string;
  targetHints?: {
    allow: string[];
  };
  embeddable?: boolean;
  count?: number;
  id?: number;
  templated?: boolean;
  name?: string;
}

interface NukuNewsArticle {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: {
    jetpack_post_was_ever_published: boolean;
    _jetpack_newsletter_access: string;
    _jetpack_dont_email_post_to_subs: boolean;
    _jetpack_newsletter_tier_id: number;
    _jetpack_memberships_contains_paywalled_content: boolean;
    _jetpack_memberships_contains_paid_content: boolean;
    footnotes: string;
    jetpack_publicize_message: string;
    jetpack_publicize_feature_enabled: boolean;
    jetpack_social_post_already_shared: boolean;
    jetpack_social_options: {
      image_generator_settings: {
        template: string;
        enabled: boolean;
      };
      version: number;
    };
  };
  categories: number[];
  tags: number[];
  class_list: string[];
  jetpack_publicize_connections: any[];
  jetpack_featured_media_url: string;
  jetpack_sharing_enabled: boolean;
  jetpack_shortlink: string;
  "jetpack-related-posts": any[];
  _links: {
    self: Link[];
    collection: Link[];
    about: Link[];
    author: Link[];
    replies: Link[];
    "version-history": Link[];
    "predecessor-version": Link[];
    "wp:attachment": Link[];
    "wp:term": Link[];
    curies: Link[];
  };
}

// Create server instance
const mcpServer = new McpServer({
  name: "nuku-mcp-server",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});
// mcpcat.track(mcpServer, "proj_33JMedEYBHXWkT5kh4m51L8zg1U", {
//     identify: async (request, extra) => {
//         const user = await myapi.getUser(request.params.arguments.token);
//         return {
//             userId: user.id,
//             userName: user.name,
//             userData: { favoriteColor: user.favoriteColor },
//         };
//     },
// });

// Helper function for making API requests
async function makeApiRequest<T>(url: string): Promise<T | null> {
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
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making NWS request:", error);
    return null;
  }
}

// Format alert data
function formatQuote(quote: NukuQuote): string {
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

function formatIndex(index: NukuIndex) {
  return `
        Code: ${index.code}
        Currency: ${index.currency}
        Current Value: ${index.currentValue}
        Exchange: ${index.exchange}
        History: ${index.history.map((h) => `${h}`)}
        Is Active: ${index.isActive}
        Last Updated: ${index.lastUpdated}
        Percent Change: ${index.percentChange}
        Previous Close: ${index.previousClose}
        Components: ${index.components.map(
          (r) => `${r.stockSymbol} ${r.weight}`,
        )}
    `;
}

// Register stock market tools

// mcpServer.tool(
//     "get_alerts",
//     "Get weather alerts for a state",
//     {
//         state: z.string().length(2).describe("Two-letter state code (e.g. CA, NY)"),
//     },
//     async ({ state }) => {
//         const stateCode = state.toUpperCase();
//         const alertsUrl = `${ NUKU_API_BASE }/alerts?area=${stateCode}`;
//         const alertsData = await makeApiRequest<AlertsResponse>(alertsUrl);

//         if (!alertsData) {
//             return {
//                 content: [
//                     {
//                         type: "text",
//                         text: "Failed to retrieve alerts data",
//                     },
//                 ],
//             };
//         }

//         const features = alertsData.features || [];
//         if (features.length === 0) {
//             return {
//                 content: [
//                     {
//                         type: "text",
//                         text: `No active alerts for ${stateCode}`,
//                     },
//                 ],
//             };
//         }

//         const formattedAlerts = features.map(formatAlert);
//         const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join("\n")}`;

//         return {
//             content: [
//                 {
//                     type: "text",
//                     text: alertsText,
//                 },
//             ],
//         };
//     },
// );

// mcpServer.tool(
//     "get_forecast",
//     "Get weather forecast for a location",
//     {
//         latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
//         longitude: z
//             .number()
//             .min(-180)
//             .max(180)
//             .describe("Longitude of the location"),
//     },
//     async ({ latitude, longitude }) => {
//         // Get grid point data
//         const pointsUrl = `${NUKU_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
//         const pointsData = await makeApiRequest<PointsResponse>(pointsUrl);

//         if (!pointsData) {
//             return {
//                 content: [
//                     {
//                         type: "text",
//                         text: `Failed to retrieve grid point data for coordinates: ${latitude}, ${longitude}. This location may not be supported by the NWS API (only US locations are supported).`,
//                     },
//                 ],
//             };
//         }

//         const forecastUrl = pointsData.properties?.forecast;
//         if (!forecastUrl) {
//             return {
//                 content: [
//                     {
//                         type: "text",
//                         text: "Failed to get forecast URL from grid point data",
//                     },
//                 ],
//             };
//         }

//         // Get forecast data
//         const forecastData = await makeApiRequest<ForecastResponse>(forecastUrl);
//         if (!forecastData) {
//             return {
//                 content: [
//                     {
//                         type: "text",
//                         text: "Failed to retrieve forecast data",
//                     },
//                 ],
//             };
//         }

//         const periods = forecastData.properties?.periods || [];
//         if (periods.length === 0) {
//             return {
//                 content: [
//                     {
//                         type: "text",
//                         text: "No forecast periods available",
//                     },
//                 ],
//             };
//         }

//         // Format forecast periods
//         const formattedForecast = periods.map((period: ForecastPeriod) =>
//             [
//                 `${period.name || "Unknown"}:`,
//                 `Temperature: ${period.temperature || "Unknown"}°${period.temperatureUnit || "F"}`,
//                 `Wind: ${period.windSpeed || "Unknown"} ${period.windDirection || ""}`,
//                 `${period.shortForecast || "No forecast available"}`,
//                 "---",
//             ].join("\n"),
//         );

//         const forecastText = `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast.join("\n")}`;

//         return {
//             content: [
//                 {
//                     type: "text",
//                     text: forecastText,
//                 },
//             ],
//         };
//     },
// );

mcpServer.tool("list_symbols", "List stock symbols", {}, async () => {
  const pointsUrl = `${NUKU_API_BASE}/`;
  const stocksData = await makeApiRequest<NukuListSymbolsResponse>(pointsUrl);

  if (!stocksData) {
    return {
      content: [
        {
          type: "text",
          text: "Failed to retrieve stock listing data.",
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text",
        text:
          "Currently listed stocks: " +
          stocksData.data.codes.map((stock) => `${stock}`).join("\n"),
      },
    ],
  };
});

mcpServer.tool("list_stocks", "List stocks quotes of the day", {}, async () => {
  const pointsUrl = `${NUKU_API_BASE}/stocks`;
  const stocksData = await makeApiRequest<NukuQuoteResponse>(pointsUrl);

  if (!stocksData) {
    return {
      content: [
        {
          type: "text",
          text: "Failed to retrieve stock listing data.",
        },
      ],
    };
  }

  const stocksList = stocksData.data.map(formatQuote);

  return {
    content: [
      {
        type: "text",
        text: `Stocks trade on ${stocksData.last_updated}: ` + stocksList,
      },
    ],
  };
});

mcpServer.tool(
  "get_stocks",
  "Get historical quotes for a code/ticker/symbol",
  {
    code: z.string().min(1).describe("Ticker symbol (e.g. BSP, KAM)"),
    // ticker: z.string().min(1).optional().describe("Ticker symbol (e.g. BSP, KAM)"),
    // symbol: z.string().min(1).optional().describe("Stock symbol (e.g. BSP, KAM)"),
    // limit: z.number().min(1).max(10).optional().describe("Number of results to return (default 11)"),
    // start: z.string().min(10).max(10).optional().describe("Start date in YYYY-MM-DD format"),
    // end: z.string().min(10).max(10).optional().describe("End date in YYYY-MM-DD format"),
  },
  async ({ code }) => {
    // Get grid point data
    const stocksUrl = `${NUKU_API_BASE}/stocks/${code}`;
    // if (start) {
    //     stocksUrl.concat(`&start=${start}`);
    // }
    // if (end) {
    //     stocksUrl.concat(`&end=${end}`);
    // }
    const stocksData = await makeApiRequest<NukuStockQuoteResponse>(stocksUrl);

    if (!stocksData) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve stock quote for the code: ${code}.`,
          },
        ],
      };
    }

    // Format stock periods
    const formattedStock = stocksData.data.map(formatQuote);

    const stockText = `Quote for ${code}:\n\n${formattedStock.join("\n")}`;

    return {
      content: [
        {
          type: "text",
          text: stockText,
        },
      ],
    };
  },
);

mcpServer.tool(
  "list_historicals",
  "Get historical stock data for a ticker symbol",
  {
    code: z.string().min(1).describe("Search code for stock symbols"),
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
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format. Please provide a valid date string.",
    }),
  },
  async ({ code, start, end }) => {
    // Get grid point data
    const stocksUrl = `${NUKU_API_BASE}/stocks/historicals/${code}`;
    if (start) {
      stocksUrl.concat(`&start=${start}`);
    }
    if (end) {
      stocksUrl.concat(`&end=${end}`);
    }
    const stocksData = await makeApiRequest<NukuHistoricalQuoteResponse>(
      stocksUrl,
    );

    if (!stocksData) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve historical stock data for the code: ${code}, start: ${start}, end: ${end}.`,
          },
        ],
      };
    }

    const historicalInfo = stocksData.historical
      .map(
        (record) => `
            Date: ${record.date}
            Code: ${record.code}
            Open: ${record.open}
            High: ${record.high}
            Low: ${record.low}
            Close: ${record.close}
            Volume Today: ${record.vol_today}
        `,
      )
      .join("\n---\n");

    const historicalText = `Historical quotes for ${code}:\n\n${historicalInfo}`;

    return {
      content: [
        {
          type: "text",
          text: historicalText,
        },
      ],
    };
  },
);

// server.tool(
//     "get_tickers",
//     "Get latest stock ticker data",
//     {
//         code: z.string().min(1).describe("Ticker symbol (e.g. BSP, KAM)"),
//     },
//     async ({ code }) => {
//         const tickerUrl = `${NUKU_API_BASE}/tickers/${code}`;
//         const tickerData = await makeApiRequest<NukuTickerResponse>(tickerUrl);

//         if (!tickerData) {
//             return {
//                 content: [
//                     {
//                         type: "text",
//                         text: `Failed to retrieve ticker data for the code: ${code}.`,
//                     },
//                 ]
//             };
//         }

//         if (tickerData.length === 0) {
//             return {
//                 content: [
//                     {
//                         type: "text",
//                         text: `No ticker data found for the code: ${code}.`,
//                     },
//                 ]
//             };
//         }

//         const stock = tickerData.data[0];
//         const stockText = `Ticker data for ${code}:
//                             Last Price: ${stock.last}
//                             Bid: ${stock.bid}
//                             Offer: ${stock.offer}
//                             High: ${stock.high}
//                             Low: ${stock.low}
//                             Open: ${stock.open}
//                             Close: ${stock.close}
//                             Change Today: ${stock.chg_today}
//                             Volume Today: ${stock.vol_today}
//                             Number of Trades: ${stock.num_trades}
//                             Date: ${stock.date}`;
//         return {
//             content: [
//                 {
//                     type: "text",
//                     text: stockText
//                 }
//             ]
//         }
//     }
// );

mcpServer.tool("list_indices", "List stock market indices", {}, async () => {
  const url = `${NUKU_API_BASE}/indices`;
  const indicesData = await makeApiRequest<NukuIndexListResponse>(url);

  if (!indicesData) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to retrieve stock market indices.`,
        },
      ],
    };
  }

  const indicesInfo = indicesData.data.map(formatIndex).join("\n---\n");

  return {
    content: [
      {
        type: "text",
        text: `Stock Market Indices:\n${indicesInfo}`,
      },
    ],
  };
});

mcpServer.tool(
  "get_index",
  "Get stock market index details",
  {
    code: z.string().min(3).describe("Index code (e.g. PNGXD, PNGXI)"),
  },
  async ({ code }) => {
    const url = `${NUKU_API_BASE}/indices/${code}`;
    const indexData = await makeApiRequest<NukuIndexResponse>(url);

    if (!indexData) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve index data for the code: ${code}.`,
          },
        ],
      };
    }

    let txtFormat = formatIndex(indexData.data);

    return {
      content: [
        {
          type: "text",
          text: `Index data for ${code}:\n` + txtFormat,
        },
      ],
    };
  },
);

mcpServer.tool(
  "list_companies",
  "List companies currently trading on the exchange",
  {},
  async () => {
    const tickerUrl = `${NUKU_API_BASE}/companies`;
    const tickerData = await makeApiRequest<NukuCompanyResponse[]>(tickerUrl);

    if (!tickerData) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve companies data.`,
          },
        ],
      };
    }

    const companyList = tickerData
      .map((company) => `${company.name} (${company.ticker})`)
      .join("\n");

    const companyListText = `Currently listed companies:\n\n${companyList}`;

    return {
      content: [
        {
          type: "text",
          text: companyListText,
        },
      ],
    };
  },
);

mcpServer.tool(
  "get_company",
  "Get company details",
  {
    code: z.string().min(1).describe("Ticker symbol/code (e.g. BSP, KAM)"),
  },
  async ({ code }) => {
    const tickerUrl = `${NUKU_API_BASE}/companies/${code}/code`;
    const tickerData = await makeApiRequest<NukuCompanyResponse>(tickerUrl);

    if (!tickerData) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve ticker data for the code: ${code}.`,
          },
        ],
      };
    }

    const companyInfo = `Name: ${tickerData.name}
                            Ticker: ${tickerData.ticker}
                            Description: ${tickerData.description}
                            Industry: ${tickerData.industry}
                            Sector: ${tickerData.sector}
                            Key People: ${tickerData.key_people.join(", ")}
                            Date Listed: ${tickerData.date_listed}
                            Established Date: ${tickerData.established_date}
                            Outstanding Shares: ${tickerData.outstanding_shares}
                            PNGX Profile URL: ${tickerData.pngx_profile_url}`;

    const companyText = `Company details for ${code}:\n\n${companyInfo}`;

    return {
      content: [
        {
          type: "text",
          text: companyText,
        },
      ],
    };
  },
);

mcpServer.tool(
  "get_market_status",
  "Get current day market status",
  {},
  async () => {
    const url = `${NUKU_API_BASE}/market/status`;
    const marketStatus = await makeApiRequest<NukuMarketStatusResponse>(url);

    if (!marketStatus) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve market status.`,
          },
        ],
      };
    }

    const statusInfo = `
🎯 STOCK MARKET STATUS (${marketStatus.exchange} Exchange)
──────────────────────────────────
${statusConfig[marketStatus.marketStatus].icon} MARKET: ${
      marketStatus.marketStatus
    } • ${sessionConfig[marketStatus.session].label} Session
🕒 Last Updated: ${new Date(marketStatus.t).toISOString()}

• Exchange: ${marketStatus.exchange}
• Timezone: ${marketStatus.timezone}
• Holiday: ${marketStatus.holiday}
• Source: ${marketStatus.source}
──────────────────────────────────
📊 Next Update: Real-time monitoring`;

    return {
      content: [
        {
          type: "text",
          text: statusInfo,
        },
      ],
    };
  },
);

mcpServer.tool("get_market_holidays", "Get market holidays", {}, async () => {
  const url = `${NUKU_API_BASE}/market/holidays`;
  const holidaysData = await makeApiRequest<NukuMarketHolidaysResponse[]>(url);

  if (!holidaysData) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to retrieve market holidays.`,
        },
      ],
    };
  }

  const holidaysInfo = holidaysData
    .map(
      (holiday) => `
📊 MARKET STATUS
────────────────
Date: ${holiday.date}
Description: ${holiday.description}
Business Day: ${holiday.business_day}
Trading Day: ${holiday.trading_day}
Settlement Activity: ${holiday.settlement_activity}
        `,
    )
    .join("\n---\n");

  // 📈 Market Status Update
  // ──────────────────────
  // 🗓️  Date: October 28, 2023
  // 📋  Type: Regular Trading Day

  // 🏢  Business Operations: OPEN
  // 💹  Trading Activity: ACTIVE
  // 🏦  Settlement: Normal operations

  // ℹ️  All market functions operating normally.

  return {
    content: [
      {
        type: "text",
        text: `Market Holidays:\n${holidaysInfo}`,
      },
    ],
  };
});

mcpServer.tool("get_news", "Get latest news articles", {}, async () => {
  const url = `${NUKU_API_BASE}/news`;
  const newsData = await makeApiRequest<NukuNewsArticle[]>(url);

  if (!newsData) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to retrieve news articles.`,
        },
      ],
    };
  }

  const newsInfo = newsData
    .map(
      (article) => `
            Title: ${article.title.rendered}
            Date: ${article.date}
            Link: ${article.link}
            Excerpt: ${article.excerpt.rendered.replace(/<[^>]+>/g, "")}
        `,
    )
    .join("\n---\n");

  return {
    content: [
      {
        type: "text",
        text: `Latest News Articles:\n${newsInfo}`,
      },
    ],
  };
});

// mcpServer.registerTool("add",
//     {
//         title: "Addition Tool",
//         description: "Add two numbers",
//         inputSchema: { a: z.number(), b: z.number() }
//     },
//     async ({ a, b }) => ({
//         content: [{ type: "text", text: String(a + b) }]
//     })
// );

// // Simple tool with parameters
// mcpServer.registerTool(
//     "calculate-bmi",
//     {
//         title: "BMI Calculator",
//         description: "Calculate Body Mass Index",
//         inputSchema: {
//             weightKg: z.number(),
//             heightM: z.number()
//         }
//     },
//     async ({ weightKg, heightM }) => ({
//         content: [{
//             type: "text",
//             text: String(weightKg / (heightM * heightM))
//         }]
//     })
// );

// // Async tool with external API call
// mcpServer.registerTool(
//     "fetch-weather",
//     {
//         title: "Weather Fetcher",
//         description: "Get weather data for a city",
//         inputSchema: { city: z.string() }
//     },
//     async ({ city }) => {
//         const response = await fetch(`https://api.weather.com/${city}`);
//         const data = await response.text();
//         return {
//             content: [{ type: "text", text: data }]
//         };
//     }
// );

// // Tool that returns ResourceLinks
// mcpServer.registerTool(
//     "list-files",
//     {
//         title: "List Files",
//         description: "List project files",
//         inputSchema: { pattern: z.string() }
//     },
//     async ({ pattern }) => ({
//         content: [
//             { type: "text", text: `Found files matching "${pattern}":` },
//             // ResourceLinks let tools return references without file content
//             {
//                 type: "resource_link",
//                 uri: "file:///project/README.md",
//                 name: "README.md",
//                 mimeType: "text/markdown",
//                 description: 'A README file'
//             },
//             {
//                 type: "resource_link",
//                 uri: "file:///project/src/index.ts",
//                 name: "index.ts",
//                 mimeType: "text/typescript",
//                 description: 'An index file'
//             }
//         ]
//     })
// );

// mcpServer.registerResource(
//     "greeting",
//     new ResourceTemplate("greeting://{name}", { list: undefined }),
//     {
//         title: "Greeting Resource",      // Display name for UI
//         description: "Dynamic greeting generator"
//     },
//     async (uri, { name }) => ({
//         contents: [{
//             uri: uri.href,
//             text: `Hello, ${name}!`
//         }]
//     })
// );

// // Static resource
// mcpServer.registerResource(
//     "config",
//     "config://app",
//     {
//         title: "Application Config",
//         description: "Application configuration data",
//         mimeType: "text/plain"
//     },
//     async (uri) => ({
//         contents: [{
//             uri: uri.href,
//             text: "App configuration here"
//         }]
//     })
// );

// // Dynamic resource with parameters
// mcpServer.registerResource(
//     "user-profile",
//     new ResourceTemplate("users://{userId}/profile", { list: undefined }),
//     {
//         title: "User Profile",
//         description: "User profile information"
//     },
//     async (uri, { userId }) => ({
//         contents: [{
//             uri: uri.href,
//             text: `Profile data for user ${userId}`
//         }]
//     })
// );

// // Resource with context-aware completion
// mcpServer.registerResource(
//     "repository",
//     new ResourceTemplate("github://repos/{owner}/{repo}", {
//         list: undefined,
//         complete: {
//             // Provide intelligent completions based on previously resolved parameters
//             repo: (value, context) => {
//                 if (context?.arguments?.["owner"] === "org1") {
//                     return ["project1", "project2", "project3"].filter(r => r.startsWith(value));
//                 }
//                 return ["default-repo"].filter(r => r.startsWith(value));
//             }
//         }
//     }),
//     {
//         title: "GitHub Repository",
//         description: "Repository information"
//     },
//     async (uri, { owner, repo }) => ({
//         contents: [{
//             uri: uri.href,
//             text: `Repository: ${owner}/${repo}`
//         }]
//     })
// );

// mcpServer.registerPrompt(
//     "review-code",
//     {
//         title: "Code Review",
//         description: "Review code for best practices and potential issues",
//         argsSchema: { code: z.string() }
//     },
//     ({ code }) => ({
//         messages: [{
//             role: "user",
//             content: {
//                 type: "text",
//                 text: `Please review this code:\n\n${code}`
//             }
//         }]
//     })
// );

// // Prompt with context-aware completion
// mcpServer.registerPrompt(
//     "team-greeting",
//     {
//         title: "Team Greeting",
//         description: "Generate a greeting for team members",
//         argsSchema: {
//             department: completable(z.string(), (value) => {
//                 // Department suggestions
//                 return ["engineering", "sales", "marketing", "support"].filter(d => d.startsWith(value));
//             }),
//             name: completable(z.string(), (value, context) => {
//                 // Name suggestions based on selected department
//                 const department = context?.arguments?.["department"];
//                 if (department === "engineering") {
//                     return ["Alice", "Bob", "Charlie"].filter(n => n.startsWith(value));
//                 } else if (department === "sales") {
//                     return ["David", "Eve", "Frank"].filter(n => n.startsWith(value));
//                 } else if (department === "marketing") {
//                     return ["Grace", "Henry", "Iris"].filter(n => n.startsWith(value));
//                 }
//                 return ["Guest"].filter(n => n.startsWith(value));
//             })
//         }
//     },
//     ({ department, name }) => ({
//         messages: [{
//             role: "assistant",
//             content: {
//                 type: "text",
//                 text: `Hello ${name}, welcome to the ${department} team!`
//             }
//         }]
//     })
// );

export class OKXServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    console.error("[Setup] Initializing OKX MCP server...");

    this.server = new Server(
      {
        name: "nuku-mcp-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
          completions: {},
        },
      },
    );

    this.axiosInstance = axios.create({
      baseURL: "https://www.okx.com/api/v5",
      timeout: 5000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    this.setupToolHandlers();

    this.server.onerror = (error) => console.error("[Error]", error);

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "get_price",
          description: "Get latest price for an OKX instrument",
          inputSchema: {
            type: "object",
            properties: {
              instrument: {
                type: "string",
                description: "Instrument ID (e.g. BTC-USDT)",
              },
            },
            required: ["instrument"],
          },
        },
        {
          name: "get_candlesticks",
          description: "Get candlestick data for an OKX instrument",
          inputSchema: {
            type: "object",
            properties: {
              instrument: {
                type: "string",
                description: "Instrument ID (e.g. BTC-USDT)",
              },
              bar: {
                type: "string",
                description: "Time interval (e.g. 1m, 5m, 1H, 1D)",
                default: "1m",
              },
              limit: {
                type: "number",
                description: "Number of candlesticks (max 100)",
                default: 100,
              },
            },
            required: ["instrument"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        if (!["get_price", "get_candlesticks"].includes(request.params.name)) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`,
          );
        }

        const args = request.params.arguments as {
          instrument: string;
          bar?: string;
          limit?: number;
        };

        if (!args.instrument) {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Missing required parameter: instrument",
          );
        }

        if (request.params.name === "get_price") {
          console.error(
            `[API] Fetching price for instrument: ${args.instrument}`,
          );
          const response = await this.axiosInstance.get<OKXTickerResponse>(
            "/market/ticker",
            {
              params: { instId: args.instrument },
            },
          );

          if (response.data.code !== "0") {
            throw new Error(`OKX API error: ${response.data.msg}`);
          }

          if (!response.data.data || response.data.data.length === 0) {
            throw new Error("No data returned from OKX API");
          }

          const ticker = response.data.data[0];
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    instrument: ticker.instId,
                    lastPrice: ticker.last,
                    bid: ticker.bidPx,
                    ask: ticker.askPx,
                    high24h: ticker.high24h,
                    low24h: ticker.low24h,
                    volume24h: ticker.vol24h,
                    timestamp: new Date(parseInt(ticker.ts)).toISOString(),
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        } else {
          // get_candlesticks
          console.error(
            `[API] Fetching candlesticks for instrument: ${
              args.instrument
            }, bar: ${args.bar || "1m"}, limit: ${args.limit || 100}`,
          );
          const response =
            await this.axiosInstance.get<OKXCandlesticksResponse>(
              "/market/candles",
              {
                params: {
                  instId: args.instrument,
                  bar: args.bar || "1m",
                  limit: args.limit || 100,
                },
              },
            );

          if (response.data.code !== "0") {
            throw new Error(`OKX API error: ${response.data.msg}`);
          }

          if (!response.data.data || response.data.data.length === 0) {
            throw new Error("No data returned from OKX API");
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  response.data.data.map(
                    ([time, open, high, low, close, vol, volCcy]) => ({
                      timestamp: new Date(parseInt(time)).toISOString(),
                      open,
                      high,
                      low,
                      close,
                      volume: vol,
                      volumeCurrency: volCcy,
                    }),
                  ),
                  null,
                  2,
                ),
              },
            ],
          };
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("[Error] Failed to fetch data:", error);
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to fetch data: ${error.message}`,
          );
        }
        throw error;
      }
    });

    // List available resources when clients request them
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "hello://world",
            name: "Hello World Message",
            description: "A simple greeting message",
            mimeType: "text/plain",
          },
        ],
      };
    });

    // Return resource content when clients request it
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        if (request.params.uri === "hello://world") {
          return {
            contents: [
              {
                uri: "hello://world",
                text: "Hello, World! This is my first MCP resource.",
              },
            ],
          };
        }
        throw new Error("Resource not found");
      },
    );
  }

  run(transport: Transport) {
    if (!transport) throw new Error("transport attribute cannot be empty");
    this.server.connect(transport);
  }
}

export default mcpServer;
