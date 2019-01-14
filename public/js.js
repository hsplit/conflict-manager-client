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

const getStatusesGroupsHTML = data => {
  let groups = {
    new: [],
    modified: [],
    renamed: [],
    typechange: [],
    ignored: [],
  }

  data.forEach(({ path, statuses }) => {
    switch (true) {
      case statuses.new: groups.new.push(path); break
      case statuses.modified: groups.modified.push(path); break
      case statuses.renamed: groups.renamed.push(path); break
      case statuses.typechange: groups.typechange.push(path); break
      case statuses.ignored: groups.ignored.push(path);
    }
  })

  const getHTMLstring = (key, data) => data.length ? `<p><b>${key}:</b><p>` + data.join('<br>') + '</p></p>' : ''
  const newHTML = getHTMLstring('New', groups.new)
  const modifiedHTML = getHTMLstring('Modified', groups.modified)
  const renamedHTML = getHTMLstring('Renamed', groups.renamed)
  const typechangeHTML = getHTMLstring('Typechange', groups.typechange)
  const ignoredHTML = getHTMLstring('Ignored', groups.ignored)

  return newHTML + modifiedHTML + renamedHTML + typechangeHTML + ignoredHTML
}

const getStatus = (initialMessage) => {
  fetch(API_REQUESTS.myStatus).then(response => response.json()).then(errorHanlder).then(data => {
    if (initialMessage) { HTML.longPollStatus.innerText = initialMessage }
    const { myFiles, conflicts } = data

    let timeInfo = 'Last update: ' + getCurrentTime()
    HTML.files.innerHTML = timeInfo + (myFiles.length ? getStatusesGroupsHTML(myFiles) : '<p>Have no any changes</p>')
    getStatus()
  }).catch(err => console.warn('getStatus', err))
}

const setFolder = () => {
  const data = getPostData({ folder: HTML.folderInput.value })
  HTML.folderAnswer.innerText = 'loading...'
  fetch(API_REQUESTS.setFolder, data).then(response => response.text()).then(errorHanlder).then(data => {
    HTML.folderAnswer.innerText = data
    HTML.folderInput.value = ''

    // start long poll
    getStatus('Connected')
  }).catch(err => console.warn('setFolder', err))
}

HTML.chooseFolderBtn.addEventListener('click', setFolder)
