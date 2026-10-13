'use strict';
/* 天天 · Jinan map + conversations. Loud screens; chat text uses Kaiti.
   Content: data/jinan.js (JINAN: city, characters, districts, quests). Layout: data/jinan-map.js (swappable art).
   Conversations are fully offline: hand-written scripts (data/jinan-scripts.js + data/scripts/*.js) run by talk.js.
   Progress lives in S.jinan (v2): quests, seals, one thread per character, things the learner told people (me). */

const J = window.JINAN;
const JM = window.JINAN_MAP;
const JX = window.JINAN_SCRIPTS;
const DISTRICTS = J.districts.slice().sort((a, b) => a.order - b.order);
const CHARS = Object.fromEntries(J.characters.map((c) => [c.id, c]));
const QUEST_XP = 150, SEAL_XP = 300, PRACTICE_XP = Math.round(QUEST_XP * 0.25);

// ---------------------------------------------------------------- progress + unlocking
function JS() {
  if (!S.jinan || S.jinan.v !== 3) {   // v3 (HSK 1 rewrite, conversations unlock with levels): earlier Jinan progress starts fresh
    const old = S.jinan || {};
    S.jinan = { v: 3, voice: !!old.voice };
  }
  const j = S.jinan;
  j.quests = j.quests || {}; j.seals = j.seals || {}; j.chars = j.chars || {}; j.me = j.me || {};
  if (j.voice === undefined) j.voice = false;
  return j;
}
const hskNum = (s) => parseInt(String(s).match(/\d/) || [1], 10);
const findQuest = (qid) => { for (const d of DISTRICTS) for (const q of d.quests) if (q.id === qid) return { d, q }; return null; };
const ALL_QUESTS = DISTRICTS.flatMap((d) => d.quests.map((q) => ({ d, q })));
const charOf = (q) => CHARS[q.character];
const portraitChar = (c) => [...c.zh.replace(/^[小老]/, '')][0];   // 孙师傅 → 孙, 小苏 → 苏, 老潘 → 潘
// Character art: drop img/people/<id>.png (full body) and <id>-face.png (square head crop), then list the id here.
// each person's backdrop colour behind their full-body figure in the chat panel
const CHAR_BG = { wang: '#F6E4A6', zhang: '#CDE8CF', lu: '#E4DAF2', su: '#FBE3B8', xie: '#C4EBEC', sun: '#FAD0B0', lin: '#F7D3BF', pan: '#CFE4F1', chen: '#F5CDD8', bai: '#D8E6EA' };
const PORTRAITS = new Set(['wang', 'zhang', 'lu', 'su', 'sun', 'bai', 'pan', 'lin', 'chen', 'xie']);
const faceInner = (c) => (c && PORTRAITS.has(c.id) ? `<img class="pface" src="img/people/${c.id}-face.png" alt="">` : esc(c ? portraitChar(c) : '故'));
// a finished quest on the map: a gold coin with an ink check (softer than the red stamp)
const coinCheck = '<svg class="ck" viewBox="0 0 24 24"><path d="M6.5 12.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const hasFace = (c) => !!(c && PORTRAITS.has(c.id));
// District stamps (passport): one illustrated souvenir stamp per district, img/stamps/<district id>.png.
// Earned = inked; not yet = a faint pressed outline (CSS).
const stampImg = (d, cls = '') => `<img class="stampimg ${cls}" src="img/stamps/${d.id}.png" alt="${esc(d.zh)} stamp">`;
const questsWith = (cid) => ALL_QUESTS.filter((x) => x.q.character === cid);
const doneWith = (cid) => questsWith(cid).filter((x) => (JS().quests[x.q.id] || {}).complete).length;
// Arc: stage 2 after 1/3 of a character's quests, stage 3 after 2/3.
function arcStage(cid) {
  const n = questsWith(cid).length, done = doneWith(cid);
  return done >= Math.ceil((2 * n) / 3) ? 3 : done >= Math.ceil(n / 3) ? 2 : 1;
}
const met = (cid) => !!(JS().chars[cid] && JS().chars[cid].met);
function levelTopics(l) {
  const t = new Set(); l.ids.forEach((id) => (window.WORD_TOPICS[id] || []).forEach((x) => t.add(x))); return t;
}
// Conversations unlock with HSK 1 levels: each one is written with the words of the levels before it, so finishing
// its level is the reward that opens it (and the chat is a review of those words in context). A district opens with its
// first conversation. Inside a district the story still runs in order.
const levelOk = (q) => !q.level || !!S.levelsDone[q.level];
function districtUnlock(d) {
  const q = d.quests[0];
  return levelOk(q) ? { ok: true, need: '' } : { ok: false, need: `Finish level ${q.level}` };
}
function questState(d, q) {
  const p = JS().quests[q.id] || {};
  if (p.complete) return 'complete';
  if (!levelOk(q)) return 'locked';
  const prev = d.quests.find((x) => x.order === q.order - 1);
  if (prev && !(JS().quests[prev.id] || {}).complete) return 'locked';
  return (p.done || []).length ? 'in_progress' : 'open';
}
// conversations open right now (for "new in Jinan" after a level), and slotting a new one into today's plan
const jinanOpenIds = () => ALL_QUESTS.filter(({ d, q }) => ['open', 'in_progress'].includes(questState(d, q)) && JX.quests[q.id]).map(({ q }) => q.id);
function jinanSlot(qid) {
  const f = findQuest(qid); if (!f || typeof planToday !== 'function') return;
  const p = planToday();
  if (p.steps.some((x) => x.k === 'quest' && !x.done)) return;
  const at = p.steps.findIndex((x) => x.k === 'level');
  p.steps.splice(at >= 0 ? at + 1 : p.steps.length, 0, { k: 'quest', did: f.d.id, qid, done: false });
  p.complete = false; save();
}
const districtDone = (d) => d.quests.filter((q) => (JS().quests[q.id] || {}).complete).length;
const totalStamps = () => DISTRICTS.reduce((a, d) => a + districtDone(d), 0);
const openDistricts = () => DISTRICTS.filter((d) => districtUnlock(d).ok).length;
const currentQuest = (d) => d.quests.find((q) => ['open', 'in_progress'].includes(questState(d, q)));

// ---------------------------------------------------------------- Chinese hover (pinyin) / click (English)
let DICT = null;
function dict() {
  if (DICT) return DICT;
  DICT = new Map(); W.forEach((w) => { if (w && !DICT.has(w.h)) DICT.set(w.h, w); });
  (S.extraWords || []).forEach((w) => { if (!DICT.has(w.h)) DICT.set(w.h, w); });
  return DICT;
}
const pyOf = (t) => { try { return window.pinyinPro.pinyin(t); } catch { return ''; } };
TALK.init({
  py: (s) => { try { return window.pinyinPro.pinyin(s, { toneType: 'none', type: 'array' }); } catch { return []; } },
  pyMarks: (s) => { const w = dict().get(s); return w ? w.p : pyOf(s); },
  syllables: [...new Set(W.filter(Boolean).flatMap((w) => String(w.n || '').split(/\s+/)).map((x) => x.replace(/\d/g, '')).filter(Boolean))],
  enLookup: (en) => { const w = W.find((x) => x && x.hsk <= 3 && String(x.m).split(/[;,(]/)[0].trim().toLowerCase() === en); return w ? w.h : null; }
});
// Wrap Chinese runs in a string so they get hover/click. `en` = known English for the whole run.
function zh(text, en) {
  return esc(text).replace(/([㐀-鿿　-〿！-～]*[㐀-鿿][㐀-鿿　-〿！-～]*)/g,
    (m) => `<span class="hz"${en ? ` data-en="${esc(en)}"` : ''}>${m}</span>`);
}
// Split a sentence into dictionary words (greedy, longest first) so each word has its own pinyin hover.
// wide = also use the full dictionary (团团's answers), so 夸张 is one word, not 夸 + 张.
function zhWords(text, wide) {
  const d = dict(); let out = '', i = 0; const s = [...text];
  if (wide && window.CED) {                                   // full dictionary + frequency-based splitting
    return text.split(/([㐀-鿿]+)/).map((part, k) => (k % 2 ? CED.segment(part, (w) => d.has(w)).map((w) => `<span class="hz w">${esc(w)}</span>`).join('') : esc(part))).join('');
  }
  const known = (w) => d.has(w);
  while (i < s.length) {
    if (!/[㐀-鿿]/.test(s[i])) { out += esc(s[i]); i++; continue; }
    let len = Math.min(wide ? 6 : 4, s.length - i);
    while (len > 1 && !known(s.slice(i, i + len).join(''))) len--;
    const w = s.slice(i, i + len).join('');
    out += `<span class="hz w">${esc(w)}</span>`; i += len;
  }
  return out;
}
const tip = document.createElement('div'); tip.className = 'hztip'; tip.hidden = true; document.body.appendChild(tip);
let tipEl = null;
document.addEventListener('mouseover', (e) => {
  const el = e.target.closest && e.target.closest('.hz');
  if (!el || (HZ_LOCK && el.closest('.drill'))) { if (tipEl) { tip.hidden = true; tipEl = null; } return; }
  if (el === tipEl) return;
  const hw = dict().get(el.textContent), hc = !hw && window.CED && [...el.textContent].length > 1 ? CED.best(el.textContent) : null;
  tipEl = el; showTip(el, el.dataset.py || (hw && hw.p) || (hc && hc.p) || pyOf(el.textContent));
});
document.addEventListener('click', (e) => {
  const el = e.target.closest && e.target.closest('.hz');
  if (!el || (HZ_LOCK && el.closest('.drill'))) return;          // click a word: its own English (NPC bubbles have an EN button for the whole line)
  const w = dict().get(el.textContent), c = !w && !el.dataset.en && window.CED ? CED.best(el.textContent) : null;   // full dictionary for words beyond HSK
  const en = el.dataset.en || (w && w.m) || (c && CED.short(c, 2));
  if (en) { tipEl = el; showTip(el, `${el.dataset.py || (c && c.p) || pyOf(el.textContent)} · ${en}`); }
});
function showTip(el, text) {
  tip.textContent = text; tip.hidden = false;
  const r = el.getBoundingClientRect();
  tip.style.left = Math.max(8, Math.min(window.innerWidth - tip.offsetWidth - 8, r.left + r.width / 2 - tip.offsetWidth / 2)) + 'px';
  tip.style.top = (r.top - tip.offsetHeight - 8 < 4 ? r.bottom + 8 : r.top - tip.offsetHeight - 8) + 'px';
}
function hideTip() { tip.hidden = true; tipEl = null; }

// ---------------------------------------------------------------- floating header + dropdown
// ---------------------------------------------------------------- the story so far: a postcard (first visit, then the Story button)
// The postcard shows when you open the map and something changed since you last saw it (a chat finished, or a new one
// opened); the Story button brings it back any time. Before any chat it's the welcome; after that, "the story so far":
// one recap per finished district, the district you're in, Mr. Ma's thread, and what's now / up next.
const storyKey = () => ALL_QUESTS.filter(({ q }) => (JS().quests[q.id] || {}).complete).length + '|' + jinanOpenIds().join(',');
// Mr. Ma's thread grows with the story: the last line whose quest is done is shown
const MA_THREAD = [
  [null, 'Not everyone sees it that way. A developer in a sharp suit is quietly buying up the old streets, with plans to make them “premium”.'],
  ['west-5', 'And then there is <b>Mr. Ma</b> (马先生): charming, apologetic, in a very good suit. He seems to know everyone, and his suitcase was full of plans for old streets.'],
  ['qushuiting-4', '<b>Mr. Ma</b> (马先生) has put glossy flyers under every door on Qushuiting Street. He wants to buy the old courtyards and make them “premium”.'],
  ['baotu-return', '<b>Mr. Ma</b> wants the courtyards, and now he has been seen at the springs, asking how much water they make.'],
  ['furong-5', "<b>Mr. Ma</b>'s people opened a copycat stall on Furong Street with Master Sun's stolen recipes. He wants the courtyards, the springs, and the food."],
  ['daming-5', "<b>Mr. Ma</b>'s company took over the Daming Lake pier and broke the timetable. Wherever something old works, his gold logo turns up."],
  ['quancheng-5', "<b>Mr. Ma</b> sold machine-made copies of Grandma Wang's knots as handmade. His next target, his suitcase said, is Kuanhouli."],
  ['shanda-5', '<b>Mr. Ma</b> came to class to sell his “new Kuanhouli”: tear down the old lane, build a mall. You told him no.'],
  ['kuanhouli-5', "<b>Mr. Ma</b> sat down at the street's table to buy every house, and the whole table answered him. He took his card back."],
  ['hospital-5', "And <b>Mr. Ma</b>? He came to the hospital with a bag of fruit for Grandma Wang, and she made him drink his hot water."]
];
function storyParts() {
  const done = (q) => !!(JS().quests[q.id] || {}).complete;
  const any = ALL_QUESTS.some(({ q }) => done(q));
  const recaps = DISTRICTS.filter((d) => d.quests.every(done) && d.story && d.story.recap).slice(-1).map((d) => `<p><span class="pclast">Last time</span><b class="kai">${esc(d.zh)}</b> · ${d.story.recap}</p>`);   // the latest finished district
  const cur = ALL_QUESTS.find(({ d, q }) => ['open', 'in_progress'].includes(questState(d, q)) && JX.quests[q.id]);
  const next = ALL_QUESTS.find(({ d, q }) => questState(d, q) === 'locked' && (!cur || q !== cur.q));
  const curD = cur ? cur.d : next ? next.d : null;
  const ma = MA_THREAD.filter(([qid]) => !qid || (findQuest(qid) && done(findQuest(qid).q))).pop()[1];
  return { any, recaps, cur, next, curD, ma };
}
function jIntro() {
  if (root.querySelector('#jintro')) return;
  JS().introKey = storyKey(); JS().intro = JS().intro || today(); save();
  const prev = keyHandler, P = storyParts();
  const who = (q) => `<span class="kai">${esc(CHARS[q.character].zh)}</span> ${esc(CHARS[q.character].en)}`;
  const body = P.any
    ? `<div class="pchead kai"><span class="hz" data-py="Gùshi" data-en="the story">故事</span></div>
       <div class="pcsub">The story so far · ${totalStamps()} / ${ALL_QUESTS.length} conversations · ${Object.keys(JS().seals).length} / 10 stamps</div>
       ${P.recaps.join('')}
       ${P.curD && !P.curD.quests.every((q) => (JS().quests[q.id] || {}).complete) && P.curD.story ? `<p><b class="kai">${esc(P.curD.zh)}</b> · <b>${esc(P.curD.story.title)}.</b> ${esc(P.curD.story.premise)}</p>` : ''}
       <p>${P.ma}</p>`
    : `<div class="pchead kai"><span class="hz" data-py="Huānyíng lái Jǐnán" data-en="Welcome to Jinan">欢迎来济南</span></div>
       <div class="pcsub">Welcome to Jinan · <span class="kai">泉城</span> The City of Springs</div>
       <p>You've just moved here to study Chinese. You have a room waiting on Qushuiting Street, an old lane where a clear stream runs past front doors, and you know nobody yet.</p>
       <p>Jinan is famous for its 72 springs, its breakfast stalls, and neighbors who will ask whether you've eaten before they ask your name.</p>
       <p>${P.ma}</p>
       <p>Your passport has ten empty pages. Meet the city one district at a time. Every level you finish opens a new conversation.</p>`;
  const nowNext = `${P.cur ? `<div class="pcnow"><span class="label">Now</span><b>${zh(P.cur.q.title)}</b> · ${who(P.cur.q)}<span class="smoke"> · ${esc(P.cur.d.en)}</span></div>` : ''}
    ${P.next ? `<div class="pcnow next"><span class="label">Up next</span><b>${zh(P.next.q.title)}</b> · ${who(P.next.q)}<span class="smoke"> · ${levelOk(P.next.q) ? 'after the chat before it' : 'opens at level ' + P.next.q.level}</span></div>` : ''}`;
  root.insertAdjacentHTML('beforeend', `<div class="scrim jintroscrim" id="jintro"><div class="postcard" role="dialog" aria-label="The story so far">
      <div class="pcleft">${body}${nowNext}
        <div class="pcbtns">${P.cur ? `<button class="btn-primary" id="jintrogo">Continue · ${esc(P.cur.q.title)} <kbd>↵</kbd></button><button class="btn-secondary" id="jintroclose">Map</button>` : `<button class="btn-primary" id="jintroclose">${P.any ? 'Back to the map' : '<span class="kai">开始</span> · Let\'s go'} <kbd>↵</kbd></button>`}</div>
      </div>
      <div class="pcright" aria-hidden="true">
        <div class="pcstampbox"><img class="pcstamp" src="img/stamps/${P.curD ? P.curD.id : 'baotu'}.png" alt=""></div>
        <div class="pcpostmark"><span>济南</span><span>JINAN</span></div>
        <div class="pclines"><i></i><i></i><i></i><i></i></div>
        <div class="pcto kai">寄给：${P.any ? '老朋友' : '新朋友'}<br><small>To: ${P.any ? 'an old friend' : 'a new friend'}</small></div>
      </div></div></div>`);
  const close = () => { const el = root.querySelector('#jintro'); if (el) el.remove(); keyHandler = prev; };
  const go = () => { close(); if (P.cur) jDistrict(P.cur.d.id, P.cur.q.id); };
  keyHandler = (e) => { if (e.key === 'Enter') { e.preventDefault(); P.cur ? go() : close(); } else if (e.key === 'Escape') { e.preventDefault(); close(); } };
  on('#jintrogo', 'click', go); on('#jintroclose', 'click', close);
  root.querySelector('#jintro').addEventListener('mousedown', (e) => { if (e.target.id === 'jintro') close(); });
}
function jTools() {
  return `<div class="jtools"><button class="btn-outline jpaper" id="jstory"><span class="kai">故</span> Story</button><button class="btn-outline jpaper" id="jpeople"><span class="kai">人</span> People</button><button class="btn-outline jpaper" id="jpass">Passport · 护照</button>
      <div class="jnav"><button class="jnavbtn" id="jnavbtn" aria-haspopup="true" aria-expanded="false">
        <span class="kai">济南</span> Jinan <span class="smoke" id="jnavsum">· ${openDistricts()} / 10 districts · ${totalStamps()} / ${ALL_QUESTS.length} stamps</span> ▾</button>
        <div class="jmenu" id="jmenu" hidden></div></div></div>`;
}
function navMenuHtml(openD) {
  return `<div class="jmh"><b><span class="kai">济南</span> Jinan</b><span class="smoke">${openDistricts()} / 10 districts · ${totalStamps()} / ${ALL_QUESTS.length} stamps</span></div>` +
    DISTRICTS.map((d) => {
      const u = districtUnlock(d), n = districtDone(d), exp = openD === d.id;
      const head = `<button class="jmi d ${u.ok ? '' : 'off'}" data-nd="${d.id}" ${u.ok ? '' : `aria-disabled="true" title="Locked · ${esc(u.need)}"`}>
        <span class="no">${d.order}</span><span class="kai">${esc(d.zh)}</span> ${esc(d.en)}<span class="sp"></span>${u.ok ? `<span class="${n === d.quests.length ? 'ok' : ''}">${n === d.quests.length ? '✓ ' : ''}${n}/${d.quests.length}</span> <span class="car" data-exp="${d.id}">${exp ? '▾' : '▸'}</span>` : `<span class="lk">Locked</span>`}</button>`;
      const quests = exp ? d.quests.map((q) => {
        const st = questState(d, q);
        const mark = st === 'complete' ? '✓' : st === 'locked' ? '–' : '●';
        return `<button class="jmi q ${st === 'locked' ? 'off' : ''} ${['open', 'in_progress'].includes(st) ? 'cur' : ''}" data-nq="${q.id}" ${st === 'locked' ? 'aria-disabled="true" title="Finish the quest before it first"' : ''}><span class="mk">${mark}</span>${zh(q.title)}<span class="sp"></span><span class="qc kai">${esc(charOf(q).zh)}</span></button>`;
      }).join('') : '';
      return head + quests;
    }).join('');
}
let navClose = null;
document.addEventListener('mousedown', (e) => { if (navClose && root.contains(e.target) && !e.target.closest('.jnav')) navClose(); });
function wireNav(onKeys) {
  const btn = root.querySelector('#jnavbtn'), menu = root.querySelector('#jmenu');
  let openD = null, idx = -1;
  const items = () => [...menu.querySelectorAll('.jmi')];
  const draw = () => { menu.innerHTML = navMenuHtml(openD); items().forEach((b, i) => b.classList.toggle('focus', i === idx)); };
  const open = () => { openD = openD || (DISTRICTS.find((d) => currentQuest(d)) || {}).id; draw(); menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); };
  const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); idx = -1; };
  btn.addEventListener('click', () => (menu.hidden ? open() : close()));
  menu.addEventListener('click', (e) => {
    const exp = e.target.closest('[data-exp]');
    if (exp) { e.stopPropagation(); openD = openD === exp.dataset.exp ? null : exp.dataset.exp; return draw(); }
    const it = e.target.closest('.jmi'); if (!it || it.classList.contains('off')) return;
    activate(it);
  });
  function activate(it) {
    close();
    if (it.dataset.nd) return jDistrict(it.dataset.nd);
    const f = findQuest(it.dataset.nq); if (f) jDistrict(f.d.id, f.q.id);
  }
  navClose = () => { if (!menu.hidden) close(); };
  // Keyboard: arrows move, → / ← expand or collapse a district, Enter jumps, Esc closes.
  return (e) => {
    if (menu.hidden) return onKeys && onKeys(e);
    const list = items(); e.preventDefault();
    if (e.key === 'Escape') return close();
    if (e.key === 'ArrowDown') { do idx = (idx + 1) % list.length; while (list[idx].classList.contains('off') && list.some((x) => !x.classList.contains('off'))); }
    else if (e.key === 'ArrowUp') { do idx = (idx - 1 + list.length) % list.length; while (list[idx].classList.contains('off') && list.some((x) => !x.classList.contains('off'))); }
    else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && list[idx] && list[idx].dataset.nd) { openD = e.key === 'ArrowRight' ? list[idx].dataset.nd : null; }
    else if (e.key === 'Enter' && list[idx]) return activate(list[idx]);
    draw();
  };
}

// ---------------------------------------------------------------- map: one world, two zoom levels
// The base image and everything on it live in .jworld, positioned in % of the image.
// City view = "cover" fit (never cropping past a district spot); district view = same world scaled toward the spot.
const MAP_AR = JM.width / JM.height;
const SPOT_IDS = Object.keys(JM.spots);
const shortTopic = (t) => t.split(/\s*[&,]\s*/)[0].toLowerCase();
let mapState = null;
let mapKeys = null;   // { mode: 'city' | 'district', did, base: {w,h,tx,ty} }

function mapGeometry() {
  const vp = root.querySelector('#jvp'); if (!vp) return null;
  const W = vp.clientWidth, H = vp.clientHeight;
  const xs = SPOT_IDS.map((k) => JM.spots[k][0]), ys = SPOT_IDS.map((k) => JM.spots[k][1]);
  const xmin = Math.min(...xs), xmax = Math.max(...xs), ymin = Math.min(...ys), ymax = Math.max(...ys);
  const mx = 64, top = 150, bottom = 60;             // keep markers clear of the edges and the floating header
  let w = Math.max(W, H * MAP_AR);                      // cover
  w = Math.min(w, (W - 2 * mx) / ((xmax - xmin) / 100));            // ...but never crop past a spot
  w = Math.min(w, ((H - top - bottom) / ((ymax - ymin) / 100)) * MAP_AR);
  const h = w / MAP_AR;
  let tx = (W - w) / 2, ty = (H - h) / 2;
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  // fill the window where the map is big enough (cover)...
  if (w >= W) tx = clamp(tx, W - w, 0);
  if (h >= H) ty = clamp(ty, H - h, 0);
  // ...but every district spot must stay on screen, clear of the edges and header
  tx = clamp(tx, mx - (xmin / 100) * w, W - mx - (xmax / 100) * w);
  ty = clamp(ty, top - (ymin / 100) * h, H - bottom - (ymax / 100) * h);
  return { W, H, w, h, tx, ty };
}
function applyTransform(animate) {
  const g = mapGeometry(); if (!g) return;
  const world = root.querySelector('#jworld');
  world.style.width = g.w + 'px'; world.style.height = g.h + 'px';
  root.querySelector('#jscreen').classList.toggle('compact', g.w < 1200);   // shorter status lines when space is tight
  let z = 1, tx = g.tx, ty = g.ty;
  if (mapState.mode === 'district') {
    z = JM.zoom;
    const [sx, sy] = JM.spots[mapState.did];
    const cardW = g.W > 900 ? 400 : 0;                      // leave room for the quest card on the right
    const cx = (g.W - cardW) / 2, cy = g.H / 2 + 40;
    tx = cx - z * (sx / 100) * g.w; ty = cy - z * (sy / 100) * g.h;
    // never pull the map's edge into view (千佛山 sits on the bottom edge); on the right it may tuck under the quest card
    tx = Math.min(Math.max(tx, g.W - cardW - z * g.w), 0); ty = Math.min(Math.max(ty, g.H - z * g.h), 0);
  }
  world.classList.toggle('anim', !!animate);
  world.style.transform = `translate(${tx}px, ${ty}px) scale(${z})`;
  world.style.setProperty('--inv', 1 / z);
  drawGray();
}
// Locked districts: the map is drawn into one canvas. Every pixel has an owner mask (data/jinan-art.js): it shows in
// colour once any owning district is open, and the long waters (黄河, the moat, 小清河) only once all of theirs are.
// Everything else is fully desaturated. A district that unlocked since the last visit fades in (gray → colour over 0.6s).
// City view uses the simple 1× art; district view the detailed 3× art (a hard cut: in as the zoom starts, out as it ends).
let fadingNow = null;   // { districtId: alpha } while an unlock fade is running (1 = still gray, 0 = colour)
const ART = {};         // level → { rgb, luma, own, req } once decoded
let artLevel = 'city', artKey = '';
const bitOf = (id) => 1 << JM.maskIds.indexOf(id);
function loadArt(level) {
  if (ART[level]) return ART[level].ready;
  const pix = (src) => new Promise((res) => {
    const im = new Image();
    im.onload = () => { const c = document.createElement('canvas'); c.width = JM.width; c.height = JM.height;
      const x = c.getContext('2d'); x.drawImage(im, 0, 0); res(x.getImageData(0, 0, JM.width, JM.height).data); };
    im.src = src;
  });
  const A = window.JINAN_ART, [img, msk] = level === 'city' ? [A.image, A.mask] : [A.imageDetail, A.maskDetail];
  ART[level] = { ready: Promise.all([pix(img), pix(msk)]).then(([rgb, m]) => {
    const n = JM.width * JM.height, luma = new Uint8ClampedArray(n), own = new Uint16Array(n), req = new Uint16Array(n);
    for (let i = 0; i < n; i++) {
      luma[i] = 0.2126 * rgb[i * 4] + 0.7152 * rgb[i * 4 + 1] + 0.0722 * rgb[i * 4 + 2];
      own[i] = m[i * 4] | ((m[i * 4 + 1] & 15) << 8); req[i] = m[i * 4 + 2] | ((m[i * 4 + 1] >> 4) << 8);
    }
    Object.assign(ART[level], { rgb, luma, own, req });
    if (artLevel === level) { artKey = ''; drawGray(); }
  }) };
  return ART[level].ready;
}
function setArtLevel(level) { if (artLevel === level) return; artLevel = level; artKey = ''; drawGray(); }
function drawGray(fading = fadingNow) {
  const cv = root.querySelector('#jcanvas'), art = ART[artLevel]; if (!cv) return;
  if (!art || !art.rgb) { loadArt(artLevel); return; }
  const fadeIds = Object.keys(fading || {}), a = fadeIds.length ? fading[fadeIds[0]] : 0;
  let before = 0;
  DISTRICTS.forEach((d) => { if (districtUnlock(d).ok && !fadeIds.includes(d.id)) before |= bitOf(d.id); });
  let after = before; fadeIds.forEach((id) => { after |= bitOf(id); });
  const key = `${artLevel}|${before}|${after}|${a.toFixed(3)}`; if (key === artKey) return; artKey = key;
  const x = cv.getContext('2d'), out = x.createImageData(JM.width, JM.height), o = out.data, { rgb, luma, own, req } = art;
  const lit = (bits, i) => (own[i] & bits) && (req[i] & bits) === req[i];
  for (let i = 0, n = JM.width * JM.height; i < n; i++) {
    const t = lit(before, i) ? 1 : lit(after, i) ? 1 - a : 0, l = luma[i], j = i * 4;
    o[j] = l + (rgb[j] - l) * t; o[j + 1] = l + (rgb[j + 1] - l) * t; o[j + 2] = l + (rgb[j + 2] - l) * t; o[j + 3] = 255;
  }
  x.putImageData(out, 0, 0);
}
function fadeUnlocked(ids) {
  if (!ids.length) return;
  const t0 = performance.now(), dur = 600;
  const step = (t) => {
    if (!root.querySelector('#jcanvas')) return;
    const p = Math.min(1, (t - t0) / dur), a = 1 - (p * p * (3 - 2 * p));   // smoothstep ease
    fadingNow = p < 1 ? Object.fromEntries(ids.map((id) => [id, a])) : null;
    drawGray();
    if (p < 1) requestAnimationFrame(step);
  };
  setTimeout(() => requestAnimationFrame(step), 450);
  toast(ids.map((id) => { const d = DISTRICTS.find((x) => x.id === id); return `${d.zh} ${d.en}`; }).join(', ') + ' unlocked');
}

// Swappable district marker: placeholder seal, or a real icon from JINAN_MAP.icons[id].
function districtMarker(d) {
  const u = districtUnlock(d), n = districtDone(d), [x, y] = JM.spots[d.id];
  const st = !u.ok ? 'locked' : n === d.quests.length ? 'complete' : 'open';
  // the landmark is painted into the map, so the icon is only a hit area over it (a drop-in icon still works)
  const icon = JM.icons[d.id] ? `<img src="${JM.icons[d.id]}" alt="">` : '<span class="dm-hit"></span>';
  const status = st === 'locked' ? `<span class="short">Locked</span>` : `${n} / ${d.quests.length}`;
  return `<button class="dm ${st} lab-${(JM.labels || {})[d.id] || 'below'}" data-d="${d.id}" style="left:${x}%;top:${y}%" ${st === 'locked' ? `aria-disabled="true" title="Locked · ${esc(u.need)}"` : ''}>
    <span class="dm-icon">${icon}</span>
    <span class="dm-tag"><span class="kai hz" data-py="${esc(d.pinyin)}" data-en="${esc(d.en)}">${esc(d.zh)}</span><span class="dm-st">${status}</span></span></button>`;
}
function mapNames() {
  const N = JM.names; if (!N) return '';
  const open = (id) => DISTRICTS.some((d) => d.id === id && districtUnlock(d).ok);
  const hzs = (zh, py, en) => `<span class="hz" data-py="${esc(py)}" data-en="${esc(en)}">${esc(zh)}</span>`;
  const at = (cls, [x, y], inner) => `<div class="jlab ${cls}" style="left:${x}%;top:${y}%">${inner}</div>`;
  return [
    ...N.waters.map(([zh, py, en, size, p, need]) => at(`jl-water ${size}${need.every(open) ? '' : ' gray'}`, p, hzs(zh, py, en))),
    ...N.roads.flatMap(([zh, py, en, v, city, dist]) => [
      ...city.map((p) => at(`jl-road jl-city${v ? ' v' : ''}`, p, hzs(zh, py, en))),
      ...dist.map((p) => at(`jl-road jl-district${v ? ' v' : ''}`, p, hzs(zh, py, en)))]),
    ...N.places.map(([zh, py, en, p, d]) => at(`jl-place jl-district${open(d) ? '' : ' gray'}`, p, hzs(zh, py, en)))
  ].join('');
}
function questMarkers(d) {
  return d.quests.map((q) => {
    const st = questState(d, q), [x, y] = JM.quests[q.id] || JM.spots[d.id];
    const c = charOf(q);
    return `<button class="qm ${st}" data-q="${q.id}" data-qd="${d.id}" style="left:${x}%;top:${y}%" title="${esc(q.title)} · ${esc(c.zh)} ${esc(c.en)}">${st === 'complete' ? coinCheck : hasFace(c) ? faceInner(c) : `<span class="kai">${esc(portraitChar(c))}</span>`}</button>`;
  }).join('');
}
function questCard(d) {
  const list = d.quests.map((q) => {
    const st = questState(d, q);
    const chip = { complete: 'Stamped', in_progress: 'In progress', open: 'Open', locked: levelOk(q) ? 'After quest ' + (q.order - 1) : 'Level ' + q.level }[st];
    return `<button class="qrow ${st}" data-q="${q.id}"><span class="qn">${q.order}</span>
      <span class="qport kai ${hasFace(charOf(q)) ? 'img' : ''}">${faceInner(charOf(q))}</span>
      <span class="qt"><b>${zh(q.title)}</b><span class="smoke"><span class="kai hz" data-py="${esc(charOf(q).pinyin)}" data-en="${esc(charOf(q).en)}">${esc(charOf(q).zh)}</span> · ${esc(charOf(q).en)}</span></span>
      <span class="qs">${st === 'complete' ? stamp : ''}${chip}</span></button>`;
  }).join('');
  const n = districtDone(d);
  const story = d.story ? `<div class="dstory"><div class="label">Story · 故事</div><b>${esc(d.story.title)}</b><p>${esc(d.story.premise)}</p></div>` : '';
  return `${story}<div class="goalrow"><span class="label">Quests · 任务</span><b>${n} / ${d.quests.length} stamps</b></div>
    <div class="bar spring thin" style="margin-bottom:10px"><i style="width:${Math.round((n / d.quests.length) * 100)}%"></i></div>${list}
    ${JS().seals[d.id] ? `<div class="note stampnote">${stampImg(d)}District stamp earned</div>` : ''}`;
}
function titleHtml() {
  if (mapState.mode === 'city') return `<button class="btn-secondary jback" id="jback">${I.back} Spring</button>
    <div class="label">泉城 · City of Springs</div><h1 class="jtitle"><span class="hz" data-py="Jǐnán" data-en="Jinan">济南</span> Jinan</h1>`;
  const d = DISTRICTS.find((x) => x.id === mapState.did);
  return `<button class="btn-secondary jback" id="jback">${I.back} Jinan</button>
    <div class="label">District ${d.order} · ${esc(d.hsk)} · ${esc(d.topic)}</div><h1 class="jtitle"><span class="kai hz" data-py="${esc(d.pinyin)}" data-en="${esc(d.en)}">${esc(d.zh)}</span> ${esc(d.en)}</h1>`;
}
function renderMap() {
  JS(); hideTip();
  const unlocked = DISTRICTS.filter((d) => districtUnlock(d).ok).map((d) => d.id);
  if (!Array.isArray(JS().seen)) JS().seen = unlocked.slice();            // first visit: nothing to animate
  const fresh = unlocked.filter((id) => !JS().seen.includes(id));
  const html = `<div class="jscreen" id="jscreen">
    <div class="jvp" id="jvp"><div class="jworld" id="jworld">
      <canvas class="jbase" id="jcanvas" width="${JM.width}" height="${JM.height}" aria-label="Map of Jinan"></canvas>
      ${mapNames()}
      ${DISTRICTS.map(districtMarker).join('')}
      ${DISTRICTS.map((d) => `<div class="qms" data-qms="${d.id}">${questMarkers(d)}</div>`).join('')}
    </div></div>
    <div class="jtitlebox" id="jtitle"></div>
    ${jTools()}
    <div class="jqcard" id="jqcard" hidden></div>
  </div>`;
  let navKeys;
  mapKeys = (e) => navKeys(e);
  render(html, mapKeys, () => {
    navKeys = wireNav((e) => { if (e.key === 'Escape') { if (mapState.mode === 'district') zoomTo(null); else go('home'); } });
    on('#jpass', 'click', jPassport); on('#jpeople', 'click', () => jPeople('map')); on('#jstory', 'click', jIntro);
    if (JS().introKey !== storyKey()) setTimeout(jIntro, 350);   // something changed since the last postcard: the story so far
    on('.dm', 'click', (e) => { const id = e.currentTarget.dataset.d, d = DISTRICTS.find((x) => x.id === id); if (districtUnlock(d).ok) zoomTo(id, true); });
    on('.qm', 'click', (e) => openQuest(e.currentTarget.dataset.qd, e.currentTarget.dataset.q));
    // decode both art levels (the detailed one is ready before the first zoom-in); draw as soon as ours is in
    artKey = ''; loadArt('city'); loadArt('district'); drawGray();
    if (fresh.length) {
      // start the newly unlocked patches gray, then fade them out
      fadingNow = Object.fromEntries(fresh.map((id) => [id, 1])); drawGray();
      JS().seen = unlocked.slice(); save();
      fadeUnlocked(fresh);
    }
  });
}
function syncMapUi() {
  const scr = root.querySelector('#jscreen'); if (!scr) return;
  scr.classList.toggle('zoomed', mapState.mode === 'district');
  root.querySelectorAll('.qms').forEach((el) => el.classList.toggle('show', mapState.mode === 'district' && el.dataset.qms === mapState.did));
  root.querySelectorAll('.dm').forEach((el) => el.classList.toggle('dim', mapState.mode === 'district' && el.dataset.d !== mapState.did));
  root.querySelector('#jtitle').innerHTML = titleHtml();
  on('#jback', 'click', () => (mapState.mode === 'district' ? zoomTo(null) : go('home')));
  const card = root.querySelector('#jqcard');
  if (mapState.mode === 'district') {
    const d = DISTRICTS.find((x) => x.id === mapState.did);
    card.innerHTML = questCard(d); card.hidden = false;
    card.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => openQuest(d.id, b.dataset.q)));
  } else card.hidden = true;
}
// Redraw markers/patches in place (after a quest finishes) without losing the zoom.
function refreshMarkers() {
  const world = root.querySelector('#jworld'); if (!world) return;
  world.querySelectorAll('.dm, .qms, .jlab').forEach((el) => el.remove());
  world.insertAdjacentHTML('beforeend', mapNames() + DISTRICTS.map(districtMarker).join('') + DISTRICTS.map((d) => `<div class="qms" data-qms="${d.id}">${questMarkers(d)}</div>`).join(''));
  on('.dm', 'click', (e) => { const id = e.currentTarget.dataset.d, d = DISTRICTS.find((x) => x.id === id); if (districtUnlock(d).ok) zoomTo(id, true); });
  on('.qm', 'click', (e) => openQuest(e.currentTarget.dataset.qd, e.currentTarget.dataset.q));
  const sum = root.querySelector('#jnavsum'); if (sum) sum.textContent = `· ${openDistricts()} / 10 districts · ${totalStamps()} / ${ALL_QUESTS.length} stamps`;
  syncMapUi(); drawGray();
}
let artCut = 0;
function zoomTo(did, animate = true) {
  mapState.mode = did ? 'district' : 'city'; mapState.did = did || null;
  clearTimeout(artCut);
  if (did || !animate) setArtLevel(did ? 'district' : 'city');                 // in: detail as the zoom starts
  else artCut = setTimeout(() => { if (mapState.mode === 'city') setArtLevel('city'); }, 500);   // out: simple map once it lands
  syncMapUi(); applyTransform(animate);
}
function openQuest(did, qid) {
  const d = DISTRICTS.find((x) => x.id === did), q = d && d.quests.find((x) => x.id === qid);
  if (!q) return;
  const st = questState(d, q);
  if (st === 'locked') return toast('Finish the quest before it first');
  openChat(d, q, st === 'complete' ? 'view' : 'quest');
}
function jCity() {
  const fresh = !root.querySelector('#jscreen');
  if (fresh) { mapState = { mode: 'city', did: null }; renderMap(); }
  zoomTo(null, !fresh);
}
function jDistrict(did, openQid) {
  const d = DISTRICTS.find((x) => x.id === did); if (!d) return jCity();
  const fresh = !root.querySelector('#jscreen');
  if (fresh) { mapState = { mode: 'city', did: null }; renderMap(); }
  zoomTo(did, !fresh);
  if (openQid) openQuest(did, openQid);
}
window.addEventListener('resize', () => { if (mapState && root.querySelector('#jscreen')) applyTransform(false); });

// ---------------------------------------------------------------- passport (immersive page)
function jPassport() {
  JS(); hideTip();
  const rows = DISTRICTS.map((d) => {
    const u = districtUnlock(d), seal = JS().seals[d.id];
    return `<div class="prow ${u.ok ? '' : 'locked'}">
      <div class="pstamp ${seal ? 'on' : ''}" title="${seal ? `District stamp · ${seal}` : `Finish all ${d.quests.length} conversations to earn this stamp`}">${stampImg(d)}</div>
      <div class="pname"><b><span class="kai hz" data-py="${esc(d.pinyin)}" data-en="${esc(d.en)}">${esc(d.zh)}</span> ${esc(d.en)}</b><span class="smoke">${esc(d.topic)} · ${esc(d.hsk)}</span></div>
      <div class="pstamps">${d.quests.map((q) => { const p = JS().quests[q.id] || {}; return `<div class="pst ${p.complete ? 'on' : ''}" title="${esc(q.title)}${p.complete ? ' · ' + p.complete : ''}"><span class="kai">${esc(portraitChar(charOf(q)))}</span><small>${p.complete ? p.complete.slice(5) : q.order}</small></div>`; }).join('')}</div>
    </div>`;
  }).join('');
  const backTo = mapState && mapState.mode === 'district' ? mapState.did : null;
  let navKeys;
  render(`<div class="jpage"><div class="jpagehead"><div><button class="btn-secondary jback" id="jback">${I.back} Map</button>
      <div class="label">护照 · Passport</div><h1 class="jtitle">${totalStamps()} / ${ALL_QUESTS.length} stamps</h1></div>${jTools()}</div>
    <div class="passport">${rows}</div></div>`, (e) => navKeys(e), () => {
    navKeys = wireNav((e) => { if (e.key === 'Escape') back(); });
    on('#jback', 'click', back); on('#jpass', 'click', jPassport); on('#jpeople', 'click', () => jPeople('map'));
  });
  function back() { mapState = null; backTo ? jDistrict(backTo) : jCity(); }
}

// ---------------------------------------------------------------- conversations (one thread per character)
// Thread entries: {t:'scene', qid, date, practice} · {t:'npc', zh, en, card} · {t:'me', text, fix} · {t:'done', qid, xp, words}
let chat = null;        // { cid, d, q, mode: 'quest'|'practice'|'thread', st, script, prevKeys, busy }
const charState = (cid) => (JS().chars[cid] = JS().chars[cid] || { met: false, log: [] });
const stageNote = (cid) => { const s = arcStage(cid); return `Stage ${s} · ${CHARS[cid].arc[s - 1].description}`; };
const fmtDate = (iso) => { try { return new Date(iso + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch { return iso; } };

function openChat(d, q, mode) {
  const cid = q.character, cs = charState(cid), script = JX.quests[q.id];
  if (!script) return toast('This conversation is not ready yet');
  hideTip();
  chat = { cid, d, q, mode, script, prevKeys: keyHandler, busy: false, misses: 0, suggest: [], nudge: '', lives: script.challenge ? script.challenge.lives : 0 };
  const p = JS().quests[q.id] = JS().quests[q.id] || { done: [] };
  if (mode === 'quest') {
    chat.st = TALK.newState(script, q.id, cid, p.done);
    if (!p.started) {   // a new scene: greeting (self-introduction on a first meeting), callback, opener
      p.started = today();
      cs.log.push({ t: 'scene', qid: q.id, date: today() });
      const lines = TALK.opening(script, CHARS_SCRIPT(cid), { met: cs.met, stage: arcStage(cid), me: JS().me, later: cs.later && (JX.quests[cs.later] || {}).later }, chat.st);
      cs.met = true; cs.later = null;
      lines.forEach((l) => cs.log.push(npcEntry(l)));
      save(); drawChat(); speakLines(lines); startAi();
      return;
    }
    // resuming: the engine needs the last line for "say that again"
    const last = [...cs.log].reverse().find((e) => e.t === 'npc'); if (last) chat.st.last = [last.zh, last.en];
  }
  drawChat(); startAi();
}
// ---------------------------------------------------------------- local AI for this conversation
function buildConv() {
  const { cid, d, q } = chat, me = JS().me, log = charState(cid).log;
  const memory = [me.name && `their name is ${me.name.zh || me.name}`, me.country && `they are from ${me.country.zh || me.country}`,
    questsWith(cid).filter((x) => (JS().quests[x.q.id] || {}).complete).map((x) => x.q.title).join(', ').replace(/^(.+)$/, 'you met before: $1')].filter(Boolean).join('; ');
  let known = learnedIds().slice(-200).map((id) => W[id] && W[id].h).filter(Boolean);
  if (known.length < 120) known = [...new Set([...known, ...W.filter((w) => w && w.hsk === 1).slice(0, 150).map((w) => w.h)])];
  const hist = [];
  log.slice(Math.max(0, sceneIndex(log))).forEach((e) => {
    if (e.t === 'npc' && e.zh) hist.push({ role: 'assistant', content: e.zh });
    if (e.t === 'me') hist.push({ role: 'user', content: e.text });
  });
  // merge consecutive lines from the same speaker
  const merged = []; hist.forEach((m) => { const l = merged[merged.length - 1]; if (l && l.role === m.role) l.content += ' ' + m.content; else merged.push({ ...m }); });
  return { sys: AI.system({ c: CHARS[cid], stage: arcStage(cid), d, q, memory, known }), hist: merged };
}
function convPush(role, content) {
  if (!chat || !chat.conv || !content) return;
  const h = chat.conv.hist, l = h[h.length - 1];
  if (l && l.role === role) l.content += ' ' + content; else h.push({ role, content });
}
function startAi() {
  if (!chat || !['quest', 'practice'].includes(chat.mode)) return;
  chat.conv = buildConv();
  const mine = chat;
  AI.check().then(() => { if (chat === mine && AI.ready()) AI.warm(chat.conv); });
}
const CHARS_SCRIPT = (cid) => JX.characters[cid] || {};
function startPractice() {
  if (!chat) return;
  const { cid, q, script } = chat, cs = charState(cid);
  chat.mode = 'practice'; chat.misses = 0; chat.suggest = []; chat.nudge = ''; chat.lives = script.challenge ? script.challenge.lives : 0;
  chat.st = TALK.newState(script, q.id, cid, []);
  cs.log.push({ t: 'scene', qid: q.id, date: today(), practice: true });
  const lines = TALK.opening(script, CHARS_SCRIPT(cid), { met: true, stage: arcStage(cid), me: JS().me }, chat.st);
  lines.forEach((l) => cs.log.push(npcEntry(l)));
  save(); drawChat(); speakLines(lines); startAi();
}
// slow: 慢一点儿 always plays, slowly, even with the voice switch off
async function speakLines(lines, slow) {
  if (!JS().voice && !slow) return;
  for (const l of lines) { if (!chat) return; if (!l.zh) continue; await speak(l.zh, (l.opts && l.opts.who) || l.who || chat.cid, slow); }
}
// a scene line in the log: narration (English only), or speech by the character or someone else in the scene
const npcEntry = (l) => ({ t: 'npc', zh: l.zh, en: l.en, card: l.card || null, who: (l.opts && l.opts.who) || undefined });
// people who speak in a scene without being the quest's character
const EXTRAS = { lele: { img: true, zh: '乐乐', py: 'Lèle', en: "Lele, Ms. Chen's son", face: '乐' }, ma: { img: true, zh: '马先生', py: 'Mǎ xiānsheng', en: 'Mr. Ma', face: '马' },
  kid: { img: true, zh: '小明', py: 'Xiǎo Míng', en: "Grandma Wang's grandson", face: '明' }, cook: { img: true, zh: '厨师', py: 'chúshī', en: 'The copycat cook', face: '厨' },
  seller: { img: true, zh: '老板', py: 'lǎobǎn', en: 'The shop owner', face: '板' }, cheers: { zh: '大家', py: 'dàjiā', en: 'Everyone', face: '众' } };
// finale challenge: a few lives; a misunderstood answer costs one; at zero the challenge questions start over
function challengeOn() {
  const ch = chat && chat.script.challenge; if (!ch || !['quest', 'practice'].includes(chat.mode)) return false;
  const avail = TALK.available(chat.script, chat.st).map((x) => x.obj);
  return ch.objs.some((o) => avail.includes(o));
}

function sceneIndex(log, qid) { for (let i = log.length - 1; i >= 0; i--) if (log[i].t === 'scene' && (!qid || log[i].qid === qid)) return i; return -1; }
function drawChat() {
  if (!chat) return;
  const { cid, q, d, mode } = chat, c = CHARS[cid], cs = charState(cid);
  const live = mode === 'quest' || mode === 'practice';
  const ended = live && isSceneDone();
  const objs = live ? q.objectives : [];
  const done = live ? chat.st.done : [];
  const art = hasFace(c);
  const side = `<div class="cside ${art ? 'art' : ''}" ${art ? `style="--cbg:${CHAR_BG[c.id] || '#EFE9DC'}"` : ''}>
      ${art ? `<img class="sideart" src="img/people/${c.id}.png" alt="">` : `<div class="portrait">${esc(portraitChar(c))}</div>`}
      ${art ? '<div class="cinfo">' : ''}
      <div class="cname kai hz" data-py="${esc(c.pinyin)}" data-en="${esc(c.en)}">${esc(c.zh)}</div>
      <div class="crole"><b>${esc(c.en)}</b> · ${esc(String(c.age))}<br>${esc(c.role)}</div>
      <div class="cvisit">${esc(stageNote(cid))}</div>
      ${live || mode === 'view' ? `<div class="csetting"><b>${esc(d.zh)} ${esc(d.en)}</b><br>${esc(q.setting)}</div>` : `<div class="csetting">${doneWith(cid)} of ${questsWith(cid).length} quests together</div>`}
      ${live ? `<div class="cai ${AI.ready() ? 'on' : ''}" title="${AI.ready() ? 'When a character doesn\'t understand you, a model on this Mac improvises a reply and checks your grammar.' : 'Local AI is off or not set up (Settings). Characters follow their scripts.'}">${AI.ready() ? '● Local AI' : '○ Scripted only'}</div>` : ''}
      <label class="cvoice">Voice <input type="checkbox" id="cvoice" ${JS().voice ? 'checked' : ''}></label>
      ${art ? '</div>' : ''}
    </div>`;
  const head = live || mode === 'view'
    ? `<div class="label">${esc(d.en)} · Quest ${q.order}${mode === 'practice' ? ' · Practice' : ''}</div><div class="ctitle">${zh(q.title)}</div>`
    : `<div class="label">人 · People</div><div class="ctitle">Conversations with <span class="kai">${esc(c.zh)}</span></div>`;
  const lives = live && !ended && challengeOn() ? `<div class="clives" title="Finale challenge: a wrong or misunderstood answer costs a life"><span class="label">Challenge</span>${Array.from({ length: chat.script.challenge.lives }, (_, k) => `<i class="${k < chat.lives ? 'on' : ''}">♥</i>`).join('')}</div>` : '';
  const chips = live ? `${lives}<div class="cobjs">${objs.map((o) => `<span class="cobj ${done.includes(o.id) ? 'ok' : ''}">${done.includes(o.id) ? '✓ ' : ''}${esc(o.text)}</span>`).join('')}</div>` : '';
  let foot = '';
  if (live && !ended) {
    foot = `${chat.nudge ? `<div class="cnudge"><span class="label">Hint</span> ${esc(chat.nudge)}</div>` : ''}
      ${chat.suggest.length ? `<div class="csug">${chat.suggest.map((s) => `<button class="sugg kai" data-s="${esc(s)}">${esc(s)}</button>`).join('')}</div>` : ''}
      <div class="cinput"><input id="cin" placeholder="用中文说… (type in Chinese)" autocomplete="off" spellcheck="false" ${chat.busy || chat.streaming ? 'disabled' : ''}><button class="btn-primary" id="csend" ${chat.busy || chat.streaming ? 'disabled' : ''}>Send <kbd>↵</kbd></button></div>`;
  } else if (mode === 'view' || ended) {
    const planNext = ended && planRun && planNextStep();
    foot = `<div class="cinput cend"><button class="btn-secondary" id="cclose2">Back <kbd>Esc</kbd></button><span class="sp"></span>${ended ? (planNext ? `<button class="btn-primary" id="cplan">Next: ${esc(stepInfo(planNext).t)}</button>` : '') : `<button class="btn-primary" id="cpractice">Practice again · +${PRACTICE_XP} XP</button>`}</div>`;
  } else {   // thread (from People): list this character's quests
    foot = `<div class="cquests">${questsWith(cid).map(({ d: dd, q: qq }) => {
      const st = questState(dd, qq);
      return `<button class="cq ${st}" data-cq="${qq.id}" ${st === 'locked' ? 'disabled' : ''}><span class="mk">${st === 'complete' ? '✓' : st === 'locked' ? '–' : '●'}</span><span class="kai">${esc(dd.zh)}</span> ${zh(qq.title)}<span class="sp"></span><small>${{ complete: 'Stamped', in_progress: 'Continue', open: 'Start', locked: 'Locked' }[st]}</small></button>`;
    }).join('')}</div>`;
  }
  const html = `<div class="scrim chatscrim" id="chatscrim"><div class="chatcard" role="dialog" aria-label="Conversation">${side}
    <div class="cmain"><div class="ctop"><div>${head}</div><button class="btn-secondary" id="cclose">Close <kbd>Esc</kbd></button></div>
      ${chips}<div class="cmsgs" id="cmsgs">${logHtml(cs.log)}</div>${foot}</div></div></div>`;
  const old = root.querySelector('#chatscrim'); if (old) old.remove();
  root.insertAdjacentHTML('beforeend', html);
  keyHandler = chatKeys;
  const box = root.querySelector('#cmsgs');
  // scroll: the current scene (or the quest being viewed) sits at the top when it's long, otherwise the bottom
  if (mode === 'view') { const el = box.querySelector(`[data-scene="${q.id}"]`); box.scrollTop = el ? el.offsetTop - box.offsetTop - 4 : box.scrollHeight; }
  else box.scrollTop = box.scrollHeight;
  const cin = root.querySelector('#cin');
  if (cin) { cin.focus(); cin.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); e.stopPropagation(); sendMsg(); } }); }
  on('#csend', 'click', sendMsg);
  on('#cclose', 'click', closeChat); on('#cclose2', 'click', closeChat);
  on('#cpractice', 'click', startPractice);
  on('#cplan', 'click', () => { closeChat(true); planGo(); });
  on('#cvoice', 'change', (e) => { JS().voice = e.target.checked; save(); });
  on('.sugg', 'click', (e) => { const i = root.querySelector('#cin'); if (i) { i.value = e.currentTarget.dataset.s; i.focus(); } });
  on('.cen', 'click', (e) => {
    e.stopPropagation();
    const el = e.currentTarget.closest('.bubble.npc'); if (!el) return;
    el.classList.toggle('show-en'); e.currentTarget.classList.toggle('on', el.classList.contains('show-en'));
    const ent = charState(chat.cid).log[+el.dataset.i];
    if (ent && ent.ai && !ent.en && !ent.translating && chat.conv) {   // improvised lines are translated on demand
      ent.translating = true; const mine = chat;
      AI.translate(chat.conv, ent.zh).then((en) => { ent.translating = false; if (en) { ent.en = en; save(); } if (chat === mine) { const x = root.querySelector(`.bubble.npc[data-i="${el.dataset.i}"] .en`); if (x) x.textContent = en || '(no translation)'; } });
    }
  });
  on('.cplay', 'click', (e) => { e.stopPropagation(); speak(e.currentTarget.dataset.zh, chat && chat.cid); });
  on('[data-cq]', 'click', (e) => { const f = findQuest(e.currentTarget.dataset.cq); if (!f) return; const st = questState(f.d, f.q); closeChat(true); openChat(f.d, f.q, st === 'complete' ? 'view' : 'quest'); });
  root.querySelector('#chatscrim').addEventListener('mousedown', (e) => { if (e.target.id === 'chatscrim') closeChat(); });
}
function chatKeys(e) {
  if (e.key === 'Escape') { e.preventDefault(); return closeChat(); }
}
function logHtml(log) {
  if (!log.length) return `<div class="cnote">No conversations yet.</div>`;
  // which scenes are finished (their objective chips collapse into "✓ stamped")
  let out = '';
  log.forEach((e, i) => {
    if (e.t === 'scene') {
      const f = findQuest(e.qid);
      if (!f) { out += `<div class="cscene"><span>Earlier visit · ${esc(fmtDate(e.date))}</span></div>`; return; }   // a quest that was rewritten
      const fin = log.slice(i + 1).find((x) => x.t === 'scene' || (x.t === 'done' && x.qid === e.qid));
      const stamped = fin && fin.t === 'done';
      out += `<div class="cscene" data-scene="${e.qid}"><span><span class="kai">${esc(f.d.zh)}</span> · ${esc(f.q.title)}${e.practice ? ' · practice' : ''} · ${esc(fmtDate(e.date))}</span>${stamped ? `<b>✓ ${e.practice ? 'done' : 'stamped'}</b>` : ''}</div>`;
    } else if (e.t === 'npc' && e.who === 'narr') {
      out += `<div class="cnarr">${esc(e.en)}</div>`;
    } else if (e.t === 'npc') {
      const card = e.card ? `<div class="ccard"><div class="cct kai">${esc(e.card.title)}</div>${e.card.rows.map((r) => `<div class="ccr kai">${r.map((x) => `<span>${esc(x)}</span>`).join('')}</div>`).join('')}</div>` : '';
      const prev = log[i - 1], first = !prev || prev.t !== 'npc' || prev.who !== e.who, x = EXTRAS[e.who];
      const face = x ? (x.img ? `<img class="pface" src="img/people/${e.who}-face.png" alt="">` : `<span class="kai">${esc(x.face)}</span>`) : chat ? faceInner(CHARS[chat.cid]) : '';
      out += `${x && first ? `<div class="cwho"><span class="kai hz" data-py="${esc(x.py)}" data-en="${esc(x.en)}">${esc(x.zh)}</span> · ${esc(x.en)}</div>` : ''}<div class="nrow ${x ? 'other' : ''}"><span class="nav ${first ? '' : 'hide'} ${(x ? x.img : chat && hasFace(CHARS[chat.cid])) ? 'img' : ''} ${x ? 'x-' + e.who : ''}">${face}</span><div class="bubble npc" data-i="${i}"><div class="btext kai"><span class="bt">${zhWords(e.zh)}</span><span class="cbtns"><button class="cen" title="Show the whole line in English">EN</button><button class="cplay" data-zh="${esc(e.zh)}" title="Play">${I.speaker}</button></span></div><div class="en">${esc(e.en || (e.ai ? '…' : ''))}</div>${card}</div></div>`;
    } else if (e.t === 'me') {
      let t = esc(e.text);
      if (e.fix && !e.fix.tip && e.fix.original && e.text.includes(e.fix.original)) t = t.split(esc(e.fix.original)).join(`<s class="cx">${esc(e.fix.original)}</s>`);
      const fx = e.fix ? `<div class="cfix ${e.fix.tip ? 'tip' : ''}">${e.fix.tip ? '<b>Tip</b> · ' : ''}${e.fix.corrected ? `${e.fix.tip ? '' : '✎ '}<span class="cx">${esc(e.fix.original)}</span> → <span class="cf kai">${esc(e.fix.corrected)}</span><br>` : ''}${esc(e.fix.note || '')}</div>` : '';
      out += `<div class="bubble me"><div class="btext kai">${t}</div>${fx}</div>`;
    } else if (e.t === 'done') {
      const f = findQuest(e.qid);
      out += `<div class="cdone">${e.practice ? `<span class="bs">练</span>` : stamp}<div><b>${e.practice ? 'Practice complete' : 'Quest complete · stamped'}</b><div class="smoke">+${e.xp} XP${e.seal ? ` · District stamp +${SEAL_XP} XP` : ''}${e.words && e.words.length ? ` · New words: <span class="kai">${e.words.map(esc).join('、')}</span>` : ''}${f && !e.practice ? ` · ${esc(f.d.en)}` : ''}</div></div></div>${e.seal && f ? `<div class="cseal">${stampImg(f.d, i === log.length - 1 ? 'thunk' : '')}<div><b>District stamp · <span class="kai">${esc(f.d.zh)}</span></b><div class="smoke">Every conversation in ${esc(f.d.en)} done. It's in your passport.</div></div></div>` : ''}`;
    }
  });
  if (chat && chat.busy) { const l = log[log.length - 1]; out += `<div class="nrow"><span class="nav ${l && l.t === 'npc' ? 'hide' : ''} ${hasFace(CHARS[chat.cid]) ? 'img' : ''}">${faceInner(CHARS[chat.cid])}</span><div class="bubble npc typing"><span></span><span></span><span></span></div></div>`; }
  return out;
}
function isSceneDone() {
  const log = charState(chat.cid).log, i = sceneIndex(log);
  return i >= 0 && log.slice(i).some((e) => e.t === 'done');
}

const HAN_RX = /[㐀-鿿]/;
function sendMsg() {
  if (!chat || chat.busy || chat.streaming) return;
  const inp = root.querySelector('#cin'); if (!inp) return;
  const text = inp.value.trim(); if (!text) return;
  const mine = chat, { cid, q, script } = chat, cs = charState(cid);
  const inChallenge = challengeOn();
  const r = TALK.respond(script, CHARS_SCRIPT(cid), chat.st, text, {
    objectives: q.objectives, me: JS().me, remember: (k, v) => { JS().me[k] = v; }
  });
  const meEntry = { t: 'me', text, fix: r.fix || null };
  cs.log.push(meEntry);
  if (chat.mode === 'quest') { const p = JS().quests[q.id]; p.done = chat.st.done.slice(); }
  chat.suggest = []; chat.nudge = '';
  chat.misses = r.miss ? chat.misses + 1 : 0;
  const pinyin = TALK.isPinyin(text);
  // The script didn't understand a real attempt in Chinese (or pinyin): the local model improvises, in character.
  const improvise = r.miss && !inChallenge && AI.ready() && (HAN_RX.test(text) || pinyin);
  // the finale challenge: a misunderstood answer (or 我不知道) costs a life; out of lives, its questions start over
  if (inChallenge && (r.miss || r.giveup)) {
    chat.lives--;
    if (chat.lives <= 0) {
      const ch = script.challenge;
      chat.st.done = chat.st.done.filter((o) => !ch.objs.includes(o)); chat.lives = ch.lives; chat.st.pending = null;
      if (chat.mode === 'quest') JS().quests[q.id].done = chat.st.done.slice();
      r.lines = [].concat([].concat(...[TALK.pick(ch.fail), ch.restart].map((x) => (Array.isArray(x[0]) ? x : [x]))).map((l) => ({ zh: l[0], en: l[1], opts: l[2] || {} })));
      chat.st.last = ch.restart.filter((l) => l[0]).pop() || chat.st.last;
      r.suggest = []; r.nudge = '';
    }
  }
  chat.busy = true; save(); drawChat();
  const left = q.objectives.filter((o) => !chat.st.done.includes(o.id)).map((o) => o.text);
  const after = async () => {
    // a second opinion on grammar when the rules found nothing (shown as a softer "Tip")
    if (chat !== mine || !AI.ready()) return;
    const needsChars = pinyin && (!meEntry.fix || !meEntry.fix.corrected);
    if (meEntry.fix && !needsChars) return;
    if (!HAN_RX.test(text) && !pinyin) return;
    const tip = await AI.checkSentence(mine.conv, text, pinyin);
    if (tip && chat === mine) { meEntry.fix = needsChars ? { ...tip, tip: false, note: 'Type characters, not pinyin: switch your keyboard to Pinyin – Simplified, type the sounds, then pick the characters.' } : tip; save(); drawChat(); }
  };
  if (improvise) {
    chat.streaming = true;
    convPush('user', text);
    const npc = { t: 'npc', zh: '', en: '', ai: true };
    let shown = false;
    AI.reply(chat.conv, text, left, (part) => {
      if (chat !== mine || !part) return;
      if (!shown) { shown = true; chat.busy = false; cs.log.push(npc); }
      npc.zh = part; streamInto(npc);
    }).then((out) => {
      if (chat !== mine) return;
      chat.busy = false; chat.streaming = false;
      if (out) { npc.zh = out; if (!shown) cs.log.push(npc); convPush('assistant', out); speakLines([{ zh: out }]); }
      else {   // the model failed: fall back to the script's "huh?"
        if (shown) cs.log.splice(cs.log.indexOf(npc), 1);
        r.lines.forEach((l) => { cs.log.push(npcEntry(l)); convPush('assistant', l.zh); });
        chat.suggest = r.suggest || [];
      }
      if (chat.misses >= 2) { chat.nudge = r.nudge || ''; chat.suggest = r.suggest || []; }
      save(); drawChat(); after();
    });
    return;
  }
  convPush('user', text);
  const delay = 450 + Math.min(900, r.lines.reduce((a, l) => a + l.zh.length, 0) * 25);
  setTimeout(() => {
    if (chat !== mine) return;
    chat.busy = false;
    r.lines.forEach((l) => { cs.log.push(npcEntry(l)); convPush('assistant', l.zh); });
    if (r.miss) { chat.suggest = r.suggest || []; chat.nudge = r.nudge || ''; }
    else if (r.suggest && r.suggest.length) chat.suggest = r.suggest;
    if (r.complete) finishScene();
    save(); drawChat(); speakLines(r.lines, r.slow); after();
  }, delay);
}
// update the streaming bubble in place (no full redraw per token)
function streamInto(npc) {
  const box = root.querySelector('#cmsgs'); if (!box) return;
  let el = box.querySelector('.bubble.npc.live');
  if (!el) { drawChat(); const all = root.querySelectorAll('#cmsgs .bubble.npc'); el = all[all.length - 1]; if (el) el.classList.add('live'); }
  const t = el && (el.querySelector('.bt') || el.querySelector('.btext'));
  if (t) { t.textContent = npc.zh; box.scrollTop = box.scrollHeight; }
}
function addQuestWords(list) {
  const added = [];
  (list || []).forEach(([h, p, m]) => {
    const hsk = W.find((w) => w && w.h === h);
    if (hsk) { if (!S.words[hsk.id]) learnWord(hsk.id, 1); added.push(h); return; }
    S.extraWords = S.extraWords || [];
    let w = S.extraWords.find((x) => x.h === h);
    if (!w) {
      let n = ''; try { n = window.pinyinPro.pinyin(h, { toneType: 'num' }).replace(/0/g, '5'); } catch {}
      w = { id: 100000 + S.extraWords.length, h, p, n, m, all: m, hsk: 0, extra: true };
      S.extraWords.push(w); W[w.id] = w; DICT = null;
    }
    if (!S.words[w.id]) learnWord(w.id, 1);
    added.push(h);
  });
  return added;
}
function finishScene() {
  const { cid, d, q, script, mode } = chat, cs = charState(cid);
  const before = rank().i;
  if (mode === 'practice') {
    addXp(PRACTICE_XP);
    cs.log.push({ t: 'done', qid: q.id, xp: PRACTICE_XP, practice: true });
  } else {
    const p = JS().quests[q.id];
    p.complete = today(); p.done = q.objectives.map((o) => o.id);
    addXp(QUEST_XP);
    const words = addQuestWords(script.words);
    let seal = false;
    if (districtDone(d) === d.quests.length && !JS().seals[d.id]) { JS().seals[d.id] = today(); addXp(SEAL_XP); seal = true; }
    cs.later = q.id;
    cs.log.push({ t: 'done', qid: q.id, xp: QUEST_XP, words, seal });
    planMark('quest'); weekBump('stamps');
    S.stats.quests = (S.stats.quests || 0) + 1;
  }
  markPractice();
  const got = checkBadges();
  save();
  const r = rank();
  setTimeout(() => {
    if (r.i > before) toast(`New rank · ${r.hz} ${r.en}`, 3600);
    else if (got.length) toast(`New badge · ${got.map((b) => b.name).join(', ')}`);
  }, 300);
}
function closeChat(silent) {
  if (!chat) return;
  if (window.speechSynthesis) speechSynthesis.cancel();
  try { bridge.stopSpeak(); } catch {}
  const prev = chat.prevKeys, from = chat.mode;
  chat = null; hideTip();
  const s = root.querySelector('#chatscrim'); if (s) s.remove();
  keyHandler = prev;
  if (silent === true) return;
  if (root.querySelector('#jscreen')) refreshMarkers();
  else if (root.querySelector('#peoplepage')) jPeople(peopleFrom);
}

// ---------------------------------------------------------------- 人 People: characters you've met
let peopleFrom = 'map';
function jPeople(from) {
  JS(); hideTip(); peopleFrom = from || peopleFrom;
  const metIds = J.characters.filter((c) => met(c.id)).map((c) => c.id);
  const left = J.characters.length - metIds.length;
  const cards = metIds.map((cid) => {
    const c = CHARS[cid], n = questsWith(cid).length, dn = doneWith(cid);
    const next = questsWith(cid).find(({ d, q }) => ['open', 'in_progress'].includes(questState(d, q)));
    return `<button class="pcard" data-pc="${cid}">
      <span class="portrait sm ${hasFace(c) ? 'img' : ''}">${faceInner(c)}</span>
      <span class="pci"><b><span class="kai">${esc(c.zh)}</span> ${esc(c.en)}</b>
        <span class="smoke">${esc(c.role)}</span>
        <span class="pcs">${esc(stageNote(cid))}</span>
        <span class="pcq"><span class="bar spring thin"><i style="width:${Math.round((dn / n) * 100)}%"></i></span>${dn} / ${n} quests${next ? ` · next: ${esc(next.q.title)}` : ''}</span></span></button>`;
  }).join('');
  const body = `<div class="people" id="peoplepage">${cards || `<div class="cnote">You haven't met anyone yet. Start a quest in Jinan to meet your first neighbor.</div>`}</div>
    ${left ? `<p class="smoke pleft">${left} more ${left === 1 ? 'person' : 'people'} to meet around Jinan.</p>` : ''}`;
  const wire = () => on('[data-pc]', 'click', (e) => openThread(e.currentTarget.dataset.pc));
  if (peopleFrom === 'side') {
    render(shell('people', `<div class="pagehead"><div class="label">人 · People</div><h1>People</h1></div>${body}`), (e) => e.key === 'Escape' && go('home'), wire);
    return;
  }
  const backTo = mapState && mapState.mode === 'district' ? mapState.did : null;
  let navKeys;
  render(`<div class="jpage"><div class="jpagehead"><div><button class="btn-secondary jback" id="jback">${I.back} Map</button>
      <div class="label">人 · People</div><h1 class="jtitle">${metIds.length} / ${J.characters.length} met</h1></div>${jTools()}</div>${body}</div>`, (e) => navKeys(e), () => {
    navKeys = wireNav((e) => { if (e.key === 'Escape') back(); });
    on('#jback', 'click', back); on('#jpass', 'click', jPassport); on('#jpeople', 'click', () => jPeople('map'));
    wire();
  });
  function back() { mapState = null; backTo ? jDistrict(backTo) : jCity(); }
}
function openThread(cid) {
  const { d, q } = questsWith(cid)[0];
  hideTip();
  chat = { cid, d, q, mode: 'thread', prevKeys: keyHandler, busy: false, misses: 0, suggest: [], nudge: '' };
  drawChat();
}
