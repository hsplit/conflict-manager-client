const serverService = srcRequire('services/server')

module.exports = (request, response) => {
  response.json({ ...serverService.getServerApi() })
}
