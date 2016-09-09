## Teak Tools

Teak is a functional data language used to describe data in the form of scalars,
lists, trees, or general graphs. It's grammar draws from LISP and JSON.

LISP grammar elements
* One composition from, s expressions.
* Space is separator
* Symbol definition and reference
* Comments

JSON grammar elements
* Name value pairs (optional)
* UTF8 encoding
* Unicode escapes

TEAK specific
* IEEE 754 floating point

The Teak NPM package provides tools to work with teak expressions in JavaScript.

### Installation

```
 npm install teak
```

### Use

```
var teak = require('teak');

console.log(teak.teakExpressionToObject('(1 2 3 4)'));
[1, 2, 3, 4]

```