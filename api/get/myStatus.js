const path = require('path')
const nodegit = require('nodegit')

const folderService = require('../../services/folder')

module.exports = (request, response) => {
  const folderPath = folderService.getFolderPath()
  nodegit.Repository.open(path.resolve(folderPath, './.git')).then(repo => {
    repo.getStatus().then(statuses => {
      const statusesToObj = status => {
        return {
          path: status.path(),
          statuses: {
            new: !!status.isNew(),
            modified: !!status.isModified(),
            typechange: !!status.isTypechange(),
            renamed: !!status.isRenamed(),
            ignored: !!status.isIgnored(),
          }
        }
      }
      let info = statuses.map(file => statusesToObj(file)).filter(el => Object.values(el.statuses).some(Boolean))
      response.json(info)
    }, err => console.log(err))
  }, err => console.log(err))
}
