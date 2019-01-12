let port = !isNaN(+process.argv[2]) ? +process.argv[2] : 5011

const express = require('express')
const bodyParser = require('body-parser')
const opn = require('opn')

const api = require('./api')

const app = express()
const jsonParser = bodyParser.json()

app.use(express.static(__dirname + '/public'))
app.get('/favicon.ico', (request, response) => response.end(''))

app.get('/mystatus', api.get.myStatus)

app.post('/setfolder', jsonParser, api.post.setFolder)

app.listen(port, () => console.log(`start on http://localhost:${port}/`) || opn(`http://localhost:${port}/`))
