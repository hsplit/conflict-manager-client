const folderService = require('services/folder')

module.exports = (request, response) => {
  const { folder } = request.body
  const done = res => response.send(res)
  folderService.setFolderPath(folder, done)
}
