"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
describe("fetches stocks for the current day", () => {
  test("should return full data in json", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const result = yield (0, src_1.getStocks)();
      expect(result).toBe("expected value");
    }));
});
describe("fetches stock for BSP", () => {
  test("should return full data in json", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const result = yield (0, src_1.getStock)("BSP");
      expect(result).toBe("expected value");
    }));
});
describe("fetches ticker for BSP", () => {
  test("should return full data in json", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const result = yield (0, src_1.getTickers)();
      expect(result).toBe("expected value");
    }));
});
describe("fetches ticker for BSP", () => {
  test("should return full data in json", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const result = yield (0, src_1.getTicker)("BSP");
      expect(result).toBe("expected value");
    }));
});
describe("fetches historical data for BSP", () => {
  test("should return full data in json", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const result = yield (0, src_1.getHistoricals)("BSP");
      expect(result).toBe("expected value");
    }));
});
describe("fetches data from www.pngx.com.pg", () => {
  test("should return full data in json", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const result = yield (0, src_1.getDataFromServer)("BSP");
      expect(result).toBe("expected value");
    }));
});
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
