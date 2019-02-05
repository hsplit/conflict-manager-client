const folderService = srcRequire('services/folder')

module.exports = (request, response) => {
  response.json({ defaultValue: folderService.getDefaultValueFolder() })
}
