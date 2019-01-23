const path = require('path')
const nodegit = require('nodegit')
const fs = require('fs')

let _folderPath

const { defaultValueFolder = '' } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../config.json')))
const getDefaultValueFolder = () => defaultValueFolder

const getSuccessMessage = () => `Folder set successfully: '${_folderPath}'.`
const _getErrorMessage = err => `Folder set with error: ${err}.\nCurrent folder: '${_folderPath}'.`

const getFolderPath = () => _folderPath

const setFolderPath = (folderPath, response) => {
  console.log(`Try to set folderPath: '${folderPath}'.`)
  nodegit.Repository.open(path.resolve(folderPath, './.git')).then(() => {
    _folderPath = folderPath
    console.log(getSuccessMessage())
    response.send(getSuccessMessage())
  }, err => response.send(_getErrorMessage(err)))
}

module.exports = {
  getFolderPath,
  setFolderPath,
  getSuccessMessage,
  getDefaultValueFolder,
}
