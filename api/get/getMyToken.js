const ownData = srcRequire('services/ownData')

module.exports = (request, response) => {
  response.send(ownData.getMyToken())
}
