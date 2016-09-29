'use strict';

var assert = require('assert');
var teak = require('../lib/teak.js');
var exec = require('../lib/execution.js');

var testIoLib = {};

//------------------------------------------------------------------------------
testIoLib.led = function (esite, inst) {
  // This is the message receiver funciton for a teak script.

  // Text can be sent to the execution sites standard out channel.
  esite.stdout('LED:' + JSON.stringify(inst[1]) + '\n');

  // Simple functions just return indicating they have received the message
  // and that the script should contind to the next step of the sequence.
  return esite.next();
};


//------------------------------------------------------------------------------
testIoLib.motor = function (esite, inst) {
  // This is the message receiver funciton for a teak script.
  esite.stdout('Motor:' + JSON.stringify(inst[1]) + '\n');

  // Script meaage receivers can handshake by setting up a continue.

  // If the message done with then it can still tell the sequencer to continue.
  // immediately.
  return esite.next();
};

//------------------------------------------------------------------------------
function popAndRunTest(tests, index) {
  let state = {
    stdout:''
  };
  let libs = [testIoLib, exec.standardLib];
  let obj =  teak.parse(tests[index][0], state, libs);
  let rt = new exec.RunTime(obj, state, libs);
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
    (stdout 'Hello IO actors')
    (led true)
    (motor (power:50))
    (motor true)
    (motor false)
    (motor (power:50 time:2))
    (led false)
  )
)
`;

let r1 =
`Hello IO actors
LED:true
Motor:{"power":50}
Motor:true
Motor:false
Motor:{"power":50,"time":2}
LED:false
`;

//------------------------------------------------------------------------------
let execTests =  [
  [c1, r1],
];

runTests(execTests);
