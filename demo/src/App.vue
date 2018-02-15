<template>
  <div class="app">
    <div>
      Open Multiple tabs
      <ul>
        <li v-for="n in neighbors" :key="n.iid">iid: {{n.iid}}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import ExaQuarkJs from './../../lib/index.js'
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
          lat: 1.2883, // {double} required: latitude
          lng: 103.8475, // {double} required: longitude
          altitude: 0, // {double} optional: altitude in meters - can be negative
          rotation: [ 2, 5, 19 ] // {Array of doubles} optional: all in degrees. Default facing north
        },
        properties: {
          avatarId: 'MOCK_AVATAR_ID', // {string} required: the avatar your user has selected
          sound: true, // {boolean} optional: defaults to true. false === mute
          mic: true, // {boolean} optional: defaults to true. false === muted microphone
          virtualPosition: false, // {boolean} optional: defaults to false. Is this person physically in the position that they are in the digital universe. (true === they are not physically present there)
          entityType: 'HUMAN' // {string} optional: defaults to 'human'. Options: 'HUMAN' | 'BOT' | 'DRONE'
        },
        universeState: {
          // developer defined state for their universe
          // you can use this to pass arbitrary data to other entities in your neighborhood
        }
      }
    }
  },
  created: function () {
    const exaquarkUrl = 'http://163.172.171.14:9999' // https://enter.exaquark.net

    var apiKey = 'YOUR_API_KEY' // required
    let options = {
      entityId: 'ENTITY_ID', // required
      universe: 'UNIVERSE_ID', // optional: defaults to sandbox
      transport: 'WebSocket' // optional: WebSocket | UDP
      // logger: (msg, data) => { console.log(msg, data) } // optional: attach your own logger
    }

    let exaQuark = new ExaQuarkJs(exaquarkUrl, apiKey, options)
    exaQuark.bind(this.getState)
    exaQuark.on('neighbor:enter', entityState => {
      this.neighbors = exaQuark.neighbors('Array')
    })
    exaQuark.on('neighbor:leave', entityState => {
      this.neighbors = exaQuark.neighbors('Array')
    })
    exaQuark.connect(this.entityState).then(({ iid }) => {
      this.iid = iid
      exaQuark.push('ask:neighbours')
    }).catch('err', err => { console.error(err) })
  },
  methods: {
    getState: function () {
      return this.entityState
    }
  }
}
</script>

<style>

</style>
