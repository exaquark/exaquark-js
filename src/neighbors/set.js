import Neighbor from './neighbor'

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
  asArray: function (neighborLevel) {
    let array = Object.values(NeighborsSet.set)
    if (neighborLevel) array = array.filter(n => n.state.neighborLevel <= neighborLevel)
    return array
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
  isInSet: function (iid) {
    let neighbor = NeighborsSet.set[iid]
    return typeof neighbor !== 'undefined'
  },
  insertOrUpdateNeighbor: function (neighbourState, isPeerAuthority, stream) {
    let iid = neighbourState.iid
    let isNewNeighbor = !NeighborsSet.isInSet(iid)
    if (!isNewNeighbor && !this.remoteStreamChanged(NeighborsSet.set[iid], neighbourState)) { // update, no change to peerConnection
      NeighborsSet.set[iid].update(neighbourState)
      return NeighborsSet.set[iid]
    }
    let isInitiator = (isNewNeighbor) ? isPeerAuthority : false // if this is a new neighbor, let the IID decide, otherwise the other person has initiated a new peerConnection
    let neighbor = new Neighbor(neighbourState)
    NeighborsSet.set[iid] = neighbor
    neighbor.initPeerConnection(stream, isInitiator)
    return neighbor
  },
  // checks if the remote peer has changed their media stream
  remoteStreamChanged: function (neighbor, newState) {
    return neighbor.state.customState.webrtc.streamId !== newState.customState.webrtc.streamId
  }
}
export default NeighborsSet
