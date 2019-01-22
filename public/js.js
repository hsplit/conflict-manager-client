const API = window.origin || 'http://localhost:5011'
const API_REQUESTS = {
  myStatus: `${API}/mystatus`,
  setFolder: `${API}/setfolder`,
  checkServerStatus: `${API}/checkserverstatus`,
  checkFile: `${API}/checkfile`,
  checkFileForDay: `${API}/checkfileforday`,
}

const HTML = {
  chooseFolderBtn,
  folderInput,
  folderAnswer,
  longPollStatus,
  files,
  conflicts,
  fileInput,
  fileAnswer,
  usersFiles,
  chooseFileBtnMongo,
  fileInputMongo,
  fileDateMongo,
  fileAnswerMongo,
}

const getCurrentTime = () => {
  let currentDate = new Date()
  const getTimePart = method => currentDate[method]().toString().padStart(2, '0')
  return ['getHours', 'getMinutes', 'getSeconds'].map(getTimePart).join(':')
}

const getCurrentDate = () => {
  let currentDate = new Date()
  const getTimePart = method => currentDate[method]().toString().padStart(2, '0')
  const getDatePart = (method, i) => (currentDate[method]() + i % 2).toString().padStart(4 - (i ? 2 : 0), '0')
  return {
    date: ['getFullYear', 'getMonth', 'getDate'].map(getDatePart).join('-'),
    time: ['getHours', 'getMinutes', 'getSeconds'].map(getTimePart).join(':'),
  }
}

const showError = message => {
  HTML.files.innerHTML = 'Disconnected'
  HTML.conflicts.innerHTML = 'Disconnected'
  HTML.longPollStatus.innerHTML = message
}

const errorHanlder = data => {
  if (data.error) {
    showError(data.error)
    throw new Error(data.error)
  }
  return data
}

const getPostData = data => ({
  method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  body: JSON.stringify(data)
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

const getStatus = (initialMessage) => {
  fetch(API_REQUESTS.myStatus).then(response => response.json()).then(errorHanlder).then(data => {
    if (initialMessage) { HTML.longPollStatus.innerText = initialMessage }
    const { myFiles, conflicts } = data

    let timeInfo = 'Last update: ' + getCurrentTime() + '<br><br>'
    HTML.files.innerHTML = timeInfo + (myFiles.length ? getStatusesGroupsHTML(myFiles) : '<p>Have no any changes</p>')
    HTML.conflicts.innerHTML = conflicts.length ? getConflictsGroupsHTML(conflicts) : '<p>Have no any conflicts</p>'
    getStatus()
  }).catch(err => console.warn('getStatus', err) || showError('Lost connection'))
}

const setFolder = () => {
  const data = getPostData({ folder: HTML.folderInput.value })
  HTML.folderAnswer.innerText = 'loading...'
  HTML.longPollStatus.innerText = 'loading...'
  fetch(API_REQUESTS.setFolder, data).then(response => response.text()).then(errorHanlder).then(data => {
    HTML.folderAnswer.innerText = data
    HTML.folderInput.value = ''

    // start long poll
    getStatus('Connected')
  }).catch(err => console.warn('setFolder', err))
}

const checkServerStatus = () => {
  fetch(API_REQUESTS.checkServerStatus).then(response => response.json()).then(errorHanlder).then(data => {
    const { folderPath } = data

    if (folderPath) {
      HTML.longPollStatus.innerText = 'Connected'
      HTML.files.innerHTML = 'loading...'
      HTML.conflicts.innerHTML = 'loading...'
      HTML.folderAnswer.innerText = folderPath
      getStatus()
    } else {
      HTML.longPollStatus.innerText = 'Disconnected'
    }
  }).catch(err => console.warn('checkServerStatus', err))
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
      return errorFile(data.error)
    }
    return data
  }
  fetch(API_REQUESTS.checkFile, data).then(response => response.json()).then(errorFileHandler).then(data => {
    const { fileName, usersFiles } = data
    HTML.fileAnswer.innerHTML = 'Last update: ' + getCurrentTime() + '<br><br>For file: ' + fileName
    HTML.fileInput.value = ''
    HTML.usersFiles.innerHTML = usersFiles.length
      ? '<br>' + getConflictsGroupsHTML(usersFiles)
      : '<p>Have no users files</p>'
  }).catch(err => console.warn('checkFile', err))
}

HTML.chooseFolderBtn.addEventListener('click', setFolder)
HTML.fileInput.addEventListener('input', checkFile)
checkServerStatus()

const checkFileForDay = () => {
  if (!HTML.fileInputMongo.value || !HTML.fileDateMongo.value) {
    HTML.fileAnswerMongo.innerHTML = 'Path should not be empty and date should be correct.'
    return
  }

  const getFilesHTML = data => data.map(({ fileName, users }) => {
    let fileNameHTML = `<i>${fileName}:</i><br>`
    let usersHTML = `<p>${users.join(', ')}</p><br>`
    return fileNameHTML + usersHTML
  }).join('')

  const errorHanlder = data => {
    if (data.error) {
      throw new Error(data.error)
    }
    return data
  }

  let file = HTML.fileInputMongo.value
  let date = HTML.fileDateMongo.value
  let data = getPostData({ file, date })
  HTML.fileAnswerMongo.innerHTML = 'Loading...'
  fetch(API_REQUESTS.checkFileForDay, data).then(response => response.json()).then(errorHanlder).then(data => {
    let filePath = 'File: \'' + file + '\'.<br>'
    let dateInfo = 'For: ' + date + '.<br><br>'
    if (!data.length) {
      HTML.fileAnswerMongo.innerHTML = filePath + dateInfo + 'Have no matches.'
    } else {
      HTML.fileAnswerMongo.innerHTML = filePath + dateInfo + getFilesHTML(data)
    }
  }).catch(err => HTML.fileAnswerMongo.innerHTML = 'Error: ' + err)
}

HTML.chooseFileBtnMongo.addEventListener('click', checkFileForDay)
HTML.fileInputMongo.addEventListener('keydown', e => e.key === 'Enter' && checkFileForDay())

HTML.fileDateMongo.value = getCurrentDate().date
