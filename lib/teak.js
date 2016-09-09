module.exports = (function () {
  //-----------------------------------------------------------------------------
  var teak = {};

  // Token categories
  var tkNone = 0;         // No valid token
  var tkOpenParen = 1;    // (
  var tkCloseParen = 2;   // )
  var tkString = 3;       // 'abc'
  var tkNumber = 4;       // 123 456.289
  var tkSymbol = 5;       // add
  var tkName = 6;         // name:

  function isNumberChar (c) {
    return (c >= '0' && c <= '9');
  }

  function isAlphaChar (c) {
    return (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z');
  }

  teak.invalidToken = {string:'', cat: tkNone};

  //-----------------------------------------------------------------------------
  teak.StringTool = function StringTool (buffer, begin, state) {
    // Buffer is an array of single unicode grapheme
    this.buffer = buffer;
    // Begin is the index to the next character
    this.begin = begin;
    // Parser state
    this.state = state;
    state.error = '';
    state.position = 0;
  };

  //-----------------------------------------------------------------------------
  teak.StringTool.prototype.markError = function (message, position) {
    state.error = message;
    state.position = position;
  };

  //-----------------------------------------------------------------------------
  teak.StringTool.prototype.empty = function () {
    return (this.begin >= this.buffer.length);
  };

  //-----------------------------------------------------------------------------
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

  //-----------------------------------------------------------------------------
  teak.StringTool.prototype.peekChar = function () {
    return this.buffer[this.begin];
  };

  //-----------------------------------------------------------------------------
  teak.StringTool.prototype.readChar = function () {
    var c = '';
    if (this.begin < this.buffer.length) {
      c = this.buffer[this.begin];
      this.begin++;
    }
    return c;
  };

  //-----------------------------------------------------------------------------
  teak.StringTool.prototype.scanNumberToken = function (isNeg) {
    var str = isNeg ? '-' : '';
    do {
      str += this.readChar();
      c = this.peekChar();
    } while (isNumberChar(c));

    return { string:str, category:tkNumber };
  };

  //-----------------------------------------------------------------------------
  teak.StringTool.prototype.scanSymbolToken = function (isNeg) {
    var str = isNeg ? '-' : '';
    var cat = tkSymbol;
    do {
      str += this.readChar();
      var c = this.peekChar();
    } while (isNumberChar(c) || isAlphaChar(c));

    // There are a few special cases
    if (c === ':') {
      if (isNeg) {
        this.markError('Invalid negated name', this.begin);
        return teak.invalidToken;
      }
      // symbol followed by a colon is really anchor/field name
      // this takes precedence over reserved words.
      cat = tkName;
      this.readChar();
    }
    return { string:str, category:cat };
  };

  //-----------------------------------------------------------------------------
  // Reads characters from the buffer assuming it is a string
  teak.StringTool.prototype.scanStringToken = function () {
    this.readChar();
    var str = '';
    var position = this.begin;
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
          this.markError('Invalid string escape', this.begin);
        }
        c = this.readChar();
      }
    };

    if (c !== '\'') {
      this.markError('Invalid string', position);
    }
    return {
      string:str,
      category:tkString,
    };
  };

  //-----------------------------------------------------------------------------
  teak.StringTool.prototype.readToken = function () {
    this.skipSpace();
    var c = this.peekChar();
    var isNeg = false;

    if (c === '(') {
      return { string: this.readChar(), category: tkOpenParen };
    } else if (c === ')') {
      return { string: this.readChar(), category: tkCloseParen };
    } else if (c === '\'') {
      return this.scanStringToken();
    } else if (c === '-') {
      // negative sign can prefix numbers and some symbols
      isNeg = true;
      this.readChar();
      c = this.peekChar();
    }

    if (isNumberChar(c)) {
      return this.scanNumberToken(isNeg);
    } else if (isAlphaChar(c)) {
      return this.scanSymbolToken(isNeg);
    }  else {
      return teak.invalidToken;
    }
  };

//-----------------------------------------------------------------------------
teak.StringTool.prototype.tokenToObject = function (token) {
    var str = token.string;
    if (token.category === tkNumber) {
      // Its a number, turn it into a real number
      return parseInt(str, 10);
    } else if (token.category === tkString) {
      // Its a string use the data as is.
      return str;
    } else if (token.category === tkSymbol) {
      // Check for reserved words first
      if (str === 'true') {
        return true;
      } else if (str === 'false') {
        return false;
      } else if (str === 'null') {
        return null;
      } else if (str === 'nan') {
        return Number.NaN;
      } else if (str === 'inf') {
        return Number.POSITIVE_INFINITY;
      } else if (str === '-inf') {
        return Number.NEGATIVE_INFINITY;
      } else {
        // TODO Look up in symbool table
        return '_' + str;
      }
    } else if (token.category === tkNone) {
      // Unrecognized characters or end of string
      this.markError('Invalid token', this.begin);
      return null;
    } else {
      // Token type not yet supported.
      this.markError('Invalid token category :' + token.category, this.begin);
    }
  };

  //-----------------------------------------------------------------------------
  teak.StringTool.prototype.parseObject = function (token) {
      var obj = null;
      var names = [];
      var index = 0;

      if (token.category === tkOpenParen) {
        // begining of a list
        obj = [];
        token = this.readToken();
        while (token.category !== tkCloseParen && !this.empty()) {

          // See if item has a name
          if (token.category === tkName) {
            names[index] = token.string;
            token = this.readToken();
          }
          if (token.category === tkName) {
            this.markError('Invalid token', this.begin);
            return null;
          }

          obj.push(this.parseObject(token));
          token = this.readToken();
          index += 1;
        }
        if (names.length > 0) {
          console.log('names exist', names);
        }
        if (token.category !== tkCloseParen) {
          this.markError('Invalid expression', this.begin);
          return null;
        }
        // TODO if names exist promote array to object
      } else {
        // Not a list, is a single item
        obj = this.tokenToObject(token);
      }
      return obj;
  };

  //-----------------------------------------------------------------------------
  teak.expressionToObject = function (string, state) {
    var st = new teak.StringTool(Array.from(string), 0, state);
    var token = st.readToken();
    return st.parseObject(token);
  };

  return teak;
}());