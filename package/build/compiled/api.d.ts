type TQuery = {
    date?: string;
    start?: string;
    end?: string;
    limit?: number;
    sort?: number;
    skip?: number;
    fields?: [];
};
/**
 * /api/historicals/:symbol
 * @param symbol
 * @param query
 * @returns
 */
export declare function getHistoricals(symbol: string, query?: TQuery): Promise<unknown>;
/**
 *
 * @param options
 * @returns
 */
export declare function getStocks(options?: TQuery): Promise<() => Promise<unknown>>;
/**
 *
 * @param symbol
 * @param options
 * @returns
 */
export declare function getStock(symbol: string, options?: TQuery): Promise<unknown>;
export declare function getCompanies(options?: TQuery): Promise<unknown>;
export declare function getCompany(symbol: string, options?: TQuery): Promise<unknown>;
export declare function getTickers(options?: TQuery): Promise<unknown>;
export declare function getTicker(symbol: string, options?: TQuery): Promise<unknown>;
export declare function getDataFromServer(symbol: string, options?: TQuery): Promise<undefined>;
export {};
