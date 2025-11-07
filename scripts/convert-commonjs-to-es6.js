#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function convertCommonJSToES6(content, filePath) {
    let converted = content;

    // Convert module.exports to export default
    converted = converted.replace(/module\.exports\s*=\s*([^;]+);/g, 'export default $1;');

    // Convert exports.xxx to export const xxx
    converted = converted.replace(/exports\.(\w+)\s*=\s*/g, 'export const $1 = ');

    // Convert multiple exports in object
    converted = converted.replace(/module\.exports\s*=\s*{([^}]+)};/g, (match, exportsList) => {
        const exports = exportsList.split(',').map(exp => {
            const [key, value] = exp.split(':').map(s => s.trim());
            if (key && value) {
                return `export const ${key} = ${value};`;
            }
            return exp;
        }).join('\n');
        return exports;
    });

    // Convert require to import (basic)
    converted = converted.replace(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);/g, 'import $1 from \"$2\";');

    return converted;
}

// Process command line arguments
const args = process.argv.slice(2);
const filePath = args[0];

if (!filePath) {
    console.error('Please provide a file path');
    process.exit(1);
}

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const converted = convertCommonJSToES6(content, filePath);
    console.log(converted);
} catch (error) {
    console.error('Error reading file:', error.message);
    process.exit(1);
}
