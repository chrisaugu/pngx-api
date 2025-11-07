export interface UserRequestBody {
    name: string;
    email: string;
}

export interface UserParams {
    id: string;
}

export interface UserQuery {
    status?: 'active' | 'inactive';
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
}

export interface IAPIUsage {
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
    name: string,
    ticker: string,
    description: string,
    industry: string,
    sector: string,
    key_people: string[],
    date_listed: Date, // ipo
    esteblished_date: Date,
    outstanding_shares: number,
    pngx_profile_url: string,
    logo: {
        data: Buffer,
        contentType: string,
    },
}

interface IComponent {
    stockSymbol: {
        type: string,
        required: boolean,
        uppercase: boolean,
        trim: boolean,
    },
    weight: {
        type: number,
        min: number,
        max: number,
    },
}
interface IHistory {
    date: Date,
    value: number,
    volume: number,
}
export interface IIndex {
    code: string;
    name: string;
    components: Array<IComponent>,
    currentValue: string;
    previousClose: number,
    open: number,
    high: number,
    low: number,
    exchange: string;
    currency: string;
    isActive: string;
    lastUpdated: string;
    history: Array<IHistory>,
}

export interface IQuote {
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


export interface ITicker {
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
    url: string;
    headers: string;
    events: string;
    secret: string;
    isActive: string;
    description: string;
    createdAt: Date
}
