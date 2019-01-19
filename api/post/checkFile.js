const serverService = require('../../services/server')

module.exports = (request, response) => {
  serverService.checkFile(request.body).then(data => response.json(data))
}
