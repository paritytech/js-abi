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

const { keccak_256 } = require('js-sha3'); // eslint-disable-line camelcase
const { fromParamType } = require('../spec/paramType/format');

function eventSignature (eventName, params) {
  const { strName, name } = parseName(eventName);
  const types = (params || []).map(fromParamType).join(',');
  const id = `${strName}(${types})`;
  const signature = strName ? keccak_256(id) : '';

  return { id, name, signature };
}

function methodSignature (methodName, params) {
  const { id, name, signature } = eventSignature(methodName, params);

  return { id, name, signature: signature.substr(0, 8) };
}

function parseName (name) {
  const strName = `${name || ''}`;
  const index = strName.indexOf('(');

  if (index === -1) {
    return { strName, name };
  }

  const trimmedName = strName.slice(0, index);

  return {
    strName: trimmedName,
    name: trimmedName
  };
}

module.exports = {
  eventSignature,
  methodSignature
};
