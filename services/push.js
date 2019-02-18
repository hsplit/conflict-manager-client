const fs = require('fs')
const webPush = require('web-push')

const KEYS = {}

try {
  const { publicKey, privateKey } = JSON.parse(fs.readFileSync('./notifications.json'))
  KEYS.publicKey = publicKey
  KEYS.privateKey = privateKey
} catch (err) {
  console.log('keys for notifications generated')
  const vapidKeys = webPush.generateVAPIDKeys()
  KEYS.publicKey = vapidKeys.publicKey
  KEYS.privateKey = vapidKeys.privateKey
  fs.writeFileSync('notifications.json', JSON.stringify({
    publicKey: vapidKeys.publicKey,
    privateKey: vapidKeys.privateKey,
  }))
}

webPush.setVapidDetails('mailto:not@today.myfriend', KEYS.publicKey, KEYS.privateKey)

let _subscription

const _options = {
  TTL: 3600,
}

const _getPayload = ({ title, body }) => JSON.stringify({
  title,
  body,
  icon: '/push.png',
})

const subscribe = (subscription, done) => {
  let shouldSendInit = !_subscription
  _subscription = subscription

  let payload = _getPayload({ title: 'Welcome to CoMa', body: 'Conflict Manager notifications enabled' })

  shouldSendInit && _subscription && webPush.sendNotification(_subscription, payload, _options)
    .then(() => console.log('notifications subscribed') || done(200))
    .catch(err => console.error('can\'t send notification on subscribe', err) || done(500))
}

const pushNotification = () => {
  let payload = _getPayload({ title: 'Info updated', body: `Conflicts changed (${new Date().toLocaleTimeString()})` })
  _subscription && webPush.sendNotification(_subscription, payload, _options)
    .catch(err => console.error('can\'t push', err))
}

const getPublicKey = done => done({ publicKey: KEYS.publicKey })

module.exports = {
  subscribe,
  getPublicKey,
  pushNotification,
}
