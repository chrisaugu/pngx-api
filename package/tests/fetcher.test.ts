import { fetcher, TQuote } from "../src";

const desired = {
    "count": 11,
    "data": {},
    "date": "Sat Nov 29 2025",
    "last_updated": "2025-11-06T00:00:00.000Z",
    "status": 200
}

describe("fetches stocks for the current day", () => {
    test("should return data in this format", async () => {
        const result = await fetcher<TQuote[]>("/stocks");
        expect(result).toMatchObject(desired);
    });
});

// test('fetches data from an API', async () => {
//     // mock the fetch function to return a fake response
//     jest.mock('node-fetch');
//     // import fetch from 'node-fetch';
//     const response = { data: 'some data' };
//     fetch.mockResolvedValue(response);

//     // import the function that uses the fetch function
//     import { fetchData } from './fetchData';

//     // call the function and wait for the result
//     const result = await fetchData('https://example.com/api');

//     // make assertions about the result
//     expect(result).toEqual(response.data);
// });
