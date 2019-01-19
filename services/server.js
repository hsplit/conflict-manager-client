const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')

const ownData = require('./ownData')

const { serverApi } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../config.json')))
const API = serverApi || 'http://localhost:5010'

const API_REQUESTS = {
  getConflicts: `${API}/getconflictsforuser`,
  checkFile: `${API}/checkfile`,
}

const _getPostData = data => ({
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})

const getConflicts = files => fetch(API_REQUESTS.getConflicts, _getPostData({ files, user: ownData.getUserName() }))
  .then(response => response.json())

const checkFile = file => fetch(API_REQUESTS.checkFile, _getPostData(file))
  .then(response => response.json())

module.exports = {
  getConflicts,
  checkFile,
}
