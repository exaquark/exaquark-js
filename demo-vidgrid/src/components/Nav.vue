<template>
  <div class="Nav">

    <nav class="navbar" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <a class="navbar-item is-hidden-mobile" href="/">
          <img src="../assets/logo-menu.svg" alt="exaQuark" width="112" >
        </a>
        <a class="navbar-item" @click="$store.commit('TOGGLE_SOUND')" v-show="hasVideoStream">
          <span class="icon is-small" v-bind:class="{ 'has-text-info': sound, 'has-text-danger': !sound }"><i class="fas fa-volume-up"></i></span>
        </a>
        <a class="navbar-item" @click="$emit('onVideoClicked')" v-show="hasVideoStream">
          <span class="icon is-small" v-bind:class="{ 'has-text-info': video }"><i class="fas fa-video"></i></span>
        </a>

        <!-- <div class="navbar-item has-dropdown is-hoverable" v-show="hasVideoStream">
          <a class="navbar-link" @click="$emit('onVideoClicked')" >
            <span class="icon is-small" v-bind:class="{ 'has-text-info': video }"><i class="fas fa-video"></i></span>
          </a>
          <div class="navbar-dropdown" >
            <a class="navbar-item" v-for="device in videoDevices" :key="device.deviceId">
              {{device.label}}
            </a>
          </div>
        </div>
        <div class="navbar-item has-dropdown is-hoverable" v-show="hasVideoStream">
          <a class="navbar-link" @click="$emit('onMicClicked')">
            <span class="icon is-small" v-bind:class="{ 'has-text-info': mic }"><i class="fas fa-microphone"></i></span>
          </a>
          <div class="navbar-dropdown" >
            <a class="navbar-item" v-for="device in audioDevices" :key="device.deviceId">
              {{device.label}}
            </a>
          </div>
        </div> -->

        <a class="navbar-item" @click="$emit('onMicClicked')" v-show="hasVideoStream">
          <span class="icon is-small" v-bind:class="{ 'has-text-info': mic }"><i class="fas fa-microphone"></i></span>
        </a>
        <a class="navbar-item" @click="toggleLocationModal()">
          <span class="icon is-small has-text-info">
            <i class="far fa-map"></i>
          </span>
        </a>
        <a class="navbar-item" @click="toggleSettingsModal()">
          <span class="icon is-small has-text-info">
            <i class="fas fa-cog"></i>
          </span>
        </a>

        <!-- <div class="navbar-burger" @click="toggleMobileMenu()">
          <span></span>
          <span></span>
          <span></span>
        </div> -->
      </div>
      <div class="navbar-menu" v-bind:class="{ 'is-active': showMobileMenu }">
        <div class="navbar-end">

        </div>
      </div>
    </nav>

    <!-- <Settings />
    <LocationModal /> -->

    <div class="modal" v-bind:class="{ 'is-active': settingsModalActive }">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="box">

          <p>video</p>
          <a class="button" v-for="device in videoDevices" :key="device.deviceId + 'v'" @click="$emit('onVideoDeviceChanged', device)">
            {{device.label}}
          </a>

          <p>audio</p>
          <a class="button" v-for="device in audioDevices" :key="device.deviceId + 'a'">
            {{device.label}}
          </a>

          <p>speaker</p>
          <a class="button" v-for="device in speakerDevices" :key="device.deviceId + 's'">
            {{device.deviceId}}-{{device.label}}
          </a>

        </div>
      </div>
      <button class="modal-close is-large" aria-label="close" @click="toggleSettingsModal()"></button>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import Settings from '@/components/Settings.vue'
// import LocationModal from '@/components/LocationModal.vue'
export default {
  name: 'Nav',
  components: {
    // AddressLookup,
    // LocationModal,
    // Settings
  },
  data: function () {
    return {
      settingsModalActive: false,
      devices: [],
      showMobileMenu: false
    }
  },
  computed: {
    ...mapGetters([
      'hasVideoStream',
      'mic',
      'sound',
      'video'
    ]),
    videoDevices: function () {
      return this.devices.filter(d => d.kind === 'videoinput')
    },
    audioDevices: function () {
      return this.devices.filter(d => d.kind === 'audioinput')
    },
    speakerDevices: function () {
      return this.devices.filter(d => d.kind === 'audiooutput')
    }
  },
  created: function () {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        this.devices = devices
      })
    }
  },
  methods: {
    onlyUnique: function (value, index, self) {
      return self.indexOf(value.deviceId) === index
    },
    toggleMobileMenu: function () {
      this.showMobileMenu = !this.showMobileMenu
    },
    toggleLocationModal: function () {
      this.$store.commit('TOGGLE_LOCATION_MODAL')
    },
    toggleSettingsModal: function () {
      this.settingsModalActive = !this.settingsModalActive
      // this.$store.commit('TOGGLE_SETTINGS_MODAL')
    }
  }
}
</script>
<style scoped lang="scss">
.Nav {
  .navbar {
    border-bottom: 1px solid #ededed;
  }
  .off {
    color: red;
    fill:red;
  }
}
</style>
