'use strict';
/* 天天 · Chinese everywhere: hover any Chinese word for pinyin, click for English (locked inside a question until it's answered),
   and a dictionary that opens from anywhere (🔍 top right, or ⌘K). Loaded after jinan.js (uses zhWords, dict, showTip). */

// ---------------------------------------------------------------- hover/click on every Chinese word
const HZ_SKIP = 'input, textarea, select, option, script, style, svg, .hz, .hztip, .brush, .couplet, .dragbar, [data-nohz], kbd, .dictlook, .dicttabs, .askin, .askstage';
const HAN_ANY = /[\u3400-\u9fff]/;
function hzify(node) {
  if (!node) return;
  if (node.nodeType === 3) return hzText(node);
  if (node.nodeType !== 1 || node.closest(HZ_SKIP)) return;
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
    acceptNode: (t) => (HAN_ANY.test(t.nodeValue) && t.parentElement && !t.parentElement.closest(HZ_SKIP) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT)
  });
  const list = []; while (walker.nextNode()) list.push(walker.currentNode);
  list.forEach(hzText);
}
function hzText(t) {
  if (!t.parentNode || !HAN_ANY.test(t.nodeValue) || (t.parentElement && t.parentElement.closest(HZ_SKIP))) return;
  // one inline wrapper, so flex/grid containers still see a single item
  const wrap = document.createElement('span');
  wrap.className = 'hzr';
  wrap.innerHTML = zhWords(t.nodeValue, !!(t.parentElement && t.parentElement.closest('.askb, .dres.ced')));
  t.parentNode.replaceChild(wrap, t);
}
let hzQueue = [], hzRaf = 0;
new MutationObserver((muts) => {
  muts.forEach((m) => { if (m.type === 'characterData') hzQueue.push(m.target); else m.addedNodes.forEach((n) => hzQueue.push(n)); });
  if (!hzRaf) hzRaf = requestAnimationFrame(() => { hzRaf = 0; const q = hzQueue; hzQueue = []; q.forEach((n) => { if (document.contains(n)) hzify(n); }); });
}).observe(document.body, { childList: true, subtree: true, characterData: true });
hzify(document.body);

// ---------------------------------------------------------------- dictionary
const DICT_ICON = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>`;
const dictBtn = document.createElement('button');
dictBtn.className = 'dictbtn'; dictBtn.id = 'dictbtn'; dictBtn.title = 'Dictionary (⌘K)'; dictBtn.setAttribute('aria-label', 'Dictionary');
dictBtn.innerHTML = DICT_ICON;
document.body.appendChild(dictBtn);
dictBtn.addEventListener('click', () => (document.getElementById('dictpanel') ? dictClose() : dictOpen()));
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') { e.preventDefault(); e.stopPropagation(); document.getElementById('dictpanel') ? dictClose() : dictOpen(); }
}, true);

let DIDX = null;
function dictIndex() {
  if (DIDX && DIDX.n === W.length + (S.extraWords || []).length) return DIDX.list;
  const strip = (s) => String(s || '').toLowerCase().replace(/ü|u:/g, 'v').replace(/\s+/g, '');
  const list = W.filter(Boolean).map((w) => {
    const num = strip(w.n).replace(/5/g, '');
    return { w, num, plain: num.replace(/\d/g, ''), m: String(w.m || '').toLowerCase(), all: String(w.all || '').toLowerCase() };
  });
  DIDX = { n: W.length + (S.extraWords || []).length, list };
  return list;
}
function dictSearch(raw) {
  const q = raw.trim(); if (!q) return [];
  const list = dictIndex(), out = [];
  if (HAN_ANY.test(q)) {
    for (const e of list) {
      const h = e.w.h; let sc = 0;
      if (h === q) sc = 100; else if (h.startsWith(q)) sc = 80 - (h.length - q.length); else if (h.includes(q)) sc = 60 - (h.length - q.length); else if (q.includes(h) && h.length > 1) sc = 50 + h.length;
      if (sc) out.push([sc, e]);
    }
  } else {
    let qn = q.toLowerCase();
    try { if (/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(qn)) qn = window.pinyinPro.convert(qn, { format: 'symbolToNum' }); } catch {}
    qn = qn.replace(/ü|u:/g, 'v').replace(/\s+/g, '').replace(/5/g, '');
    const tones = /\d/.test(qn), qp = qn.replace(/\d/g, ''), ql = q.toLowerCase().trim();
    const wordRx = new RegExp(`(^|[^a-z])${ql.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`);
    for (const e of list) {
      let sc = 0;
      if (/^[a-z\dv:]+$/.test(qn)) {
        if (tones) { if (e.num === qn) sc = 95; else if (e.num.startsWith(qn)) sc = 68; }
        else if (e.plain === qp) sc = 90; else if (qp.length >= 2 && e.plain.startsWith(qp)) sc = 62;
      }
      const glosses = e.m.split(/[;,]/).map((x) => x.trim().replace(/^to /, ''));
      if (glosses.includes(ql) || glosses.includes(ql.replace(/^to /, ''))) sc = Math.max(sc, 92);
      else if (wordRx.test(e.m)) sc = Math.max(sc, 74);
      else if (ql.length >= 3 && wordRx.test(e.all)) sc = Math.max(sc, 54);
      if (sc) out.push([sc, e]);
    }
  }
  return out.sort((a, b) => b[0] - a[0] || (a[1].w.hsk || 9) - (b[1].w.hsk || 9) || a[1].w.h.length - b[1].w.h.length).slice(0, 40).map((x) => x[1].w);
}
// HSK words first, then the full dictionary (CC-CEDICT) for everything else
function dictSearchAll(raw) {
  const hsk = dictSearch(raw), seen = new Set(hsk.map((w) => w.h));
  const more = window.CED ? CED.search(raw, 30).filter((e) => !seen.has(e.h) && (seen.add(e.h), true))
    .map((e) => ({ h: e.h, p: e.p, m: CED.short(e), all: e.d.replace(/ \/ /g, '; '), ced: true })) : [];
  return hsk.concat(more);
}
function metIn(w) {
  const c = ((S.ctx || {})[w.id] || [])[0];
  if (c) { const st = (window.STORIES || []).find((s) => s.id === c.s); return `Met in ${st ? `the story <span class="kai">${esc(st.title[0])}</span>` : 'a story'}: <span class="kai">${esc(c.zh)}</span>`; }
  if (w.extra) return 'Picked up in Jinan or a story';
  const lv = LEVELS.find((l) => l.ids.includes(w.id));
  return lv ? `${S.levelsDone[lv.n] ? 'Learned in' : 'Comes in'} Level ${lv.n}` : '';
}
let dictSel = 0, dictRes = [], dictCleanup = null;
// The panel has two tabs: "Look up" (the dictionary) and "Ask 🐼" (团团, ask.js). It reopens on the tab you used last.
function dictOpen() {
  if (document.getElementById('dictpanel')) return;
  if (typeof askContext === 'function') askCtx = askContext();      // what's on screen, before the panel covers it
  hideTip();
  const p = document.createElement('div');
  p.className = 'dictpanel'; p.id = 'dictpanel';
  p.innerHTML = `<div class="dicttabs"><button data-tab="look">${DICT_ICON} Look up</button><button data-tab="ask">Ask 🐼</button><kbd>Esc</kbd></div><div class="dictbody" id="dictbody"></div>`;
  document.body.appendChild(p);
  p.addEventListener('mousedown', (e) => e.stopPropagation());
  p.addEventListener('keydown', (e) => { if (e.key !== 'Escape' && !e.metaKey && !e.ctrlKey) e.stopPropagation(); });   // typing here never drives the screen behind
  p.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => dictTab(b.dataset.tab)));
  setTimeout(() => document.addEventListener('mousedown', dictOutside), 0);
  document.addEventListener('keydown', dictEsc, true);
  dictTab((S.settings && S.settings.dictTab) || 'look');
}
function dictTab(tab) {
  const p = document.getElementById('dictpanel'); if (!p) return;
  if (dictCleanup) { dictCleanup(); dictCleanup = null; }
  S.settings.dictTab = tab; save();
  p.classList.toggle('ask', tab === 'ask');
  p.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  const body = p.querySelector('#dictbody');
  if (tab === 'ask' && typeof askMount === 'function') { dictCleanup = askMount(body); return; }
  dictLook(body);
}
function dictLook(body) {
  body.innerHTML = `<div class="dictlook"><div class="dicthead"><span class="dicticon">${DICT_ICON}</span><input id="dictq" placeholder="Search English, pinyin or 汉字" autocomplete="off" spellcheck="false"></div>
    <div class="dictres" id="dictres"></div></div>`;
  const inp = body.querySelector('#dictq');
  inp.addEventListener('input', () => { dictSel = 0; dictRes = dictSearchAll(inp.value); drawDict(); });
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); e.stopPropagation(); if (dictRes[dictSel]) dictDetail(dictRes[dictSel]); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); dictSel = Math.max(0, Math.min(dictRes.length - 1, dictSel + (e.key === 'ArrowDown' ? 1 : -1))); drawDict(); }
  });
  dictSel = 0; dictRes = []; dictView = null; drawDict();
  setTimeout(() => inp.focus(), 0);
}
// recent words: the ones you opened, newest first
const dictRecent = () => (S.dictRecent = S.dictRecent || []);
function dictRemember(w) {
  const r = dictRecent().filter((x) => x.h !== w.h);
  r.unshift({ h: w.h, p: w.p, m: String(w.m || '').split(/[;,]/)[0].trim() });
  S.dictRecent = r.slice(0, 12); save();
}
function dictWordFor(h) {   // a recent entry back to a full word (HSK list, extra words, or the full dictionary)
  const w = dict().get(h); if (w) return w;
  const c = window.CED && CED.best(h);
  return c ? { h: c.h, p: c.p, m: CED.short(c), all: c.d.replace(/ \/ /g, '; '), ced: true } : null;
}
let dictView = null;
// one word, up close: meanings, parts, sentences you've met it in
function dictDetail(w) {
  const box = document.getElementById('dictres'); if (!box || !w) return;
  dictView = w; dictRemember(w);
  const hsk = !w.ced && w.id !== undefined ? w : null;
  const inRev = hsk ? !!S.words[hsk.id] : (() => { const x = (S.extraWords || []).find((e) => e.h === w.h); return !!(x && S.words[x.id]); })();
  const senses = String(w.all || w.m || '').split(/;\s*/).filter(Boolean).slice(0, 8);
  const ex = [];
  (window.STORIES || []).forEach((st) => (st.text || []).forEach((l) => { if (ex.length < 3 && l[0].includes(w.h)) ex.push(l); }));
  const met = hsk ? metIn(hsk) : '';
  const parts = typeof partsIntroHtml === 'function' ? partsIntroHtml(w) : '';
  box.innerHTML = `<div class="ddetail">
      <button class="dback" id="dback">← Results</button>
      <div class="dtop"><div class="dbig kai">${esc(w.h)}</div>
        <div class="dtopinfo"><div class="dpybig">${esc(w.p)}</div>
          <div class="dtags"><span class="dhsk ${w.ced ? 'beyond' : ''}">${w.ced ? 'Beyond HSK' : w.hsk ? 'HSK ' + w.hsk : 'Extra'}</span>${met ? `<span class="dmet">${met}</span>` : ''}</div>
          <div class="dbtns"><button class="btn-outline" id="dsay">${I.speaker} Listen</button>${inRev ? '<span class="din">✓ In Review</span>' : '<button class="btn-primary" id="dadd">+ Review</button>'}</div></div></div>
      <div class="dsec"><div class="label">Meaning</div><ol class="dsenses">${senses.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>
      ${parts ? `<div class="dsec">${parts}</div>` : ''}
      ${ex.length ? `<div class="dsec"><div class="label">In your stories</div>${ex.map((l) => `<div class="dex"><button class="icon-btn sm dexplay" data-zh="${esc(l[0])}" aria-label="Listen">${I.speaker}</button><div><div class="kai dexzh">${esc(l[0])}</div><div class="dexen">${esc(l[1] || '')}</div></div></div>`).join('')}</div>` : ''}
    </div>`;
  box.scrollTop = 0;
  box.querySelector('#dback').addEventListener('click', dictBack);
  box.querySelector('#dsay').addEventListener('click', () => speak(w.h));
  const add = box.querySelector('#dadd');
  if (add) add.addEventListener('click', () => { if (w.ced || w.id === undefined) addQuestWords([[w.h, w.p, w.m]]); else learnWord(w.id, 1); save(); toast(`${w.h} added to Review`); dictDetail(w); });
  box.querySelectorAll('.dexplay').forEach((b) => b.addEventListener('click', () => speak(b.dataset.zh)));
  speak(w.h);
}
function dictBack() { dictView = null; drawDict(); const i = document.getElementById('dictq'); if (i) i.focus(); }
// while the dictionary is open, Esc closes it (and nothing else)
function dictEsc(e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (dictView && document.querySelector('.ddetail')) dictBack(); else dictClose(); } }
function dictOutside(e) { if (!e.target.closest('#dictpanel, #dictbtn')) dictClose(); }
function dictClose() {
  const p = document.getElementById('dictpanel'); if (!p) return;
  if (dictCleanup) { dictCleanup(); dictCleanup = null; }
  p.remove(); document.removeEventListener('mousedown', dictOutside); document.removeEventListener('keydown', dictEsc, true);
}
function drawDict() {
  const box = document.getElementById('dictres'); if (!box) return;
  const q = document.getElementById('dictq').value.trim();
  if (!q) {
    const r = dictRecent();
    box.innerHTML = r.length
      ? `<div class="drecent"><div class="label">Recent</div><div class="dchips">${r.map((x, i) => `<button class="dchip" data-i="${i}"><span class="kai">${esc(x.h)}</span><small>${esc(x.p)}</small></button>`).join('')}</div></div>`
      : `<div class="dictempty">Try <b>happy</b>, <b>xihuan</b>, <b>xi3huan</b> or <span class="kai">喜欢</span>.</div>`;
    box.querySelectorAll('.dchip').forEach((b) => b.addEventListener('click', () => dictDetail(dictWordFor(r[+b.dataset.i].h))));
    return;
  }
  if (!dictRes.length) { box.innerHTML = `<div class="dictempty">No match for “${esc(q)}”.</div>`; return; }
  const inRev = (w) => { if (!w.ced) return S.words[w.id]; const x = (S.extraWords || []).find((e) => e.h === w.h) || W.find((e) => e && e.h === w.h); return x && S.words[x.id]; };
  box.innerHTML = dictRes.map((w, i) => `${w.ced && (i === 0 || !dictRes[i - 1].ced) ? '<div class="dsect">Full dictionary</div>' : ''}<div class="dres ${w.ced ? 'ced' : ''} ${i === dictSel ? 'sel' : ''}" data-i="${i}">
      <div class="dhz kai">${esc(w.h)}</div>
      <div class="dinfo"><div><b class="dpy">${esc(w.p)}</b> <span class="dhsk ${w.ced ? 'beyond' : ''}">${w.ced ? 'Beyond HSK' : w.hsk ? 'HSK ' + w.hsk : 'Extra'}</span>${inRev(w) ? ' <span class="din">✓ In Review</span>' : ''}</div>
        <div class="dxm">${esc(w.m || '')}</div></div>
      <button class="icon-btn sm dplay" data-i="${i}" aria-label="Listen">${I.speaker}</button></div>`).join('');
  box.querySelectorAll('.dplay').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); speak(dictRes[+b.dataset.i].h); }));
  box.querySelectorAll('.dres').forEach((r) => {
    r.addEventListener('click', () => dictDetail(dictRes[+r.dataset.i]));
    r.addEventListener('mouseenter', () => { dictSel = +r.dataset.i; box.querySelectorAll('.dres').forEach((x) => x.classList.toggle('sel', x === r)); });
  });
  const sel = box.querySelector('.dres.sel'); if (sel) sel.scrollIntoView({ block: 'nearest' });
}
