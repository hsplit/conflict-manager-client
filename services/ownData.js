const os = require('os')
const machineIdSync = require('node-machine-id').machineIdSync

const userName = `${os.userInfo().username}(${machineIdSync().slice(-5)})#${Math.random()}`
const myToken = userName.split('#')[1].slice(-5)

module.exports = {
  userName,
  myToken,
}
