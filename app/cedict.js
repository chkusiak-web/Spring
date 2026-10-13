'use strict';
/* 天天 · the full Chinese–English dictionary (CC-CEDICT, ~124k words) behind the HSK list.
   data/cedict.js holds one string, "simplified \t pinyin \t senses \t frequency" per line; it is parsed on first use.
   CED.get(w) → readings · CED.best(w) → the likeliest reading · CED.has(w) · CED.find('exaggerate') → words for an English sense
   CED.search(q) → Look up results (English, pinyin or 汉字). Used by Ask 团团 (pinyin + cheat sheet), click-for-English and Look up. */
window.CED = (() => {
  let MAP = null, LIST = null, EN = null;
  const SKIP = /^(surname |variant of|old variant|archaic variant|Japanese variant|see |used in |erhua variant|abbr\. for|\(old\)|\(archaic\)|\(classical\)|CL:)/i;
  function load() {
    if (MAP) return true;
    if (!window.CEDICT_RAW) return false;
    MAP = new Map(); LIST = [];
    for (const line of window.CEDICT_RAW.split('\n')) {
      const [h, p, d, f] = line.split('\t'); if (!h) continue;
      const e = { h, p, d, f: +f || 0 };
      LIST.push(e);
      const a = MAP.get(h); if (a) a.push(e); else MAP.set(h, [e]);
    }
    return true;
  }
  const get = (w) => (load() && MAP.get(w)) || [];
  const has = (w) => get(w).length > 0;
  // prefer common, lowercase (not a proper noun), not a "variant of" line
  const rank = (e) => (SKIP.test(e.d) ? -20 : 0) + (/^[A-Z]/.test(e.p) ? -6 : 0) + e.f;
  const best = (w) => { const a = get(w); return a.length ? a.slice().sort((x, y) => rank(y) - rank(x))[0] : null; };
  const senses = (d) => String(d).split(/\s\/\s|;/).map((x) => x.replace(/\(.*?\)|\[.*?\]/g, '').replace(/^\s*(to|a|an|the)\s+/i, '').trim().toLowerCase()).filter(Boolean);
  const short = (e, n) => String(e.d).split(' / ').filter((x) => !SKIP.test(x)).slice(0, n || 3).join('; ') || e.d;
  function enIndex() {
    if (EN) return EN;
    load(); EN = new Map();
    (LIST || []).forEach((e) => { if (SKIP.test(e.d)) return; senses(e.d).forEach((s, i) => { if (s.length > 40) return; const a = EN.get(s); const v = [e, i]; if (a) a.push(v); else EN.set(s, [v]); }); });
    return EN;
  }
  // words for an English sense, likeliest first: in the HSK list, the word's first meaning, common, two characters
  function find(en, max) {
    const q = String(en).toLowerCase().trim().replace(/^(to|a|an|the)\s+/, '');
    const hits = enIndex().get(q) || [];
    const hsk = (h) => typeof dict === 'function' && dict().has(h);
    const multi = hits.some(([e]) => [...e.h].length > 1);
    return hits.map(([e, i]) => [e, (hsk(e.h) ? 12 : 0) + (i === 0 ? 6 : i < 3 ? 2 : 0) + e.f + ([...e.h].length === 2 ? 3 : 0) - (/^[A-Z]/.test(e.p) ? 8 : 0) - (multi && [...e.h].length === 1 ? 8 : 0)])
      .sort((a, b) => b[1] - a[1]).filter((x, k, arr) => arr.findIndex((y) => y[0].h === x[0].h) === k).slice(0, max || 4).map((x) => x[0]);
  }
  // Look up: English, pinyin (with or without tones) or 汉字
  function search(raw, max) {
    if (!load()) return [];
    const q = raw.trim(); if (!q) return [];
    max = max || 30;
    if (/[㐀-鿿]/.test(q)) {
      const out = [];
      for (const e of LIST) {
        let sc = 0;
        if (e.h === q) sc = 100; else if (e.h.startsWith(q)) sc = 70 - (e.h.length - q.length); else if (q.length > 1 && e.h.includes(q)) sc = 50 - (e.h.length - q.length);
        if (sc) out.push([sc + rank(e) / 4, e]);
      }
      return out.sort((a, b) => b[0] - a[0]).slice(0, max).map((x) => x[1]);
    }
    let byEn = find(q, max);
    const strip = (s) => s.toLowerCase().replace(/ü/g, 'v').replace(/[\s']/g, '');
    let qp = q; try { if (/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(qp)) qp = q.toLowerCase(); } catch {}
    const qs = strip(qp), plain = (s) => strip(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
    const toned = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(q);
    const byPy = /^[a-zü' ]+$/i.test(q) || toned
      ? LIST.filter((e) => (toned ? strip(e.p) === qs : plain(e.p) === plain(qs))).sort((a, b) => rank(b) - rank(a)).slice(0, max) : [];
    const seen = new Set(), out = [];
    [...byPy.slice(0, 8), ...byEn, ...byPy.slice(8)].forEach((e) => { if (!seen.has(e.h + e.p)) { seen.add(e.h + e.p); out.push(e); } });
    return out.slice(0, max);
  }
  // Split a run of characters into words the likely way (like jieba): maximize the summed log-frequency, so
  // 他夸张了事实 → 他 / 夸张 / 了 / 事实, not 了事 / 实. known(w) can add words (the HSK list) on top of the dictionary.
  const freq = (w) => { const a = get(w); return a.length ? Math.max(...a.map((e) => e.f)) : 0; };
  function segment(text, known) {
    const s = [...text], n = s.length, TOTAL = 26, best = new Array(n + 1).fill(-Infinity), from = new Array(n + 1).fill(0);
    best[0] = 0;
    for (let i = 0; i < n; i++) {
      if (best[i] === -Infinity) continue;
      for (let L = 1; L <= Math.min(6, n - i); L++) {
        const w = s.slice(i, i + L).join(''); let f = freq(w);
        if (!f && known && known(w)) f = 12;
        if (!f && L > 1) continue;
        const sc = best[i] + (f || 4) - TOTAL;
        if (sc > best[i + L]) { best[i + L] = sc; from[i + L] = i; }
      }
    }
    const out = []; for (let j = n; j > 0; j = from[j]) out.unshift(s.slice(from[j], j).join(''));
    return out;
  }
  return { load, get, has, best, find, search, short, segment, freq };
})();
