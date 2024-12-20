import { getDataFromServer, getHistoricals, getStock, getStocks } from '../src/api';

// getHistoricals('bsp')
// getStock('bsp')
// getDataFromServer('BSP').then(res => {
//     console.log(res)
// })

// describe('retrieving data from www.pngx.com.pg', () => {
//     test('should return full data in json', async () => {
//         const result = await getDataFromServer('BSP');
//         expect(result).toBe('expected value');
//     })
// })

describe('retrieving data from localhost', () => {
    test('should return full data in json', async () => {
        const result = await getStocks();
        expect(result).toBe('expected value');
    })
})

// test('fetches data from an API', async () => {
//     // mock the fetch function to return a fake response
//     jest.mock('node-fetch');
//     import fetch from 'node-fetch';
//     const response = { data: 'some data' };
//     fetch.mockResolvedValue(response);
  
//     // import the function that uses the fetch function
//     import { fetchData } from './fetchData';
  
//     // call the function and wait for the result
//     const result = await fetchData('https://example.com/api');
  
//     // make assertions about the result
//     expect(result).toEqual(response.data);
// });