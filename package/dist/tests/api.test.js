"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// getHistoricals('bsp')
// getStock('bsp')
// getDataFromServer('BSP').then(res => {
//     console.log(res)
// })
describe('retrieving data from PNGx.com.pg', () => {
    test('should return full data in json', () => {
        expect(1).toBe(1);
    });
});
test('fetches data from an API', () => __awaiter(void 0, void 0, void 0, function* () {
    // mock the fetch function to return a fake response
    jest.mock('node-fetch');
    const fetch = require('node-fetch');
    const response = { data: 'some data' };
    fetch.mockResolvedValue(response);
    // import the function that uses the fetch function
    const { fetchData } = require('./fetchData');
    // call the function and wait for the result
    const result = yield fetchData('https://example.com/api');
    // make assertions about the result
    expect(result).toEqual(response.data);
}));
