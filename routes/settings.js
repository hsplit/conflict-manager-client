const express = require('express')

const {
  getDefaultValueFolder,
  getServerApi,
  getMyToken,
  setFolder,
} = require('api').settings

const router = express.Router()

router.route('/getdefaultvaluefolder').get(getDefaultValueFolder)
router.route('/getserverapi').get(getServerApi)
router.route('/getmytoken').get(getMyToken)
router.route('/setfolder').post(jsonParser, setFolder)

module.exports = router
