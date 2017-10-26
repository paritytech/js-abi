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

const jssha = require('js-sha3'); // eslint-disable-line camelcase
const format = require('../spec/paramType/format');

function eventSignature (eventName, params) {
  const _name = parseName(eventName);
  const types = (params || []).map(format.fromParamType).join(',');
  const id = `${_name.strName}(${types})`;
  const signature = _name.strName ? jssha.keccak_256(id) : '';

  return {
    id,
    name: _name.name,
    signature
  };
}

function methodSignature (methodName, params) {
  const sig = eventSignature(methodName, params);

  return {
    id: sig.id,
    name: sig.name,
    signature: sig.signature.substr(0, 8)
  };
}

function parseName (name) {
  const strName = `${name || ''}`;
  const idx = strName.indexOf('(');

  if (idx === -1) {
    return { strName, name };
  }

  const trimmedName = strName.slice(0, idx);

  return {
    strName: trimmedName,
    name: trimmedName
  };
}

module.exports = {
  eventSignature,
  methodSignature
};
