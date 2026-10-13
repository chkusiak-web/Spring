const { app, BrowserWindow, ipcMain, Notification, dialog, systemPreferences, session } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, execFile } = require('child_process');

let win = null;
let quitting = false;
let sayProc = null;
let reminder = { on: false, time: '19:00', lastPractice: '', lastFired: '' };

const dataFile = () => path.join(app.getPath('userData'), 'progress.json');

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1100,
    minHeight: 720,
    title: 'Spring',
    backgroundColor: '#F2EEE3',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  win.on('close', (e) => {
    // Keep running in the background so reminders still fire; Cmd+Q quits.
    if (process.platform === 'darwin' && !quitting) { e.preventDefault(); win.hide(); }
  });
}

app.setName('Spring');
app.setPath('userData', path.join(app.getPath('appData'), 'Spring'));
app.setAboutPanelOptions({ applicationName: 'Spring', applicationVersion: app.getVersion(), version: '泉 · Quán', credits: 'Every day, a little Chinese.' });

// Carry progress over from the app's older names (天天, then Quán) the first time Spring runs.
function migrateOldData() {
  try {
    const f = dataFile();
    if (fs.existsSync(f)) return;
    for (const name of ['天天', 'Quan']) {
      const oldDir = path.join(app.getPath('appData'), name);
      const old = path.join(oldDir, 'progress.json');
      if (!fs.existsSync(old)) continue;
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.copyFileSync(old, f);
      const ob = path.join(oldDir, 'backups'), nb = path.join(path.dirname(f), 'backups');
      if (fs.existsSync(ob)) { fs.mkdirSync(nb, { recursive: true }); for (const x of fs.readdirSync(ob)) fs.copyFileSync(path.join(ob, x), path.join(nb, x)); }
      return;
    }
  } catch {}
}

app.whenReady().then(() => {
  migrateOldData();
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(perm === 'media'));
  createWindow();
  setInterval(checkReminder, 30 * 1000);
});
app.on('before-quit', () => { quitting = true; });
app.on('activate', () => { if (win) win.show(); else createWindow(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// ---------- progress storage ----------
ipcMain.handle('store:load', () => {
  try { return JSON.parse(fs.readFileSync(dataFile(), 'utf8')); } catch { return null; }
});
ipcMain.handle('store:save', (e, data) => {
  const f = dataFile();
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const tmp = f + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data));
  fs.renameSync(tmp, f);
  // one rolling backup per day
  try {
    const day = new Date().toISOString().slice(0, 10);
    const b = path.join(path.dirname(f), 'backups');
    fs.mkdirSync(b, { recursive: true });
    const bf = path.join(b, `progress-${day}.json`);
    if (!fs.existsSync(bf)) fs.copyFileSync(f, bf);
    const all = fs.readdirSync(b).sort();
    while (all.length > 14) fs.unlinkSync(path.join(b, all.shift()));
  } catch {}
  return true;
});
ipcMain.handle('store:export', async (e, data) => {
  const r = await dialog.showSaveDialog(win, { defaultPath: `spring-progress-${new Date().toISOString().slice(0, 10)}.json` });
  if (r.canceled || !r.filePath) return false;
  fs.writeFileSync(r.filePath, JSON.stringify(data, null, 1));
  return true;
});
ipcMain.handle('store:import', async () => {
  const r = await dialog.showOpenDialog(win, { properties: ['openFile'], filters: [{ name: 'JSON', extensions: ['json'] }] });
  if (r.canceled || !r.filePaths[0]) return null;
  try { return JSON.parse(fs.readFileSync(r.filePaths[0], 'utf8')); } catch { return null; }
});

// ---------- speech (macOS "say" with Mandarin voices) ----------
ipcMain.handle('tts:voices', () => new Promise((resolve) => {
  if (process.platform !== 'darwin') return resolve([]);
  execFile('say', ['-v', '?'], (err, out) => {
    if (err) return resolve([]);
    const v = out.split('\n')
      .map((l) => l.match(/^(.+?)\s{2,}(zh_CN)\s+#/))
      .filter(Boolean)
      .map((m) => m[1].trim());
    resolve(v);
  });
}));
ipcMain.handle('tts:speak', (e, { text, voice, rate }) => new Promise((resolve) => {
  if (process.platform !== 'darwin') return resolve(false);
  if (sayProc) { try { sayProc.kill(); } catch {} }
  const args = [];
  if (voice) args.push('-v', voice);
  if (rate) args.push('-r', String(rate));
  args.push('--', text);
  const p = spawn('say', args);
  sayProc = p;
  p.on('error', () => resolve(false));
  p.on('exit', (code) => { if (sayProc === p) sayProc = null; resolve(code === 0); });
}));
ipcMain.handle('tts:stop', () => { if (sayProc) { try { sayProc.kill(); } catch {} } return true; });

// ---------- microphone ----------
ipcMain.handle('mic:access', async () => {
  if (process.platform !== 'darwin') return true;
  const s = systemPreferences.getMediaAccessStatus('microphone');
  if (s === 'granted') return true;
  return systemPreferences.askForMediaAccess('microphone');
});

// ---------- reminders & login ----------
ipcMain.handle('reminder:set', (e, r) => { reminder = { ...reminder, ...r }; return true; });
ipcMain.handle('login:set', (e, on) => {
  app.setLoginItemSettings({ openAtLogin: !!on, openAsHidden: true });
  return true;
});

function checkReminder() {
  if (!reminder.on || !Notification.isSupported()) return;
  const now = new Date();
  const today = localDay(now);
  const hm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  if (hm < reminder.time || reminder.lastFired === today || reminder.lastPractice === today) return;
  reminder.lastFired = today;
  const n = new Notification({ title: 'Spring', body: 'Time for today\'s level. Light a lantern.' });
  n.on('click', () => { if (win) { win.show(); win.focus(); } });
  n.show();
}
function localDay(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}


// Remove the API key file left by older versions (Jinan chats are now fully offline).
app.whenReady().then(() => { try { fs.unlinkSync(path.join(app.getPath('userData'), 'claude-key.bin')); } catch {} });

// ---------- local AI (built in: llama.cpp on this computer; never the internet) ----------
// The model file downloads once on request (Settings). Replies stream back token by token.
const AI = require('./ai-engine');
AI.init(app.getPath('userData'));
const aiCalls = new Map();
const aiPush = (st) => { if (win && !win.isDestroyed()) win.webContents.send('ai:progress', st); };
ipcMain.handle('ai:status', () => AI.status());
ipcMain.handle('ai:download', () => { AI.startDownload(aiPush); return AI.status(); });
ipcMain.handle('ai:download-cancel', () => AI.cancelDownload());
ipcMain.handle('ai:remove', () => AI.removeModel());
ipcMain.handle('ai:chat', async (e, { id, body, timeout }) => {
  const ctl = new AbortController(); aiCalls.set(id, ctl);
  const t = setTimeout(() => ctl.abort(), timeout || 60000);
  try {
    const r = await AI.chatOnce(body, ctl.signal, (text) => { if (!e.sender.isDestroyed()) e.sender.send('ai:token', { id, text }); });
    return ctl.signal.aborted && !r.text ? { error: 'timeout' } : r;
  } catch (err) { return { error: ctl.signal.aborted ? 'timeout' : String(err && err.message || err) }; }
  finally { clearTimeout(t); aiCalls.delete(id); }
});
ipcMain.handle('ai:cancel', (e, id) => { const c = aiCalls.get(id); if (c) c.abort(); return true; });
app.on('will-quit', () => { AI.unload(); });
