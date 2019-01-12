const path = require('path')
const nodegit = require('nodegit')

let folderPath

const _getSuccessMessage = () => `Folder set successfully: ${folderPath}`
const _getErrorMessage = err => `Folder set with error: ${err}`

const getFolderPath = () => folderPath

const setFolderPath = (_path, response) => {
  console.log('try to setFolderPath', _path)
  nodegit.Repository.open(path.resolve(_path, './.git')).then(() => {
    folderPath = _path
    console.log(_getSuccessMessage())
    response.send(_getSuccessMessage())
  }, err => response.send(_getErrorMessage(err)))
}

module.exports = {
  getFolderPath,
  setFolderPath
}
