import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  hasVideoStream: false,
  iid: '',
  entityState: {
    entityId: 'MOCK_ENTITY_ID', // {string} required: their entityId
    universe: 'VIDGRID', // {string} required:  which universe is the entitiy in
    geo: {
      lat: 0, // {double} required: latitude
      lng: 0, // {double} required: longitude
      altitude: 0, // {double} optional: altitude in meters - can be negative
      rotation: [ 2, 5, 19 ] // {Array of doubles} optional: all in degrees. Default facing north
    },
    properties: {
      displayName: '', // {string} required: a human readable name to be displayed
      sound: true, // {boolean} optional: defaults to true. false === mute
      mic: false, // {boolean} optional: defaults to true. false === muted microphone
      video: false, // {boolean} optional: defaults to true. false === muted microphone
      virtualPosition: true, // {boolean} optional: defaults to false. Is this person physically in the position that they are in the digital universe. (true === they are not physically present there)
      entityType: 'HUMAN' // {string} optional: defaults to 'human'. Options: 'HUMAN' | 'BOT' | 'DRONE'
    },
    customState: {
      webrtc: {
        isEnabled: true,
        streamId: null
      }
    }
  },
  locations: {
    places: [
      {
        label: 'Paris',
        lat: 48.8556,
        lng: 2.2986
      },
      {
        label: 'Singapore',
        lat: 1.2883,
        lng: 103.8475
      }
    ],
    modalVisible: false
  },
  neighbors: [],
  settings: {
    modalVisible: false
  }
}
const mutations = {
  RESET_DEFAULTS (state) { // resets key fields
    state.entityState.properties.sound = false
    state.entityState.properties.mic = false
    state.entityState.properties.video = false
  },
  SET_CUSTOM_AVATAR (state, payload) {
    state.settings.customAvatar = payload
    state.entityState.customState.avatarUrl = payload
  },
  SET_DISPLAY_NAME (state, payload) {
    state.entityState.properties.displayName = payload
  },
  SET_ENTITY_STATE (state, payload) {
    state.entityState = payload
  },
  SET_IID (state, payload) {
    state.iid = payload
  },
  SET_NEIGHBOUR_LIST (state, payload) {
    state.neighbors = payload
  },
  SET_POSITION (state, payload) {
    state.entityState.geo.lat = payload.lat
    state.entityState.geo.lng = payload.lng
    state.entityState.geo.altitude = payload.altitude
  },
  SET_UNIVERSE (state, payload) {
    state.entityState.universe = payload
  },
  TOGGLE_LOCATION_MODAL (state) {
    state.locations.modalVisible = !state.locations.modalVisible
  },
  TOGGLE_SETTINGS_MODAL (state) {
    state.settings.modalVisible = !state.settings.modalVisible
  },
  TOGGLE_SOUND (state) {
    state.entityState.properties.sound = !state.entityState.properties.sound
  },
  TOGGLE_MIC (state) {
    state.entityState.properties.mic = !state.entityState.properties.mic
  },
  TOGGLE_VIDEO (state) {
    state.entityState.properties.video = !state.entityState.properties.video
  },
  TOGGLE_VIDEO_STREAM (state, value) {
    state.hasVideoStream = value
  }
}
const actions = {

}
const getters = {
  customAvatar: state => state.entityState.customState.avatarUrl,
  hasVideoStream: state => state.hasVideoStream,
  iid: state => state.iid,
  entityState: state => state.entityState,
  displayName: state => state.entityState.properties.displayName,
  locations: state => state.locations,
  locationModalVisible: state => state.locations.modalVisible,
  mic: state => state.entityState.properties.mic,
  neighbors: state => state.neighbors,
  scene: state => state.scene,
  settings: state => state.settings,
  settingsModalVisible: state => state.settings.modalVisible,
  sound: state => state.entityState.properties.sound,
  universe: state => state.entityState.universe,
  video: state => state.entityState.properties.video
}
export default new Vuex.Store({
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
})
