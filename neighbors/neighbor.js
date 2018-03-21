// neighbor.js
// eslint-disable-next-line
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Peer = require('simple-peer');
var ICEconfiguration = {
  iceServers: [{ urls: 'stun:5.39.93.115', username: 'divereal', credential: 'paris1965' }, { urls: 'turn:5.39.93.115', username: 'divereal', credential: 'paris1965' }]
};

var Neighbor = function () {
  function Neighbor(entityState) {
    _classCallCheck(this, Neighbor);

    this.state = entityState;
    this.iid = entityState.iid;
  }

  _createClass(Neighbor, [{
    key: 'update',
    value: function update(state) {
      this.state = state;
    }
  }, {
    key: 'hasActiveStream',
    value: function hasActiveStream() {
      return this.peerStream && this.peerStream.active;
    }
  }, {
    key: 'getStream',
    value: function getStream() {
      return this.peerStream;
    }
  }]);

  return Neighbor;
}();

Neighbor.prototype.peerStream = null;
Neighbor.prototype.signalsToSend = [];
Neighbor.prototype.volume = {
  value: 0.0,
  instant: 0.0,
  scriptProcessor: null
};
Neighbor.prototype.initPeerConnection = function (stream, isInitiator) {
  var _this = this;

  this.closeStream();
  console.log('isInitiator', isInitiator);
  if (stream) {
    console.log('initializing p2p with stream');
    this.peerConnection = new Peer({
      channelName: this.state.iid,
      initiator: isInitiator, // the person with the highest IID should be the initiator of the P2P connection (or the person who changes stream)
      stream: stream,
      config: ICEconfiguration,
      reconnectTimer: 5000
    });
  } else {
    console.log('initializing p2p without stream');
    this.peerConnection = new Peer({
      channelName: this.state.iid,
      initiator: isInitiator,
      config: ICEconfiguration,
      reconnectTimer: 5000
    });
  }

  var neighbour = this;
  // the following are called via their peer, so they have no concept of "this" neighbor
  // instead, "this" refers to the P2P connection
  neighbour.peerConnection.on('signal', function (data) {
    // queue the data for exaQuark
    _this.signalsToSend.push(JSON.stringify(data));
  });
  neighbour.peerConnection.on('stream', function (remoteStream) {
    console.log('got remoteStream ' + remoteStream.id, remoteStream);
    neighbour.setStream(remoteStream);
  });
  neighbour.peerConnection.on('connect', function () {
    console.log('connected', neighbour);
    this.send('hello :)');
  });
  neighbour.peerConnection.on('data', function (data) {
    console.log('got a message: ' + data, this);
  });
  neighbour.peerConnection.on('close', function () {
    console.log('close', neighbour);
    neighbour.peerStream = null;
    neighbour.peerConnection = null;
    neighbour.signalsToSend = [];
  });
  return neighbour.peerConnection;
};
Neighbor.prototype.setStream = function (stream) {
  this.peerStream = stream;
};
Neighbor.prototype.closeStream = function (stream) {
  this.peerStream = null;
  this.peerConnection = null;
  this.signalsToSend = [];
};
Neighbor.prototype.receiveSignal = function (signal) {
  this.peerConnection.signal(JSON.parse(signal));
};
Neighbor.prototype.hasQueuedSignals = function () {
  return this.signalsToSend.length > 0;
};
Neighbor.prototype.sendQueuedSignals = function (exaQuark) {
  var len = this.signalsToSend.length;
  for (var i = 0; i < len; i++) {
    var type = this.signalsToSend[i].type;
    if (type) console.log('sending ' + type + ' to neighbor ' + this.iid, this.signalsToSend[i]);
    exaQuark.push('signal:private', {
      entities: [this.iid],
      signal: {
        type: '_webrtc',
        data: this.signalsToSend[i]
      }
    });
  }
  this.signalsToSend.splice(0, len);
};
Neighbor.prototype.getVolume = function () {
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext || !this.peerConnection || !this.peerStream) {
    // return console.log('Cannot get volume for ' + this.iid)
    return null;
  }

  if (!this.volume.scriptProcessor) {
    try {
      var self = this;
      var audioContext = new AudioContext();
      self.volume.scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
      self.volume.scriptProcessor.onaudioprocess = function (event) {
        var input = event.inputBuffer.getChannelData(0);
        var sum = 0.0;
        var clipcount = 0; // eslint-disable-line
        for (var i = 0; i < input.length; ++i) {
          sum += input[i] * input[i];
          if (Math.abs(input[i]) > 0.99) {
            clipcount += 1;
          }
        }
        self.volume.instant = Math.sqrt(sum / input.length);
        self.volume.value = 0.2 * self.volume.value + 0.8 * self.volume.instant; // "smooth" the volume
      };
      self.volume.mic = audioContext.createMediaStreamSource(this.peerStream);
      self.volume.mic.connect(self.volume.scriptProcessor);
      self.volume.scriptProcessor.connect(audioContext.destination);
      return self.volume.value; // will be 0.0 while the processor starts up
    } catch (e) {
      return console.log('Audio not supported', e);
    }
  } else return this.volume.value;
};

exports.default = Neighbor;
module.exports = exports['default'];