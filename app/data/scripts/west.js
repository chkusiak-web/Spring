/* 济南西站 Jinan West Station · HSK 1, levels 1–10 · Arriving
   District story: "The wrong suitcase" (拿错了箱子). You arrive by train; Xiao Su helps with your suitcase and becomes your
   first friend; Old Pan drives you home and talks the whole way; at your door the suitcase isn't yours. Back at Ms. Chen's
   lost-and-found window (a finale challenge, 3 lives) her son Lele asks you a riddle, and Mr. Ma walks in with your bag.
   Everything the learner says uses only words from the levels finished before the conversation unlocks
   (build/check_levels.js checks this). A say entry can be several lines: [[zh, en, opts], …].
   opts.who: 'narr' (narration, English only), 'lele', 'ma' (other speakers in the scene). */
Object.assign(window.JINAN_SCRIPTS.quests, {
  'west-1': {   // 小苏 · level 2 · 你好 谢谢 不客气 对不起 没关系 再见
    greet: [],
    open: [['啊！', 'Ow!']],
    steps: [
      { obj: 'west-1-1', m: ['对不起', '不好意思', '抱歉'], say: [['没关系，没关系！', "It's fine, it's fine!"]], try: ['对不起！'] },
      { obj: 'west-1-2', m: ['@hi'], say: [[['你好！', 'Hi!'], ['', 'He reaches up and lifts your suitcase (箱子) down from the rack.', { who: 'narr' }], ['箱子！', 'Your suitcase!']]], try: ['你好！'] },
      { obj: 'west-1-3', need: ['west-1-1', 'west-1-2'], m: ['@thx'], say: [[['不客气！', "You're welcome!"], ['', 'The train stops at Jinan West. The doors open.', { who: 'narr' }], ['再见！', 'Bye!']]], try: ['谢谢！'] },
      { obj: 'west-1-4', need: '*', m: ['@bye'], say: [['再见！', 'Bye!']], try: ['再见！'] }
    ],
    extra: [
      { m: ['没关系'], say: [['啊？对不起？……没关系！', 'Huh? Sorry?… No problem!']] }
    ],
    done: [['', 'He waves and disappears into the crowd on the platform.', { who: 'narr' }]],
    words: [['箱子', 'xiāngzi', 'suitcase; box']],
  },

  'west-2': {   // 小苏 · level 5 · + 叫 名字 什么 吗 不 · 他 我们 人 · 中国 老师 学生 朋友
    greet: [],
    open: [['你好！我叫小苏。你叫什么名字？', "Hi! I'm Xiao Su. What's your name?"]],
    steps: [
      { obj: 'west-2-1', m: ['{name}', '我叫', '名字'], say: [[['{name|你}！好名字！', '{name|You}! Nice name!'], ['你是中国人吗？', 'Are you Chinese?']]], try: ['我叫……', '我叫Sam。'] },
      { obj: 'west-2-2', need: 'west-2-1', m: ['不是', '我是 {country}', '{country} 人', '中国人', '是'], say: [[['哦！', 'Oh!'], ['你是老师吗？', 'Are you a teacher?']]], try: ['我不是中国人。', '不是。'] },
      { obj: 'west-2-3', need: 'west-2-2', m: ['学生'], say: [['我也是学生！我们是朋友！', "I'm a student too! We're friends!"]], try: ['不是，我是学生。'] },
      { obj: 'west-2-3', need: 'west-2-2', m: ['老师 !不是', '是 !不是'], say: [['老师！老师你好！我是学生。我们是朋友！', "A teacher! Hello, teacher! I'm a student. We're friends!"]], try: ['是，我是老师。'] },
      { obj: 'west-2-3', need: 'west-2-2', m: ['不是 !学生'], say: [['不是老师？好！我是学生。我们是朋友！', "Not a teacher? OK! I'm a student. We're friends!"]], try: ['不是。'] },
      { obj: 'west-2-4', need: 'west-2-3', m: ['朋友', '好', '是', '对'], say: [['好！再见，朋友！', 'Great! Bye, friend!']], try: ['好！我们是朋友。'] }
    ],
    done: [['', 'He heads for the metro. You head for the taxis.', { who: 'narr' }]],
    words: [],
    later: ['朋友，你好！', 'Hello, friend!']
  },

  'west-3': {   // 老潘 · level 7 · + numbers 一 to 十
    greet: [],
    open: [['我跟你说，我是老潘！曲水亭街？', "Let me tell you, I'm Old Pan! Qushuiting Street?"]],
    steps: [
      { obj: 'west-3-1', m: ['是 !不', '对 !不', '好 !不', '曲水亭 !不', '嗯'], say: [['好！曲水亭街……四十号？', 'Great! Qushuiting Street… number forty?']], try: ['是！'] },
      { obj: 'west-3-2', need: 'west-3-1', m: ['十四'], say: [[['十四号！好，好。', 'Number fourteen! OK, OK.'], ['我跟你说：济南，七十二泉！七十二！', 'Let me tell you: Jinan has seventy-two springs! Seventy-two!']]], try: ['不是四十，是十四！'] },
      { obj: 'west-3-3', need: 'west-3-2', m: ['好', '是', '对', '哇', '啊', '哦', '嗯', '七十二', '谢谢'], say: [[['是！七十二！', 'Yes! Seventy-two!'], ['', 'He pulls into traffic, still talking.', { who: 'narr' }]]], try: ['好！', '七十二！'] }
    ],
    extra: [
      { m: ['四十 !十四'], say: [['四十号？……我跟你说，四十号没有人！', "Number forty?… Let me tell you, nobody lives at forty!"]] },
      { m: ['不是 !十四'], say: [['不是？几号？', 'No? What number?']] }
    ],
    done: [['我跟你说，曲水亭街很好！', 'Let me tell you, Qushuiting Street is great!']],
    words: [['号', 'hào', 'number (house, room, date)']],
    later: ['好，好！十四号！', 'OK, OK! Number fourteen!']
  },

  'west-4': {   // 老潘 · level 9 · + 几 多少 钱 块 有 · 没有 要 喝 水 茶
    greet: [],
    open: [['十四号！我跟你说，曲水亭街十四号！', "Number fourteen! Let me tell you, Qushuiting Street, number fourteen!"]],
    steps: [
      { obj: 'west-4-1', m: ['@price'], say: [['三十五块。', 'Thirty-five yuan.']], try: ['多少钱？'] },
      { obj: 'west-4-2', need: 'west-4-1', m: ['{n} 块', '四十', '三十五', '@pay', '钱'], say: [[['好，五块给你。', 'OK, five back to you.'], ['我跟你说，你要喝水吗？', 'Let me tell you… do you want some water?']]], try: ['我有四十块。', '四十块。'] },
      { obj: 'west-4-3', need: 'west-4-2', m: ['不要', '不喝', '不用', '没'], say: [['好，好。', 'OK, OK.']], try: ['不要，谢谢。'] },
      { obj: 'west-4-3', need: 'west-4-2', m: ['要 !不', '喝 !不', '好 !不', '水 !不', '茶'], say: [['给你！', 'Here you go!']], try: ['要！'] },
      { obj: 'west-4-4', need: 'west-4-2', m: ['@thx'], say: [['不客气！再见！', "You're welcome! Bye!"]], try: ['谢谢！'] }
    ],
    extra: [
      { m: ['{n} 块 !三十五|四十'], say: [['三十五块。', 'Thirty-five.']] }
    ],
    done: [['', "He drives off. At your door you open the suitcase: shirts, rolled-up building plans, and a business card that says 马先生 (Mr. Ma). This isn't your suitcase.", { who: 'narr' }]],
    words: [],
    later: ['我跟你说，你的箱子……没问题吧？', "Let me tell you… your suitcase, all sorted?"]
  },

  'west-5': {   // 陈女士 (+ 乐乐, 马先生) · level 10 · + 吃 饭 米饭 面条 好吃 · finale challenge
    greet: [],
    open: [['一、二、三……好！你要什么？', 'One, two, three… OK! What do you need?']],
    challenge: { lives: 3, objs: ['west-5-2', 'west-5-3', 'west-5-4', 'west-5-5', 'west-5-6'],
      fail: [['……好，下一个！', '…OK, next!']],
      restart: [['', "Out of lives. You step out of the line, take a breath, and try again.", { who: 'narr' }], ['你好。你叫什么名字？', "Hello. What's your name?"]] },
    steps: [
      { obj: 'west-5-1', m: ['箱子 没有|没了|不是|不见|丢', '没有 箱子', '箱子'], say: [[['箱子？好。一、二、三……', 'A suitcase? OK. One, two, three…'], ['你叫什么名字？', "What's your name?"]]], try: ['我的箱子没有了。'] },
      { obj: 'west-5-2', need: 'west-5-1', m: ['{name}', '我叫', '名字', '我是 !中国|人|学生|老师'], say: [['你是中国人吗？', 'Are you Chinese?']], try: ['我叫……'] },
      { obj: 'west-5-3', need: 'west-5-2', m: ['不是', '我是 {country}', '{country} 人', '中国人', '是'], say: [['几个箱子？', 'How many suitcases?']], try: ['我不是中国人。'] },
      { obj: 'west-5-4', need: 'west-5-3', m: ['一 !十|二|两|三|四|五|六|七|八|九', '1'], say: [['一个。你家几号？', "One. And your house number?"]], try: ['一个。'] },
      { obj: 'west-5-5', need: 'west-5-4', m: ['十四'], say: [[['十四号。好！', 'Number fourteen. Good!'], ['你好！我叫乐乐。七和三，是几？', "Hi! I'm Lele. Seven and three makes what?", { who: 'lele' }]]], try: ['十四号。'] },
      { obj: 'west-5-6', need: 'west-5-5', m: ['十 !十四|四十|七十|三十|十三|十七|一十', '10'], say: [[['对！对！', 'Right! Right!', { who: 'lele' }], ['', 'The door swings open. A man in a sharp suit hurries in, carrying your suitcase.', { who: 'narr' }], ['你好！我姓马。对不起，对不起！你喝茶吗？', 'Hello! My name is Ma. So sorry, so sorry! Would you like some tea?', { who: 'ma' }]]], try: ['十！'] },
      { obj: 'west-5-7', need: 'west-5-6', m: ['不喝', '不要', '不用'], say: [['好，好。我们是朋友！', "Fine, fine. We're friends!", { who: 'ma' }]], try: ['不喝，谢谢。'] },
      { obj: 'west-5-7', need: 'west-5-6', m: ['好 !不', '要 !不', '喝 !不', '茶 !不', '谢谢'], say: [['好！喝茶，喝茶。我们是朋友！', "Wonderful! Tea, tea. We're friends!", { who: 'ma' }]], try: ['好，谢谢！'] }
    ],
    extra: [
      { m: ['四十 !十四'], say: [['四十号？……不对吧？', 'Number forty?… Are you sure?']] }
    ],
    done: [['', 'He presses a gold-lettered business card into your hand: 马先生. Then he is gone, and you have your suitcase back.', { who: 'narr' }]],
    words: [['的', 'de', "possessive particle ('s)"], ['了', 'le', 'particle: something has changed or happened'], ['个', 'gè', 'general measure word'], ['姓', 'xìng', 'surname; to be surnamed'], ['先生', 'xiānsheng', 'Mr.; sir']],
    later: ['一、二、三……箱子，没问题吧？', 'One, two, three… Your suitcase, all good?']
  }
});
