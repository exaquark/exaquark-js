
# JS SDK


### Binding your state

Since your state and location is so important for your neighbours and you want to know what is around you, we provide functionality that will update exaQuark as frequently as required.
All you need to do is provide a function that will return your [Entity State](entity-state.md).

For example:

```javascript
exaQuark.bind(getCurrentState)

// In your app, the getCurrentState will be something like this:

var getCurrentState = function () {
  return myState // where your state should be the same format as the specified in the {{EntityState}} documentation
}
```

### Sending updates


**Update your neighborhood with your position and state**

If you have some updates that you want to make sure have been sent immediately to your neighborhood, you can also call this function. For example, you may want to teleport to a new location and you want to notify exaQuark immediately.
```javascript
exaQuark.push('update:state', {{EntityState}})
```


**Send some arbitary data directly to your neighborhood**
```javascript
exaQuark.push('data:broadcast', {
  dimension: {{DIMENSION_ID}}, // the dimension your user is in
  reach: 1, // 1 - 5 delauney
  data: { }
})
```

**Send some arbitary data directly to one or more entity**
```javascript
// this can only reach a user within your current neighborhood
exaquark.push('data:private', {
  dimension: {{DIMENSION_ID}}, // the dimension your user is in
  iids: [ {{ARRAY_OF_RECIPIENT_IIDS}} ]
  data: { } // data to be sent
})
```
