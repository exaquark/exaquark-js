<template>
  <div class="app">
    <div class="">
      <h3>My details:</h3>

      <p>IID: {{this.iid}}</p>
      <p>Lat: {{this.entityState.geo.lat}}</p>
      <p>Lng: {{this.entityState.geo.lng}}</p>
    </div>
    <div>
      <h3>Open Multiple tabs to see neighbors</h3>
      <ul>
        <li v-for="n in neighbors" :key="n.iid">
          iid: {{n.iid}}
          <ul>
            <li>Distance: {{calcDistance(n)}}</li>
            <li v-if="n.customState && n.customState.message">Custom State Message: {{n.customState.message}}</li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import ExaQuarkJs from './../../lib/index.js'
import exaQuarkHelpers from './../../lib/helpers'
const exaquarkUrl = 'https://enter.exaquark.com'
let exaQuark = new ExaQuarkJs(exaquarkUrl, apiKey, options)
var apiKey = 'YOUR_API_KEY' // required
let options = {
  entityId: 'ENTITY_ID', // required
  universe: 'UNIVERSE_ID', // optional: defaults to sandbox
  transport: 'WebSocket' // optional: WebSocket | UDP
  // logger: (msg, data) => { console.log(msg, data) } // optional: attach your own logger
}


export default {
  name: 'app',
  components: { },
  data: () => {
    return {
      iid: null,
      neighbors: [],
      entityState: {
        entityId: 'MOCK_ENTITY_ID', // {string} required: their entityId
        universe: 'MOCK_UNIVERSE_ID', // {string} required:  which universe is the entitiy in
        delaunay: 1, // {number} 1 - 5 - delaunay is the "distance" of your neighbor. It isn't required when sending to exaQuark, however you will receive it in notifications about your neighbors
        geo: {
          lat: (Math.random() * 180 - 90).toFixed(3), // {double} required: latitude
          lng: (Math.random() * 360 - 180).toFixed(3), // {double} required: longitude
          altitude: 0, // {double} optional: altitude in meters - can be negative
          rotation: [ 2, 5, 19 ] // {Array of doubles} optional: all in degrees. Default facing north
        },
        properties: {
          displayName: 'MY_NAME_IS', // {string} required: the avatar your user has selected
          sound: true, // {boolean} optional: defaults to true. false === mute
          mic: true, // {boolean} optional: defaults to true. false === muted microphone
          virtualPosition: false, // {boolean} optional: defaults to false. Is this person physically in the position that they are in the digital universe. (true === they are not physically present there)
          entityType: 'HUMAN' // {string} optional: defaults to 'HUMAN'. Options: 'HUMAN' | 'BOT' | 'DRONE'
        },
        customState: {
          // developer defined state for their universe
          // you can use this to pass arbitrary data to other entities in your neighborhood
          message: 'Hello world'
        }
      }
    }
  },
  created: function () {
    exaQuark.bind(this.getState)
    exaQuark.on('neighbor:enter', entityState => {
      this.neighbors = exaQuark.neighbors('Array')
    })
    exaQuark.on('neighbor:updates', entityState => {
      console.log('exaQuark.', exaQuarkHelpers.getNeighborsByMaxDistance(this.entityState, this.neighbors, 10000))
      this.neighbors = exaQuark.neighbors('Array')
    })
    exaQuark.on('neighbor:leave', entityState => {
      this.neighbors = exaQuark.neighbors('Array')
    })
    exaQuark.connect(this.entityState).then(({ iid }) => {
      this.iid = iid
      exaQuark.push('ask:neighbors')
    }).catch('err', err => { console.error(err) })
  },
  methods: {
    getState: function () {
      return this.entityState
    },
    calcDistance: function (neighbor) {
      return exaQuarkHelpers.getDistanceBetweenEntities(this.entityState, neighbor)
    }
  }
}
</script>

<style>

</style>
