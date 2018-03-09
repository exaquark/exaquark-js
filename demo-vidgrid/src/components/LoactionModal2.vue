<template>
  <div class="LocationModal">

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
</template>

<script>
</script>
<style scoped lang="scss">

</style>
