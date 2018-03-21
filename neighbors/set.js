'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _neighbor = require('./neighbor');

var _neighbor2 = _interopRequireDefault(_neighbor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NeighborsSet = {
  set: {},
  ownerIID: null,
  nbNbors: function nbNbors() {
    var nb = 0;
    var uid = null;
    for (uid in NeighborsSet.set) {
      if (NeighborsSet.set.hasOwnProperty(uid)) {
        nb++;
      }
    }
    return nb - 1;
  },
  asArray: function asArray(neighborLevel) {
    var array = Object.values(NeighborsSet.set);
    if (neighborLevel) array = array.filter(function (n) {
      return n.state.neighborLevel <= neighborLevel;
    });
    return array;
  },
  doForEach: function doForEach(f) {
    for (var iid in NeighborsSet.set) {
      if (NeighborsSet.set.hasOwnProperty(iid)) {
        var neighbor = NeighborsSet.set[iid];
        f(neighbor);
      }
    }
  },
  removeNeighbor: function removeNeighbor(iid) {
    if (NeighborsSet.set.hasOwnProperty(iid)) {
      var n = Object.assign({}, NeighborsSet.set[iid]);
      delete NeighborsSet.set[iid];
      return n;
    }
  },
  removeAllBut: function removeAllBut(keepList) {
    var iid;
    for (iid in NeighborsSet.set) {
      if (NeighborsSet.set.hasOwnProperty(iid)) {
        NeighborsSet.set[iid].keepIt = false;
      }
    }
    for (var i, len = keepList.length; i < len; i++) {
      iid = keepList[i];
      if (NeighborsSet.set.hasOwnProperty(iid)) {
        NeighborsSet.set[iid].keepIt = true;
      }
    }
    var toBeRemoved = [];
    for (iid in NeighborsSet.set) {
      if (NeighborsSet.set.hasOwnProperty(iid)) {
        if (!NeighborsSet.set[iid].keepIt) {
          toBeRemoved.push(iid);
        }
      }
    }
    for (i, len = toBeRemoved.length; i < len; i++) {
      iid = toBeRemoved[i];
      NeighborsSet.removeNeighbor(iid);
    }
  },
  isInSet: function isInSet(iid) {
    var neighbor = NeighborsSet.set[iid];
    return typeof neighbor !== 'undefined';
  },
  insertOrUpdateNeighbor: function insertOrUpdateNeighbor(neighbourState, isPeerAuthority, stream) {
    var iid = neighbourState.iid;
    var isNewNeighbor = !NeighborsSet.isInSet(iid);
    if (!isNewNeighbor && !this.remoteStreamChanged(NeighborsSet.set[iid], neighbourState)) {
      // update, no change to peerConnection
      NeighborsSet.set[iid].update(neighbourState);
      return NeighborsSet.set[iid];
    }
    var isInitiator = isNewNeighbor ? isPeerAuthority : false; // if this is a new neighbor, let the IID decide, otherwise the other person has initiated a new peerConnection
    var neighbor = new _neighbor2.default(neighbourState);
    NeighborsSet.set[iid] = neighbor;
    neighbor.initPeerConnection(stream, isInitiator);
    return neighbor;
  },
  // checks if the remote peer has changed their media stream
  remoteStreamChanged: function remoteStreamChanged(neighbor, newState) {
    return neighbor.state.customState.webrtc.streamId !== newState.customState.webrtc.streamId;
  }
};
exports.default = NeighborsSet;
module.exports = exports['default'];