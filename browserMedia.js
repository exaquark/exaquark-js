'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var browserMedia = function () {
  function browserMedia() {
    _classCallCheck(this, browserMedia);

    this.audioStream = {};
    this.audioTracks = [];
    this.videoStream = {};
    this.videoTracks = [];
  }

  _createClass(browserMedia, [{
    key: 'initAudio',
    value: function initAudio() {
      var _this = this;

      var constraints = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { audio: true };

      return new Promise(function (resolve, reject) {
        navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {
          for (var i = 0; i !== deviceInfos.length; ++i) {
            var deviceInfo = deviceInfos[i];
            if (deviceInfo.kind === 'audioinput') _this.audioTracks.push(deviceInfos[i]);
          }
          return navigator.mediaDevices.getUserMedia(constraints);
        }).then(function (stream) {
          console.log('stream', stream);
          _this.audioStream = stream;
          resolve(stream); // return the default stream
        }).catch(function (err) {
          return reject(err);
        });
      });
    }
  }, {
    key: 'initVideo',
    value: function initVideo() {
      var _this2 = this;

      var constraints = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { video: true };

      return new Promise(function (resolve, reject) {
        navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {
          for (var i = 0; i !== deviceInfos.length; ++i) {
            var deviceInfo = deviceInfos[i];
            if (deviceInfo.kind === 'videoinput') _this2.videoTracks.push(deviceInfos[i]);
          }
          return navigator.mediaDevices.getUserMedia(constraints);
        }).then(function (stream) {
          _this2.videoStream = stream;
          return resolve(stream); // return the default stream
        }).catch(function (err) {
          return reject(err);
        });
      });
    }
  }, {
    key: 'getAudioTracks',
    value: function getAudioTracks() {
      return this.audioTracks;
    }
  }, {
    key: 'getVideoTracks',
    value: function getVideoTracks() {
      return this.videoTracks;
    }
  }, {
    key: 'stopAudio',
    value: function stopAudio() {
      this.videoStream.getAudioTracks()[0].stop();
    }
  }, {
    key: 'stopVideo',
    value: function stopVideo() {
      this.videoStream.getVideoTracks()[0].stop();
    }
  }]);

  return browserMedia;
}();

exports.default = browserMedia;
module.exports = exports['default'];