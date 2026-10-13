import { getLlama, LlamaChat, QwenChatWrapper, resolveModelFile } from 'node-llama-cpp';
const path = await resolveModelFile('hf:unsloth/Qwen3.5-0.8B-GGUF/Qwen3.5-0.8B-Q4_K_M.gguf', '/tmp/m');
const llama = await getLlama();
const model = await llama.loadModel({ modelPath: path });
const ctx = await model.createContext({ contextSize: 4096 });
const g = await llama.createGrammarForJsonSchema({ type: 'object', properties: { reply: { type: 'string' } }, required: ['reply'] });
const hist = [{ type: 'system', text: 'You play 王奶奶. Answer in JSON.' }, { type: 'user', text: '你好！你吃饭了吗？' }];
const variants = {
  budget0: [undefined, { budgets: { thoughtTokens: 0 } }],
  nobudget: [undefined, {}],
  discourage: [new QwenChatWrapper({ thoughts: 'discourage' }), {}],
  discourageBudget0: [new QwenChatWrapper({ thoughts: 'discourage' }), { budgets: { thoughtTokens: 0 } }],
};
for (const [name, [wrapper, extra]] of Object.entries(variants)) {
  const seq = ctx.getSequence();
  const chat = new LlamaChat({ contextSequence: seq, ...(wrapper ? { chatWrapper: wrapper } : {}) });
  let streamed = '';
  const r = await chat.generateResponse(hist, { grammar: g, temperature: 0, maxTokens: 120, onTextChunk: (t) => { streamed += t; }, ...extra });
  console.log('==', name, 'wrapper:', chat.chatWrapper.wrapperName, chat.chatWrapper.thoughts);
  console.log('response:', JSON.stringify(r.response));
  console.log('streamed:', JSON.stringify(streamed));
  console.log('full:', JSON.stringify(r.fullResponse).slice(0, 400));
  chat.dispose(); seq.dispose?.();
}
