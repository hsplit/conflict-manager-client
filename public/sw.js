self.addEventListener('push', event => {
  let notificationData = {}

  try {
    notificationData = event.data.json()
  } catch (e) {
    notificationData = {
      title: 'CoMa',
      body: 'Something went wrong, notification is empty.',
      icon: '/push.png'
    }
  }

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      {
        body: notificationData.body,
        icon: notificationData.icon
      }
    )
  )
})

self.addEventListener('notificationclick', event => {
  // close the notification
  event.notification.close()
  // see if the current is open and if it is focus it
  // otherwise open new tab
  event.waitUntil(
    self.clients.matchAll().then(clientList => {
      if (clientList.length > 0) {
        return clientList[0].focus()
      }

      return self.clients.openWindow('/')
    })
  )
})
