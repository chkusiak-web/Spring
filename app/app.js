'use strict';
/* 天天 Tiāntiān — every day, a little Chinese. Phase 1: Levels, Review, game layer.
   Visual layer follows BRAND.md v1: loud shell (Home, rewards, badges) + quiet drills. */

const W = window.WORDS;            // ordered: curated everyday words, then HSK 1→3 by frequency
const STROKES = window.STROKES;
const bridge = window.api || mockApi();
const root = document.getElementById('root');
const DAY = 86400000;

// ---------------------------------------------------------------- brand colors (for SVG + stroke writer)
const C = { paper: '#F2EEE3', raised: '#FBF9F3', ink: '#151412', red: '#D2321C', redText: '#B02A16', gold: '#E3A23B', spring: '#2E7466', stone: '#D8D0BE', smoke: '#5E584C' };

// ---------------------------------------------------------------- icons (stroke icons, 1.8px)
const ic = (d, extra = '') => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const I = {
  speaker: ic('<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/>'),
  mic: ic('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
  compare: ic('<path d="M7 4v16M17 4v16M3 8h8M13 16h8"/>'),
  pen: ic('<path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/><path d="M14 7l3 3"/>'),
  bulb: ic('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'),
  clear: ic('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
  play: ic('<path d="M7 5l12 7-12 7V5z"/>'),
  gear: ic('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'),
  back: ic('<path d="M15 5l-7 7 7 7"/>'),
  x: ic('<path d="M6 6l12 12M18 6L6 18"/>'),
  list: ic('<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>')
};

// 田字格: square with dashed vermilion center lines (~40%)
const tzg = `<svg class="tzg" viewBox="0 0 100 100" preserveAspectRatio="none"><g stroke="${C.red}" stroke-opacity=".4" stroke-width=".6" stroke-dasharray="2.4 2.4" vector-effect="non-scaling-stroke"><line x1="50" y1="0" x2="50" y2="100"/><line x1="0" y1="50" x2="100" y2="50"/></g></svg>`;
// Seal logo: vermilion square, paper inset border, 天 over 天
const seal = (cls = 'seal') => `<svg class="${cls}" viewBox="0 0 48 48" aria-label="Spring · 泉"><rect width="48" height="48" rx="7" fill="${C.red}"/><rect x="3.5" y="3.5" width="41" height="41" rx="4.5" fill="none" stroke="${C.paper}" stroke-width="2"/><text x="24" y="34.5" font-family="Noto Sans SC Display" font-weight="900" font-size="27" fill="${C.paper}" text-anchor="middle">泉</text></svg>`;
// Completed-level stamp: vermilion square + paper check
const stamp = `<svg class="stamp" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="${C.red}"/><path d="M6.5 12.5l3.5 3.5 7.5-8" fill="none" stroke="${C.paper}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
// Tea cups 茶杯 (streak unit) — brand SVGs used as-is.
const CUP = { studied: ['cup-studied', 'Studied'], frozen: ['cup-frozen', 'Streak freeze'], none: ['cup-not-yet', 'Not yet'] };
const cup = (state, h = 46) => `<img class="cup" src="img/${CUP[state][0]}.svg" alt="${CUP[state][1]}" style="height:${h}px">`;

// Sayings 格言: brush script on loud screens only, always with the Kaiti line + English.
const SAYINGS = [
  ['天天向上', 'tiān tiān xiàng shàng', 'Improve every day.'],
  ['熟能生巧', 'shú néng shēng qiǎo', 'Practice makes perfect.'],
  ['滴水穿石', 'dī shuǐ chuān shí', 'Dripping water wears through stone.'],
  ['循序渐进', 'xún xù jiàn jìn', 'Step by step.'],
  ['勤能补拙', 'qín néng bǔ zhuō', 'Hard work makes up for lack of talent.'],
  ['锲而不舍', 'qiè ér bù shě', 'Keep carving, never give up.'],
  ['学无止境', 'xué wú zhǐ jìng', 'Learning has no end.'],
  ['千里之行，始于足下', 'qiān lǐ zhī xíng, shǐ yú zú xià', 'A journey of a thousand miles begins with a single step.']
];
const REVIEW_SAYING = ['温故知新', 'wēn gù zhī xīn', 'Review the old to learn the new.'];
function sayingOfDay() {
  if (!S.firstDay) { S.firstDay = today(); save(); }
  const n = Math.max(0, daysBetween(S.firstDay, today()));
  return SAYINGS[n % SAYINGS.length];
}
const sayCap = (sy, cls = '') => `<div class="saycap ${cls}"><span class="kai">${esc(sy[0])}</span> · <span class="en">${esc(sy[2])}</span></div>`;
// Big vertical brush saying: decoration only (aria-hidden), behind content, cropped by its parent.
const brush = (text, style) => `<div class="brush" aria-hidden="true" style="${style}">${esc(text).replace('，', '<br>')}</div>`;
// The art's circle sits 2 art-pixels high in each 64×64 file, so nudge it down by the same amount (whole screen pixels).
const rankBadge = (id, size = 64, locked = false) =>
  `<img class="rankbadge" src="img/ranks/${id}${locked ? '-locked' : ''}.png" alt="" width="${size}" height="${size}" style="transform:translateY(${Math.round(size / 32)}px)">`;
const dragon = (file, style) => `<img class="dragon" src="img/${file}.svg" alt="" style="${style}">`;

// ---------------------------------------------------------------- utilities
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pickN = (a, n) => shuffle(a).slice(0, n);
const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / DAY);
const hanChars = (s) => [...s].filter((c) => /\p{Script=Han}/u.test(c) && STROKES[c]);
const fmtTime = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const pad2 = (n) => String(n).padStart(2, '0');
function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return `${t.getUTCFullYear()}-W${Math.ceil(((t - y) / DAY + 1) / 7)}`;
}
function toast(msg, ms = 2600) {
  const t = document.getElementById('toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), ms);
}

// ---------------------------------------------------------------- levels
const LEVELS = [];
for (const hsk of [1, 2, 3]) {
  const ids = W.filter((w) => w.hsk === hsk).map((w) => w.id);
  for (let i = 0; i < ids.length; i += 5) LEVELS.push({ n: LEVELS.length + 1, hsk, ids: ids.slice(i, i + 5) });
}

// ---------------------------------------------------------------- state
const DEFAULT = () => ({
  v: 2, words: {}, levelsDone: {}, xp: 0,
  streak: { count: 0, last: '', freezes: 3, best: 0 },
  days: [], frozen: [], firstDay: '',
  check: null, quizPending: false, quizzes: [],
  jinan: {}, extraWords: [],
  week: { key: isoWeek(), levels: 0, goalHit: false }, weeklyGoal: 5,
  bests: { review2: 0, review5: 0, combo: 0 },
  badges: {},
  stats: { levels: 0, reviews: 0, drawn: 0, recordings: 0, typed: 0, placementPassed: 0, goalsHit: 0, perfectQuizzes: 0 },
  settings: { voice: '', rate: 'normal', reminderOn: false, reminderTime: '19:00', openAtLogin: false, imeTipSeen: false }
});
let S = DEFAULT();
let saveTimer = null;
function save() { clearTimeout(saveTimer); saveTimer = setTimeout(() => bridge.save(S), 250); }
function merge(base, d) {
  for (const k of Object.keys(d || {})) {
    if (d[k] && typeof d[k] === 'object' && !Array.isArray(d[k]) && base[k] && typeof base[k] === 'object') merge(base[k], d[k]);
    else base[k] = d[k];
  }
  return base;
}

// ---------------------------------------------------------------- spaced repetition (unchanged)
function learnWord(id, ivlDays = 1) {
  if (S.words[id]) return;
  S.words[id] = { reps: 1, ease: 2.5, ivl: ivlDays, due: Date.now() + ivlDays * DAY - 3600000, lapses: 0, ok: 0, bad: 0, at: Date.now() };
}
function grade(id, good) {
  const w = S.words[id]; if (!w) return;
  if (good) {
    w.ok++; w.reps++;
    w.ivl = Math.max(w.ivl, w.ivl < 1 ? 1 : w.reps <= 2 ? 3 : Math.round(w.ivl * w.ease));   // a correct answer never shortens the gap
    w.ease = Math.min(3, w.ease + 0.05);
    w.due = Date.now() + w.ivl * DAY - 3600000;
  } else {
    w.bad++; w.lapses++; w.reps = 0; w.ivl = 0;
    w.ease = Math.max(1.3, w.ease - 0.2);
    w.due = Date.now() + 10 * 60000;
  }
}
const learnedIds = () => Object.keys(S.words).map(Number);
const dueIds = () => learnedIds().filter((id) => S.words[id].due <= Date.now()).sort((a, b) => S.words[a].due - S.words[b].due);
const mastery = (id) => { const w = S.words[id]; if (!w) return 0; const v = w.ivl; return v >= 60 ? 5 : v >= 21 ? 4 : v >= 7 ? 3 : v >= 3 ? 2 : v >= 1 ? 1 : 0; };
const levelMastery = (lv) => lv.ids.reduce((a, id) => a + mastery(id), 0) / (lv.ids.length * 5);

// ---------------------------------------------------------------- game layer (unchanged rules)
// Ranks: Rat → Dragon, 12 zodiac ranks across HSK 1–4. Milestone ranks (gate) also need that HSK band finished.
// Each rank's badge is img/ranks/<en lowercased>.png (and -locked.png).
const RANKS = [
  [0, '鼠', 'Rat'],          [18000, '兔', 'Rabbit'],  [46000, '鸡', 'Rooster', 1],
  [68000, '羊', 'Goat'],     [90000, '狗', 'Dog'],     [113000, '猪', 'Pig', 2],
  [142000, '猴', 'Monkey'],  [171000, '马', 'Horse'],  [200000, '蛇', 'Snake', 3],
  [230000, '牛', 'Ox'],      [258000, '虎', 'Tiger'],  [287000, '龙', 'Dragon', 4]
];
const rankId = (rk) => rk[2].toLowerCase();
const bandDone = (h) => LEVELS.filter((l) => l.hsk === h).every((l) => S.levelsDone[l.n]);
const rankOk = (r) => S.xp >= r[0] && (!r[3] || bandDone(r[3]));
function rank() {
  let i = 0; while (i + 1 < RANKS.length && rankOk(RANKS[i + 1])) i++;
  const [lo, hz, en, gate] = RANKS[i]; const next = RANKS[i + 1];
  const blocked = next && S.xp >= next[0] && next[3] && !bandDone(next[3]);
  return { i, id: en.toLowerCase(), hz, en, lo, milestone: !!gate, next: next ? next[0] : null, nextName: next ? next[2] : null,
    nextNote: !next ? 'Top rank' : blocked ? `Finish HSK ${next[3]} to become ${next[2]}` : `${(next[0] - S.xp).toLocaleString()} XP to ${next[2]}`,
    pct: next ? Math.min(1, (S.xp - lo) / (next[0] - lo)) : 1 };
}
function addXp(n) { if (sess && sess.mult) n = Math.round(n * sess.mult); S.xp += n; if (sess) sess.xp += n; }

const BADGES = [
  ['first', '第一步', 'First step', 'Finish your first level', () => S.stats.levels >= 1],
  ['lv10', '十', 'Ten levels', 'Finish 10 levels', () => S.stats.levels >= 10],
  ['lv25', '廿五', 'Quarter century', 'Finish 25 levels', () => S.stats.levels >= 25],
  ['lv50', '五十', 'Halfway to 100', 'Finish 50 levels', () => S.stats.levels >= 50],
  ['lv100', '百', 'One hundred', 'Finish 100 levels', () => S.stats.levels >= 100],
  ['w50', '词', 'Word collector', 'Learn 50 words', () => learnedIds().length >= 50],
  ['w150', '词汇', 'Vocabulary', 'Learn 150 words', () => learnedIds().length >= 150],
  ['w500', '五百', 'HSK 1 sized', 'Learn 500 words', () => learnedIds().length >= 500],
  ['hsk1', '一级', 'HSK 1 complete', 'Finish every HSK 1 level', () => LEVELS.filter((l) => l.hsk === 1).every((l) => S.levelsDone[l.n])],
  ['draw100', '书法', 'Calligrapher', 'Draw 100 characters', () => S.stats.drawn >= 100],
  ['draw500', '书法家', 'Master hand', 'Draw 500 characters', () => S.stats.drawn >= 500],
  ['rec50', '说话', 'Speaker', 'Record yourself 50 times', () => S.stats.recordings >= 50],
  ['type100', '打字', 'Typist', 'Type 100 words correctly', () => S.stats.typed >= 100],
  ['st7', '七天', 'One week', 'Reach a 7-day streak', () => S.streak.best >= 7],
  ['st30', '一个月', 'One month', 'Reach a 30-day streak', () => S.streak.best >= 30],
  ['combo20', '闪电', 'Lightning', 'Hit a 20 combo', () => S.bests.combo >= 20],
  ['rev500', '复习', 'Reviewer', 'Review 500 cards', () => S.stats.reviews >= 500],
  ['goal', '目标', 'On target', 'Hit your weekly goal', () => S.stats.goalsHit >= 1],
  ['skip', '跳级', 'Skipped ahead', 'Check off a block in the level check', () => S.stats.placementPassed >= 1],
  ['perfect', '满分', 'Full marks', 'Score 100% on a pop quiz', () => S.stats.perfectQuizzes >= 1],
  ['stamp1', '印', 'First stamp', 'Finish a quest in Jinan', () => Object.values((S.jinan && S.jinan.quests) || {}).some((q) => q.complete)],
  ['seal1', '城', 'District seal', 'Finish every conversation in a district', () => Object.keys((S.jinan && S.jinan.seals) || {}).length >= 1]
];
function checkBadges() {
  const got = [];
  for (const [id, hz, name, , test] of BADGES) if (!S.badges[id] && test()) { S.badges[id] = Date.now(); got.push({ hz, name }); }
  return got;
}
// Streak: a missed day breaks it unless you choose to spend freezes (asked when the app opens).
const FREEZE_MAX = 3;
function currentStreak() {
  const st = S.streak; if (!st.last || !st.count) return 0;
  return daysBetween(st.last, today()) <= 1 ? st.count : 0;
}
// Days missed since the last study day (not counting today). >0 means a decision is pending.
function missedDays() {
  const st = S.streak; if (!st.last || !st.count) return 0;
  return Math.max(0, daysBetween(st.last, today()) - 1);
}
function useFreezes() {
  const st = S.streak, n = missedDays(); if (!n || n > st.freezes) return false;
  for (let i = 1; i <= n; i++) { const d = new Date(st.last + 'T12:00'); d.setDate(d.getDate() + i); S.frozen.push(today(d)); }
  st.freezes -= n;
  const y = new Date(); y.setDate(y.getDate() - 1); st.last = today(y);   // streak now continues from yesterday
  save(); return true;
}
function endStreak() { S.streak.count = 0; save(); }
function markPractice() {
  const t = today(), st = S.streak;
  if (!S.days.includes(t)) { S.days.push(t); if (S.days.length > 800) S.days = S.days.slice(-800); }
  if (st.last === t) return false;
  st.count = st.last && st.count && daysBetween(st.last, t) === 1 ? st.count + 1 : 1;
  st.last = t;
  st.best = Math.max(st.best, st.count);
  bridge.setReminder({ lastPractice: t });
  return st.count % 7 === 0;   // streak milestone reached today
}
function weekLevels() { return S.week.key === isoWeek() ? S.week.levels : 0; }
function bumpWeek() {
  weekState();
  S.week.levels++;
  return false;   // the weekly goal is now plan days (plan.js)
}
const nextLevel = () => (LEVELS.find((l) => !S.levelsDone[l.n]) || LEVELS[LEVELS.length - 1]);
// Tea cups for this week (Mon–Sun): studied, frozen, or not yet.
function weekCups() {
  const now = new Date(); const dow = (now.getDay() + 6) % 7; const out = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now); d.setDate(now.getDate() - dow + i); const ds = today(d);
    const state = S.days.includes(ds) ? 'studied' : S.frozen.includes(ds) ? 'frozen' : 'none';
    out.push({ l: 'MTWTFSS'[i], state, today: i === dow });
  }
  return out;
}

// ---------------------------------------------------------------- audio
let nativeVoices = [];
async function initVoices() {
  try { nativeVoices = await bridge.voices(); } catch { nativeVoices = []; }
  if (!S.settings.voice && nativeVoices.length) {
    S.settings.voice = nativeVoices.find((v) => /premium/i.test(v)) || nativeVoices.find((v) => /enhanced/i.test(v)) || nativeVoices.find((v) => /tingting|婷婷/i.test(v)) || nativeVoices[0];
    save();
  }
  // a woman's and a man's voice for the characters (macOS names; anything else stays pickable in Settings)
  const pick = (rx) => { const m = nativeVoices.filter((v) => rx.test(v)); return m.find((v) => /premium/i.test(v)) || m.find((v) => /enhanced/i.test(v)) || m[0] || ''; };
  if (nativeVoices.length && S.settings.voiceF === undefined) { S.settings.voiceF = pick(VOICE_F) || S.settings.voice; save(); }
  if (nativeVoices.length && S.settings.voiceM === undefined) { S.settings.voiceM = pick(VOICE_M); save(); }
}
const VOICE_F = /^(ting-?ting|li-?li|lilian|sha-?sha|yue|lan-?lan|pan-?pan|yu-?shu|mei-?jia|婷婷|莉莉|姗姗|月)/i;
const VOICE_M = /^(han|li-?mu|bin-?bin|li-?sheng|hao-?hao|瀚|李牧|彬彬)/i;
// who speaks: a character id (Jinan), or 'f' / 'm'. Women and men get their own voice; everything else uses the main one.
const CHAR_SEX = { wang: 'f', lu: 'f', xie: 'f', lin: 'f', chen: 'f', zhang: 'm', su: 'm', sun: 'm', pan: 'm', bai: 'm', ma: 'm', lele: 'f', kid: 'm', cook: 'm', seller: 'm' };
function voiceFor(who) {
  const sex = who === 'f' || who === 'm' ? who : CHAR_SEX[who];
  return (sex === 'f' && S.settings.voiceF) || (sex === 'm' && S.settings.voiceM) || S.settings.voice;
}
function webVoice() {
  const vs = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
  return vs.find((v) => v.name === S.settings.voice) || vs.find((v) => /zh[-_]CN/i.test(v.lang)) || vs.find((v) => /^zh/i.test(v.lang));
}
// Silent mode: no sound, no speaking/recording. Turns itself off at the start of each day.
function silentOn() { const m = S.settings.silent; return !!(m && m.on && m.date === today()); }
function setSilent(on) { S.settings.silent = { on, date: today() }; document.body.classList.toggle('silent', on); if (on) { try { bridge.stopSpeak(); } catch {} if (window.speechSynthesis) speechSynthesis.cancel(); } save(); }
async function speak(text, who, slowNow) {
  if (silentOn()) return false;
  const slow = slowNow || S.settings.rate === 'slow';
  if (nativeVoices.length) return bridge.speak({ text, voice: who ? voiceFor(who) : S.settings.voice, rate: slowNow ? 95 : slow ? 110 : 165 });
  return new Promise((res) => {
    if (!window.speechSynthesis) return res(false);
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN'; const v = webVoice(); if (v) u.voice = v;
    u.rate = slowNow ? 0.55 : slow ? 0.65 : 0.9;
    u.onend = u.onerror = () => res(true);
    speechSynthesis.speak(u);
  });
}

// ---------------------------------------------------------------- recording
const Rec = { mr: null, chunks: [], url: null, timer: null, on: false };
async function recStart(onUpdate) {
  try {
    await bridge.micAccess();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    Rec.chunks = []; Rec.mr = new MediaRecorder(stream); Rec.on = true;
    Rec.mr.ondataavailable = (e) => Rec.chunks.push(e.data);
    Rec.mr.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      if (Rec.url) URL.revokeObjectURL(Rec.url);
      Rec.url = URL.createObjectURL(new Blob(Rec.chunks, { type: Rec.mr.mimeType || 'audio/webm' }));
      Rec.on = false; S.stats.recordings++; save(); onUpdate();
      playRec();
    };
    Rec.mr.start(); onUpdate();
    Rec.timer = setTimeout(recStop, 5000);
  } catch (e) {
    Rec.on = false; onUpdate();
    toast('Microphone unavailable. Allow it in System Settings › Privacy & Security › Microphone.', 5000);
  }
}
function recStop() { clearTimeout(Rec.timer); if (Rec.mr && Rec.mr.state === 'recording') Rec.mr.stop(); }
function playRec() { return new Promise((res) => { if (!Rec.url) return res(); const a = new Audio(Rec.url); a.onended = a.onerror = res; a.play().catch(res); }); }
async function compare(text) { await speak(text); await new Promise((r) => setTimeout(r, 250)); await playRec(); }
function recReset() { recStop(); if (Rec.url) URL.revokeObjectURL(Rec.url); Rec.url = null; Rec.on = false; }

// ---------------------------------------------------------------- stroke writers
let writers = [];
function makeWriter(el, ch, opts = {}) {
  const size = el.clientWidth || 320;
  const w = HanziWriter.create(el, ch, Object.assign({
    width: size, height: size, padding: Math.round(size * 0.08),
    showCharacter: false, showOutline: true,
    strokeColor: C.ink, outlineColor: C.stone, drawingColor: C.ink, highlightColor: C.spring,
    radicalColor: null, drawingWidth: Math.max(8, Math.round(size / 15)),
    strokeAnimationSpeed: 1.4, delayBetweenStrokes: 120, strokeFadeDuration: 180,
    charDataLoader: (c, ok, err) => (STROKES[c] ? ok(STROKES[c]) : err('missing'))
  }, opts));
  writers.push(w); return w;
}
function clearWriters() { writers.forEach((w) => { try { w.cancelQuiz(); } catch {} }); writers = []; }

// ---------------------------------------------------------------- router + keys
let keyHandler = null;
let sess = null;
let tick = null;
document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const inInput = e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT';
  if (inInput && e.key !== 'Enter' && e.key !== 'Escape') return;
  if (e.isComposing || e.keyCode === 229) return;
  if (keyHandler) keyHandler(e);
});
// "Go back": when one drill screen replaces another, keep a read-only copy of the one you just left.
let prevShot = null;
function render(html, keys, after) {
  if (window.HomeScene) HomeScene.stop();   // the scene runs only on Home (home() mounts it again)
  const isDrill = html.includes('class="drill"'), oldStage = root.querySelector('.drill .stage');
  if (isDrill && oldStage) {
    const f = root.querySelector('.drill .foot #hints');
    prevShot = { stage: oldStage.innerHTML.replace(/\sid="[^"]*"/g, ''), foot: f && /fb/.test(f.className) ? f.innerHTML : '' };
  } else if (!isDrill) prevShot = null;
  clearWriters(); clearInterval(tick); tick = null;
  root.innerHTML = html;
  if (isDrill && prevShot) {
    const tb = root.querySelector('.drill .topbar');
    if (tb) { tb.insertAdjacentHTML('beforeend', `<button class="gobackbtn" id="goback" title="Look at the previous card again">${I.back} Go back</button>`); tb.querySelector('#goback').addEventListener('click', peekBack); }
  }
  // Chinese inside small labels: display face on loud screens, Kaiti in drills (via CSS).
  root.querySelectorAll('.label').forEach((el) => { el.innerHTML = el.innerHTML.replace(/([\u3400-\u9fff]+)/g, '<span class="zh">$1</span>'); });
  const m = root.querySelector('.main, .reward'); if (m) m.scrollTop = 0;
  keyHandler = keys || null;
  root.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));
  document.body.classList.toggle('silent', silentOn());
  const sb = root.querySelector('#silentbtn');
  if (sb) sb.addEventListener('click', () => { setSilent(!silentOn()); sb.classList.toggle('on', silentOn()); const sw = sb.querySelector('.switch'); if (sw) sw.classList.toggle('on', silentOn()); toast(silentOn() ? 'Silent mode on · reading and writing only' : 'Silent mode off'); });
  if (after) after();
}
// Show the previous drill screen as it was when you left it. Look only: nothing can be answered again.
function peekBack() {
  if (!prevShot || document.getElementById('peekbox')) return;
  const paused = sess && sess.type === 'review' && !sess.pauseAt; if (paused) sess.pauseAt = Date.now();
  const box = document.createElement('div');
  box.className = 'scrim peekscrim'; box.id = 'peekbox';
  box.innerHTML = `<div class="peekcard" role="dialog" aria-label="Previous card">
    <div class="peekhead"><span class="label">Previous · look only</span><button class="btn-primary" id="peekok">Back to now <kbd>↵</kbd></button></div>
    <div class="peekstage">${prevShot.stage}</div>${prevShot.foot ? `<div class="peekfoot">${prevShot.foot}</div>` : ''}</div>`;
  root.appendChild(box);
  const prev = keyHandler;
  const close = () => { box.remove(); keyHandler = prev; if (paused && sess && sess.pauseAt) { sess.paused += Date.now() - sess.pauseAt; sess.pauseAt = 0; } };
  keyHandler = (e) => { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); close(); } };
  box.querySelector('#peekok').addEventListener('click', close);
  box.addEventListener('mousedown', (e) => { if (e.target === box) close(); });
}
function on(sel, ev, fn) { root.querySelectorAll(sel).forEach((el) => el.addEventListener(ev, fn)); }
function go(where, arg) {
  if (window.speechSynthesis) speechSynthesis.cancel();
  planRun = false; HZ_LOCK = false;
  recReset();
  ({ home, levels, review: reviewStart, words, badges, settings, wordDetail, jinan: jCity, people: () => jPeople('side'), stories: () => stShelf() })[where](arg);
}


// ================================================================ LOUD SHELL
function shell(active, main, mainExtra = '', mainCls = 'main') {
  const r = rank(), due = dueIds().length, nl = nextLevel(), stk = currentStreak();
  const nav = [
    ['levels', '学', 'Learn'], ['review', '复', 'Review', due ? `<span class="count">${due}</span>` : ''],
    ['badges', '奖', 'Badges'], ['stories', '故', 'Stories'], ['jinan', '图', 'Map'], ['people', '人', 'People']
  ];
  return `<div class="shell">
    <aside class="side">
      <div class="couplet" aria-hidden="true"><span>千里之行</span><span>始于足下</span></div>
      <button class="brand" data-go="home" title="Home">${seal()}<div><div class="t">Spring</div><div class="s">HSK 3.0 · Level ${nl.n}</div></div></button>
      <nav class="nav">${nav.map(([g, k, t, x = '']) => `<button ${g ? `data-go="${g}"` : ''} class="${g && g === active ? 'on' : ''} ${g ? '' : 'dim'}"><span class="k">${k}</span><span class="sp">${t}</span>${x}</button>`).join('')}</nav>
      <button class="silentbtn ${silentOn() ? 'on' : ''}" id="silentbtn" title="No sound, no speaking. Listening drills become reading drills. Turns off each new day."><span class="k">静</span><span class="sp">Silent mode</span><span class="switch sm ${silentOn() ? 'on' : ''}"></span></button>
      <div class="rankcard">
        <div class="label">Rank</div>
        <div class="rkrow">${rankBadge(r.id, 56)}<div><div class="rn">${r.hz}</div><div class="en">${r.en}</div></div></div>
        <div class="xp">${S.xp.toLocaleString()} XP</div>
        <div class="bar thin gold" style="margin-top:8px"><i style="width:${Math.round(r.pct * 100)}%"></i></div>
        <div class="nx">${r.nextNote}</div>
        <div class="rdiv"></div>
        <div class="label"><span class="zh">连胜</span> Streak</div>
        <div class="stk"><b>${stk}</b> ${stk === 1 ? 'day' : 'days'}</div>
        <div class="nx">${S.streak.freezes} freeze${S.streak.freezes === 1 ? '' : 's'} left</div>
      </div>
      <div class="side-foot"><button data-go="words">${I.list} Words</button><button data-go="settings">${I.gear} Settings</button></div>
    </aside>
    <section class="${mainCls}">${mainExtra}${main}</section>
  </div>`;
}
function tileHtml(lv, current) {
  const w = W[lv.ids[0]], done = !!S.levelsDone[lv.n];
  return `<button class="tile ${current ? 'current' : ''}" data-lv="${lv.n}" title="${esc(lv.ids.map((i) => W[i].h).join(' '))}">
    ${done ? stamp : current ? '<span class="now">NEXT</span>' : ''}
    <span class="w">${esc(w.h)}</span>
    <span class="tl">${pad2(lv.n)} · ${esc(w.m)}</span>
    <span class="bar thin spring"><i style="width:${Math.round(levelMastery(lv) * 100)}%"></i></span>
  </button>`;
}

// ---------------------------------------------------------------- home
// The Home screen: the animated scene of Baotu Spring and Daming Lake fills the main area (home-scene.js /
// quan-scene.js); on it sits only the plan card, bottom right (over the lake, clear of the tower).
const GREET = (h) => (h >= 5 && h < 10 ? '早上好！' : h >= 10 && h < 14 ? '你好！' : h >= 14 && h < 17 ? '下午好！' : '晚上好！');
function home() {
  sess = null;
  const now = new Date();
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const zh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const learned = learnedIds().length, due = dueIds().length;
  const sy = sayingOfDay();
  const html = shell('home', `
      <div class="hscene" id="hscene"><canvas id="hcanvas" aria-label="Baotu Spring and Daming Lake, ${esc(now.toLocaleTimeString([], { hour: 'numeric' }))}"></canvas></div>
      <div class="hplan">
        <div class="hgreet"><div class="hg1"><span class="g">${GREET(now.getHours())}</span><span class="d">${days[now.getDay()]} · ${zh[now.getDay()]}</span></div>
          <div class="hsay"><span class="kai">${esc(sy[0])}</span> · ${esc(sy[2])}</div></div>
        ${homePlanRows()}
      </div>`, '', 'hmain');
  const pending = missedDays();
  const quizNow = !pending && S.quizPending;
  render(html + (pending ? freezeAsk(pending) : quizNow ? quizAsk() : ''), (e) => {
    if (pending) { if (e.key === 'Enter') answerFreeze(true); if (e.key === 'Escape') answerFreeze(false); return; }
    if (quizNow) { if (e.key === 'Enter') startQuiz(); return; }
    if (e.key === 'Enter') planStart();
    if (e.key === 'l') startLevel(nextLevel().n);
    if (e.key === 'r' && learned) heroAction();
  }, () => {
    on('#plango', 'click', planStart);
    on('#fz-yes', 'click', () => answerFreeze(true));
    on('#fz-no', 'click', () => answerFreeze(false));
    on('#qz-go', 'click', startQuiz);
    mountHomeScene();
  });
  function answerFreeze(yes) { if (yes && useFreezes()) toast('Streak kept'); else endStreak(); home(); }
  function heroAction() { if (!learned) startLevel(nextLevel().n); else startReview(due ? 0 : 2); }
}
// The scene module loads after the app's plain scripts, so on launch Home may render before it is ready.
function mountHomeScene() {
  const go = () => {
    const c = document.getElementById('hcanvas'), fit = document.getElementById('hscene');
    if (c && fit && window.HomeScene) HomeScene.mount(c, fit, S.settings.sceneTime || '');
  };
  if (window.HomeScene) go(); else window.addEventListener('homescene-ready', go, { once: true });
}

// Freeze prompt: shown on Home after missed days, until answered.
function freezeAsk(n) {
  const st = S.streak, can = st.freezes >= n;
  return `<div class="scrim"><div class="fzcard" role="dialog" aria-label="Streak freeze">
    <div class="label">Streak · 连胜</div>
    <div class="fzcups">${Array.from({ length: Math.min(n, 3) }, () => cup(can ? 'frozen' : 'none', 92)).join('')}</div>
    <h2>${can ? `Keep your ${st.count}-day streak?` : `Your ${st.count}-day streak ended`}</h2>
    <p>${can ? `You missed ${n} day${n > 1 ? 's' : ''}. Use ${n} freeze${n > 1 ? 's' : ''} to cover ${n > 1 ? 'them' : 'it'}. You have ${st.freezes} of ${FREEZE_MAX}.`
            : `You missed ${n} days and have ${st.freezes} freeze${st.freezes === 1 ? '' : 's'}. Today starts a new streak.`}</p>
    <div class="actions">${can ? `<button class="btn-secondary" id="fz-no">Let it reset <kbd>Esc</kbd></button><button class="btn-primary" id="fz-yes">Use ${n} freeze${n > 1 ? 's' : ''} <kbd>↵</kbd></button>`
            : `<button class="btn-primary" id="fz-no">Start fresh <kbd>↵</kbd></button>`}</div>
  </div></div>`;
}

function quizAsk() {
  return `<div class="scrim"><div class="fzcard" role="dialog" aria-label="Pop quiz">
    <div class="label">Pop quiz · 测验</div>
    <h2>Time for a pop quiz</h2>
    <p>About 10 questions on words you learned a few days ago: hear it, type it, draw it. Misses go straight back to Review.</p>
    <div class="actions"><button class="btn-primary" id="qz-go">Start quiz <kbd>↵</kbd></button></div>
  </div></div>`;
}

// ---------------------------------------------------------------- level list
function levels() {
  const nl = nextLevel().n;
  const main = `<div class="pagehead"><div class="label">HSK 3.0 · ${LEVELS.length} levels</div><h1>Levels</h1><p>Each level teaches 5 words in about 15 minutes. Everything is open.</p></div>
    <div class="sechead" style="margin-top:-8px"><span></span><button class="link" id="place">${checkLabel()} →</button></div>
    ${[1, 2, 3].map((h) => {
      const band = LEVELS.filter((l) => l.hsk === h);
      return `<div class="sechead" style="margin-top:26px"><h2>HSK ${h}</h2><span class="label">${band.filter((l) => S.levelsDone[l.n]).length} / ${band.length} done</span></div>
      <div class="tiles compact">${band.map((l) => tileHtml(l, l.n === nl)).join('')}</div>`;
    }).join('')}`;
  render(shell('levels', main), (e) => { if (e.key === 'Escape') go('home'); }, () => {
    on('[data-lv]', 'click', (e) => startLevel(+e.currentTarget.dataset.lv));
    on('#place', 'click', () => startCheck());
  });
}

// ================================================================ QUIET DRILL SHELL
let HZ_LOCK = false;
// Four pinyin spellings of a word: the real tones + three with one or two syllables' tones changed.
function toneOptions(w) {
  const syl = String(w.n || '').trim().split(/\s+/).filter(Boolean).map((x) => { const m = x.match(/^(.*?)(\d)$/); return m ? [m[1], +m[2]] : [x, 5]; });
  const show = (tones) => syl.map(([b], k) => {
    const t = tones[k]; try { return window.pinyinPro.convert(`${b}${t === 5 ? '' : t}`, { format: 'numToSymbol' }).replace(/\d/g, ''); } catch { return b; }
  }).join('').replace(/v/g, 'ü');
  const real = syl.map((x) => x[1]), key = (t) => t.join(','), seen = new Set([key(real)]), out = [{ py: show(real), ok: true }];
  for (let guard = 0; out.length < 4 && guard < 200; guard++) {
    const t = real.slice(), k = Math.floor(Math.random() * t.length);
    t[k] = 1 + Math.floor(Math.random() * 4);
    if (t.length > 1 && Math.random() < 0.35) { const j = Math.floor(Math.random() * t.length); t[j] = 1 + Math.floor(Math.random() * 4); }
    if (!seen.has(key(t))) { seen.add(key(t)); out.push({ py: show(t), ok: false }); }
  }
  return out;
}
// A wrong answer: a box with the right answer that you confirm (Enter) before moving on.
function showWrong(w, onOk, yours, custom) {
  const old = document.getElementById('wrongbox'); if (old) old.remove();
  const box = document.createElement('div');
  box.className = 'scrim wrongscrim'; box.id = 'wrongbox';
  box.innerHTML = `<div class="wrongcard" role="dialog" aria-label="Correct answer">
    <div class="label">Not quite · 正确答案</div>
    ${yours ? `<div class="wyours">You wrote <span class="kai">${esc(yours)}</span></div>` : ''}
    ${custom || `<div class="whz kai">${esc(w.h)}</div><div class="wpy">${esc(w.p)}</div><div class="wm">${esc(w.m)}</div>`}
    <div class="actions"><button class="btn-outline" id="wplay">${I.speaker} Listen <kbd>Space</kbd></button><button class="btn-primary" id="wok">Got it <kbd>↵</kbd></button></div>
    ${sess && ['level', 'quiz', 'plan', 'review'].includes(sess.type) ? `<div class="smoke wnote">It'll come back in a few cards.</div>` : ''}</div>`;
  root.appendChild(box);
  const prev = keyHandler;
  const close = () => { box.remove(); keyHandler = prev; onOk && onOk(); };
  keyHandler = (e) => { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); close(); } else if (e.key === ' ') { e.preventDefault(); speak(w.h); } };
  box.querySelector('#wok').addEventListener('click', close);
  box.querySelector('#wplay').addEventListener('click', () => speak(w.h));
  setTimeout(() => box.querySelector('#wok').focus(), 50);
}
function distractors(id, n, field) {
  const w = W[id];
  const pool = W.filter((x) => x.id !== id && x.m !== w.m && x.h !== w.h && (field !== 'h' || x.h.length === w.h.length));
  const near = pool.filter((x) => Math.abs(x.id - id) < 160);
  return pickN(near.length >= n ? near : pool, n);
}
function comboHtml(n) { return `<span class="combo ${n >= 2 ? '' : 'off'}" id="combo"><i></i>×${n} combo</span>`; }
function topbar() {
  if (sess.type === 'review') {
    const pct = sess.limit ? Math.min(1, revElapsed() / sess.limit) : sess.count / Math.max(1, sess.count + sess.queue.length + 1);   // (retries aren't counted)
    return `<div class="topbar"><button class="icon-btn sm" id="quit" aria-label="Close">${I.x}</button>
      <div class="bar thin ink"><i id="pbar" style="width:${Math.round(pct * 100)}%"></i></div>
      <span class="pos">${sess.count}${sess.min ? '' : ` / ${sess.count + sess.queue.length + 1}`}</span>${comboHtml(sess.combo)}<span class="time" id="clock"></span></div>`;
  }
  const total = sess.items.length, at = Math.min(sess.i + 1, total);
  return `<div class="topbar"><button class="icon-btn sm" id="quit" aria-label="Close">${I.x}</button>
    <div class="bar thin ink"><i style="width:${Math.round((sess.i / total) * 100)}%"></i></div>
    <span class="pos">${sess.type === 'quiz' ? 'Quiz ' : ''}${at} / ${total}</span>${sess.type === 'level' ? comboHtml(sess.combo) : '<span class="combo off"></span>'}<span class="time" id="clock">${fmtTime(Date.now() - sess.start)}</span></div>`;
}
function drill(stage, foot) {
  return `<div class="drill">${topbar()}<div class="stage">${stage}</div><div class="foot">${foot}</div></div>`;
}
const hints = (list) => `<div class="hints" id="hints">${list.filter(([, t]) => !(silentOn() && /listen|record|compare/.test(t))).map(([k, t]) => `<span><kbd>${k}</kbd> ${t}</span>`).join('')}</div>`;
const pyPill = (id = 'py', text = 'Show pinyin', key = 'P') => `<button class="pypill" id="${id}">${text} <kbd>${key}</kbd></button>`;
function showPinyin(w, id = 'py') { const p = root.querySelector('#' + id); if (!p) return; p.className = 'pypill shown'; p.textContent = w.p; }
function startClock() {
  tick = setInterval(() => { const c = document.getElementById('clock'); if (c && sess) c.textContent = sess.type === 'review' ? fmtTime(sess.limit ? sess.limit - revElapsed() : revElapsed()) : sess.limit ? fmtTime(sess.limit - (Date.now() - sess.start)) : fmtTime(Date.now() - sess.start); }, 500);
  on('#quit', 'click', quitSession);
}
function quitSession() {
  if (sess && sess.type === 'level' && sess.i > 0 && !confirm('Leave this level? Progress in it will be lost.')) return;
  if (sess && sess.type === 'review' && sess.count > 0) return finishReview();
  if (sess && sess.type === 'quiz' && sess.i > 0 && !confirm('The pop quiz is required. If you leave, it starts over next time.')) return;
  save(); go('home');
}
function stageKeys(extra) {
  return (e) => {
    if (e.key === 'Escape') return quitSession();
    if (extra) extra(e);
  };
}
function setFoot(cls, html) { const h = root.querySelector('#hints'); if (h) { h.className = 'fb ' + cls; h.innerHTML = html; } }
const answerLine = (w) => `<span class="kai">${esc(w.h)}</span> · ${esc(w.p)} · ${esc(w.m)}`;

// ---------------------------------------------------------------- level session
function startLevel(n) {
  if (S.quizPending) return startQuiz();
  const lv = LEVELS[n - 1];
  const fresh = lv.ids.filter((id) => !S.words[id]);      // words you already know (e.g. from the level check) are skipped
  const ids = fresh.length ? fresh : lv.ids;
  const items = [];
  ids.forEach((id) => items.push({ t: 'intro', id }));
  const practice = [];
  ids.forEach((id, k) => [k % 2 ? 'listen' : 'hearzi', 'read', 'pick', 'trace', 'type', 'tone'].forEach((t) => practice.push({ t, id })));
  ids.forEach((id) => { if (canRad(id)) practice.push({ t: 'radical', id }); });   // 部首: what a part of it means
  items.push(...spread(practice));
  const old = shuffle(dueIds().filter((i) => !ids.includes(i))).slice(0, 5);
  const fill = old.length < 5 ? pickN(learnedIds().filter((i) => !ids.includes(i) && !old.includes(i)), 5 - old.length) : [];
  const quiz = [];
  ids.forEach((id) => quiz.push({ t: hanChars(W[id].h).length <= 2 ? 'draw' : 'type', id, q: 1 }));
  [...old, ...fill].forEach((id) => quiz.push({ t: ['listen', 'read', 'type', 'pick', 'tone', 'hearzi'][Math.floor(Math.random() * 6)], id, q: 1, old: 1 }));
  items.push({ t: 'divider' }, ...shuffle(quiz));
  sess = { type: 'level', mult: S.levelsDone[n] ? 0.25 : 1, n, ids, items, i: 0, start: Date.now(), xp: 0, right: 0, wrong: 0, retried: new Set(), missed: {}, combo: 0, bestCombo: 0 };
  nextItem();
}
function spread(list) {
  for (let tries = 0; tries < 60; tries++) {
    const s = shuffle(list);
    if (s.every((x, i) => i === 0 || x.id !== s[i - 1].id)) return s;
  }
  return shuffle(list);
}
function nextItem() {
  if (sess.type === 'review' && sess.pauseAt) { sess.paused += Date.now() - sess.pauseAt; sess.pauseAt = 0; }
  if (sess.i >= sess.items.length) return sess.type === 'level' ? finishLevel() : sess.type === 'placement' ? checkPhaseDone() : sess.type === 'quiz' ? finishQuiz() : sess.type === 'plan' ? finishTones() : sess.type === 'review' ? reviewGen() : null;
  const it = sess.items[sess.i];
  recReset();
  if (silentOn()) it.t = ({ listen: 'read', hearzi: 'pick', tone: 'tonesee' })[it.t] || it.t;   // silent mode: reading versions
  HZ_LOCK = it.t !== 'intro' && it.t !== 'divider';   // no hover pinyin/English on a question until it's answered
  ({ intro, listen: choice, read: choice, pick: choice, tone: choice, tonesee: choice, hearzi: choice, type: typeIt, trace: drawIt, draw: drawIt, radical: radIt, pyread: choice, pyzi: choice, ctx: ctxIt, divider })[it.t](it);
}
function advance() { sess.i++; nextItem(); }
function scored(it, ok) {
  if (!it.retry) it.firstOk = ok;
  if (sess.type === 'review') { if (it.t !== 'radical') reviewScored(it, ok); else if (ok) addXp(5); return; }
  if (ok) { sess.right++; addXp(it.retry ? 4 : 10); } else {
    sess.wrong++; if (it.t !== 'radical') sess.missed[it.id] = (sess.missed[it.id] || 0) + 1;
    // a miss goes back into the stack (a few cards later) until you get it right
    const key = it.t + it.id; const n = (sess.retries = sess.retries || {})[key] = ((sess.retries || {})[key] || 0) + 1;
    if (['level', 'quiz', 'plan'].includes(sess.type) && n <= 4) sess.items.splice(Math.min(sess.items.length, sess.i + 4), 0, { ...it, retry: 1 });
  }
  // Level combo: consecutive correct answers (tracked, no XP change).
  if (sess.type === 'level') {
    sess.combo = ok ? sess.combo + 1 : 0; sess.bestCombo = Math.max(sess.bestCombo, sess.combo);
    const c = root.querySelector('#combo'); if (c) c.outerHTML = comboHtml(sess.combo);
  }
  if (it.retry) { save(); return; }
  if (it.t === 'radical') { save(); return; }
  if (sess.type === 'quiz' && S.words[it.id]) grade(it.id, ok);   // pop quiz: miss → back to Review, hit → mastery boost
  else if (it.old && S.words[it.id] && (!ok || S.words[it.id].due <= Date.now())) grade(it.id, ok);
  save();
}

function divider() {
  render(drill(`<div class="label">Final check · 测验</div><div class="meaning">Quick quiz on today's words${sess.items.some((x) => x.old) ? ' and a few older ones' : ''}.</div>`,
    `${hints([['Esc', 'leave']])}<div class="right"><button class="btn-primary" id="go">Start <kbd>↵</kbd></button></div>`),
  stageKeys((e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); } }), () => { startClock(); on('#go', 'click', advance); });
}

function intro(it) {
  const w = W[it.id];
  const idx = sess.ids.indexOf(it.id) + 1;
  const draw = () => {
    const r = root.querySelector('#recbtn');
    if (r) { r.classList.toggle('rec', Rec.on); r.innerHTML = Rec.on ? '<span class="rec-dot"></span>' : I.mic; }
    const rl = root.querySelector('#reclbl'); if (rl) rl.textContent = Rec.on ? 'Stop' : 'Record';
    const c = root.querySelector('#cmp'); if (c) c.disabled = !Rec.url;
  };
  const rec = () => (Rec.on ? recStop() : recStart(draw));
  render(drill(`
      <div class="label">New word · 新词 · ${idx} / ${sess.ids.length}</div>
      <div class="prompt-k">${esc(w.h)}</div>
      ${pyPill()}
      <div class="meaning" style="margin-top:14px">${esc(w.m)}</div>
      ${partsIntroHtml(w)}
      <div class="toolrow">
        <div class="tool"><button class="icon-btn" id="play" aria-label="Listen">${I.speaker}</button>Listen</div>
        <div class="tool"><button class="icon-btn" id="recbtn" aria-label="Record"></button><span id="reclbl">Record</span></div>
        <div class="tool"><button class="icon-btn" id="cmp" aria-label="Compare">${I.compare}</button>Compare</div>
        <div class="tool"><button class="icon-btn" id="strokes" aria-label="Strokes">${I.pen}</button>Strokes</div>
      </div>
      <div class="minigrids" id="anim"></div>`,
    `${hints([['Space', 'listen'], ['P', 'pinyin'], ['R', 'record'], ['C', 'compare'], ['S', 'strokes']])}<div class="right"><button class="btn-primary" id="next">Continue <kbd>↵</kbd></button></div>`),
  stageKeys((e) => {
    if (e.key === ' ') { e.preventDefault(); speak(w.h); }
    else if (e.key === 'p') showPinyin(w);
    else if (e.key === 'r') rec();
    else if (e.key === 'c' && Rec.url) compare(w.h);
    else if (e.key === 's') strokes();
    else if (e.key === 'Enter') { recStop(); advance(); }
  }), () => {
    startClock(); draw();
    on('#play', 'click', () => speak(w.h));
    on('#recbtn', 'click', rec);
    on('#cmp', 'click', () => compare(w.h));
    on('#strokes', 'click', strokes);
    on('#py', 'click', () => showPinyin(w));
    on('#next', 'click', () => { recStop(); advance(); });
    setTimeout(() => speak(w.h), 250);
  });
  function strokes() {
    const box = root.querySelector('#anim'); clearWriters();
    box.innerHTML = hanChars(w.h).map((c, i) => `<div class="grid xs">${tzg}<div id="a${i}"></div></div>`).join('');
    const ws = hanChars(w.h).map((c, i) => makeWriter(root.querySelector('#a' + i), c, { showOutline: true }));
    (async () => { for (const x of ws) await x.animateCharacter(); })();
  }
}

function choice(it) {
  const w = W[it.id];
  let prompt, opts, label;
  if (it.t === 'listen') {
    label = it.placement ? checkTag() : 'Hear · 听';
    prompt = `<button class="listen-btn" id="spk" aria-label="Play">${I.speaker}</button>`;
    opts = shuffle([w, ...distractors(it.id, 3)]).map((x) => ({ id: x.id, html: esc(x.m) }));
  } else if (it.t === 'read') {
    label = it.placement ? checkTag() : 'See · 看';
    prompt = `<div class="prompt-k">${esc(w.h)}</div>${it.placement ? '' : pyPill()}`;
    opts = shuffle([w, ...distractors(it.id, 3)]).map((x) => ({ id: x.id, html: esc(x.m) }));
  } else if (it.t === 'pyread') {
    label = it.placement ? checkTag() : 'Pinyin · 拼音';
    prompt = `<div class="prompt-py">${esc(w.p)}</div>`;
    opts = shuffle([w, ...distractors(it.id, 3)]).map((x) => ({ id: x.id, html: esc(x.m) }));
  } else if (it.t === 'pyzi') {
    label = it.placement ? checkTag() : 'Pinyin · 拼音 · pick the characters';
    prompt = `<div class="prompt-py">${esc(w.p)}</div>`;
    opts = shuffle([w, ...distractors(it.id, 3, 'h')]).map((x) => ({ id: x.id, html: `<span class="kai">${esc(x.h)}</span>` }));
  } else if (it.t === 'hearzi') {
    label = 'Hear · 听字 · pick the characters';
    prompt = `<button class="listen-btn" id="spk" aria-label="Play">${I.speaker}</button>`;
    opts = shuffle([w, ...distractors(it.id, 3, 'h')]).map((x) => ({ id: x.id, html: `<span class="kai">${esc(x.h)}</span>` }));
  } else if (it.t === 'tonesee') {
    label = 'Tones · 声调 · which pinyin is right?';
    prompt = `<div class="prompt-k">${esc(w.h)}</div>`;
    opts = shuffle(toneOptions(w)).map((o) => ({ id: o.ok ? w.id : -9, html: `<span class="tonepy">${esc(o.py)}</span>` }));
  } else if (it.t === 'tone') {
    label = 'Tones · 声调 · which do you hear?';
    prompt = `<button class="listen-btn" id="spk" aria-label="Play">${I.speaker}</button>`;
    opts = shuffle(toneOptions(w)).map((o) => ({ id: o.ok ? w.id : -9, html: `<span class="tonepy">${esc(o.py)}</span>` }));
  } else {
    label = 'Choose · 选';
    prompt = `<div class="meaning">${esc(w.m)}</div>`;
    opts = shuffle([w, ...distractors(it.id, 3, 'h')]).map((x) => ({ id: x.id, html: `<span class="kai">${esc(x.h)}</span>` }));
  }
  if (it.placement) opts.push({ id: -1, html: "I don't know" });
  let answered = false;
  const keyList = [['1–' + opts.length, 'choose']];
  const pyQ = it.t === 'pyread' || it.t === 'pyzi';
  if (it.t !== 'read' && !pyQ) keyList.push(['Space', 'listen']); else if (it.t === 'read' && !it.placement) keyList.push(['P', 'pinyin']);
  const audioPrompt = ['listen', 'hearzi', 'tone'].includes(it.t);
  render(drill(`<div class="label">${label}</div>${prompt}
      <div class="options">${opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="n">${i + 1}</span><span>${o.html}</span></button>`).join('')}</div>`,
    `${hints(keyList)}<div class="right"><button class="btn-primary" id="next" style="visibility:hidden">Continue <kbd>↵</kbd></button></div>`),
  stageKeys((e) => {
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= opts.length && !answered) answer(n - 1);
    else if (e.key === ' ') { e.preventDefault(); if ((it.t !== 'read' && !pyQ) || answered) speak(w.h); }
    else if (e.key === 'p' && it.t === 'read' && !it.placement) showPinyin(w);
    else if (e.key === 'Enter' && answered) advance();
  }), () => {
    startClock();
    on('.opt', 'click', (e) => !answered && answer(+e.currentTarget.dataset.i));
    on('#spk', 'click', () => speak(w.h));
    on('#py', 'click', () => showPinyin(w));
    on('#next', 'click', advance);
    if (audioPrompt) setTimeout(() => speak(w.h), 250);
  });
  function answer(i) {
    answered = true; HZ_LOCK = false;
    const ok = opts[i].id === it.id;
    root.querySelectorAll('.opt').forEach((b, j) => { if (opts[j].id === it.id) b.classList.add('ok'); else if (j === i) b.classList.add('bad'); else b.classList.add('dim'); });
    if (it.placement) {
      checkAnswer(it.id, opts[i].id === -1 ? 'dk' : ok ? 'ok' : 'bad'); sess.i++;
      const go = (S.check.miss || 0) >= CHECK_STOP ? checkStop : nextItem;
      if (ok) return setTimeout(go, 350);
      // wrong or "I don't know": show the answer and wait for Enter
      HZ_LOCK = false;
      setFoot('bad', `Answer: ${answerLine(w)}`);
      const nx0 = root.querySelector('#next'), nx = nx0.cloneNode(true); nx0.replaceWith(nx); nx.style.visibility = 'visible';
      let gone = false; const cont = () => { if (gone) return; gone = true; go(); };
      nx.onclick = cont;
      keyHandler = stageKeys((e) => { if (e.key === 'Enter') { e.preventDefault(); cont(); } else if (e.key === ' ') { e.preventDefault(); speak(w.h); } });
      return;
    }
    scored(it, ok);
    speak(w.h);   // you always hear it once you've answered
    setFoot(ok ? 'ok' : 'bad', answerLine(w));
    if (ok) setTimeout(() => { if (sess && sess.items[sess.i] === it) advance(); }, 1100);
    else { root.querySelector('#next').style.visibility = 'visible'; showWrong(w, advance); }
  }
}

function typeIt(it) {
  const w = W[it.id];
  let answered = false;
  const tip = !S.settings.imeTipSeen ? `<div class="tip">Type with the Mac Chinese keyboard: switch input with Ctrl+Space or the Globe key, type the pinyin (like nihao), pick the characters, then press Enter.</div>` : '';
  render(drill(`<div class="label">Type · 打字</div>
      <div class="meaning">${esc(w.m)}</div>
      ${pyPill('py', 'Show pinyin', 'Tab')}
      <div style="margin-top:26px;display:flex;gap:14px;align-items:center"><input class="typein" id="inp" autocomplete="off" spellcheck="false" lang="zh-CN"><button class="icon-btn" id="play" aria-label="Listen">${I.speaker}</button></div>
      ${tip}`,
    `${hints([['↵', 'check'], ['Tab', 'pinyin']])}<div class="right"><button class="btn-primary" id="check">Check <kbd>↵</kbd></button></div>`),
  stageKeys((e) => {
    if (e.key === 'Enter') { e.preventDefault(); answered ? advance() : check(); }
    else if (e.key === 'Tab') { e.preventDefault(); hint(); }
  }), () => {
    startClock();
    const inp = root.querySelector('#inp'); inp.focus();
    inp.addEventListener('keydown', (e) => { if (e.key === 'Tab') { e.preventDefault(); hint(); } });
    inp.addEventListener('input', () => { if (!answered) setFoot('', `<span><kbd>↵</kbd> check</span><span><kbd>Tab</kbd> pinyin</span>`); });
    on('#check', 'click', () => (answered ? advance() : check())); on('#play', 'click', () => speak(w.h)); on('#py', 'click', hint);
    if (!S.settings.imeTipSeen) { S.settings.imeTipSeen = true; save(); }
  });
  function hint() { showPinyin(w); sess.hinted = true; }
  function check() {
    const inp = root.querySelector('#inp'); const v = inp.value.trim().replace(/\s/g, '');
    if (!v) { setFoot('bad', 'Type an answer first'); return; }
    answered = true; inp.blur(); inp.readOnly = true; HZ_LOCK = false;
    const ok = v === w.h;
    inp.classList.add(ok ? 'ok' : 'bad');
    scored(it, ok); if (ok) { S.stats.typed++; save(); }
    speak(w.h);
    setFoot(ok ? 'ok' : 'bad', ok ? answerLine(w) : `Answer: ${answerLine(w)}`);
    root.querySelector('#check').innerHTML = 'Continue <kbd>↵</kbd>';
    keyHandler = stageKeys((e) => { if (e.key === 'Enter') advance(); });
    if (!ok) showWrong(w, advance, v);
  }
}

function drawIt(it) {
  const w = W[it.id];
  const chars = hanChars(w.h);
  if (!chars.length) return advance();
  const trace = it.t === 'trace';
  const size = chars.length === 1 ? '' : chars.length === 2 ? 'md' : 'sm';
  let ci = 0, mistakes = 0, done = false, stroke = 0, cur = null;
  let hintKey = '', hintLevel = 0, hinting = false;   // hints: 1st names the next part, 2nd animates it
  it.hintsUsed = 0;
  const done_ws = [];
  render(drill(`<div class="label">${trace ? 'Trace · 描' : 'Draw · 写'}</div>
      <div class="meaning">${esc(w.m)}</div>
      ${trace ? `<div class="pypill shown">${esc(w.p)}</div>` : pyPill()}
      <div class="drawwrap">
        <div class="grids">${chars.map((c, i) => `<div class="grid ${size} ${i ? 'wait' : ''}" id="b${i}">${tzg}<div id="d${i}"></div></div>`).join('')}</div>
        <div class="sidetools">
          <button class="icon-btn" id="play" title="Listen (Space)" aria-label="Listen">${I.speaker}</button>
          <button class="icon-btn" id="hint" title="Hint (H): name the next part · press again to see it" aria-label="Hint">${I.bulb}</button>
          <button class="icon-btn" id="watch" title="Watch strokes (W)" aria-label="Watch">${I.play}</button>
          <button class="icon-btn" id="clear" title="Clear character (Backspace)" aria-label="Clear">${I.clear}</button>
        </div>
      </div>
      <div class="caption" id="cap"></div><div class="hintline" id="hintline" data-nohz></div>`,
    `${hints([['Space', 'listen'], ['H', 'hint'], ['W', 'watch'], ['⌫', 'clear']].concat(trace ? [] : [['P', 'pinyin']]))}
     <div class="right">${trace ? '' : '<button class="btn-secondary" id="skip">Skip</button>'}<button class="btn-primary" id="next" style="display:none">Continue <kbd>↵</kbd></button></div>`),
  stageKeys((e) => {
    if (e.key === ' ') { e.preventDefault(); speak(w.h); }
    else if (e.key === 'w') watch();
    else if (e.key === 'h') hint();
    else if (e.key === 'Backspace') clearChar();
    else if (e.key === 'p' && !trace) showPinyin(w);
    else if (e.key === 'Enter' && done) advance();
  }), () => {
    startClock();
    on('#play', 'click', () => speak(w.h)); on('#watch', 'click', watch); on('#hint', 'click', hint); on('#clear', 'click', clearChar);
    on('#next', 'click', advance); on('#py', 'click', () => showPinyin(w));
    on('#skip', 'click', () => { mistakes += 99; watch(); });
    if (trace) speak(w.h);
    startChar();
  });
  function total() { return STROKES[chars[ci]].strokes.length; }
  function caption() {
    const c = root.querySelector('#cap'); if (!c || done) return;
    c.className = 'caption';
    c.textContent = (chars.length > 1 ? `Character ${ci + 1} of ${chars.length} · ` : '') + `Stroke ${Math.min(stroke + 1, total())} of ${total()}`;
  }
  function startChar() {
    root.querySelectorAll('.grid').forEach((b, i) => b.classList.toggle('wait', i > ci));
    const el = root.querySelector('#d' + ci);
    el.innerHTML = ''; stroke = 0; caption();
    cur = makeWriter(el, chars[ci], { showOutline: trace });
    const relaxed = (S.settings.strokes || 'relaxed') === 'relaxed';
    cur.quiz({
      leniency: relaxed ? 1.8 : 1,           // relaxed: roughly-right strokes count (easier on a trackpad)
      showHintAfterMisses: trace ? 2 : 3,
      highlightOnComplete: false,
      onMistake: () => { mistakes++; },
      onCorrectStroke: (d) => { stroke = d.strokeNum + 1; caption(); const hl = root.querySelector('#hintline'); if (hl && hintKey && hintKey !== partKey()) hl.textContent = ''; },
      onComplete: () => {
        done_ws.push(cur);
        S.stats.drawn++; addXp(3);
        ci++;
        if (ci < chars.length) setTimeout(startChar, 200); else finish();
      }
    });
  }
  // the part the next stroke belongs to
  function nextPart() { const ps = partsOf(chars[ci]); return ps.find((p) => p.s.includes(stroke)) || null; }
  function partKey() { const p = nextPart(); return p ? ci + ':' + p.i : ci + ':s' + stroke; }
  // Hints never count as misses. 1st press: the next part's pinyin + meaning (no characters). 2nd+: animate that part's strokes.
  async function hint() {
    if (done || !cur || hinting) return;
    it.hintsUsed++;
    const p = nextPart(), key = partKey();
    if (key !== hintKey) { hintKey = key; hintLevel = 0; }
    hintLevel++;
    const hl = root.querySelector('#hintline');
    if (hintLevel === 1 && p && (p.py || p.en)) {
      if (hl) hl.innerHTML = `Next part: <b>${esc(partName(p))}</b>${it.hintsUsed >= 4 ? ` <span class="smoke">· ${it.hintsUsed} hints</span>` : ''}`;
      return;
    }
    const left = (p ? p.s : [stroke]).filter((k) => k >= stroke);
    if (hl && p) hl.innerHTML = `Next part: <b>${esc(partName(p))}</b>`;
    hinting = true;
    const w0 = cur;
    for (const k of left) { if (done || cur !== w0) break; try { await cur.highlightStroke(k); } catch {} await new Promise((r) => setTimeout(r, 120)); }
    hinting = false;
  }
  function clearChar() { if (done) return; try { cur.cancelQuiz(); } catch {} startChar(); }
  async function watch() {
    if (done) return;
    const el = root.querySelector('#d' + ci);
    try { cur.cancelQuiz(); } catch {}
    el.innerHTML = '';
    const wr = makeWriter(el, chars[ci], { showOutline: true });
    await wr.animateCharacter();
    setTimeout(() => { if (!done && root.contains(el)) startChar(); }, 400);
  }
  function finish() {
    done = true;
    const ok = mistakes <= ((S.settings.strokes || 'relaxed') === 'relaxed' ? 4 : 3) * chars.length;
    scored(it, ok);
    // 5+ hints on one question: it comes back later to redo (not counted as a miss)
    let redo = false;
    if (it.hintsUsed >= 5 && ok && mistakes < 99 && ['level', 'quiz', 'plan'].includes(sess.type)) {
      const key = it.t + it.id; const n = (sess.retries = sess.retries || {})[key] = (sess.retries[key] || 0) + 1;
      if (n <= 4) { sess.items.splice(Math.min(sess.items.length, sess.i + 4), 0, { ...it, retry: 1, redo: 1 }); redo = true; }
    }
    const hl = root.querySelector('#hintline'); if (hl) hl.innerHTML = redo ? `${it.hintsUsed} hints · this one comes back in a few cards to redo` : '';
    tagParts(chars);
    root.querySelectorAll('.grid').forEach((b) => { b.classList.remove('wait'); b.classList.add(ok ? 'ok' : 'bad'); });
    const c = root.querySelector('#cap');
    c.className = 'caption ' + (ok ? 'ok' : 'bad');
    c.textContent = mistakes >= 99 ? `Shown · ${w.p}` : `${w.p} · ${mistakes === 0 ? 'no misses' : mistakes + (mistakes === 1 ? ' miss' : ' misses')}`;
    const sk = root.querySelector('#skip'); if (sk) sk.style.display = 'none';
    root.querySelector('#next').style.display = 'inline-flex';
    setFoot(ok ? 'ok' : 'bad', answerLine(w));
    HZ_LOCK = false;
    if (!trace) speak(w.h);
    if (!ok && !trace) showWrong(w, advance);
  }
}

// ================================================================ REWARDS (loud)
function rankArt(r) {
  return `<div class="rankart" aria-hidden="true">${rankBadge(r.id, 256)}</div>`;
}
function rewardHero({ label, head, sub, art, say }) {
  return `<div class="block">${art}<div class="label">${label}</div><div class="rh">${head}</div><div class="re">${sub}</div>${say ? `<div style="margin-top:auto">${sayCap(say, 'on-red')}</div>` : ''}</div>`;
}
const heroSaying = (sy) => brush(sy[0], `font-size:${sy[0].length > 4 ? 104 : 130}px;right:-8px;top:-30px;color:var(--paper);opacity:.32`);
const milestoneCups = () => `<div class="herocups" aria-hidden="true">${cup('studied', 210)}</div>`;
const statCard = (k, v) => `<div class="card"><div class="label">${k}</div><div class="num">${v}</div></div>`;
const badgeNote = (b) => `<div class="note"><span class="bs">${esc(b.hz)}</span>New badge · ${esc(b.name)}</div>`;
const goldNote = (t) => `<div class="note"><span class="dot"></span>${esc(t)}</div>`;

function finishLevel() {
  const lv = LEVELS[sess.n - 1];
  const first = !S.levelsDone[lv.n];
  const before = rank().i;
  lv.ids.forEach((id) => { if (!S.words[id]) learnWord(id, sess.missed[id] >= 2 ? 0.2 : 1); });
  const jBefore = typeof jinanOpenIds === 'function' ? jinanOpenIds() : [];
  S.levelsDone[lv.n] = Date.now();
  const jNew = typeof jinanOpenIds === 'function' ? jinanOpenIds().filter((id) => !jBefore.includes(id)) : [];
  if (jNew.length) jinanSlot(jNew[0]);
  planMark('level');
  S.stats.levels++;
  addXp(50);
  const freezeEarned = S.stats.levels % 5 === 0 && S.streak.freezes < FREEZE_MAX;
  if (freezeEarned) S.streak.freezes++;
  const lsay = SAYINGS[(S.stats.levels - 1) % SAYINGS.length];   // rotates per level
  if (S.stats.levels % 3 === 0 && learnedIds().length >= 4) S.quizPending = true;
  const milestone = markPractice();
  const goalHit = bumpWeek();
  const newCombo = sess.bestCombo > S.bests.combo; if (newCombo) S.bests.combo = sess.bestCombo;
  const got = checkBadges();
  save();
  const r = rank(), rankUp = r.i > before;
  const acc = sess.right + sess.wrong ? Math.round((sess.right / (sess.right + sess.wrong)) * 100) : 100;
  const nl = nextLevel();
  const art = rankUp ? rankArt(r)
    : milestone ? milestoneCups()
    : heroSaying(lsay);
  const head = rankUp ? `${r.hz}!` : milestone ? `连胜 ${S.streak.count}!` : acc >= 90 ? '很好!' : acc >= 70 ? '不错!' : '加油!';
  const sub = rankUp ? `New rank · ${r.en}` : milestone ? `${S.streak.count}-day streak` : acc >= 90 ? 'Very good' : acc >= 70 ? 'Not bad' : 'Keep going';
  const say = rankUp || milestone ? null : lsay;
  const s = sess; sess = null;
  render(`<div class="reward"><div class="col">
    ${rewardHero({ label: `Level ${pad2(lv.n)} complete`, head, sub, art, say })}
    <div class="stats4">${statCard('Accuracy', acc + '%')}${statCard('XP earned', '+' + s.xp)}${statCard('Time', fmtTime(Date.now() - s.start))}${statCard('Best combo', s.bestCombo)}</div>
    <div class="chips">${lv.ids.map((id) => `<span class="chip"><span class="kai">${esc(W[id].h)}</span>${esc(W[id].m)}</span>`).join('')}</div>
    <div class="card"><div class="goalrow"><span class="label">Rank · ${r.hz} ${r.en}</span><b>${r.nextNote}</b></div><div class="bar gold"><i style="width:${Math.round(r.pct * 100)}%"></i></div></div>
    ${freezeEarned ? goldNote(`Streak freeze earned · ${S.streak.freezes} of ${FREEZE_MAX}`) : ''}
    ${goalHit ? goldNote('Weekly goal reached · +100 XP') : ''}
    ${newCombo ? goldNote(`New best combo · ${s.bestCombo}`) : ''}
    ${got.map(badgeNote).join('')}
    ${S.quizPending ? goldNote('Pop quiz unlocked · 测验 · do it next') : ''}
    ${jNew.map((id) => { const f = findQuest(id); return f ? `<button class="note jnew" data-jq="${id}"><span class="bs">城</span>New in Jinan · ${esc(f.q.title)} · <span class="kai">${esc(CHARS[f.q.character].zh)}</span><span class="sp"></span><b>Go →</b></button>` : ''; }).join('')}
    <div class="actions"><button class="btn-secondary" data-go="home">Home <kbd>Esc</kbd></button><button class="btn-primary" id="again">${S.quizPending ? 'Start pop quiz' : 'Next level'} <kbd>↵</kbd></button></div>
  </div></div>`, (e) => { if (e.key === 'Enter') startLevel(nl.n); if (e.key === 'Escape') go('home'); },
  () => { on('#again', 'click', () => startLevel(nl.n)); on('.jnew', 'click', (e) => { const f = findQuest(e.currentTarget.dataset.jq); if (f) jDistrict(f.d.id, f.q.id); }); });
  planButton();
  if (jNew.length) setTimeout(() => toast(`New in Jinan · ${findQuest(jNew[0]).q.title}`, 3600), 500);
}

// ---------------------------------------------------------------- level check (HSK 1, adaptive, resumable)
// Blocks of 10 levels. Each block opens with a 6-word sample: 5+ right → block checked off;
// 2–4 right → every word in the block is tested; 0–1 right → weak block. Two weak blocks in a row ends the check.
const HSK1 = LEVELS.filter((l) => l.hsk === 1);
// The level check runs through HSK 1, then carries on into HSK 2 (Jinan is HSK 1–2).
const CHECK_LEVELS = LEVELS.filter((l) => l.hsk === 1).concat(LEVELS.filter((l) => l.hsk === 2));
const HSK1_BLOCKS = Math.ceil(HSK1.length / 10);
const CHECK_BLOCKS = HSK1_BLOCKS + Math.ceil((CHECK_LEVELS.length - HSK1.length) / 10);
const blockLevels = (b) => (b < HSK1_BLOCKS ? HSK1.slice(b * 10, b * 10 + 10) : CHECK_LEVELS.slice(HSK1.length + (b - HSK1_BLOCKS) * 10, HSK1.length + (b - HSK1_BLOCKS) * 10 + 10));
const blockIds = (b) => blockLevels(b).flatMap((l) => l.ids);
const CHECK_STOP = 5;   // this many misses in a row ("I don't know" or wrong) ends the check
const checkTag = () => `Level check · 测 · HSK ${S.check.blk < HSK1_BLOCKS ? 1 : 2} · Block ${S.check.blk < HSK1_BLOCKS ? S.check.blk + 1 : S.check.blk - HSK1_BLOCKS + 1} / ${S.check.blk < HSK1_BLOCKS ? HSK1_BLOCKS : CHECK_BLOCKS - HSK1_BLOCKS}`;
const checkLabel = () => (S.check && !S.check.done ? 'Resume level check' : 'Level check');
function startCheck() {
  if (!S.check || S.check.done) S.check = { blk: 0, mode: 'sample', res: {}, bad: 0, queue: [], phase: [], known: 0, done: false, miss: 0, rot: 0 };
  if (!S.check.queue.length) checkPhase();
  checkRun();
}
function checkPhase() {
  const c = S.check, ids = blockIds(c.blk);
  const untested = ids.filter((id) => !c.res[id]);
  c.phase = c.mode === 'sample' ? pickN(untested, Math.min(6, untested.length)) : untested;
  c.queue = c.phase.slice(); save();
}
function checkRun() {
  if (!S.check.queue.length) return checkPhaseDone();
  sess = { type: 'placement', items: S.check.queue.map((id) => ({ t: checkType(), id, placement: 1 })), i: 0, start: Date.now(), xp: 0 };
  nextItem();
}
// question types rotate evenly: characters → meaning, audio → meaning, pinyin (→ meaning or → characters, alternating).
// Silent mode: no audio, so it rotates characters and pinyin.
function checkType() {
  const c = S.check; c.rot = (c.rot || 0) + 1;
  const kinds = silentOn() ? ['read', 'py'] : ['read', 'listen', 'py'];
  const k = kinds[c.rot % kinds.length];
  if (k !== 'py') return k;
  c.pyAlt = !c.pyAlt; return c.pyAlt ? 'pyread' : 'pyzi';
}
function checkAnswer(id, r) {
  const c = S.check; c.res[id] = r; c.queue = c.queue.filter((x) => x !== id);
  c.miss = r === 'ok' ? 0 : (c.miss || 0) + 1;
  save();
}
// 5 misses in a row: stop here. Words answered right in this block still count.
function checkStop() {
  const c = S.check, ids = blockIds(c.blk);
  checkKnow(ids.filter((id) => c.res[id] === 'ok'));
  c.stopped = true; c.done = true; c.queue = []; save();
  checkDone();
}
function checkKnow(ids) {
  ids.forEach((id) => { if (!S.words[id]) { learnWord(id, 5); S.check.known++; addXp(3); } });
  CHECK_LEVELS.forEach((l) => { if (!S.levelsDone[l.n] && l.ids.every((id) => S.words[id])) S.levelsDone[l.n] = Date.now(); });
}
function checkPhaseDone() {
  const c = S.check, ids = blockIds(c.blk);
  const okIn = (list) => list.filter((id) => c.res[id] === 'ok');
  let next = true;
  if (c.mode === 'sample') {
    const ok = okIn(c.phase).length;
    if (ok >= 5) { checkKnow(ids.filter((id) => !c.res[id] || c.res[id] === 'ok')); S.stats.placementPassed++; c.bad = 0; }
    else if (ok >= 2) { c.mode = 'full'; next = false; }
    else { checkKnow(okIn(ids)); c.bad++; }
  } else {
    const ok = okIn(ids); checkKnow(ok);
    if (ok.length / ids.length < 0.4) c.bad++; else c.bad = 0;
  }
  if (next) { c.blk++; c.mode = 'sample'; }
  if (c.bad >= 2 || c.blk >= CHECK_BLOCKS) { c.done = true; save(); return checkDone(); }
  save(); checkPhase(); checkRun();
}
function checkDone() {
  const c = S.check;
  const reach = c.blk >= HSK1_BLOCKS ? CHECK_LEVELS : HSK1, band = c.blk >= HSK1_BLOCKS ? 'HSK 1–2' : 'HSK 1';
  const known = reach.flatMap((l) => l.ids).filter((id) => S.words[id]).length;
  const total = reach.reduce((a, l) => a + l.ids.length, 0);
  const lvls = reach.filter((l) => S.levelsDone[l.n]).length;
  const dk = Object.values(c.res).filter((r) => r === 'dk').length;
  const got = checkBadges(); save();
  const nl = nextLevel(); const xp = sess ? sess.xp : 0;
  sess = null;
  render(`<div class="reward"><div class="col">
    ${rewardHero({ label: 'Level check · 测 · done', head: `${known} / ${total}`, sub: `${band} words you know`, art: heroSaying(SAYINGS[3]), say: SAYINGS[3] })}
    <div class="stats4">${statCard('Words checked off', c.known)}${statCard('Levels done', lvls + ' / ' + reach.length)}${statCard("Didn't know", dk)}${statCard('XP earned', '+' + c.known * 3)}</div>
    ${c.stopped ? `<p class="smoke">Stopped after ${CHECK_STOP} misses in a row, so you start where it gets new.</p>` : ''}
    <p class="smoke">Checked-off words come back in Review within a week to confirm them. Levels where you knew some words now teach only the ones you didn't.</p>
    ${got.map(badgeNote).join('')}
    <div class="actions"><button class="btn-secondary" data-go="home">Home <kbd>Esc</kbd></button><button class="btn-primary" id="go">Start level ${nl.n} <kbd>↵</kbd></button></div>
  </div></div>`, (e) => { if (e.key === 'Enter') startLevel(nl.n); if (e.key === 'Escape') go('home'); }, () => on('#go', 'click', () => startLevel(nl.n)));
  planButton();
}

// ---------------------------------------------------------------- pop quiz (every 3rd level, required)
function retention() {
  const q = S.quizzes.slice(-5); if (!q.length) return null;
  return Math.round((q.reduce((a, x) => a + x.ok, 0) / q.reduce((a, x) => a + x.n, 0)) * 100);
}
function startQuiz() {
  const now = Date.now(), learned = learnedIds();
  let pool = learned.filter((id) => now - (S.words[id].at || 0) >= 3 * DAY);
  if (pool.length < 10) pool = learned;
  const weight = (id) => 1 + (now - (S.words[id].at || now)) / (7 * DAY) + (5 - mastery(id)) * 0.6;   // older + weaker = likelier
  const picked = [];
  const bag = pool.slice();
  while (picked.length < Math.min(10, pool.length)) {
    const tot = bag.reduce((a, id) => a + weight(id), 0); let r = Math.random() * tot;
    const k = bag.findIndex((id) => (r -= weight(id)) <= 0); picked.push(bag.splice(k < 0 ? 0 : k, 1)[0]);
  }
  let draws = 0;
  const items = picked.map((id) => {
    const canDraw = hanChars(W[id].h).length && hanChars(W[id].h).length <= 2 && draws < 3;
    const r = Math.random();
    const t = canDraw && r < 0.3 ? (draws++, 'draw') : ['listen', 'type', 'tone', 'hearzi'][Math.floor(Math.random() * 4)];
    return { t, id, q: 1 };
  });
  sess = { type: 'quiz', items, i: 0, start: Date.now(), xp: 0, right: 0, wrong: 0, retried: new Set(), missed: {}, combo: 0, bestCombo: 0 };
  nextItem();
}
function finishQuiz() {
  const s = sess, firsts = s.items.filter((x) => !x.retry), n = firsts.length, ok = firsts.filter((x) => x.firstOk).length, pct = Math.round((ok / Math.max(1, n)) * 100);
  const before = rank().i;
  S.quizzes.push({ t: Date.now(), n, ok }); if (S.quizzes.length > 100) S.quizzes = S.quizzes.slice(-100);
  S.quizPending = false;
  planMark('quiz');
  addXp(30);
  if (ok === n) S.stats.perfectQuizzes++;
  markPractice();
  const got = checkBadges(); save();
  const r = rank(), rankUp = r.i > before;
  const missed = Object.keys(s.missed).map(Number);
  const sy = ok === n ? SAYINGS[1] : SAYINGS[2];
  sess = null;
  const nl = nextLevel();
  render(`<div class="reward"><div class="col">
    ${rewardHero({ label: 'Pop quiz · 测验', head: rankUp ? `${r.hz}!` : `${ok} / ${n}`, sub: rankUp ? `New rank · ${r.en}` : `${pct}% retained`, art: rankUp ? rankArt(r) : heroSaying(sy), say: rankUp ? null : sy })}
    <div class="stats4">${statCard('Score', pct + '%')}${statCard('Retention', retention() + '%')}${statCard('XP earned', '+' + s.xp)}${statCard('Time', fmtTime(Date.now() - s.start))}</div>
    ${missed.length ? `<div class="card"><div class="label" style="margin-bottom:12px">Back in Review now</div><div class="chips">${missed.map((id) => `<span class="chip"><span class="kai">${esc(W[id].h)}</span>${esc(W[id].p)} · ${esc(W[id].m)}</span>`).join('')}</div></div>` : ''}
    ${got.map(badgeNote).join('')}
    <div class="actions"><button class="btn-secondary" data-go="home">Home <kbd>Esc</kbd></button><button class="btn-primary" id="go">Next level <kbd>↵</kbd></button></div>
  </div></div>`, (e) => { if (e.key === 'Enter') startLevel(nl.n); if (e.key === 'Escape') go('home'); }, () => on('#go', 'click', () => startLevel(nl.n)));
}

// ================================================================ REVIEW
function reviewStart() {
  const due = dueIds().length, learned = learnedIds().length;
  if (!learned) {
    return render(shell('review', `<div class="pagehead"><div class="label">Lightning review · 复习</div><h1>Review</h1><p>Finish your first level and its words will show up here.</p></div>
      <button class="btn-primary" id="go">Start level 1 <kbd>↵</kbd></button>`), (e) => { if (e.key === 'Escape') go('home'); if (e.key === 'Enter') startLevel(1); }, () => on('#go', 'click', () => startLevel(1)));
  }
  render(shell('review', `<div class="pagehead"><div class="label">Lightning review · 复习</div><h1>Review</h1>${sayCap(REVIEW_SAYING)}<p>${due ? `${due} word${due > 1 ? 's are' : ' is'} due.` : 'Nothing due. Timed rounds use random learned words.'} Answer each card: pick, type or draw. Misses come back a few cards later.</p></div>
    <div class="revtiles">
      <button class="revtile" data-r="2"><span class="label">2 minutes · <kbd>1</kbd></span><span class="num">${S.bests.review2}</span><span class="s">Best cards in 2 minutes</span></button>
      <button class="revtile" data-r="5"><span class="label">5 minutes · <kbd>2</kbd></span><span class="num">${S.bests.review5}</span><span class="s">Best cards in 5 minutes</span></button>
      <button class="revtile" data-r="0" ${due ? '' : 'disabled'}><span class="label">All due · <kbd>3</kbd></span><span class="num">${due}</span><span class="s">${due ? 'Cards due now' : 'All caught up'}</span></button>
    </div>
    <div class="card" style="margin-top:20px"><div class="goalrow"><span class="label">Best combo</span><b>${S.bests.combo}</b></div><p class="smoke" style="font-size:13px">Combos multiply review XP: ×2 at 5 in a row, ×3 at 10.</p></div>`, brush(REVIEW_SAYING[0], 'font-size:260px;right:-70px;top:30px;color:var(--ink);opacity:.07')),
  (e) => {
    if (e.key === 'Escape') go('home');
    if (e.key === '1') startReview(2); if (e.key === '2') startReview(5); if (e.key === '3' && due) startReview(0);
  }, () => on('[data-r]', 'click', (e) => { if (!e.currentTarget.disabled) startReview(+e.currentTarget.dataset.r); }));
}
// Lightning review clock: paused while a missed card is open (sess.paused, sess.pauseAt).
const revElapsed = () => (sess ? (sess.pauseAt || Date.now()) - sess.start - (sess.paused || 0) : 0);
const revTimeUp = () => !!(sess && sess.limit && revElapsed() >= sess.limit);
function startReview(min) {
  sess = { type: 'review', paused: 0, pauseAt: 0, min, limit: min ? min * 60000 : 0, start: Date.now(), queue: dueIds(), used: new Set(), later: [], made: 0,
    count: 0, knew: 0, combo: 0, bestCombo: 0, xp: 0, items: [], i: 0, right: 0, wrong: 0, missed: {}, retries: {} };
  nextItem();
}
function reviewNextId() {
  while (sess.queue.length) { const id = sess.queue.shift(); if (!sess.used.has(id)) return { id, due: true }; }
  if (!sess.min) return null;
  const pool = learnedIds().filter((id) => !sess.used.has(id));
  const src = pool.length ? pool : learnedIds();
  if (!pool.length) sess.used.clear();
  return { id: src[Math.floor(Math.random() * src.length)], due: false };
}
// Review: every card is graded by your answer (the pop-quiz cards), one word at a time from the due queue.
// A miss shows the answer (clock paused) and the word comes back ~4 cards later until you get it right.
// A radical card every 7th; a story-sentence gap when the word was met in a story.
function reviewItem(id, due) {
  const w = W[id], n = hanChars(w.h).length;
  const ctxs = ((S.ctx || {})[id] || []).filter((c) => c.zh.includes(w.h));
  const types = [['listen', 3], ['read', 3], ['pick', 3], ['hearzi', 2], ['tone', 2], ['type', 2]];
  if (n && n <= 2) types.push(['draw', 2]);
  if (ctxs.length) types.push(['ctx', 3]);
  let r = Math.random() * types.reduce((a, t) => a + t[1], 0);
  const t = (types.find((x) => (r -= x[1]) <= 0) || types[0])[0];
  return { t, id, q: 1, due, rev: 1, ctx: t === 'ctx' ? ctxs[Math.floor(Math.random() * ctxs.length)] : null };
}
function reviewGen() {
  if (revTimeUp()) return timeUp();
  let it = null;
  if (sess.made && sess.made % 7 === 0 && sess.radAt !== sess.made) {
    sess.radAt = sess.made;
    const rid = shuffle(learnedIds()).find(canRad);
    if (rid !== undefined) it = { t: 'radical', id: rid, review: true };
  }
  if (!it) {
    const k = sess.later.findIndex((x) => x.at <= sess.made);
    if (k >= 0) it = sess.later.splice(k, 1)[0];
  }
  if (!it) {
    const nx = reviewNextId();
    if (nx) { sess.used.add(nx.id); it = reviewItem(nx.id, nx.due); }
    else if (sess.later.length) it = sess.later.shift();   // all due done: finish the misses
    else return finishReview();
  }
  sess.made++; sess.curId = it.id;
  sess.items.push(it);
  nextItem();
}
// scoring for a review card (called from scored())
function reviewScored(it, ok) {
  if (!it.retry) {
    sess.count++; S.stats.reviews++;
    if (it.due || !ok) grade(it.id, ok);
    if (ok) sess.knew++;
  }
  if (ok) {
    sess.combo++; sess.bestCombo = Math.max(sess.bestCombo, sess.combo);
    addXp((it.retry ? 2 : 5) * (sess.combo >= 10 ? 3 : sess.combo >= 5 ? 2 : 1));
  } else {
    sess.combo = 0; sess.wrong++; sess.missed[it.id] = (sess.missed[it.id] || 0) + 1;
    const key = it.t + it.id, n = (sess.retries[key] = (sess.retries[key] || 0) + 1);
    if (n <= 4) sess.later.push({ ...reviewItem(it.id, false), retry: 1, at: sess.made + 3 });
    sess.pauseAt = Date.now();   // the clock waits while you look at the answer
  }
  const c = root.querySelector('#combo'); if (c) c.outerHTML = comboHtml(sess.combo);
  save();
}
// Story sentence with a gap: pick the missing word.
function ctxIt(it) {
  const w = W[it.id], ctx = it.ctx;
  if (!ctx) return advance();
  const opts = shuffle([w, ...distractors(it.id, 3, 'h')]).map((x) => ({ id: x.id, html: `<span class="kai">${esc(x.h)}</span>` }));
  let answered = false;
  const gap = `<span class="ctxgap" id="ctxgap">${'＿'.repeat(Math.max(2, [...w.h].length))}</span>`;
  render(drill(`<div class="label">In context · 语境 · pick the missing word</div>
      <div class="flash ctx"><div class="ctxzh kai">${esc(ctx.zh).split(esc(w.h)).join(gap)}</div><div class="ctxen">${esc(ctx.en)}</div></div>
      <div class="options">${opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="n">${i + 1}</span><span>${o.html}</span></button>`).join('')}</div>`,
    `${hints([['1–' + opts.length, 'choose']])}<div class="right"><button class="btn-primary" id="next" style="visibility:hidden">Continue <kbd>↵</kbd></button></div>`),
  stageKeys((e) => {
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= opts.length && !answered) answer(n - 1);
    else if (e.key === ' ' && answered) { e.preventDefault(); speak(ctx.zh); }
    else if (e.key === 'Enter' && answered) advance();
  }), () => {
    startClock();
    on('.opt', 'click', (e) => !answered && answer(+e.currentTarget.dataset.i));
    on('#next', 'click', advance);
  });
  function answer(i) {
    answered = true; HZ_LOCK = false;
    const ok = opts[i].id === it.id;
    root.querySelectorAll('.opt').forEach((b, j) => b.classList.add(opts[j].id === it.id ? 'ok' : j === i ? 'bad' : 'dim'));
    root.querySelectorAll('#ctxgap').forEach((g) => { g.textContent = w.h; g.classList.add('on'); });
    scored(it, ok);
    speak(ctx.zh);
    setFoot(ok ? 'ok' : 'bad', answerLine(w));
    if (ok) setTimeout(() => { if (sess && sess.items[sess.i] === it) advance(); }, 1600);
    else { root.querySelector('#next').style.visibility = 'visible'; showWrong(w, advance); }
  }
}
// Time ran out (after you finished the card you were on): a small box, then the results.
function timeUp() {
  const s = sess;
  const old = document.getElementById('wrongbox'); if (old) old.remove();
  clearInterval(tick); tick = null;
  const c = document.getElementById('clock'); if (c) c.textContent = '0:00';
  const box = document.createElement('div');
  box.className = 'scrim wrongscrim'; box.id = 'wrongbox';
  box.innerHTML = `<div class="wrongcard timeup" role="dialog" aria-label="Time's up">
    <div class="label">Time's up · 时间到</div>
    <div class="whz">${s.knew} / ${s.count}</div><div class="wm">cards known in ${s.min} minute${s.min > 1 ? 's' : ''}</div>
    <div class="wpy">Best combo ${s.bestCombo}</div>
    <div class="actions"><button class="btn-primary" id="wok">See results <kbd>↵</kbd></button></div></div>`;
  root.appendChild(box);
  const done = () => { box.remove(); finishReview(); };
  keyHandler = (e) => { if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') { e.preventDefault(); done(); } };
  box.querySelector('#wok').addEventListener('click', done);
  setTimeout(() => box.querySelector('#wok').focus(), 50);
}
function finishReview() {
  if (!sess) return go('home');
  const s = sess; sess = null;
  const notes = [];
  const before = rank().i;
  if (s.min === 2 && s.knew > S.bests.review2) { S.bests.review2 = s.knew; notes.push('New personal best for 2 minutes'); }
  if (s.min === 5 && s.knew > S.bests.review5) { S.bests.review5 = s.knew; notes.push('New personal best for 5 minutes'); }
  if (s.bestCombo > S.bests.combo) { S.bests.combo = s.bestCombo; notes.push(`New best combo · ${s.bestCombo}`); }
  const milestone = s.count >= 5 ? markPractice() : false;
  if (s.count >= 5 || (s.count && !dueIds().length)) planMark('review');
  const got = checkBadges(); save();
  const r = rank(), rankUp = r.i > before;
  const art = rankUp ? rankArt(r)
    : milestone ? milestoneCups()
    : heroSaying(REVIEW_SAYING);
  render(`<div class="reward"><div class="col">
    ${rewardHero({ label: 'Lightning review · done', head: rankUp ? `${r.hz}!` : milestone ? `连胜 ${S.streak.count}!` : `${s.knew} / ${s.count}`, sub: rankUp ? `New rank · ${r.en}` : milestone ? `${S.streak.count}-day streak` : 'cards known', art, say: rankUp || milestone ? null : REVIEW_SAYING })}
    <div class="stats4">${statCard('Known', s.knew)}${statCard('XP earned', '+' + s.xp)}${statCard('Best combo', s.bestCombo)}${statCard('Still due', dueIds().length)}</div>
    ${notes.map(goldNote).join('')}
    ${got.map(badgeNote).join('')}
    <div class="actions"><button class="btn-secondary" data-go="home">Home <kbd>Esc</kbd></button><button class="btn-primary" id="again">Another round <kbd>↵</kbd></button></div>
  </div></div>`, (e) => { if (e.key === 'Enter') startReview(s.min || 2); if (e.key === 'Escape') go('home'); },
  () => on('#again', 'click', () => startReview(s.min || 2)));
  planButton();
}

// ================================================================ WORDS, BADGES, SETTINGS (loud shell)
function words() {
  const ids = learnedIds().sort((a, b) => a - b);
  render(shell('', `<div class="pagehead"><div class="label">${ids.length} learned</div><h1>Your words</h1></div>
    <div class="wordlist">${ids.length ? ids.map((id) => `<div class="wrow" data-w="${id}"><span class="kai">${esc(W[id].h)}</span><span class="py">${esc(W[id].p)}</span><span>${esc(W[id].m)}</span><span class="bar thin spring"><i style="width:${mastery(id) * 20}%"></i></span></div>`).join('') : '<div class="empty">Words appear here after your first level.</div>'}</div>`),
  (e) => e.key === 'Escape' && go('home'), () => on('[data-w]', 'click', (e) => go('wordDetail', +e.currentTarget.dataset.w)));
}
function wordDetail(id) {
  const w = W[id], chars = hanChars(w.h), sw = S.words[id];
  render(shell('', `<button class="btn-secondary" data-go="words" style="margin:-8px 0 16px -14px">${I.back} Your words</button>
    <div class="detail">
      <div>
        <div class="bigk">${esc(w.h)}</div><div class="py">${esc(w.p)}</div><div class="mn">${esc(w.m)}</div>
        ${w.all && w.all !== w.m ? `<p class="smoke" style="margin-top:10px">${esc(w.all)}</p>` : ''}
        <div class="card" style="margin-top:20px"><div class="goalrow"><span class="label">Mastery · HSK ${w.hsk}</span><b>${sw ? `Next review ${sw.due <= Date.now() ? 'now' : 'in ' + Math.ceil((sw.due - Date.now()) / DAY) + ' d'}` : 'Not learned yet'}</b></div><div class="bar spring"><i style="width:${mastery(id) * 20}%"></i></div></div>
        <div style="display:flex;gap:12px;margin-top:18px"><button class="btn-primary" id="play">${I.speaker} Listen <kbd>Space</kbd></button><button class="btn-outline" id="anim">${I.play} Strokes</button></div>
      </div>
      <div class="grids" style="flex-wrap:wrap">${chars.map((c, i) => `<div class="grid ${chars.length > 1 ? 'sm' : 'md'}">${tzg}<div id="a${i}"></div></div>`).join('')}</div>
    </div>`), (e) => { if (e.key === ' ') { e.preventDefault(); speak(w.h); } if (e.key === 'Escape') go('words'); }, () => {
    const ws = chars.map((c, i) => makeWriter(root.querySelector('#a' + i), c, { showCharacter: true, showOutline: true }));
    const anim = async () => { for (const x of ws) await x.animateCharacter(); };
    on('#play', 'click', () => speak(w.h)); on('#anim', 'click', anim);
    speak(w.h);
  });
}
// Ranks path: all 12 zodiac badges in ladder order; the current one is bigger, with a gold progress ring.
const RING_R = 70, RING_C = 2 * Math.PI * RING_R;
function rankPath(r) {
  return `<div class="ranks"><div class="label">Ranks · 生肖</div>
    <div class="rpath" id="rpath"><div class="rtrack">${RANKS.map((rk, i) => {
      const cur = i === r.i, locked = i > r.i;
      return `<button class="rstep ${cur ? 'cur' : locked ? 'locked' : 'got'}" data-ri="${i}" title="${rk[1]} ${rk[2]}">
        <span class="rbox">${cur ? `<svg class="rring" viewBox="0 0 148 148" width="148" height="148" aria-hidden="true"><circle cx="74" cy="74" r="${RING_R}" class="trk"/><circle cx="74" cy="74" r="${RING_R}" class="val" stroke-dasharray="${(r.pct * RING_C).toFixed(1)} ${RING_C.toFixed(1)}"/></svg>` : ''}${rankBadge(rankId(rk), cur ? 128 : 64, locked)}</span>
        ${cur ? `<span class="rname"><b>${rk[1]}</b> ${rk[2]}</span><span class="rnext">${esc(r.nextNote)}</span>` : ''}
      </button>`;
    }).join('')}</div></div>
    <div class="rinfo" id="rinfo" hidden></div></div>`;
}
function rankInfo(i) {
  const r = rank(), [xp, hz, en, gate] = RANKS[i], next = RANKS[i + 1];
  let status;
  if (i < r.i) status = '<span class="rst got">Reached</span>';
  else if (i === r.i) status = `<span class="rst cur">Current</span> ${esc(next ? r.nextNote : 'Top rank')}`;
  else {
    const need = Math.max(0, xp - S.xp), band = gate && !bandDone(gate);
    status = `<span class="rst locked">Locked</span> ${[need ? `${need.toLocaleString()} XP still needed` : '', band ? `HSK ${gate} not finished yet` : ''].filter(Boolean).join(' · ') || 'Reach the ranks before it first'}`;
  }
  return `${rankBadge(rankId(RANKS[i]), 64, i > r.i)}<div class="rit"><div class="rih"><b>${hz}</b> ${en}</div>
    <div class="rid">${xp ? `${xp.toLocaleString()} XP` : 'Starting rank'}${gate ? ` · Also needs HSK ${gate} finished.` : ''}</div>
    <div class="rid">${status}</div></div>`;
}
function badges() {
  const n = Object.keys(S.badges).length, r = rank();
  let open = -1;
  const box = () => root.querySelector('#rinfo');
  const close = () => { open = -1; const b = box(); if (b) b.hidden = true; root.querySelectorAll('.rstep.sel').forEach((e) => e.classList.remove('sel')); };
  const show = (i) => {
    if (open === i) return close();
    close(); open = i; const b = box(); b.innerHTML = rankInfo(i); b.hidden = false;
    root.querySelector(`.rstep[data-ri="${i}"]`).classList.add('sel');
  };
  render(shell('badges', `<div class="pagehead"><div class="label">${n} of ${BADGES.length} earned</div><h1>Badges</h1></div>
    ${rankPath(r)}
    <div class="bests">${statCard('2 min best', S.bests.review2)}${statCard('5 min best', S.bests.review5)}${statCard('Best combo', S.bests.combo)}${statCard('Longest streak', S.streak.best)}</div>
    <div class="card" style="margin-bottom:24px"><div class="goalrow"><span class="label">Pop quiz history · 测验</span><b>${S.quizzes.length ? `Retention ${retention()}% · last 5` : 'First quiz after level 3'}</b></div>
      <div class="qhist">${S.quizzes.slice(-20).map((q) => `<span title="${q.ok} / ${q.n}"><i style="height:${Math.max(4, Math.round((q.ok / q.n) * 100))}%"></i></span>`).join('') || '<em class="smoke">No quizzes yet.</em>'}</div></div>
    <div class="badges">${BADGES.map(([id, hz, name, desc]) => `<div class="badge ${S.badges[id] ? '' : 'locked'}"><span class="bs">${hz}</span><div><div class="bn">${esc(name)}</div><div class="bd">${esc(desc)}</div></div></div>`).join('')}</div>`, brush(sayingOfDay()[0], 'font-size:260px;right:-70px;top:30px;color:var(--ink);opacity:.07')),
  (e) => { if (e.key === 'Escape') { if (open >= 0) close(); else go('home'); } }, () => {
    on('.rstep', 'click', (e) => show(+e.currentTarget.dataset.ri));
    const m = root.querySelector('.main');
    m.addEventListener('mousedown', (e) => { if (open >= 0 && !e.target.closest('.rstep, .rinfo')) close(); });
    const p = root.querySelector('#rpath'), c = p && p.querySelector('.rstep.cur');
    if (c) p.scrollLeft = c.offsetLeft - (p.clientWidth - c.offsetWidth) / 2;
  });
}
function settings() {
  const st = S.settings;
  const webVoices = !nativeVoices.length && window.speechSynthesis ? speechSynthesis.getVoices().filter((v) => /^zh/i.test(v.lang)).map((v) => v.name) : [];
  const voices = nativeVoices.length ? nativeVoices : webVoices;
  render(shell('', `<div class="pagehead"><div class="label">Spring · 泉</div><h1>Settings</h1></div>
    <div class="label formhead">Voice</div><div class="form">
      <div class="frow"><div><div class="lbl">Mandarin voice</div><div class="hint">${voices.length ? 'Premium voices sound most natural.' : (bridge.platform === 'win32' ? 'No Mandarin voice found. Add one in Windows Settings › Time & language › Language & region › Add a language › Chinese (Simplified, China), with Text-to-speech ticked, then restart Spring.' : 'No Mandarin voice found. Add one in System Settings › Accessibility › Spoken Content › System voice › Manage Voices › Chinese (China mainland).')}</div></div>
        ${voices.length ? `<select id="voice">${voices.map((v) => `<option ${v === st.voice ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>` : ''}</div>
      ${nativeVoices.length ? `<div class="frow"><div><div class="lbl">Women in Jinan</div><div class="hint">Grandma Wang, Teacher Lü, Xiao Xie, Sister Lin, Ms. Chen.</div></div>
        <div style="display:flex;gap:8px;align-items:center"><select id="voiceF">${voices.map((v) => `<option ${v === st.voiceF ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select><button class="icon-btn sm" id="testF" aria-label="Test">${I.speaker}</button></div></div>
      <div class="frow"><div><div class="lbl">Men in Jinan</div><div class="hint">${st.voiceM ? 'Teacher Zhang, Xiao Su, Master Sun, Old Pan, Dr. Bai.' : 'No male Mandarin voice found, so men use the main voice. Add one (e.g. Han or Li-mu) in System Settings › Accessibility › Spoken Content › System voice › Manage Voices › Chinese (China mainland), then reopen Settings.'}</div></div>
        <div style="display:flex;gap:8px;align-items:center"><select id="voiceM"><option value="" ${!st.voiceM ? 'selected' : ''}>Main voice</option>${voices.map((v) => `<option ${v === st.voiceM ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select><button class="icon-btn sm" id="testM" aria-label="Test">${I.speaker}</button></div></div>` : ''}
      <div class="frow"><div class="lbl">Speed</div><select id="rate"><option value="normal" ${st.rate === 'normal' ? 'selected' : ''}>Normal</option><option value="slow" ${st.rate === 'slow' ? 'selected' : ''}>Slow</option></select></div>
      <div class="frow"><div class="lbl">Test</div><button class="btn-outline" id="test">${I.speaker} 你好，我们开始吧</button></div>
    </div>
    <div class="label formhead">Characters</div><div class="form">
      <div class="frow"><div><div class="lbl">Study font · <span class="kai" style="font-size:20px">楷体 天天</span></div><div class="hint">Characters use Kaiti SC. If they don't look brush-written, open Font Book, search “Kaiti SC”, and click Download.</div></div></div>
    </div>
    <div class="label formhead">Writing</div><div class="form">
      <div class="frow"><div><div class="lbl">Stroke checking</div><div class="hint">Relaxed accepts strokes that are roughly right in shape and direction (easier on a trackpad). Normal is stricter.</div></div>
        <select id="strokes"><option value="relaxed" ${(st.strokes || 'relaxed') === 'relaxed' ? 'selected' : ''}>Relaxed</option><option value="normal" ${st.strokes === 'normal' ? 'selected' : ''}>Normal</option></select></div>
    </div>
    <div class="label formhead">Goals and reminders</div><div class="form">
      <div class="frow"><div><div class="lbl">Weekly goal</div><div class="hint">Days per week you finish today's plan. Hitting it earns 100 XP.</div></div>
        <select id="goal">${[3, 4, 5, 6, 7].map((n) => `<option ${n === S.weeklyGoal ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <div class="frow"><div><div class="lbl">Daily reminder</div><div class="hint">Skipped if you've already practiced that day.</div></div>
        <div style="display:flex;gap:12px;align-items:center"><input type="time" id="rtime" value="${st.reminderTime}"><button class="switch ${st.reminderOn ? 'on' : ''}" id="ron" aria-label="Daily reminder"></button></div></div>
      <div class="frow"><div><div class="lbl">Open at login</div><div class="hint">Runs quietly in the background so reminders arrive. ${bridge.platform === 'darwin' ? 'Closing the window keeps it running; ⌘Q quits.' : ''}</div></div>
        <button class="switch ${st.openAtLogin ? 'on' : ''}" id="login" aria-label="Open at login"></button></div>
    </div>
    <div class="label formhead">Jinan conversations · local AI</div><div class="form">
      <div class="frow"><div><div class="lbl">Improvise with local AI</div><div class="hint">Characters follow hand-written scripts. When they don't understand you, an AI model running on this computer improvises a reply and double-checks your grammar. Nothing goes online. Chats work without it.</div></div>
        <button class="switch ${AI.cfg().on ? 'on' : ''}" id="aion" aria-label="Local AI"></button></div>
      <div class="frow"><div><div class="lbl">AI model</div><div class="hint" id="aihint">Checking…</div></div><div id="aiact" style="display:flex;gap:10px"></div></div>
    </div>
    <div class="label formhead">Progress</div><div class="form">
      <div class="frow"><div><div class="lbl">Back up</div><div class="hint">Saves a file you can restore later. Daily backups are also kept automatically.</div></div><div style="display:flex;gap:10px"><button class="btn-outline" id="exp">Export</button><button class="btn-outline" id="imp">Import</button></div></div>
      <div class="frow"><div class="lbl">Reset everything</div><button class="btn-outline btn-danger" id="reset">Reset</button></div>
    </div>
    <details class="devrow"><summary>Developer</summary><div class="form">
      <div class="frow"><div><div class="lbl">Home scene time</div><div class="hint">Preview the Home scene at a fixed time of day. Auto follows the clock.</div></div>
        <select id="scenetime">${[['', 'Auto'], ['morning', 'Morning'], ['midday', 'Midday'], ['evening', 'Evening'], ['night', 'Night']].map(([v, l]) => `<option value="${v}"${(st.sceneTime || '') === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
    </div></details>
    <p class="credits">Every day, a little Chinese. Vocabulary: Complete HSK Vocabulary (MIT), CC-CEDICT definitions. Stroke data: Hanzi Writer / Make Me a Hanzi (Arphic Public License). Fonts: Archivo, Noto Sans SC and Liu Jian Mao Cao (SIL Open Font License).</p>`),
  (e) => e.key === 'Escape' && go('home'), () => {
    on('#voice', 'change', (e) => { st.voice = e.target.value; save(); speak('你好'); });
    on('#voiceF', 'change', (e) => { st.voiceF = e.target.value; save(); speak('孩子，你吃饭了吗？', 'f'); });
    on('#voiceM', 'change', (e) => { st.voiceM = e.target.value; save(); speak('你好，我是张老师。', 'm'); });
    on('#testF', 'click', () => speak('孩子，你吃饭了吗？', 'f'));
    on('#testM', 'click', () => speak('你好，我是张老师。', 'm'));
    on('#rate', 'change', (e) => { st.rate = e.target.value; save(); });
    on('#scenetime', 'change', (e) => { st.sceneTime = e.target.value; save(); });
    on('#test', 'click', () => speak('你好，我们开始吧'));
    on('#goal', 'change', (e) => { S.weeklyGoal = +e.target.value; save(); });
    on('#strokes', 'change', (e) => { st.strokes = e.target.value; save(); });
    on('#rtime', 'change', (e) => { st.reminderTime = e.target.value; syncReminder(); save(); });
    on('#ron', 'click', (e) => { st.reminderOn = !st.reminderOn; e.currentTarget.classList.toggle('on', st.reminderOn); syncReminder(); save(); });
    on('#login', 'click', (e) => { st.openAtLogin = !st.openAtLogin; e.currentTarget.classList.toggle('on', st.openAtLogin); bridge.setLogin(st.openAtLogin); save(); });
    const gb = (n) => (n / 1e9).toFixed(1);
    const aiPaint = (r) => {
      const h = root.querySelector('#aihint'), act = root.querySelector('#aiact'); if (!h || !act) return;
      const dl = r.download, low = r.ramGB && r.ramGB < 12 ? ` This computer has ${r.ramGB} GB of memory, so replies may be slow.` : '';
      let btns = '';
      if (r.unsupported) h.textContent = 'Available in the desktop app.';
      else if (dl && !dl.error) { h.textContent = `Downloading… ${Math.floor(100 * dl.done / (dl.total || 1))}% (${gb(dl.done)} of ${gb(dl.total)} GB). You can keep studying.`; btns = '<button class="btn-outline" id="aicancel">Pause</button>'; }
      else if (!r.hasModel) { h.textContent = (dl && dl.error ? 'The download stopped. It picks up where it left off. ' : '') + `One-time download, about ${gb(r.size)} GB. Works best with 16 GB of memory.` + low; btns = `<button class="btn-outline" id="aidl">${dl && dl.error ? 'Resume' : 'Download'}</button>`; }
      else { h.innerHTML = '<b style="color:var(--spring)">Ready</b> · Qwen 3.5 (9B) on this computer.' + esc(low); btns = '<button class="btn-outline btn-danger" id="airm">Remove</button>'; }
      act.innerHTML = btns;
      on('#aidl', 'click', async () => aiPaint(await bridge.aiDownload()));
      on('#aicancel', 'click', async () => aiPaint(await bridge.aiDownloadCancel()));
      on('#airm', 'click', async () => { if (confirm(`Remove the AI model and free ${gb(r.size)} GB? You can download it again later.`)) aiPaint(await bridge.aiRemove()); });
    };
    AI.check(true).then(aiPaint);
    if (bridge.onAiProgress) { const off = bridge.onAiProgress((r) => { if (!root.querySelector('#aihint')) return off(); aiPaint(r); AI.check(true); }); }
    on('#aion', 'click', (e) => { AI.cfg().on = !AI.cfg().on; e.currentTarget.classList.toggle('on', AI.cfg().on); save(); });
    on('#exp', 'click', async () => { if (await bridge.exportData(S)) toast('Progress exported'); });
    on('#imp', 'click', async () => {
      const d = await bridge.importData();
      if (!d || !d.words) { if (d !== null) toast("That file doesn't look like Spring progress"); return; }
      S = merge(DEFAULT(), d); save(); toast('Progress imported'); go('home');
    });
    on('#reset', 'click', () => { if (confirm('Erase all progress? This cannot be undone (daily backups remain).')) { const s = S.settings; S = DEFAULT(); S.settings = s; save(); go('home'); } });
  });
}
function syncReminder() { bridge.setReminder({ on: S.settings.reminderOn, time: S.settings.reminderTime, lastPractice: S.streak.last }); }

// ---------------------------------------------------------------- browser fallback (for previewing outside the Mac app)
function mockApi() {
  return {
    load: async () => { try { return JSON.parse(localStorage.getItem('tiantian')); } catch { return null; } },
    save: async (d) => { try { localStorage.setItem('tiantian', JSON.stringify(d)); } catch {} },
    exportData: async (d) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(d)])); a.download = 'tiantian-progress.json'; a.click(); return true; },
    importData: async () => null,
    voices: async () => [], speak: async () => false, stopSpeak: async () => true,
    micAccess: async () => true, setReminder: async () => true, setLogin: async () => true, platform: 'web'
  };
}

window.__item = () => sess && sess.items && sess.items[sess.i];

// ---------------------------------------------------------------- boot
// New day while the app stays open: once the date changes, go back to Home so today's drills, streak and saying
// start fresh, as if the app had just been opened. It never interrupts a drill or a conversation: it waits until
// you're not in one, then rolls over when you come back to the window or after a few idle minutes.
let appDay = today(), lastInput = Date.now();
for (const ev of ['keydown', 'mousedown', 'mousemove', 'wheel']) window.addEventListener(ev, () => { lastInput = Date.now(); }, { passive: true });
function newDayCheck(returning) {
  if (today() === appDay) return;
  if (sess || (typeof chat !== 'undefined' && chat)) return;                 // mid-drill or mid-conversation: wait
  if (!returning && !document.hidden && Date.now() - lastInput < 5 * 60000) return;   // you're using it right now
  appDay = today();
  syncReminder(); home(); toast('新的一天 · A new day');
}
setInterval(() => newDayCheck(false), 60000);
window.addEventListener('focus', () => newDayCheck(true));
document.addEventListener('visibilitychange', () => { if (!document.hidden) newDayCheck(true); });

(async function boot() {
  const d = await bridge.load();
  if (d) S = merge(DEFAULT(), d);
  (S.extraWords || []).forEach((w) => { W[w.id] = w; });   // words picked up in Jinan conversations
  if (!d || (d.v || 1) < 2) {
    // v2: freezes start at 3; backfill study dates from the current streak run.
    S.streak.freezes = FREEZE_MAX;
    if (S.streak.last && S.streak.count) for (let i = 0; i < S.streak.count; i++) { const x = new Date(S.streak.last + 'T12:00'); x.setDate(x.getDate() - i); if (!S.days.includes(today(x))) S.days.push(today(x)); }
    S.v = 2; save();
  }
  if (!S.revV) { S.bests.review2 = 0; S.bests.review5 = 0; S.revV = 2; save(); }   // Review cards are now answered, not flipped: timed bests start fresh
  sayingOfDay();
  await initVoices();
  syncReminder();
  try { await document.fonts.ready; } catch {}
  home();
})();
