const server = require('./server');
const {app, BrowserWindow} = require('electron')
const path = require('path');
let main;
function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    icon: 'assets/images/favicon.png',
    webPreferences: {
      contextIsolation: true
    }
  });
  main = mainWindow;
  mainWindow.removeMenu();
  mainWindow.maximize();
  mainWindow.show();
  mainWindow.loadURL('http://localhost:'+server.port+'/');
  mainWindow.webContents.on('devtools-opened', () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  })
  //mainWindow.loadFile(path.join(__dirname+"/assets", 'index.html'));
}

app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});
