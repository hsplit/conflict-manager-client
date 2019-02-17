const ownData = require('services/ownData')

module.exports = (request, response, next) => {
  if (request.ip === '::1' || request.ip === '::ffff:127.0.0.1' || request.headers.token === ownData.myToken) {
    next()
  } else {
    console.log('Blocked request for:', {
      ip: request.ip,
      hostname: request.hostname,
      url: request.url,
      token: request.headers.token,
    })
    response.status(423).send()
  }
}
