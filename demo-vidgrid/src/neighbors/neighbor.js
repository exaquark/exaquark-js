// neighbor.js
// eslint-disable-next-line
'use strict';
const Peer = require('simple-peer')
const ICEconfiguration = {
  iceServers: [
    {urls: 'stun:5.39.93.115', username: 'divereal', credential: 'paris1965'},
    {urls: 'turn:5.39.93.115', username: 'divereal', credential: 'paris1965'}
  ]
}

export default class Neighbor {
  constructor (entityState) {
    this.state = entityState
    this.iid = entityState.iid
  }
  update = function (state) {
    this.state = state
  }
  hasActiveStream = function () {
    return this.peerStream && this.peerStream.active
  }
  getStream = function () {
    return this.peerStream
  }
}

Neighbor.prototype.peerStream = null
Neighbor.prototype.signalsToSend = []
Neighbor.prototype.volume = {
  value: 0.0,
  instant: 0.0,
  scriptProcessor: null
}
Neighbor.prototype.initPeerConnection = function (stream, isInitiator) {
  this.closeStream()
  console.log('isInitiator', isInitiator)
  if (stream) {
    console.log('initializing p2p with stream')
    this.peerConnection = new Peer({
      channelName: this.state.iid,
      initiator: isInitiator, // the person with the highest IID should be the initiator of the P2P connection (or the person who changes stream)
      stream: stream,
      config: ICEconfiguration,
      reconnectTimer: 5000
    })
  } else {
    console.log('initializing p2p without stream')
    this.peerConnection = new Peer({
      channelName: this.state.iid,
      initiator: isInitiator,
      config: ICEconfiguration,
      reconnectTimer: 5000
    })
  }

  var neighbour = this
  // the following are called via their peer, so they have no concept of "this" neighbor
  // instead, "this" refers to the P2P connection
  neighbour.peerConnection.on('signal', data => {
    // queue the data for exaQuark
    this.signalsToSend.push(JSON.stringify(data))
  })
  neighbour.peerConnection.on('stream', remoteStream => {
    console.log(`got remoteStream ${remoteStream.id}`, remoteStream)
    neighbour.setStream(remoteStream)
  })
  neighbour.peerConnection.on('connect', function () {
    console.log('connected', neighbour)
    this.send('hello :)')
  })
  neighbour.peerConnection.on('data', function (data) {
    console.log('got a message: ' + data, this)
  })
  neighbour.peerConnection.on('close', function () {
    console.log('close', neighbour)
    neighbour.peerStream = null
    neighbour.peerConnection = null
    neighbour.signalsToSend = []
  })
  return neighbour.peerConnection
}
Neighbor.prototype.setStream = function (stream) {
  this.peerStream = stream
}
Neighbor.prototype.closeStream = function (stream) {
  this.peerStream = null
  this.peerConnection = null
  this.signalsToSend = []
}
Neighbor.prototype.receiveSignal = function (signal) {
  this.peerConnection.signal(JSON.parse(signal))
}
Neighbor.prototype.hasQueuedSignals = function () {
  return this.signalsToSend.length > 0
}
Neighbor.prototype.sendQueuedSignals = function (exaQuark) {
  let len = this.signalsToSend.length
  for (let i = 0; i < len; i++) {
    let type = this.signalsToSend[i].type
    if (type) console.log(`sending ${type} to neighbor ${this.iid}`, this.signalsToSend[i])
    exaQuark.push('signal:private', {
      entities: [this.iid],
      signal: {
        type: '_webrtc',
        data: this.signalsToSend[i]
      }
    })
  }
  this.signalsToSend.splice(0, len)
}
Neighbor.prototype.getVolume = function () {
  let AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext || !this.peerConnection || !this.peerStream) {
    // return console.log('Cannot get volume for ' + this.iid)
    return null
  }

  if (!this.volume.scriptProcessor) {
    try {
      let self = this
      let audioContext = new AudioContext()
      self.volume.scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1)
      self.volume.scriptProcessor.onaudioprocess = event => {
        let input = event.inputBuffer.getChannelData(0)
        let sum = 0.0
        let clipcount = 0 // eslint-disable-line
        for (let i = 0; i < input.length; ++i) {
          sum += input[i] * input[i]
          if (Math.abs(input[i]) > 0.99) {
            clipcount += 1
          }
        }
        self.volume.instant = Math.sqrt(sum / input.length)
        self.volume.value = 0.2 * self.volume.value + 0.8 * self.volume.instant // "smooth" the volume
      }
      self.volume.mic = audioContext.createMediaStreamSource(this.peerStream)
      self.volume.mic.connect(self.volume.scriptProcessor)
      self.volume.scriptProcessor.connect(audioContext.destination)
      return self.volume.value // will be 0.0 while the processor starts up
    } catch (e) {
      return console.log('Audio not supported', e)
    }
  } else return this.volume.value
}
