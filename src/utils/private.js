const xhr = require('xhr')
var exports = module.exports = {}

// Logs the message. Override `this.logger` for specialized logging. noops by default
exports.log = function (logger, msg, data) {
  logger(msg, data)
}

exports.getRequest = function (url, callback) {
  xhr.get(url, (err, resp) => {
    callback(err, JSON.parse(resp.body))
  })
}
