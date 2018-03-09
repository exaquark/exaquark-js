<template>
<div class="Home">
  <div class="notification is-info" v-show="notification.visible">
    <button class="delete" @click="hideNotification()"></button>
    {{notification.text}}
  </div>

  <Nav @onAudioClicked="toggleAudio()" @onMicClicked="toggleMic()" @onVideoClicked="toggleVideo()" />

  <section class="section is-large" v-show="!hasVideoStream && !locationModalVisible">
    <div class="columns is-centered has-vertically-aligned-content" >
      <div class="column has-text-centered is-4">
        Enable your video! <br>
        <small>So that you can chat to your nearest neighbors</small><br><br>
        <button class="button is-info is-outlined is-rounded" name="button" @click="getVideoStream()">Enable Video</button>
      </div>
    </div>
  </section>

  <div class="locationModal" v-show="locationModalVisible">
    <div class="columns is-gapless has-text-centered is is-centered">
      <div class="column is-6">
        <div class="radar-container">
          <Radar
            :lat="reportedLatLng.lat"
            :lng="reportedLatLng.lng"
            @onMove="changeLocation"
          />
        </div>
        Pick a location <br>
        <small>We don't share your exact location with anyone</small><br><br>
        <button class="button is-dark is-outlined is-rounded is-small" name="button" @click="getLocation()" v-show="hasGeolocation">Go to my location</button>
        <div class="buttons has-addons is-centered latLng">
          <a class="button is-static is-small">{{teleportLatLng.lat}}</a>
          <a class="button is-static is-small">{{teleportLatLng.lng}}</a>
        </div>

        <button class="button is-info is-outlined is-rounded" name="button" @click="handleTeleport()">Chat Here</button>

      </div>
    </div>
  </div>

  <div class="grid columns is-gapless is-mobile is-multiline" v-show="hasVideoStream && !locationModalVisible">
    <div class="column">
      <video src="#" autoplay poster="" ref="VideoElement" muted="muted">
        Your browser does not support the video tag.
      </video>
    </div>
    <div class="column" v-for="neighbor in neighborsWithStreams" :key="neighbor.iid" v-bind:class="computeColumnSize()">
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
import Radar from '@/components/Radar.vue'
const exaQuarkUrl = 'https://enter.exaquark.com'
var apiKey = 'YOUR_API_KEY' // required

let randomLat = Math.random() * 180 - 90
let randomLng = Math.random() * 360 - 180

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
    Nav,
    Radar
  },
  data: () => {
    return {
      iid: '',
      teleportLatLng: {
        lat: randomLat,
        lng: randomLng
      },
      reportedLatLng: {
        lat: randomLat,
        lng: randomLng
      },
      notification: {
        visible: false,
        text: ''
      },
      entityState: {
        entityId: 'MOCK_ENTITY_ID', // {string} required: their entityId
        universe: 'CHATGRID', // {string} required:  which universe is the entitiy in
        geo: {
          lat: randomLat, // {double} required: latitude
          lng: randomLng, // {double} required: longitude
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
      'hasVideoStream',
      'locationModalVisible',
      'mic',
      'sound',
      'video'
    ]),
    hasGeolocation () {
      return navigator.geolocation
    },
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
      let videos = 1 + this.neighborsWithStreams
      let gridSize = Math.ceil(Math.sqrt(videos))
      let colSize = Math.floor(12 / gridSize)
      return 'is-' + colSize
    },
    hideNotification: function () {
      this.notification.visible = false
      this.notification.text = ''
    },
    showNotification: function (text) {
      this.notification.text = text
      this.notification.visible = true
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
      this.$store.commit('TOGGLE_VIDEO_STREAM', true)
      this.$store.commit('TOGGLE_MIC')
      this.$store.commit('TOGGLE_VIDEO')
      this.videoStream = stream
      this.videoElement.srcObject = stream
      let self = this
      this.videoElement.onloadedmetadata = (e) => { self.videoElement.play() }
      this.startExaQuark()
    },
    changeLocation: function (payload) {
      this.teleportLatLng.lat = payload.lat
      this.teleportLatLng.lng = payload.lng
    },
    getLocation: function () {
      this.showNotification('Getting your location!')
      let self = this
      navigator.geolocation.getCurrentPosition(this.gotLocation, err => {
        console.log('err', err)
        self.showNotification('Couldn\'t get your location :(')
      })
    },
    gotLocation: function (position) {
      this.hideNotification()
      this.teleportLatLng.lat = position.coords.latitude
      this.teleportLatLng.lng = position.coords.longitude
      this.reportedLatLng.lat = position.coords.latitude
      this.reportedLatLng.lng = position.coords.longitude
    },
    handleTeleport: function () {
      this.entityState.geo.lat = this.teleportLatLng.lat
      this.entityState.geo.lng = this.teleportLatLng.lng
      this.$store.commit('TOGGLE_LOCATION_MODAL')
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
        if (!self.neighbors.length) this.showNotification('Waiting for neighbors...')
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
        this.showNotification('Waiting for neighbors...')
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
$screenHeightWithoutMenu: calc(100vh - 3.25rem - 2px); // height of Navbar and border
.Home {
  height: 100%;
  overflow: hidden;
  font-size: 0.8rem;

  .notification {
    opacity: 0.6;
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    width: 40%;
    z-index: 20;
  }
  .intro-section {
    width: 100%;
    height: 100%;
  }
  .locationModal {
    height: $screenHeightWithoutMenu;
    overflow: hidden;
    .columns {
      height: 100%;
      .radar-container {
        height: 300px;
        border-radius: 5px;
        overflow: hidden;
        margin: 30px 0;
      }
      .latLng {
        margin: 20px 0;
      }
    }
  }
  .grid {
    height: $screenHeightWithoutMenu;
    overflow: hidden;
    .column {
      position: relative;
      overflow: hidden;
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
}
</style>
