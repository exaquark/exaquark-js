/**
 * Created by keller on 2/15/18.
 */

'use strict';

function Neighbor (entityState) {
  this.state = entityState;
  this.iid = entityState.iid;
  NeighborsSet.set[this.iid] = this;
}

Neighbor.prototype = {
  update: function (state) {
    this.state = state;
  }
};

var NeighborsSet = {
  set: {},
  nbNbors: function () {
    var nb = 0, uid;
    for (uid in NeighborsSet.set) {
      if (NeighborsSet.set.hasOwnProperty(uid)) {
        nb++;
      }
    }
    return nb - 1;
  },
  doForEach: function (f) {
    for (var iid in NeighborsSet.set) {
      if (NeighborsSet.set.hasOwnProperty(iid)) {
        var neighbor = NeighborsSet.set[iid];
        f(neighbor);
      }
    }
  },
  removeNeighbor: function (iid) {
    var neighbor;
    if (NeighborsSet.set.hasOwnProperty(iid)) {
      neighbor = NeighborsSet.set[iid];
    } else {
      return;
    }
    delete NeighborsSet.set[iid];
  },
  removeAllBut: function (keepList) {
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
  insertOrUpdateNeighbor: function (iid, entityState) {
    if (NeighborsSet.set.hasOwnProperty(iid)) {
      var neighbor = NeighborsSet.set[iid];
      neighbor.update(entityState);
      return neighbor;
    }
    var newNeighbor = new Neighbor(entityState);
    if(!newNeighbor.state.customState.webrtc){
      return newNeighbor;
    }
    console.log("New webrtc neighbor:", iid);

    if (xQkC.iid > iid) {
      console.log("Initiate P2P connection with:", iid);
      xQkP2P.startP2P(iid,true);
    } else {
      console.log("Waiting for P2P connection from:", iid);
    }
    return newNeighbor;

  }
};

export default NeighborsSet;
