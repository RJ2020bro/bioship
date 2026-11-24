// Desktop shell for Steam / Windows / macOS / Linux. Loads www/index.html (run `npm run build` first).
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('node:path');
const steam = require('./steam.cjs');

app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 500,
    backgroundColor: '#071319',
    title: 'BioShip',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
    },
  });
  win.once('ready-to-show', () => win.show());
  // External links open in the user's browser, never inside the game window.
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('before-input-event', (_e, input) => {
    if (input.type === 'keyDown' && (input.key === 'F11' || (input.alt && input.key === 'Enter'))) {
      win.setFullScreen(!win.isFullScreen());
    }
  });
  win.loadFile(path.join(__dirname, '..', 'www', 'index.html'));
  steam.attachOverlay(win);
}

ipcMain.handle('steam:status', () => steam.status());
ipcMain.handle('steam:achievement', (_e, id) => steam.unlock(String(id)));
ipcMain.handle('steam:quit', () => app.quit());

app.whenReady().then(() => {
  steam.init();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => app.quit());
