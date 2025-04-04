"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../src/utils");
describe('testing index file', () => {
    test('empty string should result in zero', () => {
        expect((0, utils_1.add)('')).toBe(0);
    });
});
