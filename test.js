var assert = require('assert');
var teak = require('./teak');

var obj;

var symbolTable = {
motor: function () {},
servo: function () {},
serialRead: function () {},
serialWrite: function () {},
};

function test (teakExpression, expectedValue) {
  var obj =  teak.expressionToObject(teakExpression, symbolTable);
  assert.deepEqual(obj, expectedValue);
  console.log('passed: <', teakExpression, '>');
}

// Basic scalars
test('null', null);
test('true', true);
test('false', false);
test('1', 1);
test('42', 42);
test('505', 505);
test('1234567890', 1234567890);
test('\'Hello\'', 'Hello');

// Simple lists
test('()', []);
test('(1)', [1]);
test('( 1)', [1]);
test('(1 )', [1]);
test(' (1 ) ', [1]);
test('(1 2 3)', [1, 2, 3]);

// partial stream read
test('123 456', 123);

// string escape sequences
test("('what' 'is' 'up')", ['what','is','up']);
// pretty confusing, first <\\> is at the JS level second <\'> is at teak level
test("('what\\\'s' 'up')", ["what's",'up']);
