

# SDK


## Installation

```
npm install exaquark-js --save
```



##### Before you begin


The following is a representation of an entity in a dimension. It is the standard format that is sent and received from exaQuark.

Any time you see `<EntityState>` in the documentation it is referring to the following format.

```javascript
@typedef EntityState::={
  userId: 'MOCK_USER_ID', // {string} required: their userId
  iid: MOCK_IID, // {number} required: instance ID - each user can have multiple "instances". For example they can be logged in to their browser and their phone at the same time
  dimension: MOCK_DIMENSION_ID, // {number} required:  which dimension is the entitiy in
  delaunay: 1, // {number} 1 - 5 - delaunay is the "distance" of your neighbor. It isn't required when sending to exaQuark, however you will receive it in notifications about your neighbors
  geo: {
    lat: 3.11, // {float} required: latitude
    lng: 5.33, // {float} required: longitude
    altitude: 32, // {number} optional: altitude in meters
    rotation: { 2, 5, 19 } // {Object} optional: default facing north
  },
  properties: {
    avatarId: 5678923123, // {Object} required: the avatar your user has selected
    sound: true, // {boolean} optional: defaults to true. false === mute
    mic: true, // {boolean} optional: defaults to true. false === muted microphone
    virtualPosition: false, // {boolean} optional: defaults to false. Is this person physically in the position that they are in the digital universe. (true === they are not physically present there)
    entityType: 'human' // {string} optional: defaults to 'human'. Options: 'human' | 'bot' | 'drone'
  },
  dimensionState: {
    // developer defined state for their dimension
  }
}
```


## Usage


##### Set up

```javascript
const exaQuarkJs = require('exaquark-js')
var enterUrl = 'https://enter.exaquark.net' // required
var apiKey = 'YOUR_API_KEY' // required
let options = {
  userId: USER_ID, // required
  universe: UNIVERSE_ID, // optional: defaults to sandbox
  transport: 'WebSocket', // optional: WebSocket | UDP
  logger: (msg, data) => { console.log(msg, data) }, // optional: attach your own logger
}
var iid = null // exaQuark will generate - A user can have multiple instance ID's (eg, one for their phone, one for their AR glasses)
var exaQuark = new exaQuarkJs(enterUrl, apiKey, options)
.then(response => {
  iid = response.iid
})
```


##### Connect to a universe

```javascript
// First, subscribe to the individual neighborhood events - see "Notifications from exaQuark" below
exaQuark.on("neighbor:enter", <EntityState> => {
  create(<EntityState>) // example function in your app
})
exaQuark.on("neighbor:leave", <EntityState> => {
  remove(<EntityState>) // example function in your app
})
exaQuark.on("neighbor:updates", <EntityState> => {
  update(<EntityState>) // example function in your app
})
exaQuark.on("data", data => {
  handleData(data) // example function in your app
})

// Next, connect to the universe!
let initialState = <EntityState> // your user's position and state
let neighbors = []
exaQuark.connect(initialState)
.then(() => {
  neighbors = exaQuark.neighbours() // get a full list of your neighbors
})
.catch("err", err => { console.error(err)})

```


**At any time you can get an up-to-date list of your neighbors**
```javascript
let neighbors = exaQuark.neighbours() // Returns an array of <EntityState>
```



### Notifications from exaQuark

You will receive a array of `<EntityState>` for all of the following subscriptions.


**Entity enters neighborhood**

Subscribe to new neigbours. This will be triggered any time a neighbor appears in your neighborhood.
```javascript
exaQuark.on("neighbor:enter", <EntityState> => {
  create(<EntityState>) // example function in your app
})
```

**Entity leaves your neighborhood**

Subscribe to neigbours leaving. This will be triggered any time a neighbor leaves in your neighborhood or goes offline.
```javascript
exaQuark.on("neighbor:leave", <EntityState> => {
  remove(<EntityState>) // example function in your app
})
```

**Entity updates their position or state**

This will be triggered any time your neighbors move or change state.
```javascript
exaQuark.on("neighbor:updates", <EntityState> => {
  update(<EntityState>) // example function in your app
})
```
**Receiving data**

In some cases the developer want to pass arbitary data around to their neighbors. This can be useful if you're developing games or special interactions within your dimension/universe.

The data is received in the following format

```javascript
exaQuark.on("data", data => console.log(data))
/*
Example data format:
{
  from: <SENDER_IID>,
  dimension: <DIMENSION_ID>, // the dimension your user is in
  data: {
    // data that was sent
  }
}
*/
```



### Sending updates

**Update your neighborhood with your position and state**
```javascript
exaQuark.push('update:state', <EntityState>)
```


**Send some arbitary data directly to your neighborhood**
```javascript
exaQuark.push('data:broadcast', {
  dimension: <DIMENSION_ID>, // the dimension your user is in
  reach: 1, // 1 - 5 delauney
  data: { }
})
```

**Send some arbitary data directly to one or more entity**
```javascript
// this can only reach a user within your current neighborhood
exaquark.push('data:private', {
  dimension: <DIMENSION_ID>, // the dimension your user is in
  iids: [ <ARRAY_OF_RECIPIENT_IIDS> ]
  data: { } // data to be sent
})
```

**Force exaQuark to send you a refreshed list of neighbors**
```javascript
exaQuark.push('ask:neighbors')
```


### Advanced

The SDK manages the lists of neighbors and sends via the `neighbors:x` notifications, however you can attach listeners to the following messages if you want to perform these actions yourself

```javascript
exaQuark.on("neighbours", arr => console.log(arr)) // a full list of neighbors is sent
exaQuark.on("updates", arr => console.log(arr)) // a list of neighbors have been updated
exaQuark.on("removes", arr => console.log(arr)) // a list of neighbours have been removed
```
