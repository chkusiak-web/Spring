'use strict';
/* 天天 · Ask 团团: an open-ended panda mentor in the dictionary panel (second tab, ⌘K from anywhere).
   No script, no goals: you ask about Chinese, 团团 explains in English with characters + pinyin, using the local AI.
   It sees what's on your screen when you open the panel (the word in a drill, the story sentence, the chat line,
   or text you selected). One running conversation, saved in S.panda (the AI reads the last few turns). */

const ASK_KEEP = 400, ASK_TURNS = 12;
let askCtx = null, askBusy = false, askPanda = null, askTyping = false, askHush = 0;

// What the learner is looking at right now (captured when the panel opens).
function askContext() {
  const bits = [];
  try {
    const sel = String(window.getSelection ? window.getSelection() : '').trim();
    if (sel && /[㐀-鿿]/.test(sel) && sel.length < 120) bits.push({ k: 'Selected', zh: sel });
  } catch {}
  const word = (id) => (W[id] ? `${W[id].h} (${W[id].p}, ${W[id].m})` : '');
  if (typeof sess !== 'undefined' && sess) {
    if (sess.type === 'review' && sess.curId !== undefined) bits.push({ k: 'Review card', zh: word(sess.curId) });
    else if (sess.items && sess.items[sess.i] && W[sess.items[sess.i].id]) bits.push({ k: 'Drill word', zh: word(sess.items[sess.i].id) });
  }
  if (typeof story !== 'undefined' && story && story.st) {
    const line = story.st.text[Math.min(story.i || 0, story.st.text.length - 1)];
    if (line) bits.push({ k: 'Story sentence', zh: `${line[0]} (${line[1]})` });
  }
  if (typeof chat !== 'undefined' && chat && chat.st && chat.st.last) {
    const l = chat.st.last; bits.push({ k: `${CHARS[chat.cid] ? CHARS[chat.cid].zh : 'Chat'} said`, zh: `${l[0]}${l[1] ? ` (${l[1]})` : ''}` });
  }
  return bits;
}

function askSystem() {
  const lvl = nextLevel(), known = learnedIds().length;
  return `You are 团团 (Tuántuan), a calm, kind, slightly sleepy giant panda who mentors an English-speaking learner of Mandarin Chinese.
The learner studies Simplified characters with the HSK 3.0 word lists. They are around HSK ${lvl.hsk} and know about ${known} words.

How you answer:
- Always answer in ENGLISH. Use Chinese only for the words and examples you are explaining.
- Write Chinese in Simplified characters ONLY. Never write pinyin or any romanization: the app adds correct pinyin after every Chinese word automatically.
- The learner's message may include "Dictionary entries" from the app. They are correct: use those words and meanings, and prefer them over your own memory.
- Be clear and practical. Explain the difference or the rule in plain words, then give 1–3 short example sentences in Chinese, each followed by an English translation.
- Keep examples simple, mostly HSK 1–3 words.
- Keep answers short: usually under 150 words. Use short paragraphs and "- " bullets. You may use **bold** for the key word.
- Be encouraging, never preachy. A tiny bit of panda warmth is fine, but no roleplay actions and no emoji.
- If a question isn't about Chinese, language or China, answer briefly and kindly steer back to learning.
- If the learner corrects you, check the dictionary entries before agreeing. If they are right, say so; if they are not, kindly explain. Never invent a word to match a correction.
- If you are not sure, say so instead of guessing.
- For questions about tones or pronunciation, describe them in words ("third tone", "falling tone"); the app shows the pinyin.`;
}


// ---------------------------------------------------------------- pinyin by the app, not the model
// The local model is unreliable at pinyin (it wrote "xiāngguǒ" for 西瓜). So it writes characters only, the app strips
// any pinyin it adds anyway, and puts correct pinyin (dictionary words first, pinyin-pro for the rest) after each run.
const HAN = '㐀-鿿', ZHP = '　-〿！-～';
const HAN_RUN = new RegExp(`[${HAN}${ZHP}]*[${HAN}][${HAN}${ZHP}]*`, 'g');
const TONE = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/;
const PYCH = "a-zA-ZāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüÜ'’";
const ZPUNCT = { '，': ',', '。': '.', '？': '?', '！': '!', '、': ',', '：': ':', '；': ';', '“': '"', '”': '"', '‘': "'", '’': "'", '（': '(', '）': ')', '…': '…', '—': '—', '《': '"', '》': '"' };
const isHan = (c) => new RegExp(`[${HAN}]`).test(c);
const knownWord = (w) => dict().has(w) || (window.CED && CED.has(w));
// pinyin for one word: the HSK list first, then the full dictionary, then pinyin-pro
function wordPy(w) {
  const e = dict().get(w), c = !e && window.CED ? CED.best(w) : null;
  let syl = e && e.p ? String(e.p).split(/\s+/) : c ? c.p.split(/\s+/) : (() => { try { return window.pinyinPro.pinyin(w, { type: 'array' }); } catch { return []; } })();
  return syl.filter(Boolean).map((x, i) => (i && /^[aeoāáǎàēéěèōóǒò]/i.test(x) ? `'${x}` : x)).join('');
}
function runPy(run) {
  const s = [...run]; let out = '', i = 0, k = 0;
  let ctxPy = []; try { ctxPy = window.pinyinPro.pinyin(s.filter(isHan).join(''), { type: 'array' }); } catch {}   // single characters read in context (了, 得, 长…)
  const words = (han) => (window.CED ? CED.segment(han, (w) => dict().has(w)) : [...han]);
  while (i < s.length) {
    if (!isHan(s[i])) { const p = ZPUNCT[s[i]]; if (p !== undefined) out += p + (/[,.?!:;]/.test(p) ? ' ' : ''); i++; continue; }
    let j = i; while (j < s.length && isHan(s[j])) j++;
    for (const w of words(s.slice(i, j).join(''))) {
      const L = [...w].length, py = L === 1 && !dict().has(w) && ctxPy[k] ? ctxPy[k] : wordPy(w);
      out += (out && !/[\s"(]$/.test(out) ? ' ' : '') + py; k += L;
    }
    i = j;
  }
  out = out.replace(/\s+/g, ' ').trim();
  if (/[。？！]\s*$/.test(run) || [...run].filter((c) => new RegExp(`[${HAN}]`).test(c)).length >= 5) out = out.charAt(0).toUpperCase() + out.slice(1);
  return out;
}
// remove pinyin the model wrote anyway: 西瓜 (xīguā) → 西瓜 ; xīguā (西瓜) → 西瓜 ; 西瓜 (xīguā, watermelon) → 西瓜 (watermelon)
function askClean(text) {
  const NEUTRAL = new Set(['de', 'le', 'ma', 'ne', 'ba', 'zi', 'men', 'ge', 'zhe', 'guo', 'a', 'ya', 'la', 'me', 'shang', 'li', 'tou', 'r']);
  const isPy = (x) => { const ws = x.trim().split(/[\s.,?!·-]+/).filter(Boolean);       // every word must look like pinyin
    return ws.length > 0 && ws.some((w) => TONE.test(w)) && ws.every((w) => new RegExp(`^[${PYCH}]+$`).test(w) && (TONE.test(w) || NEUTRAL.has(w.toLowerCase()))); };
  let t = String(text);
  t = t.replace(new RegExp(`([${HAN}][${HAN}${ZHP}]{0,40})(\\*\\*)?[ \\t]*[（(][ \\t]*([^()（）\\n]{1,80})[)）]`, 'g'), (m, run, b, inner) => {
    const raw = inner.replace(/\*\*/g, '').trim();
    if (isPy(raw)) return run + (b || '');
    const mm = raw.match(/^([^,;，；:]+)[,;，；:]\s*(.+)$/);
    if (mm && isPy(mm[1])) return `${run}${b || ''} (${mm[2]})`;
    return m;
  });
  t = t.replace(new RegExp(`((?:[${PYCH}]+ ){0,8}[${PYCH}]+)(\\*\\*)?[ \\t]*[（(][ \\t]*(\\*\\*)?([${HAN}][${HAN}${ZHP}]{0,40})(\\*\\*)?[ \\t]*[)）]`, 'g'), (m, words, b1, b2, run, b3) => {
    const ws = words.trim().split(/\s+/); let k = 0;
    while (k < ws.length && !TONE.test(ws[k])) k++;                    // leading English words stay
    if (k === ws.length) return m;
    if (!ws.slice(k).every((w) => new RegExp(`^[${PYCH}]+$`).test(w))) return m;
    const keep = ws.slice(0, k).join(' '), pre = `${keep ? keep + ' ' : ''}${/\s$/.test(words) && !keep ? '' : ''}`;
    if (b1) return `${pre}${run}**`;                                     // **xīguā** (西瓜): the opening ** is already in the text
    return (b2 || b3) ? `${pre}**${run}**` : `${pre}${run}`;
  });
  return t;
}
const addPy = (html) => html.replace(HAN_RUN, (run) => { const py = runPy(run); return py ? `${run} <span class="askpy">(${esc(py)})</span>` : run; });

// Dictionary entries for the question: Chinese in it, and English words/phrases that match a meaning in the word list.
const ASK_STOP = new Set('a an the and or but is are am was were be been to of in on at for with what whats how do does did i you me my your it its this that these those say said mean means meaning word words chinese mandarin difference between vs versus when why which who can could would should use using about like from into than then there their they we us our please tell explain write written character characters sentence english believe actually think thought know right wrong sure really correct isnt its maybe just also sorry thanks thank yes not dont'.split(' '));
function askRefs(q) {
  const out = new Map(), d = dict();
  const add = (w) => { if (w && w.h && !out.has(w.h) && out.size < 10) out.set(w.h, w); };
  const cedRef = (h, e) => { e = e || (window.CED && CED.best(h)); return e ? { h: e.h, p: e.p, m: CED.short(e) } : null; };
  (q.match(HAN_RUN) || []).forEach((run) => {
    const s = [...run].filter((c) => new RegExp(`[${HAN}]`).test(c)); let i = 0;
    (window.CED ? CED.segment(s.join(''), (w) => d.has(w)) : s).forEach((w) => add(d.get(w) || cedRef(w)));
  });
  (q.match(/[a-zA-ZāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüÜ']+/g) || []).filter((x) => TONE.test(x)).forEach((x) => {   // pinyin they typed, e.g. Kuāzhāng
    let n = ''; try { n = window.pinyinPro.convert(x.toLowerCase(), { format: 'symbolToNum' }).replace(/\s+/g, ''); } catch {}
    if (n) W.filter((w) => w && String(w.n || '').replace(/\s+/g, '').replace(/5/g, '') === n.replace(/5/g, '')).slice(0, 3).forEach(add);
  });
  const quoted = (q.match(/["“”]([^"“”]{2,40})["“”]/g) || []).map((x) => x.slice(1, -1)).join(' ');   // "watermelon": just that
  const toks = (quoted || q).toLowerCase().replace(/[^a-z' -]/g, ' ').split(/\s+/).filter(Boolean);
  const senses = (w) => String(w.all || w.m || '').toLowerCase().split(/[;,/]/).map((x) => x.replace(/\(.*?\)/g, '').replace(/^\s*(to|a|an|the)\s+/, '').trim());
  const find = (ph) => W.filter((w) => w && senses(w).includes(ph)).sort((a, b) => (a.hsk || 9) - (b.hsk || 9)).slice(0, 3);
  for (let i = 0; i < toks.length; i++) {
    if (i + 1 < toks.length && !ASK_STOP.has(toks[i]) && !ASK_STOP.has(toks[i + 1])) { const two = `${toks[i]} ${toks[i + 1]}`; const f = find(two); const c2 = !f.length && window.CED ? CED.find(two, 3) : []; if (f.length || c2.length) { f.forEach(add); c2.forEach((e) => add(cedRef(e.h, e))); i++; continue; } }
    if (ASK_STOP.has(toks[i]) || toks[i].length < 3) continue;
    let f = find(toks[i]); if (!f.length && toks[i].endsWith('s')) f = find(toks[i].slice(0, -1));
    f.forEach(add);
    if (f.length < 2 && window.CED) {                              // not (enough) in the HSK list: the full dictionary
      let c = CED.find(toks[i], 3); if (!c.length && toks[i].endsWith('s')) c = CED.find(toks[i].slice(0, -1), 3);
      c.forEach((e) => add(cedRef(e.h, e)));
    }
  }
  return [...out.values()].map((w) => `${w.h} ${String(w.p || '').replace(/\s+/g, '')} = ${w.all || w.m}`).join('; ');
}

// light markdown: paragraphs, "- " bullets, **bold**. Chinese gets hover pinyin / click English from hz.js automatically.
function askFormat(text) {
  const lines = esc(askClean(text)).split(/\n/);
  let html = '', list = false;
  for (const raw of lines) {
    const l = raw.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    if (/^\s*[-•*]\s+/.test(l)) { if (!list) { html += '<ul>'; list = true; } html += `<li>${l.replace(/^\s*[-•*]\s+/, '')}</li>`; continue; }
    if (list) { html += '</ul>'; list = false; }
    if (l.trim()) html += `<p>${l}</p>`;
  }
  if (list) html += '</ul>';
  return addPy(html);
}

const askStore = () => (S.panda = S.panda || []);
function askMsgHtml(m) {
  if (m.r === 'me') return `<div class="askrow me"><div class="askb me">${esc(m.text)}${m.ctx ? `<div class="askctx">${esc(m.ctx)}</div>` : ''}</div></div>`;
  const body = !m.text && askBusy ? '<span class="askdots" aria-label="团团 is thinking"><i></i><i></i><i></i></span>' : (m.html || askFormat(m.text));
  return `<div class="askrow tt"><img class="askface" src="img/people/tuantuan-face.png" alt=""><div class="askb tt">${body}</div></div>`;
}
function askDraw() {
  const box = document.getElementById('asklog'); if (!box) return;
  const msgs = askStore();
  box.innerHTML = '<div class="askspacer"></div>' + (msgs.length ? '' : `<div class="askrow tt"><img class="askface" src="img/people/tuantuan-face.png" alt=""><div class="askb tt"><p>Hi, I'm 团团 (Tuántuan). Ask me anything about Chinese: words that look alike, grammar, tones, when to use what.</p><p>Try: <i>What's the difference between 时候, 几点 and 季节?</i></p></div></div>`)
    + msgs.map(askMsgHtml).join('');
  box.scrollTop = box.scrollHeight;
}

function askMount(body) {
  const ctx = askCtx || [];
  body.innerHTML = `<div class="askscene">
      <canvas id="askcanvas" class="askbg" aria-label="团团 the panda on a wall under a blue sky"></canvas>
      <div class="askwrap">
        <div class="askband"></div>
        <div class="asklog" id="asklog"></div>
        ${ctx.length ? `<div class="askseen" title="团团 can see this">👀 ${ctx.map((c) => `<span><b>${esc(c.k)}:</b> <span>${esc(c.zh)}</span></span>`).join(' · ')}</div>` : ''}
        <div class="askin"><textarea id="askq" rows="2" placeholder="Ask in English (or Chinese)…  e.g. 时候 vs 几点?" spellcheck="false"></textarea>
          <button class="askgo" id="asksend">Ask <kbd>↵</kbd></button></div>
        <div class="asknote" id="asknote"></div>
      </div>
    </div>`;
  const cv = body.querySelector('#askcanvas');
  askPanda = window.PANDA ? (PANDA.mountWide ? PANDA.mountWide(cv, 4) : PANDA.mount(cv)) : null;
  if (askPanda && askBusy) (askTyping ? askPanda.setTalking(true) : askPanda.setThinking && askPanda.setThinking(true));
  askDraw();
  const q = body.querySelector('#askq');
  q.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); e.stopPropagation(); askSend(); }
  });
  body.querySelector('#asksend').addEventListener('click', askSend);
  setTimeout(() => q.focus(), 30);
  AI.check().then(() => { const n = document.getElementById('asknote'); if (n && !AI.ready()) n.textContent = askOffline(); });
  return () => { if (askPanda) askPanda.destroy(); askPanda = null; };
}
function askOffline() {
  const st = AI.status();
  if (!AI.cfg().on) return '团团 is asleep: the local AI is turned off in Settings.';
  if (st.unsupported) return '团团 needs the desktop app to think.';
  if (!st.running) return '团团 is asleep: the local AI (Ollama) isn\'t running. Open Ollama, then ask again.';
  if (!st.hasModel) return `团团 is asleep: the model ${AI.cfg().model} isn't installed in Ollama.`;
  return '';
}

async function askSend() {
  const q = document.getElementById('askq'); if (!q || askBusy) return;
  const text = q.value.trim(); if (!text) return;
  await AI.check(true);
  if (!AI.ready()) { const n = document.getElementById('asknote'); if (n) n.textContent = askOffline(); return; }
  q.value = '';
  const ctx = askCtx && askCtx.length ? askCtx.map((c) => `${c.k}: ${c.zh}`).join(' · ') : '';
  const msgs = askStore();
  const refs = askRefs(text);
  msgs.push({ r: 'me', text, ctx, refs, at: Date.now() });
  const turn = { r: 'tt', text: '', at: Date.now() }; msgs.push(turn);
  askCtx = null;                                   // the screen context goes with the first question after opening
  const seen = document.querySelector('.askseen'); if (seen) seen.remove();
  askBusy = true; askTyping = false; askDraw(); if (askPanda && askPanda.setThinking) askPanda.setThinking(true);
  const n = document.getElementById('asknote'); if (n) n.textContent = '';
  const hist = msgs.slice(0, -1).slice(-ASK_TURNS);
  const history = hist.map((m, i) => ({ role: m.r === 'me' ? 'user' : 'assistant',
    content: m.r === 'me' ? [m.ctx ? `[On my screen — ${m.ctx}]` : '', i === hist.length - 1 && m.refs ? `[Dictionary entries: ${m.refs}]` : '', m.text].filter(Boolean).join('\n') : m.text }));
  let lastDraw = 0;
  const out = await AI.mentor(askSystem(), history, (t) => {
    turn.text = t;
    if (askPanda) {                                // mouth moves only while words arrive; stops after a ½ s pause
      if (!askTyping) { askTyping = true; if (askPanda.setThinking) askPanda.setThinking(false); }
      askPanda.setTalking(true); clearTimeout(askHush); askHush = setTimeout(() => askPanda && askPanda.setTalking(false), 500);
    }
    const now = Date.now(); if (now - lastDraw < 60) return; lastDraw = now;
    const rows = document.querySelectorAll('#asklog .askrow'); const last = rows[rows.length - 1];
    if (last) { const b = last.querySelector('.askb'); if (b) b.innerHTML = askFormat(t) + '<span class="askcaret"></span>'; const box = document.getElementById('asklog'); if (box) box.scrollTop = box.scrollHeight; }
  });
  askBusy = false; askTyping = false; clearTimeout(askHush);
  if (askPanda) { askPanda.setTalking(false); if (askPanda.setThinking) askPanda.setThinking(false); }
  if (out) turn.text = out;
  else { msgs.pop(); const nn = document.getElementById('asknote'); if (nn) nn.textContent = '团团 dozed off mid-answer. Try asking again.'; }
  if (msgs.length > ASK_KEEP) msgs.splice(0, msgs.length - ASK_KEEP);
  save(); askDraw();
}
