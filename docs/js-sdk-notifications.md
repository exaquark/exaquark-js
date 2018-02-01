
# JS SDK



### Notifications from exaQuark

You will receive a array of `{{EntityState}}` for all of the following subscriptions.


**Entity enters neighborhood**

Subscribe to new neigbours. This will be triggered any time a neighbor appears in your neighborhood.
```javascript
exaQuark.on("neighbor:enter", {{EntityState}} => {
  create({{EntityState}}) // example function in your app
})
```

**Entity leaves your neighborhood**

Subscribe to neigbours leaving. This will be triggered any time a neighbor leaves in your neighborhood or goes offline.
```javascript
exaQuark.on("neighbor:leave", {{EntityState}} => {
  remove({{EntityState}}) // example function in your app
})
```

**Entity updates their position or state**

This will be triggered any time your neighbors move or change state.
```javascript
exaQuark.on("neighbor:updates", {{EntityState}} => {
  update({{EntityState}}) // example function in your app
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
