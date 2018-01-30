const exaQuark = require('../lib/exaQuark.js')
const exaquarkTempUrl = "http://163.172.171.14:9999"
const apiKey = "asjdhkjashd"

// pass this function to exaquark, which will return (msg, data) for all log calls
let logger = (msg, data) => {
  console.log(msg, data)
}

let options = {
  transport: 'WebSocket', // WebSocket | UDP
  logger: logger, // not required
  universe: 5678923123, // defaults to sandbox
  params: {
    userId: "123", // required
  }
}

// // setup with listeners
let socket = new exaQuark(exaquarkTempUrl, apiKey, options)


let init = {
  geo: {
    dimension: 234234, // which dimension is the user in? - defaults to univers default
    lat: 3.11, // lat required
    lng: 5.33, // long required
    altitude: 32, // altitude in meters, optional
    rotation: { 2, 5, 19 } // optional - default facing north
  },
  properties: { // some of this state changes infrequently - can we optimise bandwith by sending an different call - exaquark.push('properties', {}) ?
    avatarId: 5678923123,
    sound: true, // false = mute
    mic: true, // false = mute microphone
    virtualPosition: false, // is this person physically in the position that they are in the digital universe
    entityType: 'human' // human | bot | drone
  },
  state: {
    // developer defined state
  }
}

// init
socket.connect(init)
.receive("ok", ({neighbors, iid}) => {
  console.log("my instance ID", iid)
  console.log("catching up", neighbors)
} )
.receive("error", ({reason}) => console.log("failed join", reason) )
.receive("timeout", () => console.log("Networking issue. Still waiting..."))

/* this is a typical response from the connection
{
  iid: 3479374985345,
  neighbors: [
    {
      iid: 29837928734,
      delaunay: 1, // 1 - 5
      geo: {
        dimension: 234234, // which dimension is the user in? - defaults to univers default
        lat: 3.11, // lat required
        lng: 5.33, // long required
        altitude: 32, // altitude in meters, optional
        rotation: { 2, 5, 19 } // optional - default facing north
      },
      properties: { // some of this state changes infrequently - can we optimise bandwith by sending an different call - exaquark.push('properties', {}) ?
        avatarId: 5678923123,
        sound: true, // false = mute
        mic: true, // false = mute microphone
        virtualPosition: false, // is this person physically in the position that they are in the digital universe
        entityType: 'human' // human | bot | drone
      },
      state: {
        // developer defined state
      }
    }
  ]
}
*/



////////////////////////////////////////////////////////////////////////////////////////////////

// Messages to exaQuark

////////////////////////////////////////////////////////////////////////////////////////////////


// send actor updates
socket.push('update:state', {
  geo: {
    lat: 3.11, // lat required
    lng: 5.33, // long required
    dimension: 234234, // which dimension is the user in? - defaults to univers default
    alt: 32, // altitude in meters, optional
    angle:40, // cardinal direction in degrees, optional
    pitch: 0,
    yaw: 0,
    roll: 0
  },
  properties: { // some of this state changes infrequently - can we optimise bandwith by sending an different call - exaquark.push('properties', {}) ?
    avatarId: 5678923123,
    sound: true, // false = mute
    mic: true, // false = mute microphone
    virtualPosition: false, // is this person physically in the position that they are in the digital universe
    entityType: 'human' // human | bot | drone
  },
  state: {
    // developer defined state
  }
})

// send some custom data to the
socket.push('data:broadcast', {
  dimension: 234234, // which dimension is the user in? - defaults to universe default
  reach: 1, // 1 - 5 delauney
  data: { }
})
// this has to be a user within your current neighborhood list
exaquark.push('data:private', {
  dimension: 234234, // which dimension is the user in? - defaults to universe default
  iids: [ 7687686 ]
  data: { }
})


// ask for neighbors
socket.push('ask:neighbors')
.receive('ok', response => { console.log(response) })
.receive('error', error => { console.error(error) })


////////////////////////////////////////////////////////////////////////////////////////////////

// Notifications from exaQuark

////////////////////////////////////////////////////////////////////////////////////////////////


/*
  Receive a full list of nbs. Can be triggered from: socket connection/reconnection. exaQuark may send this sporadically to ensure consistency of neighborhood
  When you receive this list, it is the latest and most up to date
  @example
  [
    {
      iid: 29837928734,
      delaunay: 1, // 1 - 5
      geo: {
        dimension: 234234, // which dimension is the user in? - defaults to universe default
        lat: 3.11, // lat required
        lng: 5.33, // long required
        altitude: 32, // altitude in meters, optional
        rotation: { 2, 5, 19 } // optional - default facing north
      },
      properties: { // some of this state changes infrequently - can we optimise bandwith by sending an different call - exaquark.push('properties', {}) ?
        avatarId: 5678923123,
        sound: true, // false = mute
        mic: true, // false = mute microphone
        virtualPosition: false, // is this person physically in the position that they are in the digital universe
        entityType: 'human' // human | bot | drone
      },
      state: {
        // developer defined state
      }
    }
  ]
*/
socket.on("neighbors", msg => console.log("Got neighbors", msg) )
socket.on("neighbor:enter") // when a single neighbor appears
socket.on("neighbor:leave") // when a single neighbor leaves your
socket.on("neighbor:updates") // a list of updates for your neighbors


// Advanced - the SDK manages the lists of neighbors, however you can attach listeners to them if you want to perform these actions yourself
socket.on("updates", msg => console.log("Got updates", msg) )
socket.on("removes", msg => console.log("Got removes", msg) )
