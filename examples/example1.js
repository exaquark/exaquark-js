const exaQuarkJs = require('../lib/exaQuark.js')
const exaquarkUrl = "http://163.172.171.14:9999" // https://enter.exaquark.net

var apiKey = 'YOUR_API_KEY' // required
let options = {
  entityId: 'ENTITY_ID', // required
  universe: 'UNIVERSE_ID', // optional: defaults to sandbox
  transport: 'WebSocket', // optional: WebSocket | UDP
  logger: (msg, data) => { console.log(msg, data) }, // optional: attach your own logger
}

var iid = null // exaQuark will generate - A user can have multiple instance ID's (eg, one for their phone, one for their AR glasses)
var exaQuark = new exaQuarkJs(exaquarkUrl, apiKey, options)

// Subscribe to the individual neighborhood events - see "Notifications from exaQuark" below
exaQuark.on("neighbor:enter", entityState => {
  console.log(entityState) // example function in your app
})
exaQuark.on("neighbor:leave", entityState => {
  console.log(entityState) // example function in your app
})
exaQuark.on("neighbor:updates", entityState => {
  console.log(entityState) // example function in your app
})
exaQuark.on("data", data => {
  console.log(data) // example function in your app
})


let initialState = {
  entityId: 'MOCK_ENTITY_ID', // {string} required: their entityId
  iid: 'MOCK_IID', // {string} required: instance ID - each user can have multiple "instances". For example they can be logged in to their browser and their phone at the same time
  universe: 'MOCK_UNIVERSE_ID', // {string} required:  which universe is the entitiy in
  delaunay: 1, // {number} 1 - 5 - delaunay is the "distance" of your neighbor. It isn't required when sending to exaQuark, however you will receive it in notifications about your neighbors
  geo: {
    lat: 3.11, // {double} required: latitude
    lng: 5.33, // {double} required: longitude
    altitude: 32.1, // {double} optional: altitude in meters - can be negative
    rotation: [ 2, 5, 19 ] // {Array of doubles} optional: all in degrees. Default facing north
  },
  properties: {
    avatarId: 'MOCK_AVATAR_ID', // {string} required: the avatar your user has selected
    sound: true, // {boolean} optional: defaults to true. false === mute
    mic: true, // {boolean} optional: defaults to true. false === muted microphone
    virtualPosition: false, // {boolean} optional: defaults to false. Is this person physically in the position that they are in the digital universe. (true === they are not physically present there)
    entityType: 'HUMAN' // {string} optional: defaults to 'human'. Options: 'HUMAN' | 'BOT' | 'DRONE'
  },
  universeState: {
    // developer defined state for their universe
    // you can use this to pass arbitrary data to other entities in your neighborhood
  }
}
let neighbors = []

// init
exaQuark.connect(initialState)
.then(({iid, neighbors}) => {
  console.log('iid', iid)
  console.log('neighbors', neighbors)
})
.catch("err", err => { console.error(err)})



var interval = setInterval(function() {
  console.log('variable', exaQuark.neighbors())
}, 1000)


// .receive("ok", ({neighbors, iid}) => {
//   console.log("my instance ID", iid)
//   console.log("catching up", neighbors)
// } )
// .receive("error", ({reason}) => console.log("failed join", reason) )
// .receive("timeout", () => console.log("Networking issue. Still waiting..."))
//
// /* this is a typical response from the connection
// {
//   iid: 3479374985345,
//   neighbors: [
//     {
//       iid: 29837928734,
//       delaunay: 1, // 1 - 5
//       geo: {
//         dimension: 234234, // which dimension is the user in? - defaults to univers default
//         lat: 3.11, // lat required
//         lng: 5.33, // long required
//         altitude: 32, // altitude in meters, optional
//         rotation: { 2, 5, 19 } // optional - default facing north
//       },
//       properties: { // some of this state changes infrequently - can we optimise bandwith by sending an different call - exaquark.push('properties', {}) ?
//         avatarId: 5678923123,
//         sound: true, // false = mute
//         mic: true, // false = mute microphone
//         virtualPosition: false, // is this person physically in the position that they are in the digital universe
//         entityType: 'human' // human | bot | drone
//       },
//       state: {
//         // developer defined state
//       }
//     }
//   ]
// }
// */
//
//
//
// ////////////////////////////////////////////////////////////////////////////////////////////////
//
// // Messages to exaQuark
//
// ////////////////////////////////////////////////////////////////////////////////////////////////
//
//
// // send actor updates
// socket.push('update:state', {
//   geo: {
//     lat: 3.11, // lat required
//     lng: 5.33, // long required
//     dimension: 234234, // which dimension is the user in? - defaults to univers default
//     alt: 32, // altitude in meters, optional
//     angle:40, // cardinal direction in degrees, optional
//     pitch: 0,
//     yaw: 0,
//     roll: 0
//   },
//   properties: { // some of this state changes infrequently - can we optimise bandwith by sending an different call - exaquark.push('properties', {}) ?
//     avatarId: 5678923123,
//     sound: true, // false = mute
//     mic: true, // false = mute microphone
//     virtualPosition: false, // is this person physically in the position that they are in the digital universe
//     entityType: 'human' // human | bot | drone
//   },
//   state: {
//     // developer defined state
//   }
// })
//
// // send some custom data to the
// socket.push('data:broadcast', {
//   dimension: 234234, // which dimension is the user in? - defaults to universe default
//   reach: 1, // 1 - 5 delauney
//   data: { }
// })
// // this has to be a user within your current neighborhood list
// exaquark.push('data:private', {
//   dimension: 234234, // which dimension is the user in? - defaults to universe default
//   iids: [ 7687686 ]
//   data: { }
// })
//
//
// // ask for neighbors
// socket.push('ask:neighbors')
// .receive('ok', response => { console.log(response) })
// .receive('error', error => { console.error(error) })
//
//
// ////////////////////////////////////////////////////////////////////////////////////////////////
//
// // Notifications from exaQuark
//
// ////////////////////////////////////////////////////////////////////////////////////////////////
//
//
// /*
//   Receive a full list of nbs. Can be triggered from: socket connection/reconnection. exaQuark may send this sporadically to ensure consistency of neighborhood
//   When you receive this list, it is the latest and most up to date
//   @example
//   [
//     {
//       iid: 29837928734,
//       delaunay: 1, // 1 - 5
//       geo: {
//         dimension: 234234, // which dimension is the user in? - defaults to universe default
//         lat: 3.11, // lat required
//         lng: 5.33, // long required
//         altitude: 32, // altitude in meters, optional
//         rotation: { 2, 5, 19 } // optional - default facing north
//       },
//       properties: { // some of this state changes infrequently - can we optimise bandwith by sending an different call - exaquark.push('properties', {}) ?
//         avatarId: 5678923123,
//         sound: true, // false = mute
//         mic: true, // false = mute microphone
//         virtualPosition: false, // is this person physically in the position that they are in the digital universe
//         entityType: 'human' // human | bot | drone
//       },
//       state: {
//         // developer defined state
//       }
//     }
//   ]
// */
// socket.on("neighbors:list", msg => console.log("Got neighbors", msg) )
// socket.on("neighbors:enter") // when a single neighbor appears
// socket.on("neighbors:leave") // when a single neighbor leaves your
// socket.on("neighbors:updates") // a list of updates for your neighbors
//
//
// // Advanced - the SDK manages the lists of neighbors, however you can attach listeners to them if you want to perform these actions yourself
// socket.on("neighbours", msg => console.log("Got updates", msg) )
// socket.on("updates", msg => console.log("Got updates", msg) )
//
//
// /*
//   Receive a full list of nbs. Can be triggered from: socket connection/reconnection. exaQuark may send this sporadically to ensure consistency of neighborhood
//   When you receive this list, it is the latest and most up to date
//   @example
// */
// var REMOVES = {
//   method: 'removes',
//   neighbors: [
//     //list of iid's
//   ]
// }
//
// socket.on("removes", msg => console.log("Got removes", msg) )
