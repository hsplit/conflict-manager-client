const express = require('express')

const {
  subscribe,
  getPublicKey,
} = require('api').push

const router = express.Router()

router.route('/subscribe').post(jsonParser, subscribe)
router.route('/getpublickey').get(getPublicKey)

module.exports = router
