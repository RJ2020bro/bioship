// Optional Steamworks hooks via steamworks.js. Everything here is a no-op when
// the module is missing or Steam is not running, so the same build runs anywhere.
const fs = require('node:fs');
const path = require('node:path');

let client = null;
let sw = null;

function appId() {
  if (process.env.STEAM_APP_ID) return Number(process.env.STEAM_APP_ID);
  for (const p of [path.join(process.resourcesPath || '', '..', 'steam_appid.txt'),
                   path.join(path.dirname(process.execPath), 'steam_appid.txt'),
                   path.join(__dirname, '..', 'steam', 'steam_appid.txt')]) {
    try { return Number(fs.readFileSync(p, 'utf8').trim()); } catch {}
  }
  return 480; // Valve's Spacewar test app
}

function init() {
  try {
    sw = require('steamworks.js');
    client = sw.init(appId());
    console.log('[steam] connected as', client.localplayer.getName());
  } catch (err) {
    client = null;
    console.log('[steam] not available:', err && err.message);
  }
}

function attachOverlay(win) {
  try { if (sw && client) sw.electronEnableSteamOverlay(); } catch {}
  void win;
}

function status() {
  if (!client) return { running: false };
  try { return { running: true, user: client.localplayer.getName() }; } catch { return { running: false }; }
}

function unlock(id) {
  if (!client) return false;
  try { return client.achievement.activate(id); } catch { return false; }
}

module.exports = { init, attachOverlay, status, unlock };
