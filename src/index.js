import { log, dictionaryToArray, arrayToDictionary } from './utils/private'
import { distanceOnSphere } from './utils/distance'

const loadJSONP = (() => {
  let unique = 0
  return (url, callback, context) => {
    // INIT
    let name = '_jsonp_' + unique++
    if (url.match(/\?/)) url += '&callback=' + name
    else url += '?callback=' + name

    // Create script
    let script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = url

    // Setup handler
    window[name] = data => {
      callback.call((context || window), data)
      document.getElementsByTagName('head')[0].removeChild(script)
      script = null
      delete window[name]
    }

    // Load JSON
    document.getElementsByTagName('head')[0].appendChild(script)
  }
})()

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
    this.clientStateCallback = function () {} // noop
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
    this.state = null // holds the latest client state

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
      loadJSONP(this.allocatorUrl, response => {
        this.entryPoint = response.entryPoint
        this.iid = response.iid

        let initialState = this.deepClone(payload)
        initialState.iid = this.iid
        this.state = initialState

        let encodedState = encodeURIComponent(JSON.stringify(initialState))
        this.conn = new WebSocket(`${this.entryPoint}?state=${encodedState}`) // eslint-disable-line
        this.conn.onopen = data => this.onConnOpen(data)
        this.conn.onerror = error => this.onConnError(error)
        this.conn.onmessage = event => this.onConnMessage(event)
        this.conn.onclose = event => this.onConnClose(event)

        return resolve({
          iid: this.iid
        })
      })
    })
  }

  /**
   * Disconnects from exaquark
   */
  disconnect (callback, code, reason) {

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
        if (data.neighbors) this.onRemovesMessage(data.neighbors)
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
  removeNeighbor (n) {
    this.trigger('neighbor:remove', n)
    delete this.neighborHash[n.iid]
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
    if (format && format === 'Array') return dictionaryToArray(this.neighborHash)
    else return this.neighborHash
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
    let payload = {
      method: 'ask:neighbor',
      iid: this.iid,
      entityId: this.entityId
    }
    this.conn.send(JSON.stringify(payload))
  }

  /**
  * Returns the distance between two entities
  * @param {string} [options.units] - the unit of measurement. Defaults to meters
  */
  getDistanceBetweenEntities (entityOne, entityTwo, options) {
    return distanceOnSphere(entityOne.geo.lat, entityOne.geo.lng, entityTwo.geo.lat, entityTwo.geo.lng)
  }

  /**
  * Gets a list of neighbors within a specified distance
  * @param {number} distance
  * @param {string} [options.listType] - the list format to return. Defaults to Dictionary. Options: "Array" | "Dict"
  * @param {string} [options.units] - the unit of measurement. Defaults to meters
  */
  getNeighborsByMaxDistance (distance, options = {}) {
    let filteredList = dictionaryToArray(this.neighborHash)
      .filter(x => distance >= distanceOnSphere(this.state.geo.lat, this.state.geo.lng, x.geo.lat, x.geo.lng))

    if (options.listType === 'Array') return filteredList
    else return arrayToDictionary(filteredList)
  }
}
export default exaQuark
