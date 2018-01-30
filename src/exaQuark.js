import { log, getRequest } from './helpers/private.js'
const WebSocket = (typeof window !== 'undefined' && window.WebSocket)
  ? window.WebSocket
  : require('websocket').w3cwebsocket

/**
 * Represents an exaQuark instance
 * @constructor
 * @param {string} entryPoint - The URL of your exaQuark universe.
 * @param {string} apiKey - Your authentication key
 * @param {Object} options - @TODO
 */
export default class exaQuark {
  constructor(entryPoint, apiKey, options = {}){
    this.transport = WebSocket
    this.logger = options.logger || function(){} // noop
    this.params = options.params || {}
    this.iid =
    this.entryPoint = `${entryPoint}`
    this.bindings = []
  }


  /**
   * Initializes the websocket connection to exaquark
   */
  connect(payload) {
    if(this.conn) { return } // connection has already been established
    getRequest(this.entryPoint)
      .then(response => {
        // generate iid - unique instance for this socket
        payload.iid = aksjdhk
        let socketUrl = response.url + encodeURIComponent(payload)
        this.conn = new this.transport(response.url)
        this.conn.onopen = data => this.onConnOpen(data)
        this.conn.onerror = error => this.onConnError(error)
        this.conn.onmessage = event => this.onConnMessage(event)
        this.conn.onclose = event => this.onConnClose(event)
      })
      .catch(err => {
        console.log('err', err)
      })
  }

  /**
   * Disconnects from exaquark
   */
  disconnect(callback, code, reason) {

  }

  /**
   * Bind an event to the socket.
   * @example
   * exaQuark.on("neighbors", msg => console.log("Got list of neighbors", msg) )
   * @example
   * exaQuark.on("updates", msg => console.log("Got updates from neighbors", msg) )
   * @example
   * exaQuark.on("removes", msg => console.log("Got list of neighbors to who have left", msg) )
   */
  on (event, callback) {
    this.bindings.push({event, callback})
  }

  /**
   * Disconnect a binding
   * @example
   * exaQuark.off("neighbors")
   */
  off(event){
    this.bindings = this.bindings.filter( bind => bind.event !== event )
  }

  /**
   * Push an update
   * @example
   * exaQuark.off("neighbors")
   */
  push(event, payload){
    if(!this.joinedOnce) throw(`tried to push '${event}' to '${this.topic}' before joining. Use channel.join() before pushing events`)
    let pushEvent = new Push(this, event, payload)
    if(this.canPush()){
      pushEvent.send()
    } else {
      this.pushBuffer.push(pushEvent)
    }
    return pushEvent
  }

  onConnOpen(data){
    log(this.logger, "onConnOpen", data)
  }

  onConnError(error){
    log(this.logger, "onConnError", error)
  }

  onConnClose(event){
    log(this.logger, "onConnClose", event)
  }

  onConnMessage(rawMessage) {
    log(this.logger, "onConnMessage", rawMessage)
    let msg = JSON.parse(rawMessage.data)
    // let {topic, event, payload, ref} = msg
    // this.bindings
    //   .filter(bind => bind.event === triggerEvent)
    //   .map( bind => bind.callback(payload, ref) )
  }

  canPush() {
    return this.socket.isConnected() && this.state === CHANNEL_STATES.joined
  }

  // onNeighborsMessage (payload) {
  //   console.log('payload', payload)
  // }
  //
  // onUpdatesMessage (payload) {
  //   console.log('payload', payload)
  // }
  //
  // onRemovesMessage (payload) {
  //   console.log('payload', payload)
  // }


}
