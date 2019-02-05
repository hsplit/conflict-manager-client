const folderService = srcRequire('services/folder')

module.exports = (request, response) => {
  const { folder } = request.body
  folderService.setFolderPath(folder, response)
}
