const API = window.origin || 'http://localhost:5011'
const API_REQUESTS = {
  myStatus: `${API}/mystatus`,
  setFolder: `${API}/setfolder`,
}

const HTML = {
  chooseFolderBtn,
  folderInput,
  folderAnswer,
  longPollStatus,
  files,
  conflicts,
}

const getCurrentTime = () => {
  let currentDate = new Date()
  const getTimePart = method => currentDate[method]().toString().padStart(2, '0')
  return ['getHours', 'getMinutes', 'getSeconds'].map(el => getTimePart(el)).join(':')
}

const errorHanlder = data => {
  if (data.error) {
    HTML.files.innerHTML = 'Disconnected'
    HTML.conflicts.innerHTML = 'Disconnected'
    HTML.longPollStatus.innerHTML = data.error
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

const getStatusesGroupsHTML = groups => {
  const getHTMLString = (key, data) => data.length ? `<p><b>${key}:</b><p>` + data.join('<br>') + '</p></p>' : ''
  const newHTML = getHTMLString('New', groups.new)
  const modifiedHTML = getHTMLString('Modified', groups.modified)
  const renamedHTML = getHTMLString('Renamed', groups.renamed)
  const typechangeHTML = getHTMLString('Typechange', groups.typechange)
  const ignoredHTML = getHTMLString('Ignored', groups.ignored)

  return newHTML + modifiedHTML + renamedHTML + typechangeHTML + ignoredHTML
}

const getStatus = (initialMessage) => {
  fetch(API_REQUESTS.myStatus).then(response => response.json()).then(errorHanlder).then(data => {
    if (initialMessage) { HTML.longPollStatus.innerText = initialMessage }
    const { myFiles, conflicts } = data

    let timeInfo = 'Last update: ' + getCurrentTime()
    let hasFiles = Object.values(myFiles).some(arr => arr.length)
    HTML.files.innerHTML = timeInfo + (hasFiles ? getStatusesGroupsHTML(myFiles) : '<p>Have no any changes</p>')
    getStatus()
  }).catch(err => console.warn('getStatus', err))
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

HTML.chooseFolderBtn.addEventListener('click', setFolder)
