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

chooseFolderBtn.addEventListener('click', () => {
  const data = getPostData({ folder: folderInput.value })
  folderAnswer.innerText = 'loading...'
  fetch(API_REQUESTS.setFolder, data).then(response => response.text(), errorHanlde).then(data => {
    console.log({ data })
    folderAnswer.innerText = data
    folderInput.value = ''
  })
})


getStatus.addEventListener('click', () => {
  fetch(API_REQUESTS.myStatus).then(response => response.json(), errorHanlde).then(data => {
    if (!data.length) {
      myFiles.innerHTML = 'Have no any changes'
    } else {
      const getStatus = statuses => Object.entries(statuses).filter(el => el[1]).map(el => el[0]).join(', ')
      const getHTML = ({ path, statuses }) => `<b>${path}</b>: <span>${getStatus(statuses)}</span>`
      myFiles.innerHTML = data.map(el => getHTML(el)).join('<br>')
    }
    console.log(data)
  }, errorHanlde)
})
