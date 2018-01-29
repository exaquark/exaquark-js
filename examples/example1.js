var exaquark = require('../lib/exaquark');

let params = {
  userToken: "123"
}
let socket = new Socket("http://163.172.171.14:9999", {
  params: params
})

socket.connect()
