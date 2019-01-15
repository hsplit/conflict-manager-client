const os = require('os')

const _userName = os.userInfo().username + '#' + Math.random()

const getUserName = () => _userName

module.exports = {
  getUserName,
}
