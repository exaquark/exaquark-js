# Entity State

The following is a representation of an entity in a dimension. It is the standard format that is sent and received from exaQuark.

Any time you see `{{EntityState}}` in the documentation it is referring to the following format.

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
