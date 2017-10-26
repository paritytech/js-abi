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

const BigNumber = require('bignumber.js');
const utf8 = require('utf8');

const types = require('./types');

const ZERO_64 = '0000000000000000000000000000000000000000000000000000000000000000';

function padAddress (_input) {
  const input = _input.substr(0, 2) === '0x' ? _input.substr(2) : _input;

  return `${ZERO_64}${input}`.slice(-64);
}

function padBool (input) {
  return `${ZERO_64}${input ? '1' : '0'}`.slice(-64);
}

function padU32 (input) {
  let bn = new BigNumber(input);

  if (bn.lessThan(0)) {
    bn = new BigNumber('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)
      .plus(bn).plus(1);
  }

  return `${ZERO_64}${bn.toString(16)}`.slice(-64);
}

function stringToBytes (input) {
  if (types.isArray(input)) {
    return input;
  } else if (input.substr(0, 2) === '0x') {
    const matches = input.substr(2).toLowerCase().match(/.{1,2}/g) || [];

    return matches.map(function (value) {
      return parseInt(value, 16);
    });
  } else {
    return input.split('').map(function (char) {
      return char.charCodeAt(0);
    });
  }
}

function padBytes (_input) {
  const input = stringToBytes(_input);

  return `${padU32(input.length)}${padFixedBytes(input)}`;
}

function padFixedBytes (_input) {
  const input = stringToBytes(_input);
  const sinput = input.map(function (code) {
    return `0${code.toString(16)}`.slice(-2);
  }).join('');
  const max = Math.floor((sinput.length + 63) / 64) * 64;

  return `${sinput}${ZERO_64}`.substr(0, max);
}

function padString (input) {
  const array = utf8.encode(input)
    .split('')
    .map(function (char) {
      return char.charCodeAt(0);
    });

  return padBytes(array);
}

module.exports = {
  padAddress,
  padBool,
  padU32,
  padBytes,
  padFixedBytes,
  padString
};
