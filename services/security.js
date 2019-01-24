module.exports = (request, response, next) => {
  // TODO: add secret pass for phone by uid in headers token
  if (request.ip !== '::1' && request.ip !== '::ffff:127.0.0.1') {
    console.log('Blocked request for:', { ip: request.ip, hostname: request.hostname, url: request.url })
    response.status(423).send()
  } else {
    next()
  }
}
