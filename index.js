const argv = require('minimist')(process.argv.slice(2))

const { app: electronApp, BrowserWindow } = require('electron')

let win

global.sharedObject = { api: argv.api }

const createWindow = () => {
  win = new BrowserWindow({ width: 900, height: 520, icon: './public/electron.png' })

  win.loadFile('./public/index.html')

  argv.dev && win.webContents.openDevTools()

  win.on('closed', () => win = null)
}

electronApp.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    electronApp.quit()
  }
})

electronApp.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

electronApp.on('ready', createWindow)
