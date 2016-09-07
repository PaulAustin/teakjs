module.exports = (function () {
  var teak = {};

  // Token categories
  var tkNone = 0;         // No valid token
  var tkOpenParen = 1;    // (
  var tkCloseParen = 2;   // )
  var tkString = 3;       // 'abc'
  var tkNumber = 4;       // 123 456.289
  var tkName = 5;         // name:

  function isNumberChar (c) {
    return (c >= '0' && c <= '9');
  }

  teak.StringTool = function StringTool (buffer, begin) {
    this.buffer = buffer;
    this.begin = begin;
  };

  teak.StringTool.prototype.empty = function () {
    return (this.begin >= this.buffer.length);
  };

  teak.StringTool.prototype.skipSpace = function StringTool () {
    var i = this.begin;
    var length = this.buffer.length;
    while (i < length) {
      var c = this.buffer[i];
      if (c === ' ' || c === '\t' || c === '\r') {
        i += 1;
        continue;
      } else {
        break;
      }
    }
    this.begin = i;
  };

  teak.StringTool.prototype.peekChar = function () {
    return this.buffer[this.begin];
  };

  teak.StringTool.prototype.readChar = function () {
    var c = '';
    if (this.begin < this.buffer.length) {
      c = this.buffer[this.begin];
      this.begin++;
    }
    return c;
  };
/*
  teak.StringTool.prototype.nextCharIsAlpha = function () {
    if (this.empty()) {
      return false
    }
    var c = this.buffer[this.begin]
    return (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z')
  }
*/
  teak.StringTool.prototype.readToken = function () {
    this.skipSpace();

    var str = '';
    var cat = null;
    var c = this.peekChar();

    if (c === '(') {
      cat = tkOpenParen;
      str = this.readChar();
    } else if (c === ')') {
      cat = tkCloseParen;
      str = this.readChar();
    } else if (isNumberChar(c)) {
      cat = tkNumber;
      do {
        str += this.readChar();
        c = this.peekChar();
      } while (isNumberChar(c));
    }
    return {
      string:str,
      category:cat,
    };
  };

  function tokenToObject(token) {
    if (token.category = tkNumber) {
      return parseInt(token.string, 10);
    } else {
      return token.string;      
    }
  }

  function buildObject(st) {
      obj = [];

      var token = st.readToken();
      while (token.category !== tkCloseParen && !st.empty()) {
        obj.push(tokenToObject(token));
        token = st.readToken();
      }
      return obj;
  }

  teak.teakExpressionToObject = function (string) {
    var st = new teak.StringTool(Array.from(string), 0);
    var obj = null;
    var token = st.readToken();

    if (token.category === tkOpenParen) {
      obj = buildObject(st);
    } else {
      // Need smarter conversion function
      obj = tokenToObject(token);
    }

    return obj;
  };

  return teak;
}());
