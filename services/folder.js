const path = require('path')
const nodegit = require('nodegit')

let _folderPath

const _getSuccessMessage = () => `Folder set successfully: '${_folderPath}'.`
const _getErrorMessage = err => `Folder set with error: ${err}.\nCurrent folder: '${_folderPath}'.`

const getFolderPath = () => _folderPath

const setFolderPath = (folderPath, response) => {
  console.log('Try to set folderPath', folderPath)
  nodegit.Repository.open(path.resolve(folderPath, './.git')).then(() => {
    _folderPath = folderPath
    console.log(_getSuccessMessage())
    response.send(_getSuccessMessage())
  }, err => response.send(_getErrorMessage(err)))
}

module.exports = {
  getFolderPath,
  setFolderPath
}
