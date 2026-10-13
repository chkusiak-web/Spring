/* 天天 · level checker for Jinan conversations.
   Each quest has a `level`: it unlocks when that HSK level is finished, so it should only need words from levels 1…level.
   - What the learner SAYS (step `try` sentences) must stay inside those levels, plus the district's taught words
     (each quest's `words`, available from that quest on). Anything else is an ERROR.
   - What characters say is FLAGGED (not an error): extra words are allowed, but they should be few and on purpose.
   Names, particles and numbers are always fine.
   Usage: node build/check_levels.js [district-id] */
const fs = require('fs');
const path = require('path');
const A = path.join(__dirname, '..', 'app');
global.window = {};
eval(fs.readFileSync(path.join(A, 'data/words.js'), 'utf8'));
eval(fs.readFileSync(path.join(A, 'data/jinan.js'), 'utf8'));
eval(fs.readFileSync(path.join(A, 'data/jinan-scripts.js'), 'utf8'));
for (const f of fs.readdirSync(path.join(A, 'data/scripts'))) eval(fs.readFileSync(path.join(A, 'data/scripts', f), 'utf8'));
const W = window.WORDS, J = window.JINAN, Q = window.JINAN_SCRIPTS.quests;
const only = process.argv[2];

// level of each HSK 1 word (same grouping as app.js: 5 words per level, in list order)
const LV = {};
W.filter((w) => w.hsk === 1).forEach((w, i) => { if (!LV[w.h]) LV[w.h] = Math.floor(i / 5) + 1; });
const HSK = {}; W.forEach((w) => { if (w && !HSK[w.h]) HSK[w.h] = w.hsk; });
const NAMES = new Set(['济南', '曲水亭街', '曲水亭', '趵突泉', '芙蓉街', '大明湖', '千佛山', '泉城广场', '山东大学', '宽厚里', '小苏', '小谢', '老潘', '王奶奶', '张老师', '吕老师', '孙师傅', '林姐', '陈女士', '白大夫', '乐乐', '马先生', '马', '小明', '美国', '英国', '加拿大', '澳大利亚', '法国', '德国', '日本', '韩国', '中国人', '美国人', '超然楼', '宽厚里', '省立医院', '省立', '甜沫', '把子肉', '大明湖', '孙师傅', '吕老师', '张老师', '白大夫']);
const FREE = new Set([...'啊哦嗯哎呀哇嘿喂', '零', '百', '千', '两']);
const NUMS = /^[零一二两三四五六七八九十百千]+$/;
const DICT = new Set([...Object.keys(HSK), ...NAMES]);
function seg(t) {
  const a = [...String(t).replace(/\{[^}]*\}/g, '').replace(/[^㐀-鿿]/g, ' ')], out = []; let i = 0;
  while (i < a.length) {
    if (a[i] === ' ') { i++; continue; }
    let L = Math.min(5, a.length - i);
    while (L > 1 && !DICT.has(a.slice(i, i + L).join('')) && !NUMS.test(a.slice(i, i + L).join(''))) L--;
    out.push(a.slice(i, i + L).join('')); i += L;
  }
  return out;
}
const flat = (l) => (Array.isArray(l) && Array.isArray(l[0]) ? l : [l]);
const lineZh = (l) => flat(l).map((x) => x[0] || '').join(' ');
function over(word, level, taught) {
  if (NAMES.has(word) || FREE.has(word) || NUMS.test(word) || taught.has(word)) return null;
  const lv = LV[word];
  if (lv && lv <= level) return null;
  if (!lv && [...word].length > 1 && [...word].every((c) => LV[c] && LV[c] <= level)) return null;   // a compound of known characters
  return lv ? `${word}(L${lv})` : `${word}(${HSK[word] ? 'HSK' + HSK[word] : 'not HSK'})`;
}
let errors = 0, flags = 0;
const taught = new Set();   // taught words carry over: a district's words are known in every later district
for (const d of J.districts.slice().sort((a, b) => a.order - b.order)) {
  for (const q of d.quests) {
    if (!q.level) continue;
    const sc = Q[q.id]; if (!sc) continue;
    (sc.words || []).forEach((w) => { taught.add(w[0]); DICT.add(w[0]); });
    if (only && d.id !== only) continue;
    const bad = new Map(), npc = new Map();
    for (const s of sc.steps || []) for (const t of s.try || []) seg(t).forEach((w) => { const o = over(w, q.level, taught); if (o) bad.set(o, t); });
    const lines = [...(sc.open || []), ...(sc.done || []), ...(sc.later ? [sc.later] : []), ...(sc.steps || []).flatMap((s) => s.say || []), ...(sc.extra || []).flatMap((e) => e.say || [])];
    if (sc.challenge) lines.push(...(sc.challenge.fail || []), ...(sc.challenge.restart || []));
    lines.forEach((l) => seg(lineZh(l)).forEach((w) => { const o = over(w, q.level, taught); if (o) npc.set(o, (npc.get(o) || 0) + 1); }));
    const head = `${q.id.padEnd(14)} level ${String(q.level).padStart(3)}`;
    if (bad.size) { errors += bad.size; console.log(`ERROR ${head}  learner says words above level: ${[...bad].map(([w, t]) => `${w} in “${t}”`).join(', ')}`); }
    if (npc.size) { flags += npc.size; console.log(`  flag ${head}  characters use: ${[...npc.keys()].join(' ')}`); }
    if (!bad.size && !npc.size) console.log(`  ok   ${head}`);
  }
}
console.log(`\n${errors} errors (learner lines above level), ${flags} flagged extra words in character lines`);
process.exitCode = errors ? 1 : 0;
