const API = window.origin || 'http://localhost:5011'
const API_ROUTES = {
  settings: `${API}/settings`,
  connection: `${API}/connection`,
  server: `${API}/server`,
}
const API_REQUESTS = {
  setFolder: `${API_ROUTES.settings}/setfolder`,
  getDefaultValueFolder: `${API_ROUTES.settings}/getdefaultvaluefolder`,
  getServerApi: `${API_ROUTES.settings}/getserverapi`,
  getMyToken: `${API_ROUTES.settings}/getmytoken`,

  checkServerStatus: `${API_ROUTES.connection}/checkserverstatus`,
  myStatus: `${API_ROUTES.connection}/mystatus`,

  checkFile: `${API_ROUTES.server}/checkfile`,
  checkFileForDay: `${API_ROUTES.server}/checkfileforday`,
}

// Common
const getCurrentDate = () => {
  let currentDate = new Date()
  const getTimePart = method => currentDate[method]().toString().padStart(2, '0')
  const getDatePart = (method, i) => (currentDate[method]() + i % 2).toString().padStart(4 - (i ? 2 : 0), '0')
  return {
    date: ['getFullYear', 'getMonth', 'getDate'].map(getDatePart).join('-'),
    time: ['getHours', 'getMinutes', 'getSeconds'].map(getTimePart).join(':'),
  }
}

const getPostData = data => ({
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
})

const getStatusesGroupsHTML = files => {
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

  const groups = filesToGroups(files)

  const getHTMLString = (key, data) => data.length ? `<div><b>${key}:</b><p>` + data.join('<br>') + '</p></div>' : ''
  const newHTML = getHTMLString('New', groups.new)
  const modifiedHTML = getHTMLString('Modified', groups.modified)
  const renamedHTML = getHTMLString('Renamed', groups.renamed)
  const typechangeHTML = getHTMLString('Typechange', groups.typechange)
  const ignoredHTML = getHTMLString('Ignored', groups.ignored)

  return newHTML + modifiedHTML + renamedHTML + typechangeHTML + ignoredHTML
}

const getConflictsGroupsHTML = conflicts => {
  const getHTMLString = (userName, files) => `<div><b>${userName}:</b><p>` + files.join('<br>') + '</p></div>'
  return conflicts.map(({ userName, files }) => getHTMLString(userName, files)).join('')
}

// Start
const HTML = [
  'linkServer',
  'chooseFolderBtn',
  'folderInput',
  'folderAnswer',
  'connectionStatus',
  'files',
  'conflicts',
  'fileInput',
  'fileAnswer',
  'usersFiles',
  'chooseFileBtnMongo',
  'fileInputMongo',
  'fileDateMongo',
  'fileAnswerMongo',
  'chat',
  'chatHeader',
  'chatBody',
  'chatStatus',
  'chatIcon',
  'iconPath',
  'unreadMessages',
  'inputChat',
  'messages',
  'token',
].reduce((acc, id) => (acc[id] = document.querySelector(`#${id}`)) && acc, {})

const getMyToken = () => {
  fetch(API_REQUESTS.getMyToken).then(response => response.text()).then(token => {
    alert('Your private token: ' + token)
  }).catch(err => alert('Error: ' + err))
}

HTML.token.addEventListener('click', e => {
  e.preventDefault()
  getMyToken()
})

const showError = message => {
  HTML.files.innerHTML = 'Disconnected'
  HTML.conflicts.innerHTML = 'Disconnected'
  HTML.folderAnswer.innerText = 'Disconnected'
  HTML.connectionStatus.innerHTML = message
}

const errorHandler = data => {
  if (data.error) {
    showError(data.error)
    throw new Error(data.error)
  }
  return data
}

const getStatus = isInit => {
  fetch(`${API_REQUESTS.myStatus}/${isInit}`).then(response => response.json()).then(errorHandler).then(data => {
    if (isInit) { HTML.connectionStatus.innerText = 'Connected' }
    const { myFiles, conflicts } = data

    let timeInfo = 'Last update: ' + getCurrentDate().time + '<br><br>'
    HTML.files.innerHTML = timeInfo + (myFiles.length ? getStatusesGroupsHTML(myFiles) : '<p>Have no any changes</p>')
    if (conflicts.error) {
      HTML.conflicts.innerHTML = `<p>${conflicts.error}</p>`
    } else {
      HTML.conflicts.innerHTML = conflicts.length ? getConflictsGroupsHTML(conflicts) : '<p>Have no any conflicts</p>'
    }
    getStatus(false)
  }).catch(err => console.warn('getStatus', err) || showError('Lost connection'))
}

const setFolder = () => {
  const data = getPostData({ folder: HTML.folderInput.value })
  HTML.folderAnswer.innerText = 'loading...'
  HTML.connectionStatus.innerText = 'loading...'
  fetch(API_REQUESTS.setFolder, data).then(response => response.text()).then(errorHandler).then(data => {
    HTML.folderAnswer.innerText = data
    HTML.folderInput.value = ''

    if (HTML.connectionStatus.innerHTML === 'Lost connection') {
      getStatus(true)
    }
  }).catch(err => console.warn('setFolder', err) || showError(err))
}

const checkServerStatus = (isInit) => {
  fetch(API_REQUESTS.checkServerStatus).then(response => response.json()).then(errorHandler).then(data => {
    const { folderPath } = data

    if (folderPath) {
      HTML.connectionStatus.innerText = 'Connected'
      HTML.files.innerHTML = 'loading...'
      HTML.conflicts.innerHTML = 'loading...'
      HTML.folderAnswer.innerText = folderPath
      HTML.folderInput.value = ''
      getStatus(isInit)
    } else {
      HTML.connectionStatus.innerText = 'Disconnected (reconnect after 5s)'
      setTimeout(() => checkServerStatus(isInit), 5000)
    }
  }).catch(err => console.warn('checkServerStatus', err) ||
    setTimeout(() => checkServerStatus(isInit), 5000))
}

const checkFile = e => {
  let fileName = e.target.files[0].name
  HTML.fileAnswer.innerHTML = 'Loading...'
  const data = getPostData({ fileName })
  const errorFile = err => {
    HTML.fileAnswer.innerHTML = 'Error: ' + err + '.'
    HTML.usersFiles.innerHTML = ''
    HTML.fileInput.value = ''
  }
  const errorFileHandler = data => {
    if (data.error) {
      throw new Error(data.error)
    }
    return data
  }
  fetch(API_REQUESTS.checkFile, data).then(response => response.json()).then(errorFileHandler).then(data => {
    const { fileName, usersFiles } = data
    HTML.fileAnswer.innerHTML = 'Last update: ' + getCurrentDate().time + '<br><br>For file: ' + fileName
    HTML.fileInput.value = ''
    HTML.usersFiles.innerHTML = usersFiles.length
      ? '<br>' + getConflictsGroupsHTML(usersFiles)
      : '<p>Have no users files</p>'
  }).catch(err => console.warn('checkFile', err) || errorFile(err))
}

const checkFileForDay = () => {
  if (!HTML.fileInputMongo.value || !HTML.fileDateMongo.value) {
    HTML.fileAnswerMongo.innerHTML = 'Path should not be empty and date should be correct.'
    return
  }

  const getFilesHTML = data => data.map(({ fileName, users }) => {
    let fileNameHTML = `<i>${fileName}:</i><br>`
    let usersHTML = `<p>${users.join(', ')}</p>`
    return fileNameHTML + usersHTML
  }).join('')

  const errorHandler = data => {
    if (data.error) {
      throw new Error(data.error)
    }
    return data
  }

  let file = HTML.fileInputMongo.value
  let date = HTML.fileDateMongo.value
  let data = getPostData({ file, date })
  HTML.fileAnswerMongo.innerHTML = 'Loading...'
  fetch(API_REQUESTS.checkFileForDay, data).then(response => response.json()).then(errorHandler).then(data => {
    let now = getCurrentDate().time
    let filePath = 'Last update: ' + now + '<br><br>File: \'' + file + '\'.<br>'
    let dateInfo = 'For: ' + date + '.<br><br>'
    if (!data.length) {
      HTML.fileAnswerMongo.innerHTML = filePath + dateInfo + 'Have no matches.'
    } else {
      HTML.fileAnswerMongo.innerHTML = filePath + dateInfo + getFilesHTML(data)
    }
  }).catch(err => HTML.fileAnswerMongo.innerHTML = 'Error: ' + err)
}

HTML.chooseFolderBtn.addEventListener('click', setFolder)
HTML.fileInput.addEventListener('input', checkFile)
HTML.chooseFileBtnMongo.addEventListener('click', checkFileForDay)
HTML.fileInputMongo.addEventListener('keydown', e => e.key === 'Enter' && checkFileForDay())

const getDefaultValueFolder = () => {
  fetch(API_REQUESTS.getDefaultValueFolder).then(response => response.json()).then(data => {
    const { defaultValue } = data
    HTML.folderInput.value = defaultValue
  })
}

getDefaultValueFolder()
checkServerStatus(true)

HTML.fileDateMongo.value = getCurrentDate().date

// CHAT -----------------------------------------------------------------------------------------
const pathOpened = 'M229.5,71.4l81.6,81.6l35.7-35.7L229.5,0L112.2,117.3l35.7,35.7L229.5,71.4z'
const pathClosed = 'M229.5,387.6L147.9,306l-35.7,35.7L229.5,459l117.3-117.3L311.1,306L229.5,387.6z'

const messagesData = []
let isChatOpened = false
let unreadMessagesCount = 0
const toggleChat = () => {
  if (isChatOpened) {
    isChatOpened = false
    HTML.iconPath.setAttribute('d', pathClosed)
  } else {
    isChatOpened = true
    HTML.unreadMessages.textContent = ''
    unreadMessagesCount = 0
    HTML.iconPath.setAttribute('d', pathOpened)
  }
  HTML.chatHeader.classList.toggle('chatHeaderOpened')
  HTML.chatIcon.classList.toggle('chatIconOpened')
  HTML.chatBody.classList.toggle('chatOpened')
}

HTML.chatHeader.addEventListener('click', toggleChat)

const getMessageHTML = message => {
  const { userName, text, time, delivered, updated } = message

  return `<div class="message ${userName ? 'otherUser' : ''}">
            <div class="messageContent ${!userName ? 'myMessage' : ''}">
              ${text.replace(/\n/g,'<br><br>')}
              <hr>
              <div class="signature">
                <span>${userName ? userName : ''} <span>
                <span>${time + (updated ? ' (upd)' : '')}<span>
                ${!userName && !delivered ? '&nbsp;' : ''}
                <span class="${!userName && !delivered ? 'sending' : ''}">
                  ${userName ? '' : delivered ? ' ✓' : ' ⏳'}
                </span>
              </div>
            </div>
          </div>`
}

const renderMessages = () => {
  const isNeedScroll = HTML.messages.scrollTop + HTML.messages.clientHeight === HTML.messages.scrollHeight
  HTML.messages.innerHTML = messagesData.map(getMessageHTML).join('')
  if (isNeedScroll) {
    HTML.messages.scrollTop = HTML.messages.scrollHeight
  }
}

document.addEventListener('wheel', event => {
  if (event.target.closest('#chatHeader') || event.target.closest('#inputChat')) {
    event.preventDefault()
  }
  if (event.target.closest('#messages')) {
    const target = HTML.messages
    if(target.scrollHeight - target.scrollTop === target.clientHeight && event.deltaY > 0) {
      event.preventDefault()
    } else if(target.scrollTop === 0 && event.deltaY < 0) {
      event.preventDefault()
    }
  }
})

const setStatus = status => {
  if  (status === 'Online') {
    HTML.chatStatus.classList.add('online')
  } else {
    HTML.chatStatus.classList.remove('online')
  }
  HTML.chatStatus.innerText = status
}

const startWSChat = (serverWS, userName) => {
  let ws = new WebSocket(serverWS)

  const getMessage = ({ id, time, text, userName }) => {
    if (!isChatOpened) {
      HTML.unreadMessages.textContent = '(' + ++unreadMessagesCount + ')'
    }
    if (id !== undefined) {
      messagesData[id].time = time
      messagesData[id].delivered = true
    } else {
      let lastIndex = messagesData.length - 1
      let shouldUpdate = messagesData[lastIndex]
        && messagesData[lastIndex].userName === userName
      if (shouldUpdate) {
        messagesData[lastIndex].text = messagesData[lastIndex].text + '\n' + text
        messagesData[lastIndex].time = time
        messagesData[lastIndex].updated = true
      } else {
        messagesData.push({ userName, text, time })
      }
    }
  }

  const send = e => {
    if (e.key !== 'Enter' || !HTML.inputChat.value) {
      return
    }
    let text = HTML.inputChat.value

    const sendMessage = () => {
      let shouldUpdate = messagesData[messagesData.length - 1]
        && messagesData[messagesData.length - 1].userName === undefined
      if (shouldUpdate) {
        messagesData[messagesData.length - 1] = {
          text:  messagesData[messagesData.length - 1].text + '\n' + text,
          time: getCurrentDate().time,
          delivered: false,
        }
        return messagesData.length - 1
      } else {
        return -1 + messagesData.push({
          text,
          time: getCurrentDate().time,
          delivered: false,
        })
      }
    }

    ws.send(JSON.stringify({
      text,
      userName,
      id: sendMessage(),
    }))
    HTML.inputChat.value = ''
  }

  const reconnecting = () => {
    ws.onclose = () => {}
    ws.close()
    ws = new WebSocket(serverWS)
    setListeners()
  }

  const setListeners = () => {
    ws.onopen = () => {
      setStatus('Online')
      HTML.inputChat.addEventListener('keydown', send)
    }
    ws.onclose = () => {
      setStatus('Offline')
      HTML.inputChat.removeEventListener('keydown', send)
      setTimeout(reconnecting, 1000)
    }
    ws.onerror = err => console.warn(err)
    ws.onmessage = res => {
      getMessage(JSON.parse(res.data))
      renderMessages()
    }
  }

  setListeners()
}

const getServerApi = () => {
  fetch(API_REQUESTS.getServerApi).then(response => response.json()).then(data => {
    const { serverApi, serverWS, userName } = data
    startWSChat(serverWS, userName)
    HTML.linkServer.href = serverApi
    HTML.linkServer.innerHTML = '<h3>Go to Server</h3>'
  })
}

getServerApi()
