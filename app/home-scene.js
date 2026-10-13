/* Spring · the Home screen's animated background (quan-scene.js, a finished asset: don't edit it).
   The rest of the app is plain scripts, so this module exposes window.HomeScene and fires 'homescene-ready'.
   HomeScene.mount(canvas, fitEl, time?) · HomeScene.stop(). time ('' = follow the clock) is for testing only.

   Framing wrapper: the runtime always covers its `fit` box and crops evenly, at whole-number scales. To keep
   超然楼 (the tower) in view and clear of the plan card at any window size, we size and place that box ourselves:
   a 16:10 box, at least as big as the visible area, slid left (to bring the tower in from the right edge) and
   up (to lift it above the card). The canvas scaling stays the runtime's own. */
import { mountScene, currentTime } from './quan-scene.js';

// the tower (with its island) as fractions of the scene: left, top, right, bottom
const TOWER = { l: 0.715, t: 0.27, r: 0.83, b: 0.47 };
const ASPECT = 512 / 320;

let cur = null, ro = null;
function frame(fit) {
  const main = fit.parentElement, card = main && main.querySelector('.hplan');
  if (!main) return;
  const w = main.clientWidth, h = main.clientHeight;
  let up = 0, Sh = h, Sw = Math.max(w, Sh * ASPECT), o = (Sw - w) / 2;
  for (let k = 0; k < 4; k++) {
    Sh = Math.max(h + up, w / ASPECT); Sw = Sh * ASPECT;
    o = Math.min(Sw - w, Math.max((Sw - w) / 2, TOWER.r * Sw + 16 - w));   // bring the tower's right edge into view
    if (!card) break;
    const c = { l: card.offsetLeft, t: card.offsetTop };
    const tl = TOWER.l * Sw - o, tb = TOWER.b * Sh - up;
    const overlapX = tl < w && TOWER.r * Sw - o > c.l - 12;
    if (!overlapX || tb <= c.t - 12) break;
    up += Math.ceil(tb - (c.t - 12)) + 1;   // lift the scene so the tower clears the card
  }
  Object.assign(fit.style, { left: `${-Math.round(o)}px`, top: `${-Math.round(up)}px`, width: `${Math.ceil(Sw)}px`, height: `${Math.ceil(Sh)}px`, right: 'auto', bottom: 'auto' });
}
window.HomeScene = {
  mount(canvas, fit, time) {
    this.stop();
    frame(fit);
    ro = new ResizeObserver(() => frame(fit));
    ro.observe(fit.parentElement);
    cur = mountScene(canvas, time ? { fit, time } : { fit });
    return cur;
  },
  stop() { if (ro) { ro.disconnect(); ro = null; } if (cur) { try { cur.stop(); } catch {} cur = null; } },
  time: () => (cur ? cur.time : currentTime())
};
window.dispatchEvent(new Event('homescene-ready'));
