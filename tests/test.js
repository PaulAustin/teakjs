var assert = require('assert');
var teak = require('../lib/teak.js');

var symbolTable = {
motor: function () {},
servo: function () {},
serialRead: function () {},
serialWrite: function () {},
};

function test (teakExpression, expectedValue) {
  state = {};
  var obj =  teak.expressionToObject(teakExpression, state);
  assert.deepEqual(expectedValue, obj);
  assert.equal(state.err, null);
  console.log('passed: <', teakExpression, '> => <', obj, '>');
}

function print (teakExpression, expectedValue) {
  state = {};
  var obj =  teak.expressionToObject(teakExpression, state);
  console.log('==print==: <', obj, '=>', teakExpression, '>');
}

/*
function testSyntaxFail (teakExpression, expectedValue) {
  state = {};
  var obj =  teak.expressionToObject(teakExpression, state);
  console.log('partial parse<', obj, '>');
  console.log('error message<', state.error, ':', state.position, '>');
}
*/

// Basic scalars
test('null', null);
test('true', true);
test('false', false);
test('1', 1);
test('42', 42);
test('505', 505);
test('1234567890', 1234567890);
test('\'Hello\'', 'Hello');
test("' \\\\ '", ' \\ ');

test(" + ", null);
test("' + '", ' + ');

// Simple lists
test('()', []);
test('(1)', [1]);
test('( 1)', [1]);
test('(1 )', [1]);
test(' (1 ) ', [1]);

test('(true)', [true]);

// Some malformed
test('(  ', []);
test('( 1 2 3  ', [1,2,3]);

test('((1 2) (3 4))', [[1,2],[3,4]]);

test("(('a' 2 true) ('b' 4 false))", [['a',2, true],['b',4, false]]);
test("(('a' 2 true ()) ('b' 4 false (true)))", [['a',2, true,[]],['b',4, false,[true]]]);

// Partial stream read
test('123 456', 123);

//test('(x:123 y:90)',[123, 90]);
//test('(x:123 50 y:90)',[123, 90]);
test('(setPixel x:123 y:90)',['_setPixel', 123, 90]);
