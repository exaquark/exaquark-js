var exports = module.exports = {}

// Logs the message. Override `this.logger` for specialized logging. noops by default
exports.log = function(logger, msg, data){
  logger(msg, data)
}
