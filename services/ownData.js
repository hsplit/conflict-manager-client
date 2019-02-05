const os = require('os')
const machineIdSync = require('node-machine-id').machineIdSync
console.log(machineIdSync())

const _userName = `${os.userInfo().username}(${machineIdSync().slice(-5)})#${Math.random()}`

const getUserName = () => _userName
const getMyToken = () => _userName.split('#')[1].slice(-5)

module.exports = {
  getUserName,
  getMyToken,
}
