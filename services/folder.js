let folderPath

const getFolderPath = () => folderPath
// TODO: check .git in repo
const setFolderPath = path => folderPath = path

module.exports = {
  getFolderPath,
  setFolderPath
}
