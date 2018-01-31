
# Protocol

A high level overview of the exaQuark protocol






## Authorise your connection

Request a URL from exaQuark for the universe.

```javascript
var entryPoint = 'exaquark.io/universe_key'
var apiKey = '29837928734a-29837928734a'

requestConnection (entryPoint, apiKey, params)

```

Returns a URL for the universe which you can use to establish a socket connection

```javascript
{
  url: '111.111.111.111' // the url for the socket to connect to
}

```

## Create a socket connection

Establish the socket connection with your location and state. You don't need to provide your instance ID. exaQuark will return your instance ID

```javascript

// set up your initial state
var payload = {
  userId: '123234'
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

// append your state to the endpoint
url += encodeURIComponent(payload)
var socket = new WebSocket(url)
```

Returns your identifying info and a list of you neighbors. You should save the instance ID to send with every request

```javascript
{
  iid: '3459374593', // your instance ID
  neighbors [...{NeighborObject}]
}

```

## Notifications from exaQuark

All neighbours can be represented in the following format

```javascript
@typedef NeighborObject::={
  userId: 234234,
  iid: 29837928734, // instance ID
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
```

###### exaQuark sends a full list of neighbors

Receive a full list of nbs. Can be triggered from: socket connection/reconnection. exaQuark may send this sporadically to ensure consistency of neighborhood
When you receive this list, it is the latest and most up to date


```javascript
{
  method: 'neighbors'
  neighbors: [
    {NeighborObject},
    ...
  ]
}

```


##### Notification of changes in the neighborhood


```javascript
{
  method: 'updates'
  neighbors: [
    {NeighborObject},
    ...
  ]
}
```

##### Notifications about entities leaving the neighborhood

```javascript
{
  method: 'removes'
  neighbors: [
    {NeighborObject},
    ...
  ]
}
```

##### Data is sent from a neighbor

```javascript
{
  method: 'data'
  data: {}
}
```

## Messages to exaQuark

##### Update position and state

```javascript
socket.send(JSON.stringify({
  method:'update:state',
  userId: 234234,
  iid: 29837928734, // instance ID
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
}))
```

##### Send data to all neighbors

```javascript
socket.send(JSON.stringify({
  method:'data:broadcast',
  userId: 234234,
  iid: 29837928734, // instance ID
  dimension: 234234,
  iids: [ 7687686 ]
  data: { }
}))
```

##### Send data to one neighbor

```javascript
socket.send(JSON.stringify({
  method:'data:private',
  userId: 234234,
  iid: 29837928734, // instance ID
  dimension: 234234,
  iids: [ 7687686 ]
  data: { }
}))
```


##### Ask for a list of neighbors


```javascript
socket.send(JSON.stringify({
  method:'ask:neighbors',
  userId: 234234,
  iid: 29837928734, // instance ID
  dimension: 234234
}))
```
