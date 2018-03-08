const Peer = require('simple-peer')

var NeighborsSet = {
  set: {},
  ownerIID: null,
  nbNbors: function () {
    let nb = 0
    let uid = null
    for (uid in NeighborsSet.set) {
      if (NeighborsSet.set.hasOwnProperty(uid)) {
        nb++
      }
    }
    return nb - 1
  },
  doForEach: function (f) {
    for (var iid in NeighborsSet.set) {
      if (NeighborsSet.set.hasOwnProperty(iid)) {
        var neighbor = NeighborsSet.set[iid]
        f(neighbor)
      }
    }
  },
  removeNeighbor: function (iid) {
    if (NeighborsSet.set.hasOwnProperty(iid)) {
      let n = Object.assign({}, NeighborsSet.set[iid])
      delete NeighborsSet.set[iid]
      return n
    }
  },
  removeAllBut: function (keepList) {
    var iid
    for (iid in NeighborsSet.set) {
      if (NeighborsSet.set.hasOwnProperty(iid)) {
        NeighborsSet.set[iid].keepIt = false
      }
    }
    for (var i, len = keepList.length; i < len; i++) {
      iid = keepList[i]
      if (NeighborsSet.set.hasOwnProperty(iid)) {
        NeighborsSet.set[iid].keepIt = true
      }
    }
    var toBeRemoved = []
    for (iid in NeighborsSet.set) {
      if (NeighborsSet.set.hasOwnProperty(iid)) {
        if (!NeighborsSet.set[iid].keepIt) {
          toBeRemoved.push(iid)
        }
      }
    }
    for (i, len = toBeRemoved.length; i < len; i++) {
      iid = toBeRemoved[i]
      NeighborsSet.removeNeighbor(iid)
    }
  },
  insertOrUpdateNeighbor: function (iid, entityState, stream) {
    let neighbor = null
    if (NeighborsSet.set.hasOwnProperty(iid)) {
      neighbor = NeighborsSet.set[iid]
      neighbor.update(entityState)
      return neighbor
    }
    neighbor = new Neighbor(entityState, stream)
    NeighborsSet.set[iid] = neighbor
    return neighbor
  }
}
export default NeighborsSet

class Neighbor {
  constructor (entityState, stream) {
    this.state = entityState
    this.iid = entityState.iid
    this.isInitiator = entityState.isPeerAuthority // the person with the highest IID should be the initiator of the P2P connection
    this.peerConnection = Peer({
      channelName: entityState.iid,
      initiator: this.isInitiator,
      stream: stream
    })
    this.peerStream = null
    this.signalsToSend = []
    console.log('this.isInitiator', this.isInitiator)
    console.log('this.peerConnection.stream', this.peerConnection.stream)

    this.peerConnection.on('signal', data => {
      // queue the data for exaQuark
      this.signalsToSend.push(JSON.stringify(data))
    })

    // the following are called via their peer, so they have no concept of "this" neighbor
    // instead, "this" refers to the P2P connection
    this.peerConnection.on('connect', function () {
      console.log('connected', this)
      this.send('hello :)')
    })
    this.peerConnection.on('data', function (data) {
      console.log('got a message: ' + data, this)
    })
    this.peerConnection.on('close', function () {
      console.log('close', this)
      this.signalsToSend = []
    })
  }

  update = function (state) {
    this.state = state
  }
  updatePosition = function (x, y, z) {
    this.avatar.position.x = x
    this.avatar.position.y = y
    this.avatar.position.z = z
  }
  getGeo = function () {
    return this.state.geo
  }
  hasQueuedSignals = function () {
    return this.signalsToSend.length > 0
  }
  sendQueuedSignals = function (exaQuark) {
    let len = this.signalsToSend.length
    for (let i = 0; i < len; i++) {
      let type = this.signalsToSend[i].type
      if (type) console.log(`sending ${type} to neighbor ${this.iid}`, this.signalsToSend[i])
      exaQuark.push('signal:private', {
        entities: [this.iid],
        signal: {
          type: 'webrtc',
          data: this.signalsToSend[i]
        }
      })
    }
    this.signalsToSend.splice(0, len)
  }
  receiveSignal = function (signal) {
    this.peerConnection.signal(JSON.parse(signal))
  }
  hasActivePeerStream = function () {
    return this.peerStream && this.peerStream.active
  }
  getPeerStream = function () {
    return this.peerStream
  }
}
