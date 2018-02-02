

# JS SDK




### Advanced

The SDK manages the lists of neighbors and sends via the `neighbors:x` notifications, however you can attach listeners to the following messages if you want to perform these actions yourself

```javascript
exaQuark.on("neighbours", arr => console.log(arr)) // a full list of neighbors is sent
exaQuark.on("updates", arr => console.log(arr)) // a list of neighbors have been updated
exaQuark.on("removes", arr => console.log(arr)) // a list of neighbours have been removed
exaQuark.push("neighbors") // force exaQuark to send a fresh list of neighbors
```
