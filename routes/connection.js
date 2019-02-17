const express = require('express')

const {
  checkServerStatus,
  myStatus,
} = require('api').connection

const router = express.Router()

router.route('/mystatus/:isinit').get(myStatus)
router.route('/checkserverstatus').get(checkServerStatus)

module.exports = router
