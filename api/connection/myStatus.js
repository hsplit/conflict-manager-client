const ownStatusesService = require('services/ownStatuses')

module.exports = (request, response) => {
  const done = data => response.json(data)
  ownStatusesService.getMyStatus(request.params.isinit, done)
}
