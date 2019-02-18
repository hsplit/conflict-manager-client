const express = require('express')

const routes = require('routes')

const router = express.Router()

router.use('/settings', routes.settingsRouter)
router.use('/server', routes.serverRouter)
router.use('/connection', routes.connectionRouter)
router.use('/push', routes.pushRouter)

module.exports = router
