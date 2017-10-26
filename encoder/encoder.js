// Copyright 2015-2017 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

const { padAddress, padBool, padBytes, padFixedBytes, padU32, padString } = require('../util/pad');
const Mediate = require('./mediate');
const Token = require('../token/token');
const { isArray, isInstanceOf } = require('../util/types');

class Encoder {
}

Encoder.encode = function (tokens) {
  if (!isArray(tokens)) {
    throw new Error('tokens should be array of Token');
  }

  const mediates = tokens.map(function (token, index) {
    return Encoder.encodeToken(token, index);
  });
  const inits = mediates
    .map(function (mediate, idx) {
      return mediate.init(Mediate.offsetFor(mediates, idx));
    })
    .join('');
  const closings = mediates
    .map(function (mediate, idx) {
      return mediate.closing(Mediate.offsetFor(mediates, idx));
    })
    .join('');

  return `${inits}${closings}`;
};

Encoder.encodeToken = function (token, index = 0) {
  if (!isInstanceOf(token, Token)) {
    throw new Error('token should be instanceof Token');
  }

  try {
    switch (token.type) {
      case 'address':
        return new Mediate('raw', padAddress(token.value));

      case 'int':
      case 'uint':
        return new Mediate('raw', padU32(token.value));

      case 'bool':
        return new Mediate('raw', padBool(token.value));

      case 'fixedBytes':
        return new Mediate('raw', padFixedBytes(token.value));

      case 'bytes':
        return new Mediate('prefixed', padBytes(token.value));

      case 'string':
        return new Mediate('prefixed', padString(token.value));

      case 'fixedArray':
      case 'array':
        return new Mediate(token.type, token.value.map(function (token) {
          return Encoder.encodeToken(token));
        });
    }
  } catch (e) {
    throw new Error(`Cannot encode token #${index} [${token.type}: ${token.value}]. ${e.message}`);
  }

  throw new Error(`Invalid token type ${token.type} in encodeToken`);
};

module.exports = Encoder;
