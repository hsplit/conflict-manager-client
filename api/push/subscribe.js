const pushService = require('services/push')

module.exports = (request, response) => {
  const done = status => response.status(status).send('push-push')
  pushService.subscribe(request.body, done)
}
