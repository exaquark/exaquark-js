"use strict";

var _exports = module.exports = {};

// Calculates the distance between a set of Lat/Lngs
_exports.distanceOnSphere = function (lat1, lon1, lat2, lon2) {
  var radius = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 6371;

  var p = 0.017453292519943295; // Math.PI / 180
  var c = Math.cos;
  var diameter = 2 * radius;
  var a = 0.5 - c((lat2 - lat1) * p) / 2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p)) / 2;

  return diameter * Math.asin(Math.sqrt(a));
};