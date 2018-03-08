<template>
  <div class="Radar">

    <gmap-map :center="mapCenter" :zoom="zoom" class="map-canvas" @center_changed="updateCenter" :options="defaultMapOptions">

      <gmap-marker
        key="123"
        :position="reportedCenter"
        :clickable="false"
        :draggable="false"
      />
    </gmap-map>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Vue from 'vue'
import * as VueGoogleMaps from 'vue2-google-maps'
Vue.component('google-map', VueGoogleMaps.Map)
Vue.component('google-marker', VueGoogleMaps.Marker)
const DEFAULT_ZOOM_LEVEL = 2

export default {
  name: 'Radar',
  props: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  created: function () {
    this.mapCenter = {
      lat: this.lat,
      lng: this.lng
    }
    this.reportedCenter = {
      lat: this.lat,
      lng: this.lng
    }
  },
  watch: {
    lat: function (value) {
      this.mapCenter.lat = value
    },
    lng: function (value) {
      this.mapCenter.lng = value
    }
  },
  data: () => {
    return {
      mapCenter: {
        lat: 48.8538302,
        lng: 2.2982161
      },
      reportedCenter: {
        lat: 48.8538302,
        lng: 2.2982161
      },
      zoom: DEFAULT_ZOOM_LEVEL,
      defaultMapOptions: {
        clickableIcons: false,
        streetViewControl: true,
        panControlOptions: false,
        // gestureHandling: 'greedy',
        keyboardShortcuts: false,
        disableDefaultUI: false,
        scrollwheel: false,
        navigationControl: false,
        mapTypeControl: false,
        scaleControl: true,
        draggable: true
      }
    }
  },
  components: {
  },
  computed: {
    ...mapGetters([]),
    geoMarker: function () {
      return {
        lat: this.lat,
        lng: this.lng
      }
    }
  },
  methods: {
    // temp function to mimic movement in a world
    updateCenter: function (newCenter) {
      let payload = {
        lat: newCenter.lat(),
        lng: newCenter.lng()
      }
      this.reportedCenter = payload
      this.$emit('onMove', payload)
    }
  }
}
</script>
<style scoped lang="scss">
.Radar {
  position: relative;
  width: 100%;
  height: 100%;
  .map-canvas {
    position: relative;
    width: 100%;
    height: 100%;
  }
}
</style>
