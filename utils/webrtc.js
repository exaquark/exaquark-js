'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var webrtc = {};
webrtc.peerLink = {};
webrtc.mediaSelected = {};
webrtc.mediaWanted = {};

var ICEconfiguration = {
  iceServers: [
  // {urls: "stun:stun.l.google.com:19302"},
  { urls: 'turn:5.39.93.115', username: 'divereal', credential: 'paris1965' }]
};

var PeerLink = function () {
  function PeerLink(iid, audioPlayer, videoPlayer) {
    _classCallCheck(this, PeerLink);

    console.log('CONSTRUCTOR:', iid);
    this.dataChannel = null;
    webrtc.peerLink[iid] = this;
    this.iid = iid;
    this.video = videoPlayer;
    this.audio = audioPlayer;
    this.audioMeter = false;
    this.soundSensor = false;
    this.peerConnection = new RTCPeerConnection(ICEconfiguration); // eslint-disable-line

    try {
      this.soundSensor = new SoundSensor(); // eslint-disable-line
    } catch (e) {
      console.log('audio context error', e);
      this.soundSensor = false;
    }
    if (this.soundSensor) {
      this.audioMeter.setAttribute('value', '0');
    } else {
      this.audioMeter.setAttribute('value', '1');
    }
  }

  _createClass(PeerLink, [{
    key: 'attachDataChannel',
    value: function attachDataChannel(channel) {
      this.dataChannel = channel;
      this.setupDataChannel();
    }
  }, {
    key: 'initiateDataChannel',
    value: function initiateDataChannel() {
      this.dataChannel = this.peerConnection.createDataChannel('exaQuarkData');
      this.setupDataChannel();
    }
  }, {
    key: 'setupDataChannel',
    value: function setupDataChannel() {
      var self = this;
      this.dataChannel.onopen = function () {
        console.log('P2P data channel with', self.iid, 'is now enabled, send message');
        // self.dataChannel.send("DATA CHANNEL ON")
        self.sendData('DATA CHANNEL ON');
      };
      this.dataChannel.onmessage = function (evt) {
        var dataReceived = JSON.parse(evt.data);
        console.log('P2P message FROM:', self.iid, ' - Received data:', dataReceived);
      };
    }
  }, {
    key: 'sendData',
    value: function sendData(dataToSend) {
      this.dataChannel.send(JSON.stringify(dataToSend));
    }
  }]);

  return PeerLink;
}();

// call startP2P() to initiate


webrtc.startP2P = function (iid, isInitiator) {
  var selfPeerLink = new PeerLink(iid);

  // send any ice candidates to the other peer
  selfPeerLink.peerConnection.onicecandidate = function (evt) {
    // console.log("ICE CANDIDATE", evt)
    if (evt.candidate != null) {
      console.log('SEND ICE CANDIDATE');
      // xQkC.send_private_signal([iid], {
      //   type: 'webrtc',
      //   candidate: evt.candidate
      // })
    } else {
      console.log('NULL ICE CANDIDATE', evt);
    }
  };

  // let the "negotiationneeded" event trigger offer generation
  selfPeerLink.peerConnection.onnegotiationneeded = function () {
    console.log('NEGOTIATION NEEDED');
    selfPeerLink.peerConnection.createOffer().then(function (offer) {
      console.log('GOT OFFER');
      return selfPeerLink.peerConnection.setLocalDescription(offer);
    }).then(function () {
      // send the offer to the other peer
      // console.log("SEND OFFER", webrtc.peerConnection[iid].localDescription)
      console.log('SEND OFFER');
      // xQkC.send_private_signal([iid], {
      //   type: 'webrtc',
      //   sdp: selfPeerLink.peerConnection.localDescription
      // })

      // signalingChannel.send(JSON.stringify({sdp: webrtc.peerConnection[iid].localDescription}))
    }).catch(function (error) {
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
    // if (false && stream.getVideoTracks()) { // when it's audio only this triggers true as well
    //   selfPeerLink.video.srcObject = stream
    //   selfPeerLink.video.muted = true
    // }
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
  if (webrtc.mediaWanted.video) {
    selfPeerLink.peerConnection.addTrack(webrtc.mediaSelected.video.stream.getVideoTracks()[webrtc.mediaSelected.video.trackNumber], webrtc.mediaSelected.video.stream);
  }
  if (webrtc.mediaWanted.audio) {
    selfPeerLink.peerConnection.addTrack(webrtc.mediaSelected.audio.stream.getAudioTracks()[webrtc.mediaSelected.audio.trackNumber], webrtc.mediaSelected.audio.stream);
  }

  if (isInitiator) {
    console.log('INITIATE DATA CHANNEL');
    selfPeerLink.initiateDataChannel();
  }
};

///  when receiving offers and answers
webrtc.onwebrtcsignal = function (sourceIid, incomingSignal) {
  if (!webrtc.peerLink[sourceIid]) {
    webrtc.startP2P(sourceIid, false);
  }

  if (incomingSignal.sdp) {
    // if we get an offer, we need to reply with an answer
    if (incomingSignal.sdp.type === 'offer') {
      console.log('GOT OFFER');

      webrtc.peerLink[sourceIid].peerConnection.setRemoteDescription(incomingSignal.sdp).then(function () {
        console.log('CREATE ANSWER');
        return webrtc.peerLink[sourceIid].peerConnection.createAnswer();
      }).then(function (answer) {
        return webrtc.peerLink[sourceIid].peerConnection.setLocalDescription(answer);
      }).then(function () {
        // xQkC.send_private_signal([sourceIid], {
        //   type: 'webrtc',
        //   sdp: webrtc.peerLink[sourceIid].peerConnection.localDescription
        // })
      }).catch(function (error) {
        console.log('GET WRONG OFFER !?', incomingSignal, error);
      });
    } else if (incomingSignal.sdp.type === 'answer') {
      console.log('GOT ANSWER');
      webrtc.peerLink[sourceIid].peerConnection.setRemoteDescription(incomingSignal.sdp).catch(function (error) {
        console.log('GET WRONG ANSWER', incomingSignal, error);
      });
    } else {
      console.log('Unsupported SDP type. Your code may differ here.');
    }
  } else {
    webrtc.peerLink[sourceIid].peerConnection.addIceCandidate(incomingSignal.candidate).catch(function (error) {
      console.log('WRONG candidate:', incomingSignal, error);
    });
  }
};

webrtc.close = function (iid) {
  try {
    webrtc.peerLink[iid].peerConnection.close();
  } catch (e) {
    console.log('CLOSE', iid, 'FAILED', e);
  }
};