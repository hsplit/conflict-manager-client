const os = require('os')

const _userName = os.userInfo().username + '#' + Math.random()

const getUserName = () => _userName
const getMyToken = () => _userName.split('#')[1].slice(-5)

module.exports = {
  getUserName,
  getMyToken,
}
