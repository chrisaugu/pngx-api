const {
    stock_fetcher,
    check_if_exist_in_database,
    data_fetcher,
    get_quotes_from_pngx,
    make_async_request
} = require('../../tasks');

jest.mock('../../constants');
jest.mock('../../libs/logger', () => ({
    winstonLogger: fn()
}));
jest.mock("../../utils/logger", () => ({
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
}));
jest.mock('../../utils');
jest.mock('../../models', () => ({
    Stock: jest.fn()
}));

jest.mock('request');
jest.mock('lodash');
jest.mock('needle');
jest.mock('papaparse');

// describe("Tasks test", () => {
    // expect("", () => { })
// })