var teak = require('./teak');
var obj;

var symbolTable = {
motor: function () {},
servo: function () {},
serialRead: function () {},
serialWrite: function () {},
};

obj = teak.teakExpressionToObject('(1234 5678 123 )', symbolTable);
console.log('teak obj:', obj);

obj = teak.teakExpressionToObject('1456 234', symbolTable);
console.log('teak obj:', obj);

obj = teak.teakExpressionToObject('()', symbolTable);
console.log('teak obj:', obj);

obj = teak.teakExpressionToObject("'hello'", symbolTable);
console.log('teak obj:', obj);

obj = teak.teakExpressionToObject("('hello' 'what' 'is' 'up' 45)", symbolTable);
console.log('teak obj:', obj);

console.log(">>>('helloyo' 'what\\\'s' 'up' 45)");
obj = teak.teakExpressionToObject("('hello' 'what\\\'s' 'up' 45)", symbolTable);
console.log('teak obj:', obj);
