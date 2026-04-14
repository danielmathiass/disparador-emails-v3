const { app, BrowserWindow, ipcMain } = require('electron'); 
const path = require('node:path');

if (require('electron-squirrel-startup')) app.quit(); 

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-gpu');

const mainWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            devTools: false
        },
        icon: path.join(__dirname, 'icon-v3.png')
    });

    win.removeMenu();
    win.loadFile('./view/index.html');

    win.once('ready-to-show', () => {
        win.show();
    });
}

app.whenReady().then(() => {
    mainWindow();

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
});

ipcMain.on('fechar-janela', () => {
    app.quit();
});