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

const format = require('./paramType/format');

class Param {
  constructor (name, type) {
    this._name = name;
    this._kind = format.toParamType(type);
  }

  get name () {
    return this._name;
  }

  get kind () {
    return this._kind;
  }
}

Param.toParams = function (params) {
  return params.map(function (param) {
    if (param instanceof Param) {
      return param;
    }

    return new Param(param.name, param.type);
  });
};

module.exports = Param;
