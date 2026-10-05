const { add } = require('./calculator');
const assert = require('assert');

const result = add(2, 3);
assert.strictEqual(result, 5, `Expected add(2,3) to be 5, but got ${result}`);
console.log('Test passed');
