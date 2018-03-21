'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _private = require('./utils/private');

var _helpers = require('./helpers');

var _set = require('./neighbors/set');

var _set2 = _interopRequireDefault(_set);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require('axios');

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
    this.clientStateCallback = function () {
      return {};
    }; // noop
    this.clientStateInterval = null;
    this.conn = null; // this socket connection to exaQuark
    this.entityId = options.entityId;
    this.universe = options.universe;
    this.entryPoint = null;
    this.heartbeat = !options.heartbeat ? 2000 : options.heartbeat; // frequecy that the clientStateCallback will send updates to exaQuark
    this.iid = null;
    this.logger = options.logger || function () {}; // noop
    this.neighborsSet = _set2.default;
    this.params = options.params || {};
    this.state = null; // holds the latest client entityState
    this.peerConnection = {
      enabled: true,
      type: 'WEBRTC',
      stream: null
    };
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
          self.entryPoint = response.sentryPoint; // use secure socket
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
          if (data.entities) this.onRemovesMessage(data.entities);
          break;
        case 'signal':
          this.onSignalMessage(data);
          break;
      }
    }
  }, {
    key: 'onNeighborsMessage',
    value: function onNeighborsMessage(neighbors) {
      var _this3 = this;

      neighbors.forEach(function (n) {
        if (_this3.isSelf(n)) return false;
        if (_this3.neighborsSet.isInSet(n.iid)) _this3.trigger('neighbor:updates', n);else _this3.trigger('neighbor:enter', n);

        var isPeerAuthority = n.iid > _this3.iid;
        _this3.neighborsSet.insertOrUpdateNeighbor(n, isPeerAuthority, _this3.peerConnection.stream);
      });
    }
  }, {
    key: 'onUpdatesMessage',
    value: function onUpdatesMessage(neighbors) {
      var _this4 = this;

      neighbors.forEach(function (n) {
        if (_this4.isSelf(n)) return false;
        if (_this4.neighborsSet.isInSet(n.iid)) _this4.trigger('neighbor:updates', n);else _this4.trigger('neighbor:enter', n);
        var isPeerAuthority = n.iid > _this4.iid;
        _this4.neighborsSet.insertOrUpdateNeighbor(n, isPeerAuthority, _this4.peerConnection.stream);
      });
    }
  }, {
    key: 'onRemovesMessage',
    value: function onRemovesMessage(neighbors) {
      var _this5 = this;

      neighbors.forEach(function (iid) {
        _this5.neighborsSet.removeNeighbor(iid);
        _this5.trigger('neighbor:leave', iid);
      });
    }
  }, {
    key: 'onSignalMessage',
    value: function onSignalMessage(data) {
      this.trigger('signal', data);
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
    key: 'push',
    value: function push(eventName, payload) {
      if (!this.canPush()) {
        return;
      }
      switch (eventName) {
        case 'update:state':
          this.sendState(payload);
          break;
        case 'signal:private':
          this.sendPrivateSignal(payload);
          break;
        case 'signal:broadcast':
          this.sendBroadcastSignal(payload);
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
      return (0, _helpers.dictionaryToArray)(this.neighborsSet.set);
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
    key: 'sendBroadcastSignal',
    value: function sendBroadcastSignal(payload) {
      // log(this.logger, 'sending update', state)
      var signalPayload = {
        method: 'signal:broadcast',
        iid: this.iid,
        universe: this.universe,
        entityId: this.entityId,
        reach: payload.reach,
        signal: payload.signal
      };
      this.conn.send(JSON.stringify(signalPayload));
    }
  }, {
    key: 'sendPrivateSignal',
    value: function sendPrivateSignal(payload) {
      // log(this.logger, 'sending update', state)
      var signalPayload = {
        method: 'signal:private',
        // iid: this.iid,
        // universe: this.universe,
        entities: payload.entities,
        signal: payload.signal
      };
      this.conn.send(JSON.stringify(signalPayload));
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