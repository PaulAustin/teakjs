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
  'use strict';

  //----------------------------------------------------------------------------
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

  //----------------------------------------------------------------------------
  teak.Parser = function Parser (buffer, begin, state, symbolTable) {
    // Buffer is an array of single unicode grapheme
    this.buffer = buffer;
    // Begin is the index to the next character
    this.begin = begin;
    // Parser state
    this.state = state;
    state.error = '';
    state.position = 0;

    // SymbolTable for mapping symbols (not strings) found in the expression
    this.symbolTable = symbolTable;
  };

  //----------------------------------------------------------------------------
  teak.Parser.prototype.markError = function (message, position) {
    this.state.error = message;
    this.state.position = position;
  };

  //----------------------------------------------------------------------------
  teak.Parser.prototype.empty = function () {
    return (this.begin >= this.buffer.length);
  };

  //----------------------------------------------------------------------------
  // Skip spaces and any comments found along the way.
  teak.Parser.prototype.skipSpace = function Parser () {
    var i = this.begin;
    var length = this.buffer.length;
    while (i < length) {
      var c = this.peekChar();
      if (c === ' ' || c === '\n' || c === '\r' || c === '\t') {
        this.readChar();
        continue;
      } else if (c === '/' && ((i + 1) < length) && this.buffer[i+1] === '/') {
        // Comment to end-of-line, or end-of-file
        this.readChar();
        this.readChar();
        do {
          c = this.readChar();
        } while (c !== '\n' && !this.empty());
      } else {
        // Found something that does not count was space, break.
        break;
      }
    }
  };

  //----------------------------------------------------------------------------
  teak.Parser.prototype.peekChar = function () {
    return this.buffer[this.begin];
  };

  //----------------------------------------------------------------------------
  teak.Parser.prototype.readChar = function () {
    var c = '';
    if (this.begin < this.buffer.length) {
      c = this.buffer[this.begin];
      this.begin += 1;
    }
    return c;
  };

  //----------------------------------------------------------------------------
  teak.Parser.prototype.scanNumberToken = function (isNeg) {
    var str = isNeg ? '-' : '';
    var c = '';
    do {
      str += this.readChar();
      c = this.peekChar();
      // TODO this is not as strict as it oughto be..
      // tighten up here or in tokenToObject().
    } while (isNumberChar(c) || c === '.');
    return { string:str, category:tkNumber };
  };

  //----------------------------------------------------------------------------
  teak.Parser.prototype.scanSymbolToken = function (isNeg) {
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

  //----------------------------------------------------------------------------
  // Reads characters from the buffer assuming it is a string
  teak.Parser.prototype.scanStringToken = function () {
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

  //----------------------------------------------------------------------------
  teak.Parser.prototype.readToken = function () {
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

//------------------------------------------------------------------------------
teak.Parser.prototype.tokenToObject = function (token) {
    var str = token.string;
    if (token.category === tkNumber) {
      if (str.includes('.')) {
        return parseFloat(str, 10);
      } else {
        return parseInt(str, 10);
      }
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
        return this.lookupSymbol(str);
        // TODO unresolved symbols just pass through as undefined.
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

  //----------------------------------------------------------------------------
  teak.Parser.prototype.lookupSymbol = function (name) {
    var value = undefined;
    if (Array.isArray(this.symbolTable)) {
      for (var i = 0; i < this.symbolTable.length; i++) {
        value = this.symbolTable[i][name];
        if (value !== undefined) {
          break;
        }
      }
    } else if (typeof this.symbolTable === "function") {
      return this.symbolTable(name);
    } else {
      value = this.symbolTable[name];
    }
    return value;
  };

  //----------------------------------------------------------------------------
  teak.Parser.prototype.parseObject = function (token) {
      var obj = null;
      var names = [];
      var index = 0;

      if (token.category === tkOpenParen) {
        // Beginning of a list
        var array = [];
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

          array.push(this.parseObject(token));
          token = this.readToken();
          index += 1;
        }
        if (names.length > 0) {
          var objWithFields = {};
          var length = array.length;
          for (var i = 0; i < length; i++) {
            var name = names[i];
            if (name === undefined) {
              name = "_" + i;
            }
            objWithFields[name] = array[i];
          }
          obj = objWithFields;
        } else {
          obj = array;
        }
        if (token.category !== tkCloseParen) {
          this.markError('Invalid expression', this.begin);
          return null;
        }
      } else {
        // Not a list, is a single item
        obj = this.tokenToObject(token);
      }
      return obj;
  };

  //----------------------------------------------------------------------------
  teak.parse = function (string, state, symbolTable) {
    if (state === undefined || state === null) {
      state = {};
    }
    if (symbolTable === undefined || state === null) {
      symbolTable = {};
    }
    var st = new teak.Parser(Array.from(string), 0, state, symbolTable);
    var token = st.readToken();
    return st.parseObject(token);
  };

  return teak;
}());
