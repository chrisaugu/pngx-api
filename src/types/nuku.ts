export interface UserRequestBody {
  name: string;
  email: string;
}

export interface UserParams {
  id: string;
}

export interface UserQuery {
  status?: "active" | "inactive";
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
}

export interface ErrorInfo {}

export interface QueryStockRequest {
  code: string;
}

export interface QueryQuoteResponse {
  success: boolean;
  errors: ErrorInfo | null;
  data: IQuote | null;
}
export interface QueryQuotesResponse {
  success: boolean;
  errors: ErrorInfo | null;
  data: Array<IQuote> | null;
}
export interface QueryIndicesResponse {
  success: boolean;
  errors: ErrorInfo | null;
  data: Array<IIndex> | null;
}
export interface QueryCompaniesResponse {
  success: boolean;
  errors: ErrorInfo | null;
  data: Array<ICompany> | null;
}

export interface QuoteFilters {
  code?: string;
  date?: string;
  start?: string;
  end?: string;
  limit?: number;
  sort?: number;
  skip?: number;
  fields?: string;
}

export interface NewsFilters {
  text?: string;
}

export type APIResponse<T> = {
  status?: number;
  message?: string;
  data?: T;
};

export interface IAPIUsage {
  id: string;
  // api_key: String;
  // user_id: String;
  ip_address: String;
  user_agent: String;
  request_id: String;
  endpoint: String;
  method: String;
  status_code: number;
  request_time: Date;
  response_time_ms: number;
}

export interface ICompany {
  id: string;
  name: string;
  symbol: string;
  ticker: string;
  description: string;
  industry: string;
  sector: string;
  key_people: string[];
  date_listed: Date; // ipo
  established_date: Date;
  exempt_foregin_entity: boolean;
  outstanding_shares: number;
  pngx_profile_url: string;
  logo_src: string;
  internet_address: string;
  registered_office_address: string;
  logo: {
    data: Buffer;
    contentType: string;
  };
}

export interface IIndexComponent {
  stockSymbol: string;
  weight: number;
}

export interface IIndexHistory {
  date: Date;
  value: number;
  volume?: number;
}

export interface IIndex {
  id: string;
  code: string;
  name: string;
  components: Array<IIndexComponent>;
  currentValue: number;
  previousClose: number;
  percentChange: number;
  open: number;
  high: number;
  low: number;
  exchange: string;
  currency: string;
  isActive: boolean;
  lastUpdated: Date;
  history: Array<IIndexHistory>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuote {
  id: string;
  date: Date;
  code: String;
  short_name: String;
  bid: Number;
  offer: Number;
  last: Number;
  close: Number;
  high: Number;
  low: Number;
  open: Number;
  chg_today: Number;
  vol_today: Number;
  num_trades: Number;
}

export interface ICandle {
  time: number;
  open: number;
  low: number;
  high: number;
  close: number;
}

export interface ITicker {
  id: string;
  date: Date;
  symbol: String;
  close: Number;
  high: Number;
  low: Number;
  open: Number;
  change: Number;
  volume: Number;
}

export interface IWebhook {
  id: string;
  url: string;
  headers: Object;
  events: [string];
  secret: string;
  isActive: boolean;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INewsSource {
  id: string;
  url: string;
  name: string;
}

export interface INews {
  id: string;
  title: string;
  link: string;
  summary: string;
  published: Date;
}
