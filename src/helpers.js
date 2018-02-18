import { distanceOnSphere } from './utils/distance'
var exports = module.exports = {}

/**
* Converts a dictionary to an array
* @param {Object} dict
*/
exports.dictionaryToArray = function (dict) {
  return Object.keys(dict).map(key => dict[key])
}

// Converts a dictionary to an array
/**
* Converts a array to an dictionary
* @param {Array} arr
*/
exports.arrayToDictionary = function (arr) {
  return arr.reduce(function (map, obj) {
    map[obj.iid] = obj
    return map
  }, {})
}

/**
* Returns the distance between two entities
* @param {string} [options.units] - the unit of measurement. Defaults to meters
*/
exports.getDistanceBetweenEntities = function (entityOne, entityTwo, options) {
  return distanceOnSphere(entityOne.geo.lat, entityOne.geo.lng, entityTwo.geo.lat, entityTwo.geo.lng)
}

/**
* Gets a list of neighbors within a specified distance
* @param {Array} a list of neighbors that you want to check
* @param {number} distance
* @param {string} [options.units] - the unit of measurement. Defaults to meters
* @returns Array of neighbors
*/
exports.getNeighborsByMaxDistance = function (entityState, arrayOfNeighbors, distance, options = {}) {
  return arrayOfNeighbors.filter(x => distance >= distanceOnSphere(entityState.geo.lat, entityState.geo.lng, x.geo.lat, x.geo.lng))
}
