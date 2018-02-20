'use strict';

var xhr = require('xhr');
var _exports = module.exports = {};

// Logs the message. Override `this.logger` for specialized logging. noops by default
_exports.log = function (logger, msg, data) {
  logger(msg, data);
};

_exports.getRequest = function (url, callback) {
  xhr.get(url, function (err, resp) {
    callback(err, JSON.parse(resp.body));
  });
};