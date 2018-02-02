# Entity State

The following is a representation of an entity in a dimension. It is the standard format that is sent and received from exaQuark.

Any time you see `{{EntityState}}` in the documentation it is referring to the following format.

```javascript
@typedef EntityState::={
  entityId: 'MOCK_ENTITY_ID', // {string} required: their entityId
  iid: 'MOCK_IID', // {string} required: instance ID - each user can have multiple "instances". For example they can be logged in to their browser and their phone at the same time
  dimension: 'MOCK_DIMENSION_ID', // {string} required:  which dimension is the entitiy in
  delaunay: 1, // {number} 1 - 5 - delaunay is the "distance" of your neighbor. It isn't required when sending to exaQuark, however you will receive it in notifications about your neighbors
  geo: {
    lat: 3.11, // {double} required: latitude
    lng: 5.33, // {double} required: longitude
    altitude: 32.1, // {double} optional: altitude in meters - can be negative
    rotation: { 2, 5, 19 } // {Object of doubles} optional: all in degrees. Default facing north
  },
  properties: {
    avatarId: '5678923123', // {string} required: the avatar your user has selected
    sound: true, // {boolean} optional: defaults to true. false === mute
    mic: true, // {boolean} optional: defaults to true. false === muted microphone
    virtualPosition: false, // {boolean} optional: defaults to false. Is this person physically in the position that they are in the digital universe. (true === they are not physically present there)
    entityType: 'HUMAN' // {string} optional: defaults to 'human'. Options: 'HUMAN' | 'BOT' | 'DRONE'
  },
  dimensionState: {
    // developer defined state for their dimension
  }
}
```
