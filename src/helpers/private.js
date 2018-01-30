var XMLHttpRequest = XMLHttpRequest || require("xmlhttprequest").XMLHttpRequest
XMLHttpRequest.DONE = 4

// Logs the message. Override `this.logger` for specialized logging. noops by default
export function log(logger, msg, data){
  logger(msg, data)
}

export function getRequest(endpoint) {
  return new Promise((resolve, reject) => {
    var xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
        if (xmlhttp.status == 200) {
          let data = JSON.parse(xmlhttp.responseText)
          return resolve(data)
        }
        else return reject(xmlhttp)
      }
    }
    xmlhttp.open("GET", endpoint, true);
    xmlhttp.send()
  })

}
