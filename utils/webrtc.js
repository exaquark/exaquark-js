// var exports = module.exports = {}
//
// const ICEconfiguration = {
//   iceServers: [
//     {urls: 'stun:stun.l.google.com:19302'},
//     {urls: 'turn:5.39.93.115', username: 'divereal', credential: 'paris1965'}
//   ]
// }
// //
// // class PeerLink {
// //   constructor(iid) {
// //     xQkP2P.peerLink[iid] = this;
// //     this.iid = iid;
// //     this.video = document.createElement('video', {id: 'video' + iid});
// //     document.body.appendChild(this.video);
// //   }
// //
// //   doSomething() {
// //     console.log('I'm a ' + this.name);
// //   }
// // }
//
// class webrtc {
//   constructor () {
//     this.mediaWanted.audio = false
//     this.mediaSelected.audio = {}
//
//     this.mediaWanted.video = false
//     this.mediaSelected.video = {}
//
//     // navigator.mediaDevices.getUserMedia(mediaWanted)
//     // .then(function (stream) {
//     //   stream.oninactive = () => console.log('Stream inactive')
//     //
//     //   var audioTracks = stream.getAudioTracks()
//     //   var videoTracks = stream.getVideoTracks()
//     //
//     //   if (mediaWanted.audio && audioTracks) {
//     //     this.mediaSelected.audio = {}
//     //     this.mediaSelected.audio.trackNumber = 0
//     //     this.mediaSelected.audio.trackLabel = audioTracks[xQkP2P.mediaSelected.audio.trackNumber].label
//     //     this.mediaWanted.audio = true
//     //   }
//     //   if (mediaWanted.video && videoTracks) {
//     //     this.mediaSelected.video.trackNumber = 0
//     //     this.mediaSelected.video.stream = stream
//     //     this.mediaSelected.video.trackLabel = videoTracks[xQkP2P.mediaSelected.video.trackNumber].label
//     //     this.mediaWanted.video = true
//     //   }
//     // })
//     // .catch(err => console.error(err))
//   }
//
//   initAudio (trackNumber, trackLabel) {
//     this.mediaSelected.audio.trackNumber = trackNumber
//     this.mediaSelected.audio.trackLabel = trackLabel
//     this.mediaWanted.audio = true
//   }
//
//   initVideo (trackNumber, trackLabel) {
//     this.mediaSelected.video.trackNumber = trackNumber
//     this.mediaSelected.video.trackLabel = trackLabel
//     this.mediaWanted.video = true
//   }
// }
// export default webrtc
//
// // call startP2P() to initiate
// // xQkP2P.startP2P = function (iid, isInitiator) {
// //   new PeerLink(iid);
// //   xQkP2P.peerConnection[iid] = new RTCPeerConnection(ICEconfiguration);
// //
// //   // send any ice candidates to the other peer
// //   xQkP2P.peerConnection[iid].onicecandidate = function (evt) {
// //     // console.log('ICE CANDIDATE', evt);
// //     if (evt.candidate != null) {
// //       console.log('SEND ICE CANDIDATE');
// //       xQkC.send_private_signal([iid], {
// //         type: 'webrtc',
// //         candidate: evt.candidate
// //       });
// //     } else {
// //       console.log('NULL ICE CANDIDATE', evt);
// //     }
// //   };
// //
// //   // let the 'negotiationneeded' event trigger offer generation
// //   xQkP2P.peerConnection[iid].onnegotiationneeded = function () {
// //     console.log('NEGOTIATION NEEDED');
// //     xQkP2P.peerConnection[iid].createOffer()
// //       .then(function (offer) {
// //         console.log('GOT OFFER');
// //         return xQkP2P.peerConnection[iid].setLocalDescription(offer);
// //       })
// //       .then(function () {
// //         // send the offer to the other peer
// //         // console.log('SEND OFFER', xQkP2P.peerConnection[iid].localDescription);
// //         console.log('SEND OFFER');
// //         xQkC.send_private_signal([iid], {
// //           type: 'webrtc',
// //           sdp: xQkP2P.peerConnection[iid].localDescription
// //         });
// //
// //         // signalingChannel.send(JSON.stringify({sdp: xQkP2P.peerConnection[iid].localDescription}));
// //       })
// //       .catch(function (error) {
// //         console.log('ERROR in CREATE OFFER (NEGOTIATION)', error);
// //       });
// //   };
// //
// //   xQkP2P.peerConnection[iid].ondatachannel = function (evt) {
// //     console.log('INCOMING CHANNEL from', iid, ', Label:', evt.channel.label);
// //     xQkP2P.dataChannelWith[iid] = evt.channel;
// //     setupDataChannelWith(iid);
// //   };
// //
// //   // once remote track arrives, show it in the remote video element
// //   xQkP2P.peerConnection[iid].ontrack = function (evt) {
// //     // don't set srcObject again if it is already set.
// //     console.log('ONTRACK evt:', evt);
// //
// //     if (document.getElementById('remoteVideo1').srcObject == null)
// //       document.getElementById('remoteVideo1').srcObject = evt.streams[0];
// //     else if (document.getElementById('remoteVideo2').srcObject == null)
// //       document.getElementById('remoteVideo2').srcObject = evt.streams[0];
// //     else if (document.getElementById('remoteVideo3').srcObject == null)
// //       document.getElementById('remoteVideo3').srcObject = evt.streams[0];
// //     else if (document.getElementById('remoteVideo4').srcObject == null)
// //       document.getElementById('remoteVideo4').srcObject = evt.streams[0];
// //     else if (document.getElementById('remoteVideo5').srcObject == null)
// //       document.getElementById('remoteVideo5').srcObject = evt.streams[0];
// //     // document.createElement('video').srcObject = evt.streams[0];
// //     // xQkP2P.peerLink[iid].srcObject = evt.streams[0];
// //
// //   };
// //   if (xQkP2P.mediaSelected.video) {
// //     xQkP2P.peerConnection[iid].addTrack(
// //       xQkP2P.mediaSelected.video.stream.getVideoTracks()[xQkP2P.mediaSelected.video.trackNumber],
// //       xQkP2P.mediaSelected.video.stream);
// //   }
// //
// //   if (isInitiator) {
// //
// //     // create and setup channel
// //     console.log('INITIATE DATA CHANNEL');
// //     xQkP2P.dataChannelWith[iid] = xQkP2P.peerConnection[iid].createDataChannel('exaQuarkData');
// //     setupDataChannelWith(iid);
// //   }
// //
// //
// //   // selfView.srcObject = stream;
// //
// // }
// //
// //
// // ///  when receiving offers and answers
// //
// // xQkP2P.onwebrtcsignal = function (source_iid, incomingSignal) {
// //
// //   if (!xQkP2P.peerConnection[source_iid]) {
// //     xQkP2P.startP2P(source_iid, false);
// //   }
// //
// //   if (incomingSignal.sdp) {
// //
// //     // if we get an offer, we need to reply with an answer
// //     if (incomingSignal.sdp.type == 'offer') {
// //       console.log('GOT OFFER');
// //
// //       xQkP2P.peerConnection[source_iid].setRemoteDescription(incomingSignal.sdp)
// //         .then(function () {
// //           console.log('CREATE ANSWER');
// //           return xQkP2P.peerConnection[source_iid].createAnswer();
// //         })
// //         .then(function (answer) {
// //           return xQkP2P.peerConnection[source_iid].setLocalDescription(answer);
// //         })
// //         .then(function () {
// //           xQkC.send_private_signal([source_iid], {
// //             type: 'webrtc',
// //             sdp: xQkP2P.peerConnection[source_iid].localDescription
// //           });
// //
// //         })
// //         .catch(function (error) {
// //           console.log('GET WRONG OFFER !?', incomingSignal, error);
// //         });
// //     } else if (incomingSignal.sdp.type == 'answer') {
// //       console.log('GOT ANSWER');
// //       xQkP2P.peerConnection[source_iid].setRemoteDescription(incomingSignal.sdp)
// //         .catch(function (error) {
// //           console.log('GET WRONG ANSWER', incomingSignal, error);
// //         });
// //     } else {
// //       console.log('Unsupported SDP type. Your code may differ here.');
// //     }
// //
// //   } else {
// //     xQkP2P.peerConnection[source_iid].addIceCandidate(incomingSignal.candidate)
// //       .catch(function (error) {
// //         console.log('WRONG candidate:', incomingSignal, error);
// //       });
// //   }
// // };
// //
// //
// // xQkP2P.close = function (iid) {
// //   xQkP2P.peerConnection[ii].close();
// // };
// //
// //
// // /////////////////////////////////
// // ///   REFACTORING NEEDED BELOW
// // /////////////////////////////////
// //
// // function setupDataChannelWith(iid) {
// //   xQkP2P.dataChannelWith[iid].onopen = function () {
// //
// //     console.log('P2P data channel with', iid, 'is now enabled, send message');
// //     xQkP2P.dataChannelWith[iid].send('DATA CHANNEL ON');
// //
// //   };
// //
// //   xQkP2P.dataChannelWith[iid].onmessage = function (evt) {
// //     var source_iid = iid;
// //     // var data_received = JSON.parse(evt.data);
// //     console.log('P2P message FROM:', source_iid, ' - Received data:', evt.data);
// //     // console.log('evt:', evt);
// //   };
// // }
// //
// // function sendDataTo(iid, data) {
// //   xQkP2P.dataChannelWith[iid].send(JSON.stringify(data));
// // }
"use strict";