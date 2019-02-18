const path = require('path')
const nodegit = require('nodegit')
const fs = require('fs')

let _folderPath

const { defaultValueFolder } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../config.json')))
_folderPath = defaultValueFolder
const getDefaultValueFolder = () => defaultValueFolder || ''

const getSuccessMessage = () => `Folder set successfully: '${_folderPath}'.`
const _getErrorMessage = err => `Folder set with error: ${err}.\nCurrent folder: '${_folderPath}'.`

const getFolderPath = () => _folderPath

const setFolderPath = (folderPath, done) => {
  console.log(`Try to set folderPath: '${folderPath}'.`)
  nodegit.Repository.open(path.resolve(folderPath, './.git')).then(() => {
    _folderPath = folderPath
    console.log(getSuccessMessage())
    done(getSuccessMessage())
  }, err => done(_getErrorMessage(err)))
}

module.exports = {
  getFolderPath,
  setFolderPath,
  getSuccessMessage,
  getDefaultValueFolder,
}
