export declare enum QUOTES {
    'BSP' = 0,
    'CCP' = 1,
    'CGA' = 2,
    'COY' = 3,
    'CPL' = 4,
    'KAM' = 5,
    'KSL' = 6,
    'NEM' = 7,
    'NGP' = 8,
    'NIU' = 9,
    'SST' = 10,
    'STO' = 11
}
export declare enum OLD_QUOTES {
    'NCM' = 0,
    'OSH' = 1
}
export type TQuotes = 'BSP' | 'CCP' | 'CGA' | 'COY' | 'CPL' | 'KAM' | 'KSL' | 'NEM' | 'NGP' | 'NIU' | 'SST' | 'STO';
export type TQuote = {
    date: Date;
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
};
export type TCompany = {
    name: string;
    ticker: string;
    description: string;
    industry: string;
    sector: string;
    key_people: string[];
    date_listed: Date;
    esteblished_date: Date;
    outstanding_shares: Number;
};
export type TTicker = TQuote & {};
export type TAPIRequest = {};
export type TAPIResponse<T> = {
    status: number;
    message: string;
    symbols: string;
    api: string;
    time: number;
    date: Date;
    last_updated: Date;
    data: T[];
};
