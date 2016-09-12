var teak = require('teak');

// Simple expressions
console.log(teak.parse('(true 3.14 \'Hello, World\')'));

// Name-value pairs map to javascript objects
console.log(teak.parse('(x:505 y:404)'));

// Symbol table bindings
var symobls = {
  f1:function () {},
  f2:function () {},
  square: 1,
  circle: 2,
};
var state = {};
console.log(teak.parse('(f1 shape:square)', state, symobls));
