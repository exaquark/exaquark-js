import { log } from './utils/private'
import { dictionaryToArray } from './helpers'
const axios = require('axios')

/**
 * Represents an exaQuark instance
 * @constructor
 * @param {string} entryPoint - The URL of your exaQuark universe.
 * @param {string} apiKey - Your authentication key
 * @param {Object} options - @TODO
 */
class exaQuark {
  constructor (allocatorUrl, apiKey, options = {}) {
    this.allocatorUrl = `${allocatorUrl}`
    this.apiKey = `${apiKey}`
    this.bindings = []
    this.clientStateCallback = function () { return {} } // noop
    this.clientStateInterval = null
    this.conn = null // this socket connection to exaQuark
    this.entityId = options.entityId
    this.entryPoint = null
    this.heartbeat = !(options.heartbeat) ? 2000 : options.heartbeat // frequecy that the clientStateCallback will send updates to exaQuark
    this.iid = null
    this.logger = options.logger || function () {} // noop
    this.neighborList = []
    this.neighborHash = {}
    this.params = options.params || {}
    this.state = null // holds the latest client entityState

    // this.heartbeatTimer       = null
    // this.pendingHeartbeatRef  = null
    // this.reconnectTimer       = new Timer(() => {
    //   this.disconnect(() => this.connect())
    // }, this.reconnectAfterMs)
  }

  /**
   * Initializes the websocket connection to exaquark
   */
  connect (payload) {
    if (this.conn) { return }

    return new Promise((resolve, reject) => {
      var self = this
      axios.get(this.allocatorUrl)
      .then(function (res) {
        let response = res.data
        self.entryPoint = response.sentryPoint // use secure socket
        self.iid = response.iid

        let initialState = self.deepClone(payload)
        initialState.iid = self.iid
        self.state = initialState

        let encodedState = encodeURIComponent(JSON.stringify(initialState))
        self.conn = new WebSocket(`${self.entryPoint}?state=${encodedState}`) // eslint-disable-line
        self.conn.onopen = data => self.onConnOpen(data)
        self.conn.onerror = error => self.onConnError(error)
        self.conn.onmessage = event => self.onConnMessage(event)
        self.conn.onclose = event => self.onConnClose(event)

        return resolve({
          iid: self.iid
        })
      })
      .catch(function (error) {
        reject(error)
      })
    })
  }

  /**
   * Disconnects from exaquark
   */
  disconnect (callback, code, reason) {
    this.conn.close()
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
  on (event, callback) {
    this.bindings.push({event, callback})
  }

  /**
   * Disconnect a binding
   * @example
   * exaQuark.off('neighbors')
   */
  off (event) {
    this.bindings = this.bindings.filter(bind => bind.event !== event)
  }
  bind (clientFunction) {
    this.clientStateCallback = clientFunction
  }
  onConnOpen (data) {
    log(this.logger, 'onConnOpen', data)
    this.clientStateInterval = setInterval(() => {
      this.getClientState()
    }, this.heartbeat)
  }
  onConnError (error) {
    log(this.logger, 'onConnError', error)
  }
  onConnClose (event) {
    log(this.logger, 'onConnClose', event)
    this.disconnect()
    clearInterval(this.clientStateInterval)
  }
  onConnMessage (rawMessage) {
    log(this.logger, 'onConnMessage', rawMessage)
    let data = JSON.parse(rawMessage.data)
    switch (data.method) {
      case 'neighbors': // list of neighbors
        if (data.neighbors) this.onNeighborsMessage(data.neighbors)
        break
      case 'updates': // moved etc
        if (data.neighbors) this.onUpdatesMessage(data.neighbors)
        break
      case 'removes': // leaving neighborhood
        if (data.entities) this.onRemovesMessage(data.entities)
        break
    }
  }
  onNeighborsMessage (neighbors) {
    if (Object.keys(this.neighborHash).length === 0) neighbors.forEach(n => { this.addNeighbor(n) })
    else {
      let oldNeighbors = this.deepClone(this.neighborHash)
      neighbors.forEach(n => { // check for new neighbors
        if (!this.isSelf(n)) {
          if (!(n.iid in oldNeighbors) && !this.isSelf(n)) this.addNeighbor(n)
          else this.updateNeighbor(n)
        }
      })
      for (var n in oldNeighbors) { // check for leavers
        if (!this.isSelf(n) && !(this.neighborHash[n])) this.removeNeighbor(oldNeighbors[n])
      }
    }
  }
  onUpdatesMessage (neighbors) {
    neighbors.forEach(n => {
      if (!this.isSelf(n)) {
        if (typeof this.neighborHash[n.iid] === 'undefined') this.addNeighbor(n)
        else this.updateNeighbor(n)
      }
    })
  }
  onRemovesMessage (neighbors) {
    neighbors.forEach(n => { this.removeNeighbor(n) })
  }
  trigger (triggerEvent, payload, ref) {
    this.bindings
      .filter(bind => bind.event === triggerEvent)
      .map(bind => bind.callback(payload, ref))
  }
  isSelf (entity) {
    return entity.iid === this.iid
  }
  addNeighbor (n) {
    this.trigger('neighbor:enter', n)
    this.neighborHash[n.iid] = n
  }
  updateNeighbor (n) {
    this.trigger('neighbor:updates', n)
    this.neighborHash[n.iid] = n
  }
  removeNeighbor (iid) {
    this.trigger('neighbor:leave', iid)
    delete this.neighborHash[iid]
  }
  push (eventName, payload) {
    if (!this.canPush()) { return }
    switch (eventName) {
      case 'update:state':
        this.sendState(payload)
        break
      case 'ask:neighbors':
        this.askForNeighbors()
        break
      default:
        log(this.logger, 'Unkown Command', eventName)
        return 'UNKNOWN_COMMAND'
    }
  }
  canPush () {
    return !!this.conn && (this.conn.readyState === this.conn.OPEN)
  }
  neighbors (format) {
    return dictionaryToArray(this.neighborHash)
  }
  deepClone (object) {
    return JSON.parse(JSON.stringify(object))
  }
  getClientState () {
    if (!this.clientStateCallback) { return }
    let newState = this.deepClone(this.clientStateCallback())
    this.sendState(newState)
  }
  sendState (state) {
    this.state = state
    // log(this.logger, 'sending update', state)
    let payload = {
      method: 'update',
      state: state
    }
    payload.state.iid = this.iid
    this.conn.send(JSON.stringify(payload))
  }
  askForNeighbors () {
    if (!this.canPush()) { return }
    let payload = {
      method: 'ask:neighbor',
      iid: this.iid,
      entityId: this.entityId
    }
    this.conn.send(JSON.stringify(payload))
  }
}
export default exaQuark
