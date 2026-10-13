'use strict';
/* 天天 · 团团 the panda: an animated 64×64 pixel portrait (art by Moondog, traced from the comp).
   PANDA.mount(canvas) → { setTalking(bool), destroy() }. Show at a whole multiple of 64 with image-rendering: pixelated. */
window.PANDA = (() => {
  // The panda portrait as a tiny animated scene, traced from Moondog's comp on its native 64x64 grid (one
// character per pixel). The clouds are lifted out of the map and drift left behind the panda; while it talks,
// its little mouth under the nose opens and closes. Fur keeps to three creams (c, t, p).
const S = 64;
const SIZE = S;
const LOOP = 40;                                   // clouds' periods divide this, so LOOP seconds loops cleanly
const PAL = {
  '.': '#3BA0EB', a: '#85C2DB', b: '#DBE2DA',            // sky, cloud underside, cloud top
  c: '#F7E6CC', t: '#E1CAB2', p: '#C69080',              // fur: cream, tan, pinkish shade
  K: '#1F2033', L: '#2C2D43', r: '#78434D',              // black fur shadow, black fur lit, eyelid
  w: '#3D3B48', W: '#4E4B53', k: '#131423',              // wall coping, wall blocks, mortar
  m: '#5A2E30', n: '#B8605A'                             // open mouth, tongue
};
const MAP = [
  'bbb.............................................................',
  'bbbaa...........................................................',
  'bbbbbba.........................................................',
  'bbbbbbba........................................................',
  'bbbbbbbbaa......................................................',
  'bbbbbbbbbba.....................................................',
  'aaabbbbbbbbbbb..................................................',
  'abbaaaaaaababbb.................................................',
  'aaaaaaaaaaaabbbbb...............................................',
  'aaaaaaaaaaaaaaaaLLLLL...........................................',
  'aaaaaaaaaaaaaaLLLLLLLLL........................LLL..............',
  'aaaaaaaaaaaaaaLLLLLLLLLL.........cccc........LLLLLLL............',
  'aaaaaaaaaaaaLLLLLLLLLLLLL....cccccccccccct..LLLLLLLLL...........',
  'aaaaaaaa...LLLLLLKKKKLLLLLccccccccccccccccccLLLLLLLLLL..........',
  '...........LLLLLKKKKKKLLLLccccccccccccccccccccccKKKKLLL.........',
  '...........LLLLLKKKKKKKLLLcccccccccccccccccccccKKKKKKLL.........',
  '..........LLLLLKKKKKKKcLLcccccccccccccccccccccccKKKKKLLL........',
  '..........LLLLLKKKKKKKcccccccccccccccccccccccccccKKKKKLL........',
  '..........LLLLLKKKKKKKtcccccccccccccccccccccccccccKKKKLL........',
  '..........LKKKKKKKptttcccccccccccccccccccccccccccccKKKKK......bb',
  '...........LKKKKKKKtttcccccccccccccccccccccccccccccKKKKK......ba',
  '............pKKKLttttcccccccccccccccccccccccccccccccKKK......aba',
  '.........LKpLKKKLttttcccccccccccccccccccccccccccccccKK......aaaa',
  '........LKKppppKpttttccccccccccccccccccccccccccccccccK.....aaaaa',
  '.......LKppppppttttttcccccccccccKKKKKcccccccccccccccc...........',
  '.....LLLKppppppptttttccccccccccKKKKKKKcccccccccccKKKcc..........',
  '....LLLKLKpppppptttttccccccccccKKKKKKKKccccccccccKKKcc..........',
  '...LLLKKKppppppptttttcccccccccKKKKKKKKKccccccccccKKKKcc.........',
  '...LKKKKKpppppppptttttccccccccKKKKKKKKKccccccccccKKKKcc.........',
  '..KKKKKKKpppppppptttttcccccccKKKKKKKKKKccccccccccKKKKccc........',
  '.KKKKKKKKppppppppttttttccccccKKrrrrrrKKccccccctccKrrrKcc........',
  'KKKKKKKKKKppppppppttttttccccKKKrrrrrrKccccccLLLLLLrrrKcct.......',
  'KKKKKKKKKKKpppppppptptttttcccKKKKKKKKcccccccKKKKKKcKKKccccc.....',
  'KKKKKKKKKKKKppppLLLLLLLLLLLLcccKKKKKcccccccccKKKKccccKcccc......',
  'KKKKKKKKKKKKLLKLLLLLLLLLLLLLLLLLLcccccccccccccLKcccccccct.......',
  'KKKKKKKKKKKKKKLLLLLLLLLLLLLLLLLLLLLcccccccccccctccccLLLLLLL.....',
  'KKKKKKKKKKKKKLLLLLLLLLLLLLLLLLLLLLLLccccccccccppccLLLLLLLLLL....',
  'KKKKKKKKKKKKKKLLLLLLLLLLLLLLLLLLLLLLpppccccctttttLLLLLLLLLLLL...',
  'KKKKKKKKKKKKKLLKLLLLLLLLLLLLLLLLLLLLLppptttpppppLLLLLLLLLLLLLL..',
  'KKKKKKKKKKKKKKKKKLLLLLLLLLLLLLLLLLLLLLpppppppppKKLLLLLLLLLLLLL..',
  'KKKKKKKKKKKKKKKKKKLLLLLLLLLLLKLLLLLLLLLppppppppKKLLLLLLLLLLLLLL.',
  'KKKKKKKKKKKKKKKKKKKKKLLLLLLLLKKLLLLLLLLppppppppKKKLLLLKLLLLLLLK.',
  'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKppppppKKKKKKKKKKKKKKKKK.',
  'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  'WWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWkWWWWWW',
  'WWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWkWWWWWW',
  'WWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWkWWWWWW',
  'WWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWkWWWWWW',
  'WWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWkWWWWWW',
  'WWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWkWWWWWW',
  'WWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWkWWWWWW',
  'WWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWkWWWWWW',
  'WWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWkWWWWWW',
  'WWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWkWWWWWW',
  'WWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWWkWWWWWWWWWWWWWWWWWWWWkWWWWWW',
  'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK'
];
const SKYISH = new Set(['.', 'a', 'b']);

// a cloud as seen in the comp, cut off by the frame edge, mirrored into a whole cloud
function cloud(y0, y1, x0, x1, keepRight) {
  return MAP.slice(y0, y1 + 1).map((row) => {
    const seen = [...row.slice(x0, x1 + 1)].map((ch) => (ch === 'a' || ch === 'b' ? ch : ' ')).join('');
    const flip = [...seen].reverse().join('');
    return keepRight ? flip + seen : seen + flip;
  });
}
const CLOUDS = [
  { rows: cloud(0, 13, 0, 16, true), x: -17, y: 0, period: 40 },    // big one, top left
  { rows: cloud(19, 23, 58, 63, false), x: 58, y: 19, period: 40 }  // small one, right of his ear
];
// extra clouds for the wide band (built from the same two shapes), spread over the right side
const pad = (rows) => { const n = Math.max(...rows.map((r) => r.length)); return rows.map((r) => r.padEnd(n)); };
const PUFF_L = pad([
  '          bbbb',
  '       bbbbbbbbb     bbb',
  '     bbbbbbbbbbbbb bbbbbbb',
  '  bbbbbbbbbbbbbbbbbbbbbbbbbbb',
  ' bbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  'aabbbbbbbbbbbbbbbbbbbbbbbbbbaaa',
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  ' aaaaaaaaaaaaaaaaaaaaaaaaaaaaa']);
const PUFF_M = pad([
  '      bbbbb',
  '   bbbbbbbbbb bbb',
  ' bbbbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbbbbbb',
  'aaabbbbbbbbbbbbbaaaa',
  ' aaaaaaaaaaaaaaaaaa']);
const PUFF_S = pad([
  '    bbb',
  '  bbbbbbb bb',
  ' bbbbbbbbbbbbb',
  'aaabbbbbbbbaaa',
  ' aaaaaaaaaaaa']);
// extra clouds for the wide band, spread over the right side at different heights and speeds
const WIDE_CLOUDS = [
  { rows: PUFF_L, x: 118, y: 3, period: 40 },
  { rows: PUFF_S, x: 84, y: 10, period: 40 },
  { rows: PUFF_M, x: 92, y: 26, period: 50 },
  { rows: PUFF_S, x: 146, y: 22, period: 50 },
  { rows: PUFF_M, x: 175, y: 14, period: 40 }
];

function drawPandaScene(px, t, talking) {
  px.fill(PAL['.']);
  for (const c of CLOUDS) {                                 // whole pixels only, so they stay crisp
    const w = c.rows[0].length, span = S + w;              // fully off the left edge, then back in from the right
    const cx = Math.round(((c.x + w - t * span / c.period) % span + span) % span) - w;
    c.rows.forEach((row, j) => [...row].forEach((ch, i) => {
      const x = cx + i, y = c.y + j;
      if (ch !== ' ' && x >= 0 && x < S) px[y * S + x] = PAL[ch];
    }));
  }
  MAP.forEach((row, y) => [...row].forEach((ch, x) => { if (!SKYISH.has(ch)) px[y * S + x] = PAL[ch]; }));

  // mouth: at rest, the comp's little pink mark; talking cycles open, half, closed, half
  const phase = talking ? [2, 1, 0, 1][Math.floor(t * 9) % 4] : 0;
  const put = (x, y, ch) => { px[y * S + x] = PAL[ch]; };
  if (phase >= 1) { for (const x of [45, 46, 47, 48]) put(x, 36, 'm'); }
  if (phase === 2) { put(45, 37, 'm'); put(46, 37, 'n'); put(47, 37, 'n'); put(48, 37, 'm'); }
}

function mountPanda(canvas) {
  canvas.width = SIZE; canvas.height = SIZE;
  const ctx = canvas.getContext('2d'), img = ctx.createImageData(SIZE, SIZE), px = new Array(SIZE * SIZE);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;   // clouds hold still unless the panda is talking
  let talking = false, raf = 0, last = -1;
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    const t = now / 1000, tick = Math.floor(t * 12);                      // 12 fps is plenty for pixel art
    if (tick === last) return; last = tick;
    drawPandaScene(px, reduce && !talking ? 0 : t, talking);
    px.forEach((c, i) => { const n = parseInt(c.slice(1), 16); img.data[i * 4] = n >> 16; img.data[i * 4 + 1] = (n >> 8) & 255; img.data[i * 4 + 2] = n & 255; img.data[i * 4 + 3] = 255; });
    ctx.putImageData(img, 0, 0);
  };
  raf = requestAnimationFrame(frame);
  return {
    setTalking(on) { talking = !!on; },
    destroy() { cancelAnimationFrame(raf); }
  };
}

// Wide scene: the panda at the left, sky + drifting clouds across the full width, and the wall running all the
// way down (brick courses that darken toward the bottom). W, H in native pixels.
function mix(a, b, f) { const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  const ch = (s) => Math.round(((x >> s) & 255) * (1 - f) + ((y >> s) & 255) * f);
  return '#' + [16, 8, 0].map((s) => ch(s).toString(16).padStart(2, '0')).join(''); }
function drawWide(px, W, H, t, talking, blink) {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = y < 43 ? PAL['.'] : PAL.W;
  for (const c of [CLOUDS[0], { rows: PUFF_S, x: 58, y: 18, period: 40 }].concat(WIDE_CLOUDS)) {   // the comp's little cloud swapped for a puff
    const w = c.rows[0].length, span = W + w;
    const cx = Math.round(((c.x + w - t * span / c.period) % span + span) % span) - w;
    c.rows.forEach((row, j) => [...row].forEach((ch, i) => {
      const x = cx + i, y = c.y + j;
      if (ch !== ' ' && x >= 0 && x < W && y < 43) px[y * W + x] = PAL[ch];
    }));
  }
  for (let y = 43; y < 62; y++) for (let x = 0; x < W; x++) {
    let ch = x < 64 ? MAP[y][x] : (y < 50 ? 'w' : y === 50 ? 'k' : ((x - 57) % 22 === 0 ? 'k' : 'W'));
    px[y * W + x] = PAL[ch];
  }
  MAP.slice(0, 43).forEach((row, y) => [...row].forEach((ch, x) => { if (!SKYISH.has(ch) && x < W) px[y * W + x] = PAL[ch]; }));
  // round off his right paw, which the 64-wide comp cut flat at the frame edge: an easing curve down to the ledge
  const edge = { 37: 60, 38: 61, 39: 62, 40: 62, 41: 63, 42: 63 };
  for (const [y, xe] of Object.entries(edge)) for (let x = 55; x <= xe && x < W; x++) {
    const cur = MAP[y][x]; if (SKYISH.has(cur) || (+y === 41 && x === 62)) px[y * W + x] = PAL[+y === 42 ? 'K' : 'L'];
  }
  // courses below the band: 1 mortar row + 11 block rows, joints offset each course, fading darker
  const deep = Math.max(1, Math.floor((H - 62) / 12));
  for (let y = 62; y < H; y++) {
    const course = Math.floor((y - 62) / 12), r = (y - 62) % 12, f = Math.min(1, course / deep) * 0.7;
    const block = mix(PAL.W, '#1A1922', f), mort = mix(PAL.k, '#08080D', f);
    for (let x = 0; x < W; x++) {
      const joint = ((x + (course % 2 ? 11 : 0) - 3) % 22 + 22) % 22 === 0;
      px[y * W + x] = r === 0 || joint ? mort : block;
    }
  }
  if (blink) for (const y of [30, 31]) for (const x of [31, 32, 33, 34, 35, 36, 50, 51, 52]) px[y * W + x] = PAL.K;   // eyelids shut
  const phase = talking ? [2, 1, 0, 1][Math.floor(t * 9) % 4] : 0;
  const put = (x, y, ch) => { px[y * W + x] = PAL[ch]; };
  if (phase >= 1) { for (const x of [45, 46, 47, 48]) put(x, 36, 'm'); }
  if (phase === 2) { put(45, 37, 'm'); put(46, 37, 'n'); put(47, 37, 'n'); put(48, 37, 'm'); }
}
function mountWide(canvas, scale) {
  scale = scale || 4;
  const ctx = canvas.getContext('2d'); let W = 0, H = 0, img, px;
  let talking = false, thinking = false, raf = 0, last = -1;
  const fit = () => { const r = canvas.getBoundingClientRect();
    const w = Math.max(64, Math.ceil(r.width / scale)), h = Math.max(64, Math.ceil(r.height / scale));
    if (w === W && h === H) return; W = w; H = h; canvas.width = W; canvas.height = H;
    img = ctx.createImageData(W, H); px = new Array(W * H); last = -1; };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;   // clouds hold still unless he's talking
  const frame = (now) => {
    raf = requestAnimationFrame(frame); fit();
    const t = now / 1000, tick = Math.floor(t * 12); if (tick === last) return; last = tick;
    const blink = thinking && (t % 3.2) < 0.18;                            // thinking: a slow blink every few seconds
    drawWide(px, W, H, reduce && !talking ? 0 : t, talking, blink);
    px.forEach((c, i) => { const n = parseInt(c.slice(1), 16); img.data[i * 4] = n >> 16; img.data[i * 4 + 1] = (n >> 8) & 255; img.data[i * 4 + 2] = n & 255; img.data[i * 4 + 3] = 255; });
    ctx.putImageData(img, 0, 0);
  };
  raf = requestAnimationFrame(frame);
  return { setTalking(on) { talking = !!on; }, setThinking(on) { thinking = !!on; }, destroy() { cancelAnimationFrame(raf); } };
}
  return { mount: mountPanda, mountWide, draw: drawPandaScene, drawWide, SIZE, LOOP };
})();
