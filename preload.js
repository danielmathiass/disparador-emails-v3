const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    fecharApp: () => ipcRenderer.send('fechar-janela')
});