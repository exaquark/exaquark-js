'use strict';

var _exports = module.exports = {};

// Logs the message. Override `this.logger` for specialized logging. noops by default
_exports.log = function (logger, msg, data) {
  logger(msg, data);
};

_exports.getRequest = function (url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = function () {
    if (xhr.status === 200) {
      callback(null, JSON.parse(xhr.responseText));
    } else {
      callback(xhr.status);
    }
  };
  xhr.send();
};