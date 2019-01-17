const path = require('path')
const nodegit = require('nodegit')

const { LONG_POLL_DELAY } = require('../../constants')

const folderService = require('../../services/folder')
const serverService = require('../../services/server')

const ERROR = { error: `Can't open repository.` }
const SERVER_ERROR = { error: `Can't connect to server` }

let _firstRequest = true

const _statusesToObj = status => {
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

module.exports = (request, response) => {
  const folderPath = folderService.getFolderPath()

  if (folderPath === undefined) { return response.status(500).json(ERROR) }

  nodegit.Repository.open(path.resolve(folderPath, './.git')).then(repo => {
    repo.getStatus().then(statuses => {
      let info = statuses.map(_statusesToObj).filter(el => Object.values(el.statuses).some(Boolean))
      if (_firstRequest) {
        _firstRequest = false
        serverService.getConflicts(info).then(data => {
          response.json({ myFiles: info, conflicts: data })
        }).catch(() => response.json({ myFiles: info, conflicts: SERVER_ERROR }))
      } else {
        serverService.getConflicts(info).then(data => {
          setTimeout(() => response.json({ myFiles: info, conflicts: data }), LONG_POLL_DELAY)
        }).catch(() => setTimeout(() => response.json({ myFiles: info, conflicts: SERVER_ERROR }), LONG_POLL_DELAY))
      }
    }, err => console.log(err) || response.json(ERROR))
  }, err => console.log(err) || response.json(ERROR))
}
