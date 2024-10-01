"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const add_1 = require("../src/add");
describe('testing index file', () => {
    test('empty string should result in zero', () => {
        expect((0, add_1.add)('')).toBe(0);
    });
});
