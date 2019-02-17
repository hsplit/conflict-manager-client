const express = require('express')

const {
  checkFile,
  checkFileForDay,
} = require('api').server

const router = express.Router()

router.route('/checkfile').post(jsonParser, checkFile)
router.route('/checkfileforday').post(jsonParser, checkFileForDay)

module.exports = router
