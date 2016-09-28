'use strict';

var assert = require('assert');
var teak = require('../lib/teak.js');
var exec = require('../lib/execution.js');

var gOutput = '';
var gIndex = 0;
var gTests = null;

function pumpLoop(rt) {
  var stuffDone = rt.pump();
  if (stuffDone) {
    setTimeout(function(){ pumpLoop(rt); }, 10);
  } else {
    console.log('------- Test finished -------');
    console.log(gOutput);
    assert.equal(gOutput, gTests[gIndex][1]);
    gIndex++;
    if (gIndex < gTests.length) {
      popAndRunTest();
    }
  }
}

function popAndRunTest(codeBlock) {
  let state = {};
  gOutput = '';
  state.stdout = function(text) { gOutput = gOutput + text; };
  let obj =  teak.parse(gTests[gIndex][0], state, exec.standardLib);
  let rt = new exec.RunTime(obj, state, exec.standardLib);
  pumpLoop(rt);
}

function runTests(listOfTests) {
  gTests = listOfTests;
  gIndex = 0;
  popAndRunTest();
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
let execTests =  [
  [c1,r1],
  [c2,r2],
  [c3,r3],
];

runTests(execTests);
