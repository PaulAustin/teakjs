'use strict';

var assert = require('assert');
var teak = require('../lib/teak.js');
var exec = require('../lib/execution.js');

function popAndRunTest(tests, index) {
  let state = {
    stdout:''
  };

  let obj =  teak.parse(tests[index][0], state, exec.standardLib);
  let rt = new exec.RunTime(obj, state, exec.standardLib);
  rt.run( function(text) {
    console.log('------- Test finished -------');
    console.log(text);
    assert.equal(text, tests[index][1]);
    index += 1;
    if (index < tests.length) {
      popAndRunTest(tests, index);
    }
  });
}

function runTests(listOfTests) {
  popAndRunTest(listOfTests, 0);
}

//------------------------------------------------------------------------------
let c1 = `
(
  (startup
    (stdout 'Hello, World.')
  )

  (startup
    (stdout 'Hello, Moon.')
    (stdout true)
    (stdout 42)
    (stdout 1 2 3)
    (stdout (1 2 3))
  )
)
`;

let r1 =
`Hello, World.
Hello, Moon.
true
42
1 2 3
1,2,3
`;

//------------------------------------------------------------------------------
let c2 = `
(
  (startup
    (stdout 'Hello, loops.')
    (loop 3
      (stdout 'row')
    )
    (stdout 'your boat.')
  )
)
`;

let r2 =
`Hello, loops.
row
row
row
your boat.
`;

//------------------------------------------------------------------------------
let c3 = `
(
  (startup
    (stdout 'Hello, nested loops.')
    (loop 3
      (stdout 'a')
      (loop 2
        (stdout '  b')
      )
    )
  )
)
`;

let r3 =
`Hello, nested loops.
a
  b
  b
a
  b
  b
a
  b
  b
`;
//------------------------------------------------------------------------------
let c4 = `
(
  (startup
    (stdout 'start')
    (wait 1.5)
    (stdout 'finish')
  )
)
`;
let r4 =
`start
finish
`;
//------------------------------------------------------------------------------
let c5 = `
(
  symbol1: 42
  symbol2: true
  symbol3: 'Howdy'

  funtion1: (startup
    (stdout symbol1)
    (stdout symbol2)
    (stdout symbol3)
  )
)
`;

//------------------------------------------------------------------------------
let execTests =  [
  [c1, r1],
  [c2, r2],
  [c3, r3],
  [c4, r4],
];

runTests(execTests);
