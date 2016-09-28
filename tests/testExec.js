'use strict';

var assert = require('assert');
var teak = require('../lib/teak.js');
var exec = require('../lib/execution.js');

var code1 = `
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

var code1Expected =
`Hello, World.
Hello, Moon.
true
42
1 2 3
1,2,3
`;

var gOutput = '';

function pumpLoop(rt) {
  var stuffDone = rt.pump();
  if (stuffDone) {
    setTimeout(function(){ pumpLoop(rt); }, 10);
  } else {
    console.log('Nothing left to run');
    console.log('stdout:');
    console.log(gOutput);
    assert.equal(gOutput, code1Expected);
  }
}

function test1(codeBlock) {
  let state = {};
  state.stdout = function(text) { gOutput = gOutput + text; };
  let obj =  teak.parse(codeBlock, state, exec.standardLib);
  let rt = new exec.RunTime(obj, state, exec.standardLib);
  pumpLoop(rt);
}

var code2 = `
(
  (startup
    (stdout 'Hello, loops.')
    (loop 2
      (stdout 'Whats')
      (stdout 'Up')
    )
  )
)
`;

test1(code1);
