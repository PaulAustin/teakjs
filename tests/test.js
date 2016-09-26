'use strict';

var assert = require('assert');
var teak = require('../lib/teak.js');

var symbolTable = {
a:1,
b:2,
c:true,
d:[true],
setPixel: function () {},
motor: function () {},
servo: function () {},
serialRead: function () {},
serialWrite: function () {},
};

//-----------------------------------------------------------------------------
function test (teakExpression, expectedValue) {
  var state = {};
  var obj =  teak.parse(teakExpression, state, symbolTable);
  assert.deepEqual(expectedValue, obj);
  assert.equal(state.err, null);
  console.log('passed: <', teakExpression, '> => <', obj, '>');
}

//-----------------------------------------------------------------------------
// For tests where direct comparisons wont work expectedValue
// can be supplied as the form toConsoleString should return
function testStringForm (teakExpression, expectedValue) {
  var state = {};
  var obj = teak.parse(teakExpression, state);
  var str = toPseudoJSONString(obj);
  assert.equal(expectedValue, str);
  assert.equal(state.err, null);
  console.log('passed: <', teakExpression, '> => <', str, '>');
}

//-----------------------------------------------------------------------------
function toPseudoJSONString(obj) {
  // Turns out its not simple to get the same toString that consoel.log
  // has. Regular JSON.stringify() turns nan and infs to null :(
  return JSON.stringify(obj, function (name, value) {

    if ((typeof value) !== 'number') {
      return value;
    }

    if (isNaN(value)) {
      return 'NaN';
    } else if (value > 0 && !isFinite(value)) {
      return 'Infinity';
    } else if (value < 0 && !isFinite(value)) {
      return '-Infinity';
    } else {
      return value;
    }
  });
}

//-----------------------------------------------------------------------------
function print (teakExpression, expectedValue) {
  var state = {};
  var obj =  teak.parse(teakExpression, state);
  console.log('==print==: <', obj, '=>', teakExpression, '>');
}

// Simole example
console.log(teak.parse('(1 2 3 4)'));

// Basic scalars
test('1.5', 1.5);
test('1.000000001', 1.000000001);
test('(3.14 6.28)', [3.14, 6.28]);

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
test('(  ', null);
test('( 1 2 3  ', null);

test('((1 2) (3 4))', [[1,2],[3,4]]);

test("(('a' 2 true) ('b' 4 false))", [['a',2, true],['b',4, false]]);
test("(('a' 2 true ()) ('b' 4 false (true)))", [['a',2, true,[]],['b',4, false,[true]]]);

// Partial stream read
test('123 456', 123);

// NaN anss Infinities are never equal so test as string
testStringForm('nan', '"NaN"');
testStringForm('inf', '"Infinity"');
testStringForm('-inf', '"-Infinity"');
testStringForm('(nan)', '["NaN"]');
testStringForm('(inf)', '["Infinity"]');
testStringForm('(-inf)', '["-Infinity"]');
testStringForm('(0 nan 1)', '[0,"NaN",1]');

// multi-line
test(`(
  (1 2 3)
  (4 5 6)
)`,
[[1,2,3],[4,5,6]]);

// comment to end of line
test(`(
  (1 2 3) // Line 1
  (4 5 6) // line 2
)`,
[[1,2,3],[4,5,6]]);

//test('(x:123 y:90)',[123, 90]);
//test('(x:123 50 y:90)',[123, 90]);

// Expressions wiht field names
test('(x:123 y:90)',{x:123, y:90});
test('(setPixel x:123 y:90)',{_0:symbolTable.setPixel, x:123, y:90});
test('(clearPixel x:1.5 y:null)',{_0:symbolTable.clearPixel, x:1.5, y:null});
test('(clearPixel x:() y:(()))))',{_0:symbolTable.clearPixel, x:[], y:[[]]});
test('(clearPixel x:-3 y:-4 z:0 true)',{_0:symbolTable.clearPixel, x:-3, y:-4, z:0, _4:true});

// Look up symbols from simple table provided in test funtion.
test('a',1);
test('(a)',[1]);
test('((a))',[[1]]);
test('((c)d)',[[true], [true]]);
test('(a b c d)',[1, 2, true, [true]]);
test('((a) b c d)',[[1], 2, true, [true]]);
