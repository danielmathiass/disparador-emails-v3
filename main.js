const { app, BrowserWindow } = require('electron');
const path = require('node:path');

const mainWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    //win.removeMenu();
    win.loadFile('./view/index.html');
}

app.whenReady().then(() => {
    mainWindow();

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
});

