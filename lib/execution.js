/*
Copyright (c) 2016 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = (function () {
  var execution = {};

  //----------------------------------------------------------------------------
  // For instructions the inst object is a bit like argv/argc. inst[0] is the
  // instruction fuction pointer, inst[1] is the first argument.
  execution.standardLib = {};

  //----------------------------------------------------------------------------
  execution.standardLib.stdin = function (inst) {
  };

  //----------------------------------------------------------------------------
  execution.standardLib.stdout = function (inst) {
    console.log(inst[1]);
  };

  //----------------------------------------------------------------------------
  execution.standardLib.startup = function (inst) {
    // Not used at this time. May not need to be a function.
  };


  //----------------------------------------------------------------------------
  // Execution site
  execution.ESite = function ESite(runtime, sequence, index) {
    this.rt = runtime;
    this.sequence = sequence;
    this.index = index;
  };

  //----------------------------------------------------------------------------
  // If there is an instruction execute it.
  execution.ESite.prototype.pump = function() {
    if (this.index < this.sequence.length) {
      var elt = this.sequence[this.index];
      elt[0](elt);
      this.index += 1;
      return true;
    } else {
      return false;
    }
  };

  //----------------------------------------------------------------------------
  execution.RunTime = function RuntTime(obj, state, symbolTable) {
    this.esites = [];
    this.findStartups(obj);
    this.code = obj;
  };

  //----------------------------------------------------------------------------
  execution.RunTime.prototype.findStartups = function (obj, inSequence) {
    for (var i = 0; i < obj.length; i++) {
      elt = obj[i];
      if (Array.isArray(elt)) {
        if (elt[0] === execution.standardLib.startup) {
          var esite= new execution.ESite(this, elt, 1);
          this.esites.push(esite);
        }
      }
    }
  };

  //----------------------------------------------------------------------------
  // Give each execution site a chance to execute an instruction.
  execution.RunTime.prototype.pump = function (slices) {
    var somethingDone = false;
    this.esites.forEach(function(elt) {
      somethingDone |= elt.pump();
      // Active sites just become dormant unless something else wakes
      // them up.
    });
    return somethingDone;
  };

  return execution;
}());
