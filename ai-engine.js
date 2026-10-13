// Built-in local AI (llama.cpp via node-llama-cpp). Replaces Ollama: nothing for the learner to install.
// The model downloads once into the user data folder; everything runs on this computer, never the internet.
// The renderer speaks the same Ollama-style chat bodies as before ({ messages, format, stream, options }).
const path = require('path');
const fs = require('fs');
const os = require('os');

const MODEL = {
  id: 'qwen3.5:9b',
  uri: 'hf:unsloth/Qwen3.5-9B-GGUF/Qwen3.5-9B-Q4_K_M.gguf',
  file: 'Qwen3.5-9B-Q4_K_M.gguf',
  size: 5.68e9
};
// CI smoke tests swap in a small model of the same family
if (process.env.SPRING_MODEL_URI) Object.assign(MODEL, { uri: process.env.SPRING_MODEL_URI, file: process.env.SPRING_MODEL_FILE, size: 5e8 });
const IDLE_UNLOAD = 20 * 60 * 1000;

let dir = '';
let lib = null, llama = null, model = null, context = null, chat = null, loading = null;
let downloader = null, download = null;   // download: { done, total, error }
let idleTimer = null, queue = Promise.resolve();
const grammars = new Map();

const modelPath = () => path.join(dir, MODEL.file);
const hasModel = () => { try { return fs.statSync(modelPath()).size > MODEL.size * 0.9; } catch { return false; } };
const importLib = () => lib || (lib = import('node-llama-cpp'));

function init(userData) { dir = path.join(userData, 'models'); }

function status() {
  return {
    running: true, builtIn: true, model: MODEL.id, size: MODEL.size,
    hasModel: hasModel(), models: hasModel() ? [MODEL.id] : [],
    loaded: !!chat, ramGB: Math.round(os.totalmem() / 2 ** 30),
    download: download && { ...download }
  };
}

async function startDownload(onProgress) {
  if (downloader || hasModel()) return status();
  fs.mkdirSync(dir, { recursive: true });
  download = { done: 0, total: MODEL.size, error: '' };
  try {
    const { createModelDownloader } = await importLib();
    downloader = await createModelDownloader({
      modelUri: MODEL.uri, dirPath: dir, fileName: MODEL.file, skipExisting: true, deleteTempFileOnCancel: false,
      onProgress: ({ totalSize, downloadedSize }) => { download.total = totalSize || MODEL.size; download.done = downloadedSize; onProgress(status()); }
    });
    await downloader.download();
    download = null;
  } catch (err) {
    download = { ...(download || {}), error: String(err && err.message || err) };
  } finally { downloader = null; onProgress(status()); }
  return status();
}
async function cancelDownload() {
  if (downloader) { try { await downloader.cancel({ deleteTempFile: false }); } catch {} }
  download = null;
  return status();
}
async function removeModel() {
  await unload();
  try { fs.unlinkSync(modelPath()); } catch {}
  return status();
}

async function load() {
  if (chat) return chat;
  if (loading) return loading;
  loading = (async () => {
    const { getLlama, LlamaChat } = await importLib();
    llama = llama || await getLlama();
    try { model = await llama.loadModel({ modelPath: modelPath() }); }
    catch (err) {
      // a GPU that can't take the model (old drivers, too little video memory): run on the CPU instead
      if (llama.gpu === false) throw err;
      llama = await getLlama({ gpu: false });
      model = await llama.loadModel({ modelPath: modelPath() });
    }
    context = await model.createContext({ contextSize: 4096 });
    chat = new LlamaChat({ contextSequence: context.getSequence() });
    return chat;
  })();
  try { return await loading; }
  catch (err) { await unload(); throw err; }
  finally { loading = null; }
}
async function unload() {
  const m = model, c = context;
  chat = null; context = null; model = null; grammars.clear();
  try { if (c) await c.dispose(); } catch {}
  try { if (m) await m.dispose(); } catch {}
}
function touch() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { queue = queue.then(unload, unload); }, IDLE_UNLOAD);
}

async function grammarFor(schema) {
  const key = JSON.stringify(schema);
  if (!grammars.has(key)) grammars.set(key, await llama.createGrammarForJsonSchema(schema));
  return grammars.get(key);
}

// Ollama-style messages → node-llama-cpp chat history (the last item is the user turn to answer)
const toHistory = (messages) => messages.map((m) =>
  m.role === 'system' ? { type: 'system', text: String(m.content) }
    : m.role === 'assistant' ? { type: 'model', response: [String(m.content)] }
      : { type: 'user', text: String(m.content) });

// One model, one sequence: requests run one at a time. signal aborts a running or queued request.
function chatOnce(body, signal, onText) {
  const run = async () => {
    if (signal.aborted) return { error: 'timeout' };
    if (!hasModel()) return { error: 'no model' };
    const c = await load();
    touch();
    const o = body.options || {};
    let text = '';
    const res = await c.generateResponse(toHistory(body.messages || []), {
      grammar: body.format && typeof body.format === 'object' ? await grammarFor(body.format) : undefined,
      temperature: o.temperature ?? 0.7,
      maxTokens: o.num_predict || undefined,
      budgets: { thoughtTokens: 0 },
      signal, stopOnAbortSignal: true,
      onTextChunk: body.stream ? (t) => { text += t; onText(text); } : undefined
    });
    touch();
    return { text: res.response };
  };
  const p = queue.then(run, run);
  queue = p.catch(() => {});
  return p;
}

module.exports = { MODEL, init, status, startDownload, cancelDownload, removeModel, chatOnce, unload };
