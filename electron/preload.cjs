// Exposes a tiny, safe API to the game page. The game can call these when present:
//   window.bioshipDesktop.steam.unlock('FIRST_ISLAND')   -> Steam achievement (no-op without Steam)
//   await window.bioshipDesktop.steam.status()           -> { running, user }
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bioshipDesktop', {
  platform: process.platform,
  steam: {
    status: () => ipcRenderer.invoke('steam:status'),
    unlock: (id) => ipcRenderer.invoke('steam:achievement', id),
  },
  quit: () => ipcRenderer.invoke('steam:quit'),
});
