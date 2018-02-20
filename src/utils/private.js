var exports = module.exports = {}

// Logs the message. Override `this.logger` for specialized logging. noops by default
exports.log = function (logger, msg, data) {
  logger(msg, data)
}

exports.getRequest = function (url, callback) {
  let xhr = new XMLHttpRequest()
  xhr.open('GET', url)
  xhr.onload = function() {
    if (xhr.status === 200) {
      callback(null, JSON.parse(xhr.responseText))
    }
    else {
      callback(xhr.status)
    }
  }
  xhr.send()
}
