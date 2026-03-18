/**
┌─────────────────┐    ┌──────────────┐    ┌──────────────┐    ┌─────────────────┐
│   DATA SOURCES  │ -> │   INGESTION  │ -> │  PROCESSING  │ -> │    STORAGE      │
├─────────────────┤    ├──────────────┤    ├──────────────┤    ├─────────────────┤
│ • PNGX Website  │    │ • CSV Parser │    │ • Validation │    │ • PostgreSQL    │
│ • Company PDFs  │    │ • Scheduler  │    │ • Enrichment │    │ • TimescaleDB   │
│ • Email Alerts  │    │ • API Pull   │    │ • Dedupe     │    │ • MongoDB       │
│ • Manual Upload │    │ • Webhooks   │    │ • Aggregation│    │ • Object Storage│
└─────────────────┘    └──────────────┘    └──────────────┘    └─────────────────┘
                              │                    │                    │
                              v                    v                    v
                    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
                    │   DATA LAKE      │  │   STREAMING      │  │      API         │
                    │ • Raw CSV Store  │  │ • Kafka/RabbitMQ │  │ • REST Endpoints │
                    │ • JSON Snapshots │  │ • Real-time      │  │ • GraphQL        │
                    └──────────────────┘  │   Processing     │  │ • Webhooks       │
                                          └──────────────────┘  └──────────────────┘

Sources:
  - type: "PNGX Daily CSV"
    format: "CSV"
    frequency: "Daily (after market close, 4:00 PM PNG time)"
    source_url: "https://www.pngx.com.pg/market-data/daily/"
    authentication: None (public data)
    
  - type: "Company Announcements PDF"
    format: "PDF"
    frequency: "As released (irregular)"
    source_url: "https://www.pngx.com.pg/announcements/"
    requires: PDF parsing
    
  - type: "Manual Upload (Admin)"
    format: "CSV/Excel"
    frequency: "Ad-hoc (backfill, corrections)"
    source: Internal dashboard upload
    
  - type: "Email Alerts"
    format: "Email attachments"
    frequency: "Real-time"
    source: PNGX email subscription

 */

// Create time series collection for market cap data
db.createCollection("market_cap_history", {
  timeseries: {
    timeField: "timestamp",
    metaField: "metadata",
    granularity: "minutes", // or "hours" based on update frequency
  },
  expireAfterSeconds: 31536000, // Optional: auto-delete after 1 year
});

// // Create indexes for common query patterns
// db.market_cap_history.createIndex({ "metadata.ticker": 1, "timestamp": -1 });
// db.market_cap_history.createIndex({ "metadata.sector": 1, "timestamp": -1 });

// Sample document structure
// {
//   "_id": ObjectId("..."),
//   "timestamp": ISODate("2026-03-18T10:00:00Z"),  // timeField
//   "metadata": {                                    // metaField
//     "ticker": "BSP",
//     "company_name": "BSP Financial Group Limited",
//     "sector": "Banking and Finance",
//     "exchange": "PNGX",
//     "listing_date": ISODate("2003-08-27"),
//     "is_foreign_entity": false
//   },
//   "market_cap": {
//     "value": 1600000000,                          // in PGK
//     "shares_outstanding": 800000000,
//     "share_price": 2.00,
//     "currency": "PGK"
//   },
//   "volume": 50000,
//   "data_source": "PNGX_daily_close"
// }

// Companies collection with embedded time-series
db.companies.insertOne({
  ticker: "KSL",
  company_name: "Kina Securities Limited",
  sector: "Banking and Finance",
  listing_date: ISODate("2015-07-30"),
  is_foreign_entity: false,
  share_registry: "PNG Registries Limited",
  head_office: "Level 9, Kina Bank Haus, Port Moresby",
  // market_cap: 520000000,
  // current_price: 2.00,
  // shares_outstanding: 260000000,
  market_cap_history: [
    {
      date: ISODate("2026-03-18"),
      value: 520000000,
      shares_outstanding: 260000000,
      price: 2.0,
    },
    {
      date: ISODate("2026-03-17"),
      value: 515000000,
      shares_outstanding: 260000000,
      price: 1.98,
    },
  ],
  market_data: {
    date: "2026-03-18",
    close_price: 2.0,
    volume: 50000,
    shares_outstanding: 800000000,
    market_cap: 1600000000,
    pe_ratio: 8.5,
    eps: 0.235,
  },
  year_high: 2.15,
  year_low: 1.85,
});

//  PostgreSQL/TimescaleDB
// http://docs-dev.timescale.com/docs-sv-tk-16-nmost/tutorials/sv-tk-16-nmost/analyze-intraday-stocks/fetch-and-ingest/#collect-ticker-symbols
