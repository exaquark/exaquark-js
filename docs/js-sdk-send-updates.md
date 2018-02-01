
# JS SDK


### Sending updates

**Update your neighborhood with your position and state**
```javascript
exaQuark.push('update:state', {{EntityState}})
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
