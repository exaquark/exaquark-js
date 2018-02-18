var exports = module.exports = {}

// Logs the message. Override `this.logger` for specialized logging. noops by default
exports.log = function (logger, msg, data) {
  logger(msg, data)
}

// Converts a dictionary to an array
exports.dictionaryToArray = function (dict) {
  return Object.keys(dict).map(key => dict[key])
}

// Converts a dictionary to an array
exports.arrayToDictionary = function (arr) {
  return arr.reduce(function (map, obj) {
    map[obj.iid] = obj
    return map
  }, {})
}
