const path = require('path')
const nodegit = require('nodegit')

const folderService = require('../../services/folder')
const serverService = require('../../services/server')

const LONG_POLL_DELAY = 5000
const ERROR = { error: `Can't open repository.` }
const SERVER_ERROR = { error: `Can't connect to server` }

let firstRequest = true

const filesToGroups = files => {
  let groups = {
    new: [],
    modified: [],
    renamed: [],
    typechange: [],
    ignored: [],
  }

  files.forEach(({ path, statuses }) => {
    switch (true) {
      case statuses.new: groups.new.push(path); break
      case statuses.modified: groups.modified.push(path); break
      case statuses.renamed: groups.renamed.push(path); break
      case statuses.typechange: groups.typechange.push(path); break
      case statuses.ignored: groups.ignored.push(path);
    }
  })

  return groups
}

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

module.exports = (request, response) => {
  const folderPath = folderService.getFolderPath()

  if (folderPath === undefined) { return response.status(500).json(ERROR) }

  nodegit.Repository.open(path.resolve(folderPath, './.git')).then(repo => {
    repo.getStatus().then(statuses => {
      let info = filesToGroups(statuses.map(statusesToObj).filter(el => Object.values(el.statuses).some(Boolean)))
      if (firstRequest) {
        firstRequest = false
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
