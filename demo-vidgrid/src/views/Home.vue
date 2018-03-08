<template>
<div class="Home">
  <Nav @onAudioClicked="toggleAudio()" @onMicClicked="toggleMic()" @onVideoClicked="toggleVideo()" />

  <div class="section is-large has-text-centered" v-show="!hasVideoStream || !hasLocation">
    <div class="columns">
      <div class="column" v-if="!hasVideoStream">
        Enable your video! <br>
        <small>So that you can chat to your nearest neighbors</small><br><br>
        <button class="button" name="button" @click="getVideoStream()">Enable Video</button>
      </div>
      <div class="column" v-if="!hasLocation">
        Send us your location <br>
        <small>We don't share your exact location with anyone</small><br><br>
        <button class="button" name="button" @click="getLocation()">Send Location</button>
      </div>
    </div>
  </div>

  <div class="grid tile is-ancestor" v-show="hasVideoStream && hasLocation">
    <div class="tile">
      <video src="#" autoplay poster="" ref="VideoElement" muted="muted">
        Your browser does not support the video tag.
      </video>
    </div>
    <div class="tile" v-for="neighbor in neighborsWithStreams" :key="neighbor.iid">
      <video src="#" autoplay poster="" v-bind:ref="neighbor.iid" v-bind:muted="!sound">
        Your browser does not support the video tag.
      </video>
    </div>
  </div>

</div>
</template>

<script>
import { mapGetters } from 'vuex'
import NeighborsSet from '@/utils/neighborsSet'
import ExaQuarkJs from 'exaquark-js/core'
import Nav from '@/components/Nav.vue'
const exaQuarkUrl = 'https://enter.exaquark.com'
var apiKey = 'YOUR_API_KEY' // required
let options = {
  entityId: 'ENTITY_ID', // required
  universe: 'UNIVERSE_ID', // optional: defaults to sandbox
  transport: 'WebSocket' // optional: WebSocket | UDP
  // logger: (msg, data) => { console.log(msg, data) } // optional: attach your own logger
}
var exaQuark = new ExaQuarkJs(exaQuarkUrl, apiKey, options)
var Home = {
  name: 'Home',
  components: {
    Nav
  },
  data: () => {
    return {
      iid: '',
      hasVideoStream: false,
      hasLocation: false,
      entityState: {
        entityId: 'MOCK_ENTITY_ID', // {string} required: their entityId
        universe: 'CHATGRID', // {string} required:  which universe is the entitiy in
        geo: {
          lat: 0, // {double} required: latitude
          lng: 0, // {double} required: longitude
          altitude: 0, // {double} optional: altitude in meters - can be negative
          rotation: [ 2, 5, 19 ] // {Array of doubles} optional: all in degrees. Default facing north
        },
        properties: {
          displayName: '', // {string} required: a human readable name to be displayed
          sound: true, // {boolean} optional: defaults to true. false === mute
          mic: true, // {boolean} optional: defaults to true. false === muted microphone
          video: true, // {boolean} optional: defaults to true. false === muted microphone
          virtualPosition: true, // {boolean} optional: defaults to false. Is this person physically in the position that they are in the digital universe. (true === they are not physically present there)
          entityType: 'HUMAN' // {string} optional: defaults to 'human'. Options: 'HUMAN' | 'BOT' | 'DRONE'
        }
      },
      neighbors: [],
      videoStream: null
    }
  },
  mounted: function () {
  },
  computed: {
    ...mapGetters([
      'mic',
      'sound',
      'video'
    ]),
    // iid: {
    //   get () {
    //     return this.$store.iid || ''
    //   },
    //   set (value) {
    //     this.$store.commit('SET_IID', value)
    //   }
    // },
    // entityState: {
    //   get () {
    //     return this.$store.entityState
    //   },
    //   entityState (value) {
    //     this.$store.commit('SET_ENTITY_STATE', value)
    //   }
    // },
    neighborsWithStreams: function () {
      return this.neighbors
        .filter(n => n.hasActivePeerStream())
        .sort((a, b) => {
          return a.iid > b.iid ? 1 : a.iid < b.iid ? -1 : 0
        })
    }
  },
  methods: {
    getState: function () {
      return this.entityState
    },
    computeColumnSize: function () {
      return 'is-6'
    },
    getVideoStream: function () {
      navigator.getUserMedia({
        video: true,
        audio: true
      }, this.gotMedia, err => {
        console.log('err', err)
      })
    },
    gotMedia: function (stream) {
      this.videoElement = this.$refs.VideoElement
      this.hasVideoStream = true
      this.$store.commit('TOGGLE_MIC')
      this.$store.commit('TOGGLE_VIDEO')
      this.videoStream = stream
      this.videoElement.srcObject = stream
      let self = this
      this.videoElement.onloadedmetadata = (e) => { self.videoElement.play() }
      if (this.hasLocation) this.startExaQuark()
    },
    getLocation: function () {
      navigator.geolocation.getCurrentPosition(this.gotLocation, err => {
        console.log('err', err)
      })
    },
    gotLocation: function (position) {
      this.hasLocation = true
      this.setPosition(position.coords.latitude, position.coords.longitude, 10)
      if (this.hasVideoStream) this.startExaQuark()
    },
    startExaQuark: function () {
      let self = this
      exaQuark.on('neighbor:enter', entityState => {
        console.log('neighbor', entityState)
        entityState.isPeerAuthority = entityState.iid > self.iid
        let neighbor = NeighborsSet.insertOrUpdateNeighbor(entityState.iid, entityState, self.videoStream)
        neighbor.peerConnection.on('stream', function (stream) {
          console.log(`got stream ${stream.id}`, stream)
          neighbor.peerStream = stream
        })
      })
      exaQuark.on('neighbor:leave', iid => {
        NeighborsSet.removeNeighbor(iid)
        self.neighbors = self.neighbors.filter(n => n.iid !== iid)
      })
      exaQuark.on('neighbor:updates', entityState => {
        NeighborsSet.insertOrUpdateNeighbor(entityState.iid, entityState, self.videoStream)

        let neighbor = NeighborsSet.set[entityState.iid]
        // if we have some data for this neighbor then send it to them
        if (neighbor.hasQueuedSignals()) {
          neighbor.sendQueuedSignals(exaQuark)
        }
        self.neighbors = self.neighbors.filter(n => n.iid !== entityState.iid)
        self.neighbors.push(neighbor)
        let videoElement = (self.$refs[entityState.iid]) ? self.$refs[entityState.iid][0] : false
        if (videoElement && !videoElement.srcObject) {
          videoElement.srcObject = neighbor.getPeerStream()
          videoElement.play()
        }
      })
      exaQuark.on('signal', payload => {
        // if (payload.signal && payload.signal.type === 'webrtc') this.handleP2pSetup(payload)
        // else console.log('received signal', payload)
        let peer = NeighborsSet.set[payload.source]
        if (payload.signal.type === 'webrtc') {
          peer.receiveSignal(payload.signal.data)
        }
      })
      exaQuark.connect(self.entityState).then(({ iid }) => {
        console.log('iid', iid)
        self.iid = iid
        exaQuark.push('ask:neighbours')
      }).catch('err', err => { console.error(err) })
      exaQuark.bind(self.getState)
    },
    setPosition: function (lat, lng, altitude) {
      this.entityState.geo.lat = lat
      this.entityState.geo.lng = lng
      // this.$store.commit('SET_POSITION', { lat: lat, lng: lng, altitude: altitude })
    },
    toggleVideo: function () {
      this.$store.commit('TOGGLE_VIDEO')
      this.videoStream.getTracks().forEach(track => {
        track.enabled = !track.enabled
      })
    }
  }
}
export default Home
</script>
<style lang="scss" scoped>
.Home {
  height: 100vh;
  .grid {
    height: 100vh;
    .tile {
      overflow: hidden;
      position: relative;
      video {
        height: 100%;
        width: 100%;
        object-fit: cover;
        z-index: -100;
        right: 0;
        bottom: 0;
        background-size: cover;
        overflow: hidden;
      }
    }
  }

  font-size: 0.8rem;
}
</style>
