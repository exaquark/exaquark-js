<template>
  <div class="Nav">

    <nav class="navbar" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <a class="navbar-item is-hidden-mobile" href="/">
          <img src="../assets/logo-menu.svg" alt="exaQuark" width="112" >
        </a>
        <a class="navbar-item" @click="$store.commit('TOGGLE_SOUND')">
          <span class="icon is-small" v-bind:class="{ 'has-text-info': sound, 'has-text-danger': !sound }"><i class="fas fa-volume-up"></i></span>
        </a>
        <a class="navbar-item" @click="$emit('onVideoClicked')">
          <span class="icon is-small" v-bind:class="{ 'has-text-info': video }"><i class="fas fa-video"></i></span>
        </a>
        <a class="navbar-item" @click="$store.commit('TOGGLE_MIC')">
          <span class="icon is-small" v-bind:class="{ 'has-text-info': mic }"><i class="fas fa-microphone"></i></span>
        </a>
        <!-- <a class="navbar-item" @click="toggleLocationModal()">
          <span class="icon is-small has-text-info">
            <i class="far fa-map"></i>
          </span>
        </a>
        <a class="navbar-item" @click="toggleSettingsModal()">
          <span class="icon is-small has-text-info">
            <i class="fas fa-cog"></i>
          </span>
        </a> -->

        <div class="navbar-burger" @click="toggleMobileMenu()">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div class="navbar-menu" v-bind:class="{ 'is-active': showMobileMenu }">
        <div class="navbar-end">

        </div>
      </div>
    </nav>

    <!-- <Settings />
    <LocationModal /> -->
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
      showMobileMenu: false
    }
  },
  computed: {
    ...mapGetters([
      'mic',
      'sound',
      'video'
    ])
  },
  methods: {
    toggleMobileMenu: function () {
      this.showMobileMenu = !this.showMobileMenu
    },
    toggleLocationModal: function () {
      this.$store.commit('TOGGLE_LOCATION_MODAL')
    },
    toggleSettingsModal: function () {
      this.$store.commit('TOGGLE_SETTINGS_MODAL')
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
