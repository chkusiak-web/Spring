// 天天 · builds app/data/parts.js: the parts (部件) of every character the app can draw,
// with which strokes belong to each part, plus a short pinyin + English name for every part.
// Source: Make Me a Hanzi dictionary.txt (build/data/mmh-dictionary.txt), same project as the stroke data.
// usage: node build/parts.js
const fs = require('fs'), path = require('path');
const APP = path.join(__dirname, '..', 'app');
global.window = global;
require(APP + '/data/words.js');
require(APP + '/data/strokes.js');

const MMH = new Map();
for (const line of fs.readFileSync(path.join(__dirname, 'data/mmh-dictionary.txt'), 'utf8').split('\n')) {
  if (!line.trim()) continue;
  const e = JSON.parse(line); MMH.set(e.character, e);
}
// single characters that are words in the app (HSK 1–4)
const WCH = new Map();
for (const w of WORDS) if ([...w.h].length === 1) { const o = WCH.get(w.h); if (!o || w.hsk < o.hsk) WCH.set(w.h, w); }

// What a part means *as a part* (the radical sense), when the dictionary's first gloss isn't it.
const SENSE = {
  '氵': ['shuǐ', 'water'], '亻': ['rén', 'person'], '扌': ['shǒu', 'hand'], '讠': ['yán', 'speech'], '艹': ['cǎo', 'grass'],
  '忄': ['xīn', 'heart'], '纟': ['sī', 'silk'], '钅': ['jīn', 'metal'], '饣': ['shí', 'food'], '辶': ['chuò', 'walk'],
  '阝': ['fù', 'hill / town'], '刂': ['dāo', 'knife'], '灬': ['huǒ', 'fire'], '⺮': ['zhú', 'bamboo'], '罒': ['wǎng', 'net'],
  '礻': ['shì', 'spirit'], '衤': ['yī', 'clothing'], '犭': ['quǎn', 'animal'], '冖': ['mì', 'cover'], '宀': ['mián', 'roof'],
  '亠': ['tóu', 'lid'], '攵': ['pū', 'tap'], '疒': ['nè', 'sickness'], '彳': ['chì', 'step'], '爫': ['zhǎo', 'claw'],
  '耂': ['lǎo', 'old'], '⺌': ['xiǎo', 'small'], '丷': ['bā', 'eight'], '冫': ['bīng', 'ice'], '𧾷': ['zú', 'foot'], '⻊': ['zú', 'foot'],
  '牜': ['niú', 'cow'], '⺩': ['wáng', 'jade'], '𤣩': ['wáng', 'jade'], '王': ['wáng', 'king / jade'], '月': ['yuè', 'moon / body'],
  '欠': ['qiàn', 'yawn'], '又': ['yòu', 'hand / again'], '口': ['kǒu', 'mouth'], '女': ['nǚ', 'woman'], '马': ['mǎ', 'horse'],
  '木': ['mù', 'tree'], '日': ['rì', 'sun'], '心': ['xīn', 'heart'], '手': ['shǒu', 'hand'], '土': ['tǔ', 'earth'], '士': ['shì', 'scholar'],
  '贝': ['bèi', 'shell (money)'], '页': ['yè', 'head'], '目': ['mù', 'eye'], '门': ['mén', 'door'], '力': ['lì', 'strength'],
  '寸': ['cùn', 'inch'], '夕': ['xī', 'evening'], '子': ['zǐ', 'child'], '工': ['gōng', 'work'], '巾': ['jīn', 'cloth'], '山': ['shān', 'mountain'],
  '火': ['huǒ', 'fire'], '石': ['shí', 'stone'], '田': ['tián', 'field'], '白': ['bái', 'white'], '米': ['mǐ', 'rice'], '禾': ['hé', 'grain'],
  '车': ['chē', 'vehicle'], '人': ['rén', 'person'], '儿': ['ér', 'legs'], '八': ['bā', 'eight'], '几': ['jī', 'table'], '刀': ['dāo', 'knife'],
  '厶': ['sī', 'private'], '广': ['guǎng', 'shelter'], '尸': ['shī', 'body'], '彡': ['shān', 'hair'], '廴': ['yǐn', 'stride'], '夂': ['zhǐ', 'go'],
  '勹': ['bāo', 'wrap'], '卩': ['jié', 'seal'], '冂': ['jiōng', 'borders'], '匚': ['fāng', 'box'], '戈': ['gē', 'spear'], '斤': ['jīn', 'axe'],
  '殳': ['shū', 'weapon'], '癶': ['bō', 'footsteps'], '皿': ['mǐn', 'dish'], '穴': ['xué', 'cave'], '虫': ['chóng', 'insect'], '舟': ['zhōu', 'boat'],
  '隹': ['zhuī', 'bird'], '鸟': ['niǎo', 'bird'], '雨': ['yǔ', 'rain'], '酉': ['yǒu', 'wine jar'], '豕': ['shǐ', 'pig'], '虍': ['hū', 'tiger'],
  '走': ['zǒu', 'walk'], '足': ['zú', 'foot'], '言': ['yán', 'speech'], '金': ['jīn', 'metal'], '食': ['shí', 'food'], '衣': ['yī', 'clothing'],
  '示': ['shì', 'spirit'], '水': ['shuǐ', 'water'], '大': ['dà', 'big'], '小': ['xiǎo', 'small'], '一': ['yī', 'one'], '二': ['èr', 'two'],
  '十': ['shí', 'ten'], '丶': ['zhǔ', 'dot'], '丿': ['piě', 'slash'], '乙': ['yǐ', 'second'], '亅': ['jué', 'hook'], '丨': ['gǔn', 'line'],
  '亡': ['wáng', 'lost'], '方': ['fāng', 'square'], '立': ['lì', 'stand'], '见': ['jiàn', 'see'], '生': ['shēng', 'life'], '用': ['yòng', 'use'],
  '巴': ['bā', 'hope'], '也': ['yě', 'also'], '青': ['qīng', 'blue-green'], '鱼': ['yú', 'fish'], '弓': ['gōng', 'bow'], '羊': ['yáng', 'sheep'],
  '⺶': ['yáng', 'sheep'], '⺷': ['yáng', 'sheep'], '耳': ['ěr', 'ear'], '自': ['zì', 'self'], '舌': ['shé', 'tongue'], '至': ['zhì', 'arrive'],
  '角': ['jiǎo', 'horn'], '羽': ['yǔ', 'feather'], '革': ['gé', 'leather'], '止': ['zhǐ', 'stop'], '歹': ['dǎi', 'bad'], '比': ['bǐ', 'compare'],
  '毛': ['máo', 'fur'], '氏': ['shì', 'clan'], '父': ['fù', 'father'], '片': ['piàn', 'slice'], '牛': ['niú', 'cow'], '犬': ['quǎn', 'dog'],
  '玉': ['yù', 'jade'], '瓜': ['guā', 'melon'], '甘': ['gān', 'sweet'], '矢': ['shǐ', 'arrow'], '而': ['ér', 'and'], '肉': ['ròu', 'meat'],
  '臣': ['chén', 'official'], '缶': ['fǒu', 'jar'], '辛': ['xīn', 'bitter'], '里': ['lǐ', 'village'], '高': ['gāo', 'tall'], '黑': ['hēi', 'black'],
  '廾': ['gǒng', 'two hands'], '弋': ['yì', 'dart'], '艮': ['gèn', 'stubborn'], '乂': ['yì', 'cross'], '夫': ['fū', 'man'], '戊': ['wù', 'weapon'],
  '匕': ['bǐ', 'spoon'], '卜': ['bǔ', 'divine'], '厂': ['chǎng', 'cliff'], '乚': ['yǐ', 'hook'], '𠂉': ['', 'top'], '彐': ['jì', 'snout'],
  '⺈': ['dāo', 'knife'], '龰': ['zhǐ', 'foot'], '夊': ['suī', 'walk slowly'], '覀': ['yà', 'cover'], '西': ['xī', 'west'], '己': ['jǐ', 'self'],
  '已': ['yǐ', 'already'], '干': ['gàn', 'dry'], '午': ['wǔ', 'noon'], '牙': ['yá', 'tooth'], '长': ['cháng', 'long'], '风': ['fēng', 'wind'],
  '飞': ['fēi', 'fly'], '龙': ['lóng', 'dragon'], '齿': ['chǐ', 'tooth'], '首': ['shǒu', 'head'], '香': ['xiāng', 'fragrant'], '骨': ['gǔ', 'bone'],
  '⺍': ['xiǎo', 'small'], '⺊': ['bǔ', 'divine'], '乛': ['', 'hook'], '龶': ['shēng', 'life'], '氺': ['shuǐ', 'water']
};
const firstGloss = (s) => String(s || '').split(/[;,]/)[0].replace(/^to /, '').replace(/\(.*?\)/g, '').trim();
const WEIRD = /^(kwukyel|radical|variant|component|semantic|phonetic)/i;
function info(c) {
  if (SENSE[c]) return SENSE[c];
  const w = WCH.get(c), e = MMH.get(c);
  if (w) return [w.p, firstGloss(w.m)];
  if (e && e.definition && !WEIRD.test(e.definition)) return [(e.pinyin || [])[0] || '', firstGloss(e.definition)];
  return null;
}
// a part is "recognizable" (don't split it further) if it's a word you can learn, a radical form, or has a name we know
const isRadical = (c) => { const e = MMH.get(c); return !!(e && e.radical === c); };
const INWORD = new Set(WORDS.flatMap((w) => [...w.h]));
const recognizable = (c) => WCH.has(c) || INWORD.has(c) || isRadical(c) || !!SENSE[c];
const strokeCount = (c) => (STROKES[c] ? STROKES[c].strokes.length : MMH.get(c) && MMH.get(c).matches ? MMH.get(c).matches.length : 0);

// IDS → tree. Leaves are characters ('？' = unknown piece).
const IDC2 = '⿰⿱⿴⿵⿶⿷⿸⿹⿺⿻', IDC3 = '⿲⿳';
function parseIDS(s) {
  const a = [...s]; let i = 0;
  const node = () => {
    const c = a[i++];
    if (IDC2.includes(c)) return { k: [node(), node()] };
    if (IDC3.includes(c)) return { k: [node(), node(), node()] };
    return { c };
  };
  try { const t = node(); return i === a.length ? t : null; } catch { return null; }
}
const at = (tree, p) => p.reduce((n, k) => (n && n.k ? n.k[k] : null), tree);

// split character ch whose strokes (in order) are global indices `idx` → [{c, s:[global idx]}]
function split(ch, idx, depth) {
  const e = MMH.get(ch);
  if (!e || !e.matches || e.matches.length !== idx.length || !e.decomposition || e.decomposition === '？') return [{ c: ch, s: idx }];
  const tree = parseIDS(e.decomposition);
  if (!tree || !tree.k) return [{ c: ch, s: idx }];
  // group strokes by the part (leaf of the decomposition) they belong to
  const keyOf = e.matches.map((p) => (p ? p.join('.') : null));
  // unassigned strokes join the previous stroke's part (or the next one's, at the start)
  for (let k = 0; k < keyOf.length; k++) if (keyOf[k] === null) keyOf[k] = k ? keyOf[k - 1] : null;
  for (let k = keyOf.length - 1; k >= 0; k--) if (keyOf[k] === null) keyOf[k] = keyOf[k + 1] !== undefined ? keyOf[k + 1] : null;
  if (keyOf.some((x) => x === null)) return [{ c: ch, s: idx }];
  const groups = [];
  keyOf.forEach((kk, k) => {
    let g = groups.find((x) => x.key === kk);
    if (!g) { const node = at(tree, kk.split('.').map(Number)); g = { key: kk, c: node && node.c && node.c !== '？' ? node.c : null, s: [] }; groups.push(g); }
    g.s.push(idx[k]);
  });
  const parts = groups.filter((g) => g.c);
  if (parts.length < 2) return [{ c: ch, s: idx }];
  // unknown pieces join the nearest named part
  groups.forEach((g, i) => { if (!g.c) { const near = groups.slice(0, i).reverse().find((x) => x.c) || groups.slice(i + 1).find((x) => x.c); near.s.push(...g.s); } });
  const out = [];
  for (const g of parts) {
    g.s.sort((a, b) => a - b);
    const sub = MMH.get(g.c);
    const deeper = depth < 2 && !recognizable(g.c) && g.s.length >= 4 && sub && sub.matches && sub.matches.length === g.s.length;
    if (deeper) {
      const sp = split(g.c, g.s, depth + 1);
      // only trust a deeper split if every piece has the stroke count it should
      if (sp.length > 1 && sp.every((x) => !strokeCount(x.c) || strokeCount(x.c) === x.s.length)) { out.push(...sp); continue; }
    }
    out.push({ c: g.c, s: g.s });
  }
  return out;
}

const PARTS = {}, NAMES = {};
let n = 0, multi = 0, unnamed = new Map();
for (const ch of Object.keys(STROKES)) {
  const k = STROKES[ch].strokes.length;
  let parts = split(ch, [...Array(k).keys()], 0);
  // sanity: every stroke exactly once
  const all = parts.flatMap((p) => p.s).sort((a, b) => a - b);
  if (all.length !== k || all.some((v, i) => v !== i)) parts = [{ c: ch, s: [...Array(k).keys()] }];
  if (parts.length > 5) parts = [{ c: ch, s: [...Array(k).keys()] }];
  const e = MMH.get(ch);
  const rad = e && e.radical;
  PARTS[ch] = { p: parts.map((p) => [p.c, p.s]), r: rad || '' };
  n++; if (parts.length > 1) multi++;
  for (const p of parts) {
    if (NAMES[p.c]) continue;
    const i = info(p.c);
    if (i) NAMES[p.c] = i; else unnamed.set(p.c, (unnamed.get(p.c) || 0) + 1);
  }
  if (rad && !NAMES[rad]) { const i = info(rad); if (i) NAMES[rad] = i; }
}
fs.writeFileSync(APP + '/data/parts.js', '/* generated by build/parts.js from Make Me a Hanzi (dictionary.txt): parts of each character, the strokes in each part, and part names */\n'
  + 'window.PARTS=' + JSON.stringify(PARTS) + ';\nwindow.PART_NAMES=' + JSON.stringify(NAMES) + ';\n');
console.log(`${n} characters · ${multi} with 2+ parts · ${Object.keys(NAMES).length} named parts · ${unnamed.size} unnamed: ${[...unnamed].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([c, k]) => c + k).join(' ')}`);
if (process.argv.includes('--show')) for (const c of process.argv.slice(3)) console.log(c, JSON.stringify(PARTS[c]), PARTS[c].p.map(([x]) => x + ':' + (NAMES[x] || []).join(' ')).join(' | '));
