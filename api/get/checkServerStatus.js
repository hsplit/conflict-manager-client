const folderService = require('../../services/folder')

module.exports = (request, response) => {
  const folderPath = folderService.getFolderPath()
  response.json({ folderPath: folderPath === undefined ? false : folderService.getSuccessMessage() })
}
