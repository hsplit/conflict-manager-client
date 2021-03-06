let ports = [5011, 5111, 5211]
let argv = require('minimist')(process.argv.slice(2))
let port = argv.port || ports[0]
let electron = argv.electron
let dev = argv.dev || ''

const exec = require('child_process').exec
const opn = require('opn')
const getFolderPath = require('services/folder').getFolderPath
const getMyStatus = require('services/ownStatuses').getMyStatus

const startServer = (_port, app) => {
  app.listen(_port, () => {
    console.log(`Start on http://localhost:${_port}/`)
    !electron && opn(`http://localhost:${_port}/`)
    electron && exec(`electron . --api=http://localhost:${_port} --dev=${dev}`, (error, stdout, stderr) => {
      console.log('stdout:', stdout)
      console.log('stderr:', stderr)
      error && console.log('exec error', error)
      })
  }).on('error', err => {
      console.log(err)
      const indexCurrentPort = ports.indexOf(_port)
      const isLastPort = indexCurrentPort === ports.length - 1
      if (!isLastPort ) {
        console.log('Try to change port')
        startServer(ports[indexCurrentPort + 1], app)
      }
    })
}

module.exports = app => {
  if (getFolderPath() !== undefined) {
    getMyStatus('true', () => startServer(port, app))
  } else {
    startServer(port, app)
  }
}
