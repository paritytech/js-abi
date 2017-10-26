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

const Decoder = require('../../decoder/decoder');
const DecodedLog = require('./decodedLog');
const DecodedLogParam = require('./decodedLogParam');
const EventParam = require('./eventParam');
const { asAddress } = require('../../util/sliceAs');
const { eventSignature } = require('../../util/signature');

class Event {
  constructor (abi) {
    this._inputs = EventParam.toEventParams(abi.inputs || []);
    this._anonymous = !!abi.anonymous;

    const { id, name, signature } = eventSignature(abi.name, this.inputParamTypes());

    this._id = id;
    this._name = name;
    this._signature = signature;
  }

  get name () {
    return this._name;
  }

  get id () {
    return this._id;
  }

  get inputs () {
    return this._inputs;
  }

  get anonymous () {
    return this._anonymous;
  }

  get signature () {
    return this._signature;
  }

  inputParamTypes () {
    return this._inputs.map(function (input) {
      return input.kind;
    });
  }

  inputParamNames () {
    return this._inputs.map(function (input) {
      return input.name;
    });
  }

  indexedParams (indexed) {
    return this._inputs.filter(function (input) {
      return input.indexed === indexed;
    });
  }

  decodeLog (topics, data) {
    const topicParams = this.indexedParams(true);
    const dataParams = this.indexedParams(false);

    let address;
    let toSkip;

    if (!this.anonymous) {
      address = asAddress(topics[0]);
      toSkip = 1;
    } else {
      toSkip = 0;
    }

    const topicTypes = topicParams.map(function (param) {
      return param.kind;
    });
    const flatTopics = topics
      .filter(function (topic, idx) {
        return idx >= toSkip;
      })
      .map(function (topic) {
        return (topic.substr(0, 2) === '0x')
          ? topic.substr(2)
          : topic;
      })
      .join('');
    const topicTokens = Decoder.decode(topicTypes, flatTopics);

    if (topicTokens.length !== (topics.length - toSkip)) {
      throw new Error('Invalid topic data');
    }

    const dataTypes = dataParams.map(function (param) {
      return param.kind;
    });
    const dataTokens = Decoder.decode(dataTypes, data);

    const namedTokens = {};

    topicParams.forEach(function (param, idx) {
      namedTokens[param.name || idx] = topicTokens[idx];
    });
    dataParams.forEach(function (param, idx) {
      namedTokens[param.name || idx] = dataTokens[idx];
    });

    const inputParamTypes = this.inputParamTypes();
    const decodedParams = this.inputParamNames()
      .map(function (name, idx) {
        return new DecodedLogParam(name, inputParamTypes[idx], namedTokens[name || idx]);
      });

    return new DecodedLog(decodedParams, address);
  }
}

module.exports = Event;
