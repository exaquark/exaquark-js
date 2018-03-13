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
  insertOrUpdateNeighbor: function (iid, entityState, stream) {
    let neighbor = null
    if (NeighborsSet.set.hasOwnProperty(iid)) {
      neighbor = NeighborsSet.set[iid]
      neighbor.update(entityState)
      return neighbor
    }
    neighbor = new Neighbor(entityState)
    neighbor.initPeerConnection(stream)
    NeighborsSet.set[iid] = neighbor
    return neighbor
  }
}
export default NeighborsSet
