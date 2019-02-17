const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')

const ownData = require('services/ownData')

const { serverApi } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../config.json')))
const API = serverApi || 'http://localhost:5010'
const _port = +API.substr(-4)

const API_REQUESTS = {
  getConflicts: `${API}/client/getconflictsforuser`,
  checkFile: `${API}/client/checkfile`,
  checkFileForDay: `${API}/mongodb/checkfileforday`,
}

const _getPostData = data => ({
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})

const getConflicts = files => fetch(API_REQUESTS.getConflicts, _getPostData({ files, user: ownData.userName }))
  .then(response => response.json())

const checkFile = file => fetch(API_REQUESTS.checkFile, _getPostData(file))
  .then(response => response.json())

const checkFileForDay = file => fetch(API_REQUESTS.checkFileForDay, _getPostData(file))
  .then(response => response.json())

const getServerApi = () =>
  ({ serverApi: API, serverWS: API.replace('http', 'ws').replace(_port, _port + 105), userName: ownData.userName })

module.exports = {
  getConflicts,
  checkFile,
  checkFileForDay,
  getServerApi,
}
