import { fetcher, TQuote } from "../src";

global.fetch = jest.fn();

const desired = {
    "count": 11,
    "data": {},
    "date": "Sat Nov 29 2025",
    "last_updated": "2025-11-06T00:00:00.000Z",
    "status": 200
}
// fetcher("https://api.apilayer.com/bank_data/banks_by_country?country_code=PG", requestOptions)
//   .then(response => response.text())
//   .then(result => console.log(result))
//   .catch(error => console.log('error', error));

describe('fetcher', () => {
    beforeEach(() => {
        (fetch as jest.Mock).mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should make a GET request to the correct URL', async () => {
        // Arrange
        const mockResponse = { data: 'test data' };
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: () => Promise.resolve(mockResponse)
        });

        // Act
        const result = await fetcher('/stocks');

        // Assert
        expect(fetch).toHaveBeenCalledWith(
            'https://nuku.zeabur.app/api/v2/stocks',
            undefined
        );
        expect(result).toEqual(mockResponse);
    });
});
