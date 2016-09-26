'use strict';

var assert = require('assert');
var teak = require('../lib/teak.js');
var exec = require('../lib/execution.js');

var code1 = `
(
  (startup
    (stdout 'Hello, World.\n')
  )

  (startup
    (stdout 'Hello, Moon.\n')
  )
)
`;

var gOutput = '';

function pumpLoop(rt) {
  var stuffDone = rt.pump();
  if (stuffDone) {
    setTimeout(function(){ pumpLoop(rt); }, 100);
  } else {
    console.log('Nothing left to run');
    console.log(gOutput);
    assert.equal(gOutput, 'Hello, World.\nHello, Moon.\n');
  }
}


function test1() {
  let state = {};
  state.stdout = function(text) { gOutput = gOutput + text; };

  let obj =  teak.parse(code1, state, exec.standardLib);

  let rt = new exec.RunTime(obj, state, exec.standardLib);
  pumpLoop(rt);
}

test1();
