const path = require('path')
const nodegit = require('nodegit')

const folderService = require('../../services/folder')

const LONG_POLL_DELAY = 5000
const ERROR = {
  error: `Can't open repository.`,
}

let firstRequest = true

module.exports = (request, response) => {
  const folderPath = folderService.getFolderPath()

  if (!folderPath) { return response.status(500).json(ERROR) }

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
      if (firstRequest) {
        firstRequest = false
        response.json(info)
      } else {
        setTimeout(() => response.json(info), LONG_POLL_DELAY)
      }
    }, err => console.log(err) || response.json(ERROR))
  }, err => console.log(err) || response.json(ERROR))
}
