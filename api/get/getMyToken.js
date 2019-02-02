const ownData = require('../../services/ownData')

module.exports = (request, response) => {
  response.send(ownData.getMyToken())
}
