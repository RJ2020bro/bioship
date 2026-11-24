// BioShip online backend (Firebase Realtime Database + anonymous auth).
// Exposes window.BIOSHIP_NET.use(name) with the same shape the game expects
// from Claude artifact storage: "db", "user" and "room".
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, ref, get, set, remove, onValue, onDisconnect, query, limitToFirst, connectDatabaseEmulator } from 'firebase/database';

const cfg = window.BIOSHIP_FIREBASE;
let ready = null;

const ADJ = ['Coral', 'Tidal', 'Amber', 'Brine', 'Kelp', 'Storm', 'Pearl', 'Reef', 'Salt', 'Drift', 'Gale', 'Abyss', 'Lantern', 'Iron', 'Jade', 'Moon'];
const NOUN = ['Finch', 'Heron', 'Orca', 'Otter', 'Marlin', 'Gull', 'Petrel', 'Nautilus', 'Squid', 'Tern', 'Manta', 'Kraken', 'Seal', 'Wren', 'Ray', 'Puffin'];
function captainName() {
  let n = null;
  try { n = localStorage.getItem('bioship-captain'); } catch {}
  if (!n) {
    n = 'Captain ' + ADJ[Math.random() * ADJ.length | 0] + ' ' + NOUN[Math.random() * NOUN.length | 0];
    try { localStorage.setItem('bioship-captain', n); } catch {}
  }
  return n;
}
const clean = (s) => String(s || '').replace(/[^\p{L}\p{N} '\-]/gu, '').trim().slice(0, 24);

function start() {
  if (ready) return ready;
  ready = (async () => {
    if (!cfg || !cfg.apiKey || !cfg.databaseURL) return null;
    const app = initializeApp(cfg);
    const auth = getAuth(app);
    const db = getDatabase(app);
    if (cfg.emulatorHost) {
      connectAuthEmulator(auth, 'http://' + cfg.emulatorHost + ':9099', { disableWarnings: true });
      connectDatabaseEmulator(db, cfg.emulatorHost, 9000);
    }
    const user = await new Promise((res, rej) => {
      const off = onAuthStateChanged(auth, (u) => { if (u) { off(); res(u); } });
      signInAnonymously(auth).catch((e) => { off(); rej(e); });
    });
    const name = clean(captainName()) || 'Captain';
    await set(ref(db, 'names/' + user.uid), name).catch(() => {});
    return { db, uid: user.uid, name };
  })().catch((e) => { console.warn('[bioship-net]', e && e.message); return null; });
  return ready;
}

const snapDoc = (id, v) => ({ id, exists: v != null, data: () => v });

function dbApi(c) {
  const collection = (col) => ({
    doc: (id) => ({
      get: async () => snapDoc(id, (await get(ref(c.db, col + '/' + id))).val()),
      set: async (row) => {
        const r = Object.assign({}, row);
        if (col === 'ranked') r.name = c.name;
        await set(ref(c.db, col + '/' + id), r);
      },
    }),
    limit: (n) => ({
      get: async () => {
        const s = await get(query(ref(c.db, col), limitToFirst(n)));
        const docs = [];
        s.forEach((ch) => { docs.push(snapDoc(ch.key, ch.val())); });
        return { forEach: (fn) => docs.forEach(fn), docs, size: docs.length };
      },
    }),
  });
  return { collection };
}

function userApi(c) {
  return {
    id: async () => c.uid,
    profiles: async (ids) => {
      const out = {};
      await Promise.all((ids || []).map(async (id) => {
        try { const v = (await get(ref(c.db, 'names/' + id))).val(); if (v) out[id] = { name: v }; } catch {}
      }));
      return out;
    },
  };
}

function roomApi(c) {
  return {
    join: async (roomName) => {
      const key = String(roomName).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);
      const base = ref(c.db, 'rooms/' + key);
      const mine = ref(c.db, 'rooms/' + key + '/' + c.uid);
      let pres = {};
      await onDisconnect(mine).remove();
      const listeners = new Set();
      let last = null;
      const emit = () => { if (last) listeners.forEach((fn) => { try { fn(last); } catch {} }); };
      const unsub = onValue(base, (s) => {
        const peers = [];
        s.forEach((ch) => {
          const v = ch.val() || {};
          const { at, ...presence } = v;
          peers.push({ peer: ch.key, by: ch.key, isMe: ch.key === c.uid, presence });
        });
        last = { peers };
        emit();
      });
      return {
        presence: async (obj) => {
          pres = Object.assign({}, pres, obj || {});
          await set(mine, Object.assign({}, pres, { at: Date.now() }));
        },
        onPeers: (fn) => { listeners.add(fn); if (last) fn(last); return () => listeners.delete(fn); },
        leave: async () => { unsub(); listeners.clear(); await remove(mine).catch(() => {}); await onDisconnect(mine).cancel().catch(() => {}); },
      };
    },
  };
}

window.BIOSHIP_NET = {
  enabled: !!(cfg && cfg.apiKey),
  async use(name) {
    const c = await start();
    if (!c) return null;
    if (name === 'db') return dbApi(c);
    if (name === 'user') return userApi(c);
    if (name === 'room') return roomApi(c);
    return null;
  },
  setName(n) {
    const v = clean(n);
    if (!v) return;
    try { localStorage.setItem('bioship-captain', v); } catch {}
    start().then((c) => { if (c) { c.name = v; set(ref(c.db, 'names/' + c.uid), v).catch(() => {}); } });
  },
};
