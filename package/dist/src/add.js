"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sum = sum;
exports.add = add;
function sum(x, y) {
    return x + y;
}
function add(numbers) {
    let integers = numbers.split(',').map(x => parseInt(x));
    let negatives = integers.filter(x => x < 0);
    if (negatives.length > 0)
        throw new RangeError('Negatives are not allowed: ' + negatives.join(', '));
    return integers
        .filter(x => x <= 1000)
        .reduce((a, b) => a + b, 0);
}
