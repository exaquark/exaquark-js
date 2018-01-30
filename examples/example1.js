const exaQuarkJs = require('../lib/exaquark')
const exaQuarkTempUrl = "http://163.172.171.14:9999"

// pass this function to exaQuark, which will return (msg, data) for all log calls
let logger = (msg, data) => {
  console.log('msg', data)
}

let options = {
  transport: 'WebSocket', // WebSocket  | LongPoll | UDP
  logger: logger,
  universe: 5678923123,
  params: {
    iid: 'fe164264-4bc7-4948-b842-96d35a34ad81',
    userId: "123"
  }
}

// setup with listeners
let exaQuark = new exaQuarkJs(exaQuarkTempUrl, options)


exaQuark.on("neighbors", msg => console.log("Got neighbors", msg) )
exaQuark.on("updates", msg => console.log("Got updates", msg) )
exaQuark.on("removes", msg => console.log("Got removes", msg) )

// init
exaQuark.connect()
.receive("ok", ({neighbors}) => console.log("catching up", neighbors) )
.receive("error", ({reason}) => console.log("failed join", reason) )
.receive("timeout", () => console.log("Networking issue. Still waiting..."))

// send actor properties
exaQuark.push('actor', {
  geo: {
    dimension: 234234,
    x: 3.11, // lat required
    y: 5.33, // long required
    z: 32, // elevation metres ?
    pitch: 0,
    yaw: 0,
    roll: 0
  },
  state: {
    action: 'DANCING', // DANCING | PUNCHING | JUMPING
  },
  properties: { // some of this state changes infrequently - can we optimise bandwith by sending an different call - exaQuark.push('properties', {}) ?
    avatarId: 5678923123,
    sound: true, // false = mute
    mic: true, // false = mute microphone
  }
})


// ask for neighbors
exaQuark.push('ask:neighbors', {
  x: 3.11, // lat
  y: 5.33, // long
  z: 32, // elevation
})
.receive('ok', response => { console.log(response) })
.receive('error', error => { console.error(error) })
