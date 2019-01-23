let ports = [5011, 5111, 5211]
let argv = require('minimist')(process.argv.slice(2))
let port = argv.port || ports[0]

const express = require('express')
const bodyParser = require('body-parser')
const opn = require('opn')

const api = require('./api')

const app = express()
const jsonParser = bodyParser.json()

app.use(express.static(__dirname + '/public'))
app.get('/favicon.ico', (request, response) => response.end(''))

// Get
app.get('/mystatus', api.get.myStatus)
app.get('/checkserverstatus', api.get.checkServerStatus)
app.get('/getdefaultvaluefolder', api.get.getDefaultValueFolder)

// Post
app.post('/setfolder', jsonParser, api.post.setFolder)
app.post('/checkfile', jsonParser, api.post.checkFile)
app.post('/checkfileforday', jsonParser, api.post.checkFileForDay)

// Start
const startServer = _port => {
  app.listen(_port, () => console.log(`Start on http://localhost:${_port}/`) || opn(`http://localhost:${_port}/`))
    .on('error', err => {
      console.log(err)
      if (_port) {
        const indexCurrentPort = ports.indexOf(_port)
        if (indexCurrentPort !== ports.length - 1) {
          console.log('Try to change port')
          startServer(ports[indexCurrentPort + 1])
        }
      }
    })
}

startServer(port)
