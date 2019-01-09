const path = require('path')
const nodegit = require('nodegit')

let folderPath

const getFolderPath = () => folderPath

const setFolderPath = (_path, response) => {
  console.log('setFolderPath', _path)
  nodegit.Repository.open(path.resolve(_path, './.git')).then(() => {
    folderPath = _path
    response.send(`Folder set successfully: ${folderPath}`)
  }, err => response.send(`Folder set with error: ${err}`))
}

module.exports = {
  getFolderPath,
  setFolderPath
}
