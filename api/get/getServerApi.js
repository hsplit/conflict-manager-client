const serverService = require('../../services/server')

module.exports = (request, response) => {
  response.json({ serverApi: serverService.getServerApi() })
}
