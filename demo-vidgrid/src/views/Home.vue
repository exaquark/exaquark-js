<template>
<div class="Home">
  <Nav @onAudioClicked="toggleAudio()" @onMicClicked="toggleMic()" @onVideoClicked="toggleVideo()" />

  <div class="intro-section" v-show="!hasVideoStream || !hasLocation">
    <div class="columns is-gapless has-text-centered" >
      <div class="column left" v-if="!hasVideoStream">
        demo vid
      </div>
      <div class="column right has-vertically-aligned-content" v-if="!hasVideoStream">
        <h1 class="title is-1 ">1</h1>
        Enable your video! <br>
        <small>So that you can chat to your nearest neighbors</small><br><br>
        <button class="button is-info is-outlined is-rounded" name="button" @click="getVideoStream()">Enable Video</button>
      </div>
    </div>
    <div class="columns is-gapless has-text-centered" v-show="!hasVideoStream || !hasLocation">
      <div class="column left" v-if="!hasLocation">
        <Radar
          :lat="reportedLatLng.lat"
          :lng="reportedLatLng.lng"
          @onMove="changeLocation"
        />
      </div>
      <div class="column right has-vertically-aligned-content" v-if="!hasLocation">
        <h1 class="title is-1">2</h1>
        Pick a location <br>
        <small>We don't share your exact location with anyone</small><br><br>
        <button class="button is-dark is-outlined is-rounded is-small" name="button" @click="getLocation()" v-show="hasGeolocation">Go to my location</button>
        <div class="buttons has-addons is-centered latLng">
          <a class="button is-static is-small">{{entityState.geo.lat}}</a>
          <a class="button is-static is-small">{{entityState.geo.lng}}</a>
        </div>

        <button class="button is-info is-outlined is-rounded" name="button" @click="setLocation()">Chat Here</button>

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
      hasVideoStream: false,
      hasLocation: false,
      reportedLatLng: {
        lat: randomLat,
        lng: randomLng
      },
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
    hasGeolocation () {
      return navigator.geolocation
    },
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
    changeLocation: function (payload) {
      this.setPosition(payload.lat, payload.lng, 10)
    },
    getLocation: function () {
      navigator.geolocation.getCurrentPosition(this.gotLocation, err => {
        console.log('err', err)
      })
    },
    gotLocation: function (position) {
      this.setPosition(position.coords.latitude, position.coords.longitude, 10)
      this.reportedLatLng.lat = 0
      this.reportedLatLng.lng = 0
      this.reportedLatLng.lat = position.coords.latitude
      this.reportedLatLng.lng = position.coords.longitude
    },
    setLocation: function () {
      this.hasLocation = true
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
$screenHeightWithoutMenu: calc(100vh - 3.25rem - 2px); // height of Navbar and border
.Home {
  min-height: $screenHeightWithoutMenu;
  .intro-section {
    width: 100%;
    height: 100%;
    .columns {
      margin-bottom: 0;
      border-bottom: 1px solid #dedede;
    }

    .left {
      // margin: 0;
      // height: 100vh;
      // background-color: #0093E9;
      // background-image: linear-gradient(160deg, #0093E9 0%, #80D0C7 100%);

    }
    .right {
      align-items: center;
      // min-height: 50%;
      // height: 100vh;
      // background-color: #0093E9;
      // background-image: linear-gradient(160deg, #0093E9 0%, #80D0C7 100%);
    }
    .latLng {
      margin: 15px auto;
    }
  }
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

  .column.has-vertically-aligned-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  @media (max-width: 768px) {
    overflow: auto;
    .left, .right {
      height: 300px;
    }
  }
  @media (min-width: 768px) {
    height: $screenHeightWithoutMenu;
    .columns {
      height: 50%;
    }
  }
}
</style>
