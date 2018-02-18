var exports = module.exports = {}

// Calculates the distance between a set of Lat/Lngs
exports.distanceOnSphere = function (lat1, lon1, lat2, lon2, radius = 6371) {
  const p = 0.017453292519943295    // Math.PI / 180
  const c = Math.cos
  let diameter = 2 * radius
  let a = 0.5 - c((lat2 - lat1) * p) / 2 +
    c(lat1 * p) * c(lat2 * p) *
    (1 - c((lon2 - lon1) * p)) / 2

  return diameter * Math.asin(Math.sqrt(a))
}
