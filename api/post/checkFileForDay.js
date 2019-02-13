const serverService = require('services/server')

module.exports = (request, response) => {
  serverService.checkFileForDay(request.body).then(data => response.json(data)).catch(err => console.log(err)
    || response.json({ error: err.message }))
}
