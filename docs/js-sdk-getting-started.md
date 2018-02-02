

# JS SDK


## Installation

```
npm install exaquark-js --save
```



##### Before you begin


Any time you see `{{EntityState}}` in the documentation it is referring to [Entity State](entity-state.md), which is just a JS object with standard required data.

We have used `{{EntityState}}` to make the docs more readable.



## Usage


##### Set up

```javascript
const exaQuarkJs = require('exaquark-js')
var apiKey = 'YOUR_API_KEY' // required
let options = {
  entityId: ENTITY_ID, // required
  universe: UNIVERSE_ID, // optional: defaults to sandbox
  transport: 'WebSocket', // optional: WebSocket | UDP
  logger: (msg, data) => { console.log(msg, data) }, // optional: attach your own logger
}
var iid = null // exaQuark will generate - A user can have multiple instance ID's (eg, one for their phone, one for their AR glasses)
var exaQuark = new exaQuarkJs(apiKey, options)
.then(response => {
  iid = response.iid
})

// Subscribe to the individual neighborhood events - see "Notifications from exaQuark" below
exaQuark.on("neighbor:enter", {{EntityState}} => {
  create({{EntityState}}) // example function in your app
})
exaQuark.on("neighbor:leave", {{EntityState}} => {
  remove({{EntityState}}) // example function in your app
})
exaQuark.on("neighbor:updates", {{EntityState}} => {
  update({{EntityState}}) // example function in your app
})
exaQuark.on("data", data => {
  handleData(data) // example function in your app
})
```


##### Connect to a universe

```javascript
// Connect to the universe!
let initialState = {{EntityState}} // your user's position and state
let neighbors = []
exaQuark.connect(initialState)
.then(neighbors => {
  renderNeighbors(neighbors) // example function in your app
})
.catch("err", err => { console.error(err)})

```


**At any time you can get an up-to-date list of your neighbors**
```javascript
let neighbors = exaQuark.neighbours() // Returns an array of {{EntityState}}
```
