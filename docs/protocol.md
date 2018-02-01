
# Protocol

A high level overview of the exaQuark protocol






## Authorise your connection

Request the entrypoint for the universe.

```javascript
var allocatorUrl = 'exaquark.io' // required
var apiKey = '29837928734a-29837928734a' // required
var universeId = '29783asdf827' // required
var transport = 'WEB_SOCKET' // required: WEB_SOCKET | UDP

requestEntrypoint (allocatorUrl, apiKey, universeId, transport)

```

Returns a URL for the universe which you can use to establish a socket connection

```javascript
{
  entryPoint: '111.111.111.111', // the url for the socket to connect to
  iid: '2983748234'
}

```

## Create a socket connection

Establish the connection with your location and state.

```javascript

// set up your initial state
var initialState = {
  userId: '123234',
  iid: '2983748234',
  dimension: 234234, // which dimension is the user in? - defaults to universe default
  geo: {
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
  dimensionState: {
    // developer defined state for their dimension
  }
}

// append your state to the endpoint
entryPoint += encodeURIComponent(initialState)
var socket = new WebSocket(url)
```

Once you have connected you will receive a stream of the following notifications:

## Notifications from exaQuark

All neighbours can be represented in the following format

```javascript
@typedef EntityState::={
  userId: 234234, // their userId
  iid: 29837928734, // instance ID
  dimension: 234234, // which dimension is the entitiy in
  delaunay: 1, // 1 - 5 - delaunay is not required when sending to exaQuark, however you will receive it back for your neighbors
  geo: {
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
  dimensionState: {
    // developer defined state for their dimension
  }
}
```

###### exaQuark sends a full list of neighbors

Receive a full list of neighbours - your own IID will not be included in this list. Can be triggered from: socket connection/reconnection. exaQuark may send this sporadically to ensure consistency of neighborhood
When you receive this list, it is the latest and most up to date


```javascript
{
  method: 'neighbors'
  neighbors: [
    {EntityState},
    ...
  ]
}

```


##### Notification of changes in the neighborhood


```javascript
{
  method: 'updates'
  neighbors: [
    {EntityState},
    ...
  ]
}
```

##### Notifications about entities leaving the neighborhood

```javascript
{
  method: 'removes'
  neighbors: [
    // list of entities identified by the following
    {
      userId: 234234, // their userId
      iid: 29837928734, // instance ID
      dimension: 234234, // which dimension is the entitiy in
    }
  ]
}
```

##### Data is received

@TODO: explanation

```javascript
{
  method: 'data',
  source: {
    userId: 234234,
    iid: 29837928734, // instance ID
    dimension: 1782687123, // which dimension this data came from
  },
  data: {

  }
}
```

## Messages to exaQuark

##### Update position and state

```javascript
socket.send(JSON.stringify(<EntityState>))
```

##### Send data to all neighbors of a given level (delauney)

```javascript
socket.send(JSON.stringify({
  method:'data:broadcast',
  userId: 234234,
  iid: 29837928734, // instance ID
  dimension: 234234, // source dimension
  reach: 1, // 1 - 5 delauney
  data: { }
}))
```

##### Send data to some neighbors

```javascript
socket.send(JSON.stringify({
  method:'data:private',
  userId: 234234,
  iid: 29837928734, // instance ID
  dimension: 234234, // source dimension
  neigbours: [
    {
      userId: 7687686,
      iid: 29837928734, // instance ID
    }
  ]
  data: { }
}))
```


##### Ask for a full list of neighbors

```javascript
socket.send(JSON.stringify({
  method:'ask:neighbors',
  userId: 234234,
  iid: 29837928734, // instance ID
}))
```
