var xQkP2P = {};
xQkP2P.peerLink = {};
xQkP2P.mediaSelected = {};
xQkP2P.mediaWanted = {};

var ICEconfiguration = {
  iceServers: [
    // {urls: "stun:stun.l.google.com:19302"},
    {urls: 'turn:5.39.93.115', username: 'divereal', credential: 'paris1965'}
    // {urls: "stun:5.39.93.115", username: "divereal", credential: "paris1965"},
  ]
};


// mediaWanted = {audio: true, video: true}
xQkP2P.initMedia = function (mediaWanted) {
  if (!mediaWanted.audio && !mediaWanted.video) {
    console.log('set up data channels (DO BE DONE)');
    return;
  }
  navigator.mediaDevices.getUserMedia(mediaWanted)
    .then(function (stream) {

      stream.oninactive = function () {
        console.log('Stream inactive');
      };
      var audioTracks = stream.getAudioTracks();
      var videoTracks = stream.getVideoTracks();
      if (mediaWanted.audio && audioTracks != null) {
        xQkP2P.mediaSelected.audio = {};
        xQkP2P.mediaSelected.audio.trackNumber = 0;
        xQkP2P.mediaSelected.audio.stream = stream;

        xQkP2P.mediaSelected.audio.trackLabel = audioTracks[xQkP2P.mediaSelected.audio.trackNumber].label;
        console.log('AUDIO is', xQkP2P.mediaSelected.audio.trackLabel);
        xQkP2P.mediaWanted.audio = true;
      } else {
        xQkP2P.mediaWanted.audio = false;
      }
      if (mediaWanted.video && videoTracks != null) {
        xQkP2P.mediaSelected.video = {};
        xQkP2P.mediaSelected.video.trackNumber = 0;
        xQkP2P.mediaSelected.video.stream = stream;

        xQkP2P.mediaSelected.video.trackLabel = videoTracks[xQkP2P.mediaSelected.video.trackNumber].label;
        console.log('VIDEO is', xQkP2P.mediaSelected.video.trackLabel);
        xQkP2P.mediaWanted.video = true;
      } else {
        xQkP2P.mediaWanted.video = false;
      }
      if (xQkP2P.mediaWanted.video) {
        document.getElementById('localVideo').srcObject = stream;
      }
      if (xQkP2P.mediaWanted.audio) {
        xQkP2P.localMeter = document.getElementById('localMeter');
        try {
          xQkP2P.soundSensor = new SoundSensor();
          xQkP2P.soundSensor.connectStream(stream, function () {
            setInterval(function () {
              xQkP2P.localMeter.value = 3 * xQkP2P.soundSensor.instantVolume;
            }, 200);
          });
        } catch (e) {
          console.log("audio context error", e);
        }
      }


    })
    .catch(function (error) {
      console.log(error.name, ':', error);
    });

}


class PeerLink {
  constructor(iid) {
    console.log('CONSTRUCTOR:', iid);
    xQkP2P.peerLink[iid] = this;
    this.iid = iid;
    this.peerConnection = new RTCPeerConnection(ICEconfiguration);

    this.peerDiv = document.createElement('div');
    document.body.appendChild(this.peerDiv);

    this.video = document.createElement('video');  // not used
    this.video.setAttribute('width', '150');
    this.video.setAttribute('autoplay', '');

    this.audio = document.createElement('audio');
    this.audio.setAttribute('autoplay', '');

    try {
      this.soundSensor = new SoundSensor();
    } catch (e) {
      console.log("audio context error", e);
      this.soundSensor = false;
    }
    this.audioMeter = document.createElement('meter');
    this.audioMeter.setAttribute('high', '0.25');
    this.audioMeter.setAttribute('max', '1');
    if (this.soundSensor) {
      this.audioMeter.setAttribute('value', '0');
    } else {
      this.audioMeter.setAttribute('value', '1');
    }

    this.displayName = document.createElement('div');
    this.displayName.setAttribute('style', 'display: inline-block;');
    this.displayName.innerHTML = NeighborsSet.set[iid].state.properties.displayName + '<br>';

    $(this.peerDiv).append(
      this.audio,
      // this.video,
      this.audioMeter,
      this.displayName
    );


  }

  attachDataChannel(channel) {
    this.dataChannel = channel;
    this.setupDataChannel();
  }

  initiateDataChannel() {
    this.dataChannel = this.peerConnection.createDataChannel('exaQuarkData');
    // this.dataChannel = xQkP2P.peerConnection[this.iid].createDataChannel("exaQuarkData");
    this.setupDataChannel();
  }

  setupDataChannel() {
    var self = this;
    this.dataChannel.onopen = function () {
      console.log('P2P data channel with', self.iid, 'is now enabled, send message');
      // self.dataChannel.send("DATA CHANNEL ON");
      self.sendData('DATA CHANNEL ON');
    };
    this.dataChannel.onmessage = function (evt) {
      var data_received = JSON.parse(evt.data);
      console.log('P2P message FROM:', self.iid, ' - Received data:', data_received);
    };
  }

  sendData(data_to_send) {
    this.dataChannel.send(JSON.stringify(data_to_send));
  }
}


// call startP2P() to initiate
xQkP2P.startP2P = function (iid, isInitiator) {
  var selfPeerLink = new PeerLink(iid);
  // xQkP2P.peerConnection[iid] = new RTCPeerConnection(ICEconfiguration);

  // send any ice candidates to the other peer
  selfPeerLink.peerConnection.onicecandidate = function (evt) {
    // console.log("ICE CANDIDATE", evt);
    if (evt.candidate != null) {
      console.log('SEND ICE CANDIDATE');
      xQkC.send_private_signal([iid], {
        type: 'webrtc',
        candidate: evt.candidate
      });
    } else {
      console.log('NULL ICE CANDIDATE', evt);
    }
  };

  // let the "negotiationneeded" event trigger offer generation
  selfPeerLink.peerConnection.onnegotiationneeded = function () {
    console.log('NEGOTIATION NEEDED');
    selfPeerLink.peerConnection.createOffer()
      .then(function (offer) {
        console.log('GOT OFFER');
        return selfPeerLink.peerConnection.setLocalDescription(offer);
      })
      .then(function () {
        // send the offer to the other peer
        // console.log("SEND OFFER", xQkP2P.peerConnection[iid].localDescription);
        console.log('SEND OFFER');
        xQkC.send_private_signal([iid], {
          type: 'webrtc',
          sdp: selfPeerLink.peerConnection.localDescription
        });

        // signalingChannel.send(JSON.stringify({sdp: xQkP2P.peerConnection[iid].localDescription}));
      })
      .catch(function (error) {
        console.log('ERROR in CREATE OFFER (NEGOTIATION)', error);
      });
  };

  selfPeerLink.peerConnection.ondatachannel = function (evt) {
    console.log('INCOMING CHANNEL from', iid, ', Label:', evt.channel.label);
    selfPeerLink.attachDataChannel(evt.channel);
  };

  // once remote track arrives, show it in the remote video element

  selfPeerLink.peerConnection.ontrack = function (evt) {
    console.log('ONTRACK:');
    var stream = evt.streams[0];
    if (false && stream.getVideoTracks()) { // when it's audio only this triggers true as well
      selfPeerLink.video.srcObject = stream;
      selfPeerLink.video.muted = true;
    }
    if (stream.getAudioTracks()) {
      selfPeerLink.audio.srcObject = stream;

      selfPeerLink.audio.muted = false;
      if (selfPeerLink.soundSensor) {
        selfPeerLink.soundSensor.connectStream(stream, function () {
          setInterval(function () {
            selfPeerLink.audioMeter.value = 3 * selfPeerLink.soundSensor.instantVolume;
          }, 200);
        });
      }
    }
  };

  // HERE STARTS THE CALL:  // addTrack
  if (xQkP2P.mediaWanted.video) {
    selfPeerLink.peerConnection.addTrack(
      xQkP2P.mediaSelected.video.stream.getVideoTracks()[xQkP2P.mediaSelected.video.trackNumber],
      xQkP2P.mediaSelected.video.stream);
  }
  if (xQkP2P.mediaWanted.audio) {
    selfPeerLink.peerConnection.addTrack(
      xQkP2P.mediaSelected.audio.stream.getAudioTracks()[xQkP2P.mediaSelected.audio.trackNumber],
      xQkP2P.mediaSelected.audio.stream);
  }

  if (isInitiator) {

    console.log('INITIATE DATA CHANNEL');
    selfPeerLink.initiateDataChannel();

  }

}


///  when receiving offers and answers

xQkP2P.onwebrtcsignal = function (source_iid, incomingSignal) {

  if (!xQkP2P.peerLink[source_iid]) {
    xQkP2P.startP2P(source_iid, false);
  }

  if (incomingSignal.sdp) {

    // if we get an offer, we need to reply with an answer
    if (incomingSignal.sdp.type == 'offer') {
      console.log('GOT OFFER');

      xQkP2P.peerLink[source_iid].peerConnection.setRemoteDescription(incomingSignal.sdp)
        .then(function () {
          console.log('CREATE ANSWER');
          return xQkP2P.peerLink[source_iid].peerConnection.createAnswer();
        })
        .then(function (answer) {
          return xQkP2P.peerLink[source_iid].peerConnection.setLocalDescription(answer);
        })
        .then(function () {
          xQkC.send_private_signal([source_iid], {
            type: 'webrtc',
            sdp: xQkP2P.peerLink[source_iid].peerConnection.localDescription
          });

        })
        .catch(function (error) {
          console.log('GET WRONG OFFER !?', incomingSignal, error);
        });
    } else if (incomingSignal.sdp.type == 'answer') {
      console.log('GOT ANSWER');
      xQkP2P.peerLink[source_iid].peerConnection.setRemoteDescription(incomingSignal.sdp)
        .catch(function (error) {
          console.log('GET WRONG ANSWER', incomingSignal, error);
        });
    } else {
      console.log('Unsupported SDP type. Your code may differ here.');
    }

  } else {
    xQkP2P.peerLink[source_iid].peerConnection.addIceCandidate(incomingSignal.candidate)
      .catch(function (error) {
        console.log('WRONG candidate:', incomingSignal, error);
      });
  }
};


xQkP2P.close = function (iid) {
  try {
    xQkP2P.peerLink[iid].peerConnection.close();
    document.body.removeChild(xQkP2P.peerLink[iid].peerDiv);
  } catch (e) {
    console.log('CLOSE', iid, 'FAILED', e);
  }
};
