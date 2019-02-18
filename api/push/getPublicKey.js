const pushService = require('services/push')

module.exports = (request, response) => {
  const done = data => response.json(data)
  pushService.getPublicKey(done)
}
