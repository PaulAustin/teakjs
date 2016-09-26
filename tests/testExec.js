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
  )
)
`;

function pumpLoop(rt) {
  var stuffDone = rt.pump();
  if (stuffDone) {
    setTimeout(function(){ pumpLoop(rt); }, 100);
  } else {
    console.log('Nothing left to run');
  }
}

function test1() {
  var state = {};
  let obj =  teak.parse(code1, state, exec.standardLib);
  state.stdout = function(message) { console.log(message); };

  let rt = new exec.RunTime(obj, state, exec.standardLib);
  pumpLoop(rt);
}

test1();
