var teak = require('./teak');

var obj = teak.teakExpressionToObject('(1234 5678 123 )');
console.log('teak obj:', obj);


var obj = teak.teakExpressionToObject('1456 234');
console.log('teak obj:', obj);


var obj = teak.teakExpressionToObject('()');
console.log('teak obj:', obj);
