class browserMedia {
  constructor () {
    this.audioStream = {}
    this.audioTracks = []
    this.videoStream = {}
    this.videoTracks = []
  }

  initAudio (constraints = {audio: true}) {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.enumerateDevices()
      .then(deviceInfos => {
        for (var i = 0; i !== deviceInfos.length; ++i) {
          var deviceInfo = deviceInfos[i]
          if (deviceInfo.kind === 'audioinput') this.audioTracks.push(deviceInfos[i])
        }
        return navigator.mediaDevices.getUserMedia(constraints)
      })
      .then(stream => {
        console.log('stream', stream)
        this.audioStream = stream
        resolve(stream) // return the default stream
      })
      .catch(err => reject(err))
    })
  }

  initVideo (constraints = {video: true}) {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.enumerateDevices()
      .then(deviceInfos => {
        for (var i = 0; i !== deviceInfos.length; ++i) {
          var deviceInfo = deviceInfos[i]
          if (deviceInfo.kind === 'videoinput') this.videoTracks.push(deviceInfos[i])
        }
        return navigator.mediaDevices.getUserMedia(constraints)
      })
      .then(stream => {
        this.videoStream = stream
        return resolve(stream) // return the default stream
      })
      .catch(err => reject(err))
    })
  }

  getAudioTracks () {
    return this.audioTracks
  }

  getVideoTracks () {
    return this.videoTracks
  }

  stopAudio () {
    this.videoStream.getAudioTracks()[0].stop()
  }

  stopVideo () {
    this.videoStream.getVideoTracks()[0].stop()
  }

}
export default browserMedia
