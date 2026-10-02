// Type Definitions (Schema)
const typeDefs = `#graphql
  """
  Custom scalar for handling date and time values.
  Serializes to ISO 8601 string format.
  """
  scalar DateTime

  type Company {
    id: ID!
    name: String
    ticker: String
    description: String
    industry: String
    sector: String
    key_people: [String]
    date_listed: String
    esteblished_date: String
    outstanding_shares: Float
    pngx_profile_url: String
    logo_src: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  type Index {
    id: ID!
    code: String!
    name: String!
    components: [String]
    currentValue: Float
    previousClose: Float
    open: Float
    high: Float
    low: Float
    exchange: String
    currency: String
    isActive: Boolean
    lastUpdated: String
    history: [String]
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  type NewsSource {
    id: ID!
    name: String!
    url: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  type News {
    id: ID!
    title: String!
    link: String
    summary: String
    published: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  type Quote {
    id: ID!
    date: DateTime!
    code: String!
    bid: Float
    offer: Float
    last: Float
    close: Float
    high: Float
    low: Float
    open: Float
    chg_today: Float
    vol_today: Float
    num_trades: Float
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  type Ticker {
    id: ID!
    date: String
    symbol: String
    close: Float
    high: Float
    low: Float
    open: Float
    change: Float
    volume: Float
    createdAt: DateTime!
    updatedAt: DateTime!
  }
    
  input QueryQuoteRequest {
    code: String
    date: DateTime = now
  }

  type QueryQuoteResponse {
    success: Boolean
    errors: ErrorInfo
    data: Quote
  }

  input QueryQuotesRequest {
    code: String
    date: String
    start: String
    end: String
    total: Int
    limit: Int
    skip: Int
  }

  type QueryQuotesResponse {
    success: Boolean
    errors: ErrorInfo
    data: [Quote]
  }

  type HistoricalQuotesResponse {
    success: Boolean
    errors: ErrorInfo
    data: [Quote]
    total: Int
    limit: Int
    skip: Int
  }
  
  type QueryCompaniesResponse {
    success: Boolean
    errors: ErrorInfo
    data: [Company]
  }
  
  type QueryCompanyResponse {
    success: Boolean
    errors: ErrorInfo
    data: Company
  }

  type QueryIndicesResponse {
    success: Boolean
    errors: ErrorInfo
    data: [Index]
  }
  
  type QueryIndexResponse {
    success: Boolean
    errors: ErrorInfo
    data: Index
  }

  type QueryNewsSourcesResponse {
    success: Boolean
    errors: ErrorInfo
    data: [NewsSource]
  }
  type QueryNewsResponse {
    success: Boolean
    errors: ErrorInfo
    data: [News]
  }
  
  type QueryNewsSourceResponse {
    success: Boolean
    errors: ErrorInfo
    data: NewsSource
  }

  type QueryTickersResponse {
    success: Boolean
    errors: ErrorInfo
    data: [Ticker]
  }
  
  type QueryTickerResponse {
    success: Boolean
    errors: ErrorInfo
    data: Ticker
  }

  type ErrorInfo {
    code: String
    message: String
  }
  
  type Mutation {
    createCompany(name: String!, email: String!): Company
    updateCompany(id: ID!, name: String, email: String): Company
    deleteCompany(id: ID!): Company
  }
  
  type Query {
    quotes(start: String end: String): QueryQuotesResponse
    quoteByCode(code: String date: String): QueryQuoteResponse
    historicalQuotes(
      code: String
      start: String
      end: String
      limit: Int = 100
      skip: Int = 0
    ): HistoricalQuotesResponse
    indices: QueryIndicesResponse
    indexByCode(code: String!): QueryIndexResponse
    companies: QueryCompaniesResponse
    company(code: String!): QueryCompanyResponse
    newsSources: QueryNewsSourcesResponse
    news(
      text: String
    ): QueryNewsResponse
  }
`;
module.exports = typeDefs;
