'use strict';
/* 天天 · Parts (部件): which pieces a character is built from.
   · New words show their parts.            · Drawing: hints name the next part, then animate it; parts are tagged when you finish.
   · Radical drills (部首) mixed into levels and review.
   Data: data/parts.js (built by build/parts.js from Make Me a Hanzi). Loaded after app.js. */

const PART_COLORS = [C.red, C.spring, '#B9791D', '#3D5A80', '#7A4E8C'];
const PU = 1024 * 0.08 / 0.84;   // the writer's padding, in character units, so overlays line up with hanzi-writer exactly

function partsOf(ch) {
  const d = (window.PARTS || {})[ch]; if (!d) return [];
  return d.p.map(([c, s], i) => {
    const n = (window.PART_NAMES || {})[c] || ['', ''];
    return { c, s, py: n[0], en: n[1], rad: c === d.r, i };
  });
}
const multiPart = (ch) => partsOf(ch).length > 1;
const partName = (p) => [p.py, p.en].filter(Boolean).join(' · ');

// the whole character, each stroke colored by its part (or by color(part))
function charSvg(ch, color, cls = '') {
  const st = STROKES[ch]; if (!st) return '';
  const ps = partsOf(ch), byStroke = {};
  ps.forEach((p) => p.s.forEach((s) => (byStroke[s] = p)));
  const col = color || ((p) => PART_COLORS[p.i % PART_COLORS.length]);
  return `<svg class="charsvg ${cls}" viewBox="${-PU} ${-PU} ${1024 + 2 * PU} ${1024 + 2 * PU}" aria-hidden="true"><g transform="scale(1,-1) translate(0,-900)">${st.strokes.map((d, k) => `<path d="${d}" fill="${byStroke[k] ? col(byStroke[k]) : C.ink}"/>`).join('')}</g></svg>`;
}
// just one part's strokes, cropped to fit
function partSvg(ch, p, color = C.ink) {
  const st = STROKES[ch]; if (!st || !p) return '';
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  p.s.forEach((k) => { const nums = (st.strokes[k].match(/-?\d+(\.\d+)?/g) || []).map(Number); for (let i = 0; i + 1 < nums.length; i += 2) { const x = nums[i], y = 900 - nums[i + 1]; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } });
  const side = Math.max(x1 - x0, y1 - y0) + 80, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return `<svg class="partsvg" viewBox="${cx - side / 2} ${cy - side / 2} ${side} ${side}" aria-hidden="true"><g transform="scale(1,-1) translate(0,-900)">${p.s.map((k) => `<path d="${st.strokes[k]}" fill="${color}"/>`).join('')}</g></svg>`;
}
const partChip = (ch, p, color) => `<span class="pchip"><span class="pglyph">${partSvg(ch, p, color || PART_COLORS[p.i % PART_COLORS.length])}</span><span class="pname">${esc(partName(p))}${p.rad ? ' <span class="prad">radical</span>' : ''}</span></span>`;

// ---------------------------------------------------------------- new word: what it's made of
function partsIntroHtml(w) {
  const chars = [...new Set(hanChars(w.h))]; if (!chars.length) return '';
  const rows = chars.map((ch) => {
    const ps = partsOf(ch); if (!ps.length) return '';
    return `<div class="partrow"><div class="pchar">${charSvg(ch)}</div><div class="peq">${ps.length > 1 ? ps.map((p) => partChip(ch, p)).join('<span class="pplus">+</span>') : `<span class="pone">One part:</span>${partChip(ch, ps[0])}`}</div></div>`;
  }).join('');
  return rows ? `<div class="partsbox" data-nohz><div class="label">Parts · 部件</div>${rows}</div>` : '';
}

// ---------------------------------------------------------------- after drawing: tag the parts
function tagParts(chars) {
  chars.forEach((ch, i) => {
    const box = root.querySelector('#b' + i); if (!box || !partsOf(ch).length) return;
    const ov = document.createElement('div'); ov.className = 'partover'; ov.innerHTML = charSvg(ch);
    box.appendChild(ov);
    const el = root.querySelector('#d' + i); if (el) el.style.visibility = 'hidden';
  });
  const tags = [...new Set(chars)].map((ch) => { const ps = partsOf(ch); return ps.length ? `<div class="ptags">${ps.map((p) => partChip(ch, p)).join('')}</div>` : ''; }).join('');
  const wrap = root.querySelector('.drawwrap');
  if (wrap && tags) wrap.insertAdjacentHTML('afterend', `<div class="ptagrow" data-nohz>${tags}</div>`);
}

// ---------------------------------------------------------------- radical drill (部首)
// pick a character in the word and the part to ask about (its radical when it has a name)
function radPick(id) {
  const opts = hanChars(W[id].h).filter(multiPart);
  if (!opts.length) return null;
  const ch = opts[Math.floor(Math.random() * opts.length)];
  const ps = partsOf(ch).filter((p) => p.en);
  if (!ps.length) return null;
  const p = ps.find((x) => x.rad) || ps[Math.floor(Math.random() * ps.length)];
  return { ch, p };
}
const canRad = (id) => !!W[id] && hanChars(W[id].h).some((ch) => multiPart(ch) && partsOf(ch).some((p) => p.en));

function radIt(it) {
  const w = W[it.id], pick = it.pick || (it.pick = radPick(it.id));
  if (!pick) return advance();
  const { ch, p } = pick;
  const mode = it.mode || (it.mode = (() => { const r = Math.random(); return r < 0.34 ? 'build' : r < 0.7 ? 'mean' : 'find'; })());
  if (mode === 'build') return buildIt(it, w, ch);
  let prompt, opts, q;
  if (mode === 'mean') {
    q = 'What does the red part mean?';
    prompt = `<div class="radchar">${charSvg(ch, (x) => (x.c === p.c ? C.red : C.ink))}</div>`;
    // other meanings from parts you've met
    const seen = new Set([p.en]), pool = [];
    learnedIds().forEach((id) => hanChars(W[id].h).forEach((c) => partsOf(c).forEach((x) => { if (x.en && !seen.has(x.en)) { seen.add(x.en); pool.push(x.en); } })));
    Object.values(window.PART_NAMES || {}).forEach(([, en]) => { if (pool.length < 40 && en && !seen.has(en)) { seen.add(en); pool.push(en); } });
    opts = shuffle([{ ok: true, html: esc(p.en) }, ...pickN(pool, 3).map((en) => ({ ok: false, html: esc(en) }))]);
  } else {
    q = 'Which character has this part?';
    prompt = `<div class="radpart">${partSvg(ch, p, C.ink)}</div>`;
    const others = [];
    const has = (c) => partsOf(c).some((x) => x.c === p.c) || (STROKES[c] && (window.PARTS[c] || {}).r === p.c);
    shuffle(learnedIds().concat(W.slice(0, 400).map((x) => x.id))).forEach((id) => hanChars(W[id].h).forEach((c) => { if (others.length < 3 && c !== ch && !has(c) && !others.includes(c)) others.push(c); }));
    opts = shuffle([{ ok: true, html: `<span class="kai">${esc(ch)}</span>` }, ...others.map((c) => ({ ok: false, html: `<span class="kai">${esc(c)}</span>` }))]);
  }
  let answered = false, left = false;
  const next = () => { if (left) return; left = true; advance(); };
  render(drill(`<div class="label">Radical · 部首</div><div class="meaning sm radq">${q}</div>${prompt}
      <div class="options">${opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="n">${i + 1}</span><span>${o.html}</span></button>`).join('')}</div>`,
    `${hints([['1–' + opts.length, 'choose']])}<div class="right"><button class="btn-primary" id="next" style="visibility:hidden">Continue <kbd>↵</kbd></button></div>`),
  stageKeys((e) => {
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= opts.length && !answered) answer(n - 1);
    else if (e.key === 'Enter' && answered) next();
    else if (e.key === ' ' && answered) { e.preventDefault(); speak(w.h); }
  }), () => {
    startClock();
    on('.opt', 'click', (e) => !answered && answer(+e.currentTarget.dataset.i));
    on('#next', 'click', next);
  });
  function answer(i) {
    answered = true; HZ_LOCK = false;
    const ok = opts[i].ok;
    root.querySelectorAll('.opt').forEach((b, j) => b.classList.add(opts[j].ok ? 'ok' : j === i ? 'bad' : 'dim'));
    if (it.review) { if (ok) addXp(5); } else scored(it, ok);
    const line = `<span class="pline">${partChip(ch, p, ok ? C.spring : C.red)} <span>in <span class="kai">${esc(ch)}</span> · ${answerLine(w)}</span></span>`;
    setFoot(ok ? 'ok' : 'bad', line);
    if (mode === 'mean') { const rc = root.querySelector('.radchar'); if (rc) rc.innerHTML = charSvg(ch); }
    speak(w.h);
    if (ok) { const here = root.querySelector('.radq'); setTimeout(() => { if (sess && !left && here && root.contains(here) && !document.getElementById('wrongbox')) next(); }, 1300); }
    else { root.querySelector('#next').style.visibility = 'visible'; showWrong(w, next, null, `<div class="wpart">${partSvg(ch, p, C.ink)}</div><div class="wpy">${esc(p.py)}</div><div class="wm">${esc(p.en)}${p.rad ? ' · radical' : ''}</div><div class="smoke wnote">in <span class="kai">${esc(ch)}</span> · ${esc(w.h)} ${esc(w.p)}</div>`); }
  }
}

// ---------------------------------------------------------------- build the character (部件拼字)
// You see the word's pinyin and meaning; tap its parts in writing order from 8 tiles (its parts + decoys you've met).
// Each right tap draws that part into the grid. A wrong tap shakes the tile and counts as a miss; you keep building.
function buildSvg(ch, built) {
  const st = STROKES[ch]; if (!st) return '';
  const ps = partsOf(ch), byStroke = {};
  ps.forEach((p) => p.s.forEach((k) => (byStroke[k] = p)));
  const all = built.length === ps.length;
  return `<svg class="charsvg" viewBox="${-PU} ${-PU} ${1024 + 2 * PU} ${1024 + 2 * PU}" aria-hidden="true"><g transform="scale(1,-1) translate(0,-900)">${st.strokes.map((d, k) => {
    const p = byStroke[k], on = p ? built.includes(p.i) : all;
    return on ? `<path d="${d}" fill="${p ? PART_COLORS[p.i % PART_COLORS.length] : C.ink}"/>` : '';
  }).join('')}</g></svg>`;
}
function buildDecoys(ch, need, n) {
  const seen = new Set(need.map((p) => p.c)), named = [], plain = [];
  const look = (c) => partsOf(c).forEach((x) => {
    if (seen.has(x.c) || !STROKES[c]) return; seen.add(x.c);
    (x.en ? named : plain).push({ ch: c, p: x });
  });
  shuffle(learnedIds()).forEach((id) => hanChars(W[id].h).forEach(look));
  if (named.length < n) W.slice(0, 600).forEach((x) => hanChars(x.h).forEach(look));
  return shuffle(named).concat(shuffle(plain)).slice(0, n);
}
function buildIt(it, w, ch) {
  const need = partsOf(ch).slice().sort((a, b) => Math.min(...a.s) - Math.min(...b.s));
  if (need.length < 2 || !STROKES[ch]) { it.mode = 'mean'; return radIt(it); }
  const tiles = it.tiles || (it.tiles = shuffle(need.map((p) => ({ ch, p, real: true })).concat(buildDecoys(ch, need, 8 - need.length))));
  const chars = hanChars(w.h), at = chars.indexOf(ch);
  const slots = chars.length > 1 ? `<div class="bslots">${chars.map((c, i) => `<span class="${i === at ? 'on' : ''}">${i === at ? '?' : '＿'}</span>`).join('')}</div>` : '';
  let step = 0, missed = false, done = false, left = false;
  const built = [];
  const next = () => { if (left) return; left = true; advance(); };
  render(drill(`<div class="label">Build it · 拼字 · tap the parts in writing order</div>
      <div class="bprompt"><div class="prompt-py">${esc(w.p)}</div><div class="meaning sm">${esc(w.m)}</div>${slots}</div>
      <div class="bgrid grid">${tzg}<div class="bdraw" id="bdraw"></div></div>
      <div class="btiles">${tiles.map((t, i) => `<button class="btile" data-i="${i}"><span class="n">${i + 1}</span><span class="bglyph">${partSvg(t.ch, t.p, C.ink)}</span><span class="bname">${esc(t.p.en || '')}</span></button>`).join('')}</div>`,
    `${hints([['1–' + tiles.length, 'tap a part']])}<div class="right"><button class="btn-primary" id="next" style="visibility:hidden">Continue <kbd>↵</kbd></button></div>`),
  stageKeys((e) => {
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= tiles.length && !done) tap(n - 1);
    else if (e.key === 'Enter' && done) next();
    else if (e.key === ' ' && done) { e.preventDefault(); speak(w.h); }
  }), () => {
    startClock();
    on('.btile', 'click', (e) => !done && tap(+e.currentTarget.dataset.i));
    on('#next', 'click', next);
  });
  function tap(i) {
    const t = tiles[i], b = root.querySelector(`.btile[data-i="${i}"]`);
    if (!b || b.classList.contains('used')) return;
    const want = need[step];
    if (t.real && t.p.c === want.c) {
      // the same part can appear twice (木 + 木): take this tile for the next one in order
      built.push(want.i); step++;
      b.classList.add('used');
      root.querySelector('#bdraw').innerHTML = buildSvg(ch, built);
      if (step === need.length) finish();
    } else {
      missed = true;
      b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
    }
  }
  function finish() {
    done = true; HZ_LOCK = false;
    const ok = !missed;
    root.querySelectorAll('.btile:not(.used)').forEach((b) => b.classList.add('dim'));
    if (it.review) { if (ok) addXp(5); } else scored(it, ok);
    speak(w.h);
    const parts = need.map((p) => partChip(ch, p)).join('<span class="pplus">+</span>');
    setFoot(ok ? 'ok' : 'bad', `<span class="pline"><span class="kai">${esc(ch)}</span> = ${parts}</span>`);
    root.querySelector('.bslots span.on') && (root.querySelector('.bslots span.on').textContent = ch);
    if (ok) { const here = root.querySelector('#bdraw'); setTimeout(() => { if (sess && !left && here && root.contains(here)) next(); }, 1600); }
    else root.querySelector('#next').style.visibility = 'visible';
  }
}
