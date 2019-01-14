const fetch = require('node-fetch')
const ownData = require('./ownData')

const API = 'http://localhost:5010'

const API_REQUESTS = {
  getConflicts: `${API}/getconflicts`,
}

const getPostData = data => ({
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})

const getConflicts = files => fetch(API_REQUESTS.getConflicts, getPostData({ files, user: ownData.getUserName() }))
  .then(response => response.json())

module.exports = {
  getConflicts,
}
