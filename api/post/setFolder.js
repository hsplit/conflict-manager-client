const folderService = require('../../services/folder')

module.exports = (request, response) => {
  const { folder } = request.body
  // TODO: use answer
  const answer = folderService.setFolderPath(folder)
  response.send(`Folder set successfully: ${folder}`)
}
