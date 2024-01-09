const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  _currentLimit;

  constructor(options) {
    super(options);
    this._currentLimit = options.limit;
  }

  _transform(chunk, encoding, callback) {
    this._currentLimit -= Buffer.from(chunk).length;
    if (this._currentLimit < 0) {
      callback(new LimitExceededError(), chunk);
    } else {
      callback(null, chunk);
    }
  }
}

module.exports = LimitSizeStream;
