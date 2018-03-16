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
  insertOrUpdateNeighbor: function (iid, neighbourState, stream, isPeerAuthority) {
    let neighbor = NeighborsSet.set[iid]
    let newNeighbor = typeof neighbor === 'undefined'
    if (!newNeighbor && !this.remoteStreamChanged(neighbor, neighbourState)) { // update, no change to peerConnection
      neighbor.update(neighbourState)
      return neighbor
    }
    let isInitiator = (newNeighbor) ? isPeerAuthority : false // if this is a new neighbor, let the IID decide, otherwise the other person has initiated a new peerConnection
    neighbor = new Neighbor(neighbourState)
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
