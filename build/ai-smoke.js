// CI check for the built-in AI: download a small model, then run the same kinds of calls app/ai.js makes.
// usage: SPRING_MODEL_URI=hf:... SPRING_MODEL_FILE=x.gguf node build/ai-smoke.js
const os = require('os'), path = require('path');
const E = require('../ai-engine');
E.init(path.join(os.tmpdir(), 'spring-smoke'));
const sig = () => AbortSignal.timeout(300000);
process.on('exit', (c) => console.log('exit code', c));
process.on('unhandledRejection', (e) => { console.error('unhandled', e); });
(async () => {
  let last = 0;
  const st = await E.startDownload((s) => { const p = s.download ? Math.floor(100 * s.download.done / s.download.total) : 100; if (p >= last + 25) console.log('download', (last = p) + '%'); });
  if (!st.hasModel) throw new Error('download failed: ' + JSON.stringify(st.download));
  const sys = { role: 'system', content: 'You play 王奶奶, a friendly grandmother in Jinan. Answer in JSON.' };
  const REPLY = { type: 'object', properties: { reply: { type: 'string' } }, required: ['reply'] };
  let chunks = 0;
  const r1 = await E.chatOnce({ messages: [sys, { role: 'user', content: '你好！你吃饭了吗？' }], format: REPLY, stream: true, options: { temperature: 0.7, num_predict: 120 } }, sig(), () => chunks++);
  console.log('reply:', r1.text, '| chunks', chunks);
  if (!JSON.parse(r1.text).reply || !chunks) throw new Error('bad streamed reply');
  const CHECK = { type: 'object', properties: { ok: { type: 'boolean' }, note: { type: 'string' } }, required: ['ok', 'note'] };
  const r2 = await E.chatOnce({ messages: [sys, { role: 'user', content: '【检查】我要两苹果。' }], format: CHECK, stream: false, options: { temperature: 0, num_predict: 90 } }, sig());
  console.log('check:', r2.text); JSON.parse(r2.text);
  const r3 = await E.chatOnce({ messages: [{ role: 'system', content: 'You are a helpful panda tutor.' }, { role: 'user', content: 'What does 你好 mean?' }], stream: true, options: { temperature: 0.4, num_predict: 60 } }, sig(), () => {});
  console.log('mentor:', r3.text); if (!r3.text.trim()) throw new Error('empty mentor reply');
  // unloading happens after 20 idle minutes in the app, so it must not take the process down
  console.log('unloading…');
  await E.unload();
  console.log('unloaded');
  const r4 = await E.chatOnce({ messages: [sys, { role: 'user', content: '再见！' }], format: REPLY, stream: false, options: { temperature: 0, num_predict: 60 } }, sig());
  console.log('after reload:', r4.text); JSON.parse(r4.text);
  await E.unload();
  console.log('AI smoke test passed');
})().catch((e) => { console.error(e); process.exit(1); });
