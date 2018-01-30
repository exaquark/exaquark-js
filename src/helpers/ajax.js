
export class Ajax {

  static request(method, endPoint, accept, body, timeout, ontimeout, callback){
    if(window.XDomainRequest){
      let req = new XDomainRequest() // IE8, IE9
      this.xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback)
    } else {
      let req = window.XMLHttpRequest ?
                  new XMLHttpRequest() : // IE7+, Firefox, Chrome, Opera, Safari
                  new ActiveXObject("Microsoft.XMLHTTP") // IE6, IE5
      this.xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback)
    }
  }

  static xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback){
    req.timeout = timeout
    req.open(method, endPoint)
    req.onload = () => {
      let response = this.parseJSON(req.responseText)
      callback && callback(response)
    }
    if(ontimeout){ req.ontimeout = ontimeout }

    // Work around bug in IE9 that requires an attached onprogress handler
    req.onprogress = () => {}

    req.send(body)
  }

  static xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback){
    req.timeout = timeout
    req.open(method, endPoint, true)
    req.setRequestHeader("Content-Type", accept)
    req.onerror = () => { callback && callback(null) }
    req.onreadystatechange = () => {
      if(req.readyState === this.states.complete && callback){
        let response = this.parseJSON(req.responseText)
        callback(response)
      }
    }
    if(ontimeout){ req.ontimeout = ontimeout }

    req.send(body)
  }

  static parseJSON(resp){
    return (resp && resp !== "") ?
             JSON.parse(resp) :
             null
  }

  static serialize(obj, parentKey){
    let queryStr = [];
    for(var key in obj){ if(!obj.hasOwnProperty(key)){ continue }
      let paramKey = parentKey ? `${parentKey}[${key}]` : key
      let paramVal = obj[key]
      if(typeof paramVal === "object"){
        queryStr.push(this.serialize(paramVal, paramKey))
      } else {
        queryStr.push(encodeURIComponent(paramKey) + "=" + encodeURIComponent(paramVal))
      }
    }
    return queryStr.join("&")
  }

  static appendParams(url, params){
    if(Object.keys(params).length === 0){ return url }

    let prefix = url.match(/\?/) ? "&" : "?"
    return `${url}${prefix}${this.serialize(params)}`
  }
}

Ajax.states = {complete: 4}

export default Ajax
