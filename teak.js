module.exports = (function () {
  var teak = {};

  // Token categories
  var tkNone = 0;         // No valid token
  var tkOpenParen = 1;    // (
  var tkCloseParen = 2;   // )
  var tkString = 3;       // 'abc'
  var tkNumber = 4;       // 123 456.289
  var tkSymbol = 5;       // add
  var tkName = 5;         // name:

  function isNumberChar (c) {
    return (c >= '0' && c <= '9');
  }

  function isAlphaChar (c) {
    return (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z');
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

  teak.StringTool.prototype.scanSymbolToken = function () {
    cat = tkSymbol;
    do {
      str += this.readChar();
      c = this.peekChar();
    } while (isNumberChar(c) || isAlphaChar(c));

    // There are a few special cases
    if (c === ':') {
      // symbol followed by a colon is really anchor/field name
      // this takes precedence over reserved words.
      cat = tkName;
      this.readChar();
    }
  };

  // Reads characters from the buffer assuming it is a string
  teak.StringTool.prototype.scanStringToken = function () {
    this.readChar();
    var str = '';
    var c = this.readChar();
    while (c !== '\'' && !this.empty()) {
      if (c !== '\\') {
        str += c;
        c = this.readChar();
      } else {
        // Read escape sequence and translate.
        c = this.readChar();
        if (c === 'n') {
          str += '\n';
        } else if (c === '\'') {
          str += '\'';
        } else if (c === '\"') {
          str += '\"';
        } else if (c === '\\') {
          str += '\\';
        } else if (c === 'u') {
          // TODO unicode characters
        } else {
          // TODO bad escape code
        }
        c = this.readChar();
      }
    } while (c !== '\'' && !this.empty());

    return {
      string:str,
      category:tkString,
    };
  };

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
    } else if (isAlphaChar(c)) {
      cat = tkSymbol;
      do {
        str += this.readChar();
        c = this.peekChar();
      } while (isNumberChar(c) || isAlphaChar(c));
      if (c === ':') {
        cat = tkName;
        this.readChar();
      }
    } else if (c === '\'') {
      return this.scanStringToken();
    }
    return {
      string:str,
      category:cat,
    };
  };

  teak.StringTool.prototype.tokenToObject = function (token) {
    var str = token.string;
    if (token.category === tkNumber) {
      return parseInt(str, 10);
    } else if (token.category === tkString) {
      return str;
    } else if (token.category === tkSymbol) {
      // Check for reserved words first
      if (str === 'true') {
        return true;
      } else if (str === 'false') {
        return false;
      } else if (str === 'null') {
        return null;
      } else {
        // TODO Look up in symbool table.
        return '_' + str;
      }
    }
  };

  teak.StringTool.prototype.buildObject = function (st) {
      obj = [];

      var token = st.readToken();
      while (token.category !== tkCloseParen && !st.empty()) {
        obj.push(this.tokenToObject(token));
        token = st.readToken();
      }
      return obj;
  };

  teak.expressionToObject = function (string) {
    var st = new teak.StringTool(Array.from(string), 0);
    var obj = null;
    var token = st.readToken();

    if (token.category === tkOpenParen) {
      obj = st.buildObject(st);
    } else {
      // Need smarter conversion function
      obj = st.tokenToObject(token);
    }

    return obj;
  };

  return teak;
}());
