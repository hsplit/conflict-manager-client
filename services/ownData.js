const os = require('os')

const userName = os.userInfo().username + '#' + Math.random()

const getUserName = () => userName

module.exports = {
  getUserName,
}
