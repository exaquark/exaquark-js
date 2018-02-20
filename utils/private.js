"use strict";

var _exports = module.exports = {};

// Logs the message. Override `this.logger` for specialized logging. noops by default
_exports.log = function (logger, msg, data) {
  logger(msg, data);
};