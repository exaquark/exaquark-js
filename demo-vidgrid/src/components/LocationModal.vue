<template>
<div class="Location">

  <div class="modal" v-bind:class="{ 'is-active': locationModalVisible }">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="box">

        <div class="columns is-gapless has-text-centered">
          <div class="column left">
            <Radar
              :lat="reportedLatLng.lat"
              :lng="reportedLatLng.lng"
              @onMove="handleTeleport"
            />
          </div>
          <div class="column right has-vertically-aligned-content">
            Pick a location <br>
            <small>We don't share your exact location with anyone</small><br><br>
            <button class="button is-dark is-outlined is-rounded is-small" name="button" @click="getLocation()" v-show="geolocationEnabled">Go to my location</button>
            <div class="buttons has-addons is-centered latLng">
              <a class="button is-static is-small">{{reportedLatLng.lat}}</a>
              <a class="button is-static is-small">{{reportedLatLng.lng}}</a>
            </div>

            <button class="button is-info is-outlined is-rounded" name="button" @click="handleTeleport()">Chat Here</button>

          </div>
        </div>

      </div>
    </div>
    <button class="modal-close is-large" aria-label="close" @click="toggleLocationModal()"></button>
  </div>

</div>
</template>

<script>
import { mapGetters } from 'vuex'
import Radar from '@/components/Radar.vue'
export default {
  name: 'LocationModal',
  props: {
  },
  components: {
    Radar
  },
  data: () => {
    return {
      reportedLatLng: {
        lat: 0,
        lng: 0
      }
    }
  },
  computed: {
    ...mapGetters([
      'locationModalVisible'
    ]),
    geolocationEnabled: function () {
      return navigator && navigator.geolocation
    }
  },
  methods: {
    toggleLocationModal: function () {
      this.$store.commit('TOGGLE_LOCATION_MODAL')
    },
    setAddressGeo: function (payload) {
      this.$store.commit('SET_ADDRESS_GEO', payload)
      this.toggleLocationModal()
    },
    goToMe: function () {
      navigator.geolocation.getCurrentPosition(this.handleGeolocation, err => {
        alert(err.message)
      })
    },
    handleGeolocation: function (position) {
      let place = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      this.setPosition(place)
    },
    handleTeleport: function (position) {
      let place = {
        lat: position.lat + (Math.random() - 0.5) / 2000,
        lng: position.lng + (Math.random() - 0.5) / 2000
      }
      this.setPosition(place)
    },
    setPosition: function (place) {
      this.$store.commit('SET_POSITION', {
        lat: place.lat,
        lng: place.lng,
        altitude: 0
      })
      this.toggleLocationModal()
    }
  }
}
</script>

<style scoped lang="scss">
.Location {
  .heading-div {
    margin-bottom: 30px;
  }
  .location-buttons {
    margin: 30px 0;
  }
}
</style>
