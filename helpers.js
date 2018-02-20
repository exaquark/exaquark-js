'use strict';

var _distance = require('./utils/distance');

var _exports = module.exports = {};

/**
* Converts a dictionary to an array
* @param {Object} dict
*/
_exports.dictionaryToArray = function (dict) {
  return Object.keys(dict).map(function (key) {
    return dict[key];
  });
};

// Converts a dictionary to an array
/**
* Converts a array to an dictionary
* @param {Array} arr
*/
_exports.arrayToDictionary = function (arr) {
  return arr.reduce(function (map, obj) {
    map[obj.iid] = obj;
    return map;
  }, {});
};

/**
* Returns the distance between two entities
* @param {string} [options.units] - the unit of measurement. Defaults to meters
*/
_exports.getDistanceBetweenEntities = function (entityOne, entityTwo, options) {
  return (0, _distance.distanceOnSphere)(entityOne.geo.lat, entityOne.geo.lng, entityTwo.geo.lat, entityTwo.geo.lng);
};

/**
* Gets a list of neighbors within a specified distance
* @param {Array} a list of neighbors that you want to check
* @param {number} distance
* @param {string} [options.units] - the unit of measurement. Defaults to meters
* @returns Array of neighbors
*/
_exports.getNeighborsByMaxDistance = function (entityState, arrayOfNeighbors, distance) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  return arrayOfNeighbors.filter(function (x) {
    return distance >= (0, _distance.distanceOnSphere)(entityState.geo.lat, entityState.geo.lng, x.geo.lat, x.geo.lng);
  });
};