// Builds app/data/cedict.js: the full CC-CEDICT (simplified), with tone-mark pinyin and a frequency score from jieba.
// Sources: npm cc-cedict (CC-CEDICT data, CC BY-SA 4.0, mdbg.net) and nodejieba's jieba.dict.utf8 (MIT).
// Usage: node build/cedict.mjs <cc-cedict data/all.js> <jieba.dict.utf8>
import fs from 'fs';
import vm from 'vm';
const [allPath, jiebaPath] = process.argv.slice(2);
const all = (await import(allPath)).default.all;
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../app/lib/pinyin-pro.js', import.meta.url), 'utf8'), ctx);
const P = ctx.window.pinyinPro || ctx.pinyinPro;
const freq = new Map();
for (const line of fs.readFileSync(jiebaPath, 'utf8').split('\n')) { const [w, n] = line.split(' '); if (w) freq.set(w, (freq.get(w) || 0) + (+n || 0)); }
const marks = (num) => num.split(' ').map((s) => {
  if (!/[a-zA-Z]/.test(s)) return s;
  const x = s.replace(/u:/g, 'ü').replace(/U:/g, 'Ü');
  if (/^r5$/i.test(x)) return 'r';
  if (!/[1-5]$/.test(x)) return x;
  try { return P.convert(x.replace(/5$/, ''), { format: 'numToSymbol' }) .replace(/\d/g, '') || x; } catch { return x; }
}).join(' ');
const out = [];
let n = 0;
for (const [, simp, py, defs] of all) {
  if (!/[\u3400-\u9fff]/.test(simp)) continue;
  const d = (Array.isArray(defs) ? defs.join(' / ') : String(defs)).replace(/[\t\n]/g, ' ');
  const f = freq.get(simp) ? Math.min(30, Math.round(Math.log2(freq.get(simp) + 1))) : 0;
  out.push(`${simp}\t${marks(py)}\t${d}\t${f}`); n++;
}
const body = `/* CC-CEDICT (CC BY-SA 4.0, https://www.mdbg.net/chinese/dictionary?page=cc-cedict), simplified headwords, with jieba (MIT) frequency scores. Built by build/cedict.mjs. */\nwindow.CEDICT_RAW = ${JSON.stringify(out.join('\n'))};\n`;
fs.writeFileSync(new URL('../app/data/cedict.js', import.meta.url), body);
console.log(n, 'entries', (body.length / 1e6).toFixed(1), 'MB');
