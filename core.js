'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _private = require('./utils/private');

var _helpers = require('./helpers');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require('axios');

// const loadJSONP = (() => {
//   let unique = 0
//   return (url, callback, context) => {
//     // INIT
//     let name = '_jsonp_' + unique++
//     if (url.match(/\?/)) url += '&callback=' + name
//     else url += '?callback=' + name
//
//     // Create script
//     let script = document.createElement('script')
//     script.type = 'text/javascript'
//     script.src = url
//
//     // Setup handler
//     window[name] = data => {
//       callback.call((context || window), data)
//       document.getElementsByTagName('head')[0].removeChild(script)
//       script = null
//       delete window[name]
//     }
//
//     // Load JSON
//     document.getElementsByTagName('head')[0].appendChild(script)
//   }
// })()

/**
 * Represents an exaQuark instance
 * @constructor
 * @param {string} entryPoint - The URL of your exaQuark universe.
 * @param {string} apiKey - Your authentication key
 * @param {Object} options - @TODO
 */

var exaQuark = function () {
  function exaQuark(allocatorUrl, apiKey) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, exaQuark);

    this.allocatorUrl = '' + allocatorUrl;
    this.apiKey = '' + apiKey;
    this.bindings = [];
    this.clientStateCallback = function () {}; // noop
    this.clientStateInterval = null;
    this.conn = null; // this socket connection to exaQuark
    this.entityId = options.entityId;
    this.entryPoint = null;
    this.heartbeat = !options.heartbeat ? 2000 : options.heartbeat; // frequecy that the clientStateCallback will send updates to exaQuark
    this.iid = null;
    this.logger = options.logger || function () {}; // noop
    this.neighborList = [];
    this.neighborHash = {};
    this.params = options.params || {};
    this.state = null; // holds the latest client entityState

    // this.heartbeatTimer       = null
    // this.pendingHeartbeatRef  = null
    // this.reconnectTimer       = new Timer(() => {
    //   this.disconnect(() => this.connect())
    // }, this.reconnectAfterMs)
  }

  /**
   * Initializes the websocket connection to exaquark
   */


  _createClass(exaQuark, [{
    key: 'connect',
    value: function connect(payload) {
      var _this = this;

      if (this.conn) {
        return;
      }

      return new Promise(function (resolve, reject) {
        var self = _this;
        axios.get(_this.allocatorUrl).then(function (res) {
          var response = res.data;
          self.entryPoint = response.entryPoint;
          self.iid = response.iid;

          var initialState = self.deepClone(payload);
          initialState.iid = self.iid;
          self.state = initialState;

          var encodedState = encodeURIComponent(JSON.stringify(initialState));
          self.conn = new WebSocket(self.entryPoint + '?state=' + encodedState); // eslint-disable-line
          self.conn.onopen = function (data) {
            return self.onConnOpen(data);
          };
          self.conn.onerror = function (error) {
            return self.onConnError(error);
          };
          self.conn.onmessage = function (event) {
            return self.onConnMessage(event);
          };
          self.conn.onclose = function (event) {
            return self.onConnClose(event);
          };

          return resolve({
            iid: self.iid
          });
        }).catch(function (error) {
          reject(error);
        });
      });
    }

    /**
     * Disconnects from exaquark
     */

  }, {
    key: 'disconnect',
    value: function disconnect(callback, code, reason) {
      this.conn.close();
    }

    /**
     * Bind an event to the socket.
     * @example
     * exaQuark.on('neighbors', msg => console.log('Got list of neighbors', msg) )
     * @example
     * exaQuark.on('updates', msg => console.log('Got updates from neighbors', msg) )
     * @example
     * exaQuark.on('removes', msg => console.log('Got list of neighbors to who have left', msg) )
     */

  }, {
    key: 'on',
    value: function on(event, callback) {
      this.bindings.push({ event: event, callback: callback });
    }

    /**
     * Disconnect a binding
     * @example
     * exaQuark.off('neighbors')
     */

  }, {
    key: 'off',
    value: function off(event) {
      this.bindings = this.bindings.filter(function (bind) {
        return bind.event !== event;
      });
    }
  }, {
    key: 'bind',
    value: function bind(clientFunction) {
      this.clientStateCallback = clientFunction;
    }
  }, {
    key: 'onConnOpen',
    value: function onConnOpen(data) {
      var _this2 = this;

      (0, _private.log)(this.logger, 'onConnOpen', data);
      this.clientStateInterval = setInterval(function () {
        _this2.getClientState();
      }, this.heartbeat);
    }
  }, {
    key: 'onConnError',
    value: function onConnError(error) {
      (0, _private.log)(this.logger, 'onConnError', error);
    }
  }, {
    key: 'onConnClose',
    value: function onConnClose(event) {
      (0, _private.log)(this.logger, 'onConnClose', event);
      this.disconnect();
      clearInterval(this.clientStateInterval);
    }
  }, {
    key: 'onConnMessage',
    value: function onConnMessage(rawMessage) {
      (0, _private.log)(this.logger, 'onConnMessage', rawMessage);
      var data = JSON.parse(rawMessage.data);
      switch (data.method) {
        case 'neighbors':
          // list of neighbors
          if (data.neighbors) this.onNeighborsMessage(data.neighbors);
          break;
        case 'updates':
          // moved etc
          if (data.neighbors) this.onUpdatesMessage(data.neighbors);
          break;
        case 'removes':
          // leaving neighborhood
          if (data.neighbors) this.onRemovesMessage(data.neighbors);
          break;
      }
    }
  }, {
    key: 'onNeighborsMessage',
    value: function onNeighborsMessage(neighbors) {
      var _this3 = this;

      if (Object.keys(this.neighborHash).length === 0) neighbors.forEach(function (n) {
        _this3.addNeighbor(n);
      });else {
        var oldNeighbors = this.deepClone(this.neighborHash);
        neighbors.forEach(function (n) {
          // check for new neighbors
          if (!_this3.isSelf(n)) {
            if (!(n.iid in oldNeighbors) && !_this3.isSelf(n)) _this3.addNeighbor(n);else _this3.updateNeighbor(n);
          }
        });
        for (var n in oldNeighbors) {
          // check for leavers
          if (!this.isSelf(n) && !this.neighborHash[n]) this.removeNeighbor(oldNeighbors[n]);
        }
      }
    }
  }, {
    key: 'onUpdatesMessage',
    value: function onUpdatesMessage(neighbors) {
      var _this4 = this;

      neighbors.forEach(function (n) {
        if (!_this4.isSelf(n)) {
          if (typeof _this4.neighborHash[n.iid] === 'undefined') _this4.addNeighbor(n);else _this4.updateNeighbor(n);
        }
      });
    }
  }, {
    key: 'onRemovesMessage',
    value: function onRemovesMessage(neighbors) {
      var _this5 = this;

      neighbors.forEach(function (n) {
        _this5.removeNeighbor(n);
      });
    }
  }, {
    key: 'trigger',
    value: function trigger(triggerEvent, payload, ref) {
      this.bindings.filter(function (bind) {
        return bind.event === triggerEvent;
      }).map(function (bind) {
        return bind.callback(payload, ref);
      });
    }
  }, {
    key: 'isSelf',
    value: function isSelf(entity) {
      return entity.iid === this.iid;
    }
  }, {
    key: 'addNeighbor',
    value: function addNeighbor(n) {
      this.neighborHash[n.iid] = n;
      this.trigger('neighbor:enter', n);
    }
  }, {
    key: 'updateNeighbor',
    value: function updateNeighbor(n) {
      this.neighborHash[n.iid] = n;
      this.trigger('neighbor:updates', n);
    }
  }, {
    key: 'removeNeighbor',
    value: function removeNeighbor(n) {
      delete this.neighborHash[n.iid];
      this.trigger('neighbor:leave', n);
    }
  }, {
    key: 'push',
    value: function push(eventName, payload) {
      if (!this.canPush()) {
        return;
      }
      switch (eventName) {
        case 'update:state':
          this.sendState(payload);
          break;
        case 'ask:neighbors':
          this.askForNeighbors();
          break;
        default:
          (0, _private.log)(this.logger, 'Unkown Command', eventName);
          return 'UNKNOWN_COMMAND';
      }
    }
  }, {
    key: 'canPush',
    value: function canPush() {
      return !!this.conn && this.conn.readyState === this.conn.OPEN;
    }
  }, {
    key: 'neighbors',
    value: function neighbors(format) {
      return (0, _helpers.dictionaryToArray)(this.neighborHash);
    }
  }, {
    key: 'deepClone',
    value: function deepClone(object) {
      return JSON.parse(JSON.stringify(object));
    }
  }, {
    key: 'getClientState',
    value: function getClientState() {
      if (!this.clientStateCallback) {
        return;
      }
      var newState = this.deepClone(this.clientStateCallback());
      this.sendState(newState);
    }
  }, {
    key: 'sendState',
    value: function sendState(state) {
      this.state = state;
      // log(this.logger, 'sending update', state)
      var payload = {
        method: 'update',
        state: state
      };
      payload.state.iid = this.iid;
      this.conn.send(JSON.stringify(payload));
    }
  }, {
    key: 'askForNeighbors',
    value: function askForNeighbors() {
      if (!this.canPush()) {
        return;
      }
      var payload = {
        method: 'ask:neighbor',
        iid: this.iid,
        entityId: this.entityId
      };
      this.conn.send(JSON.stringify(payload));
    }
  }]);

  return exaQuark;
}();

exports.default = exaQuark;
module.exports = exports['default'];