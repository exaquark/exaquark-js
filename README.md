# exaQuark JS

JS library for connecting to exaquark.com

### Getting started

```javascript
npm install --save exaquark-js
```

### Documentation

See full docs at [https://docs.exaquark.io/](https://docs.exaquark.io/)



## Internals

#### Commands

- `npm run clean` - Remove `lib/` directory
- `npm test` - Run tests. Tests can be written with ES6 (WOW!)
- `npm test:watch` - You can even re-run tests on file changes!
- `npm run cover` - Yes. You can even cover ES6 code.
- `npm run lint` - We recommend using [airbnb-config](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb). It's fantastic.
- `npm run test:examples` - We recommend writing examples on pure JS for better understanding module usage.
- `npm run build` - Do some magic with ES6 to create ES5 code.
- `npm run prepublish` - Hook for npm. Do all the checks before publishing you module.


#### Demo

You can see a demo of the library in action in `demo`. See `demo/README.md` for instructions.

## ChangeLog

##### 1.0.14

- Migrating to axios for better ReactNative support

##### 1.0.13

- Updateing index.js to core.js for main functionality

##### 1.0.11

- Chaning package.json to include root files

##### 1.0.11

- Setting entry point to root folder

##### 1.0.10

- Changing native XMLHttpRequest to xhr

##### 1.0.9

- Changing JSONP to AJAX for allocator
- Moving code from `lib` to root folder

##### 1.0.8

- Adding changes for customState

##### 1.0.7

- Added `getDistanceBetweenEntities()` & `getNeighborsByMaxDistance()`
