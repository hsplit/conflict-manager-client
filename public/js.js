const API = window.origin || 'http://localhost:5011'
const API_REQUESTS = {
  myStatus: `${API}/mystatus`,
  setFolder: `${API}/setfolder`,
}

const errorHanlde = err => console.warn(err)

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

const getStatus = () => {
  fetch(API_REQUESTS.myStatus).then(response => response.json(), errorHanlde).then(data => {
    let currentDate = new Date()
    let formattedTime = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`
    let timeInfo = 'Last update: ' + formattedTime
    myFiles.innerHTML = timeInfo + (data.length ? getStatusesGroupsHTML(data) : '<p>Have no any changes</p>')
    getStatus()
  }, errorHanlde)
}

chooseFolderBtn.addEventListener('click', () => {
  const data = getPostData({ folder: folderInput.value })
  folderAnswer.innerText = 'loading...'
  fetch(API_REQUESTS.setFolder, data).then(response => response.text(), errorHanlde).then(data => {
    folderAnswer.innerText = data
    folderInput.value = ''

    // start long poll
    longPollStatus.innerText = 'Connected'
    getStatus()
  })
})
