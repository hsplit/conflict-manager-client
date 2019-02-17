const path = require('path')
const nodegit = require('nodegit')
const _isEqual = require('lodash/isEqual')

const { STATUS_CHECKER_DELAY } = require('core/constants')

const folderService = require('services/folder')
const serverService = require('services/server')

const ERROR = { error: `Can't open repository.` }
const SERVER_ERROR = { error: `Can't connect to server` }

let _storage = {
  myFiles: [],
}

let _running = false

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
const _onError = () => {
  setTimeout(() => {
    _storage = ERROR
    _statusChecker()
  }, STATUS_CHECKER_DELAY)
}

const _statusChecker = () => new Promise(resolve => {
  const folderPath = folderService.getFolderPath()
  const repoError = err => console.log(err) || _onError() || resolve()

  if (folderPath === undefined) {
    _onError()
    resolve()
    return
  }

  nodegit.Repository.open(path.resolve(folderPath, './.git')).then(repo => {
    repo.getStatus().then(statuses => {
      let info = statuses.map(_statusesToObj).filter(el => Object.values(el.statuses).some(Boolean))

      serverService.getConflicts(info).then(data => {
        _storage = { myFiles: info, conflicts: data }
        resolve()
        setTimeout(_statusChecker, STATUS_CHECKER_DELAY)
      }).catch(() => setTimeout(() => {
        _storage = { myFiles: info, conflicts: SERVER_ERROR }
        resolve()
        _statusChecker()
      }, STATUS_CHECKER_DELAY))

    }, repoError)
  }, repoError)
})

const _longPoll = done => {
  let memo = { ..._storage }
  let started = Date.now()
  const dontLetDieRequestTime = 60000

  const pooling = () => {
    if (!_isEqual(memo, _storage) || (Date.now() - started > dontLetDieRequestTime)) {
      done(_storage)
    } else {
      setTimeout(pooling, STATUS_CHECKER_DELAY)
    }
  }
  setTimeout(pooling, STATUS_CHECKER_DELAY)
}

const _run = done => {
  if (!_running) {
    _running = true
    _statusChecker().then(() => done(_storage))
  } else {
    done(_storage)
  }
}

const getMyStatus = (isInit, done) => {
  if (isInit === 'true') {
    _run(done) // A run done done
  } else {
    _longPoll(done)
  }
}

module.exports = {
  getMyStatus,
}
