/* 曲水亭街 Qushuiting Street · HSK 1, levels 11–20 · Home & neighbors
   District story: "Moving in" (搬家). Teacher Zhang hands you the keys; Grandma Wang feeds you; Old Pan drinks tea over
   the stream and has seen a man in a big car looking at houses; Sister Lin took in your package, and Mr. Ma's flyer was on
   top. Finale (challenge, 3 lives): Grandma Wang's grandson grills you on a video call.
   The learner's lines use only levels 1…unlock level, plus taught words (build/check_levels.js). */
Object.assign(window.JINAN_SCRIPTS.quests, {
  'qushuiting-1': {   // 张老师 · level 12 · + 这 那 哪儿 这儿 在 去 来 家
    greet: [],
    open: [['好，好。很好。你好！我是张老师。这是你的家！', "Good, good. Very good. Hello! I'm Teacher Zhang. This is your home!"]],
    steps: [
      { obj: 'qushuiting-1-1', m: ['@hi', '张老师'], say: [['你好，你好！你是学生吗？', 'Hello, hello! Are you a student?']], try: ['张老师，你好！'] },
      { obj: 'qushuiting-1-2', m: ['哪儿', '在哪', '哪个'], say: [[['在这儿！你看，这是你的门。', 'Right here! Look, this is your door.'], ['', 'He hands you a heavy old key (钥匙) on a red string.', { who: 'narr' }]]], try: ['我的家在哪儿？'] },
      { obj: 'qushuiting-1-3', need: 'qushuiting-1-1', m: ['学生', '是', '不是', '老师'], say: [['好，好。很好。', 'Good, good. Very good.']], try: ['是，我是学生。'] },
      { obj: 'qushuiting-1-4', need: '*', m: ['@thx'], say: [['好，好。不客气！', "Good, good. You're welcome!"]], try: ['谢谢张老师！'] }
    ],
    done: [['你看，那是王奶奶的家。她很好！', "Look, that's Grandma Wang's house. She's lovely!"]],
    words: [['钥匙', 'yàoshi', 'key']]
  },

  'qushuiting-2': {   // 王奶奶 · level 14 · + 回 · 今天 明天 现在 点
    greet: [],
    open: [['孩子，你好！我是王奶奶。你家在这儿？', "Hello, child! I'm Grandma Wang. Is your home here?"]],
    steps: [
      { obj: 'qushuiting-2-1', m: ['十四', '在这儿', '我家', '是'], say: [[['十四号！我家在十二号！', 'Fourteen! Mine is number twelve!'], ['孩子，你吃饭了吗？', 'Child, have you eaten?']]], try: ['是，我家在十四号。'] },
      { obj: 'qushuiting-2-2', need: 'qushuiting-2-1', m: ['没', '不'], say: [['没吃？孩子！今天晚上来我家吃饭！', "Not yet? Child! Come eat at my place this evening!"]], try: ['没有。'] },
      { obj: 'qushuiting-2-2', need: 'qushuiting-2-1', m: ['吃了', '吃过', '吃 !没|不'], say: [['吃了？好！今天晚上也来我家吃饭！', "You have? Good! Come eat at mine this evening anyway!"]], try: ['吃了。'] },
      { obj: 'qushuiting-2-3', need: 'qushuiting-2-2', m: ['几点', '什么时候', '@when'], say: [['晚上六点！', 'Six this evening!']], try: ['几点？'] },
      { obj: 'qushuiting-2-4', need: 'qushuiting-2-3', m: ['@thx', '好'], say: [['好孩子！晚上见！', 'Good child! See you tonight!']], try: ['好，谢谢王奶奶！'] }
    ],
    done: [['', 'At six she feeds you three kinds of dumplings and asks four times whether you have had enough.', { who: 'narr' }]],
    words: []
  },

  'qushuiting-3': {   // 老潘 · level 16 · + 早上 下午 晚上 · 年 月 日 号 星期
    greet: [],
    open: [['我跟你说，你好！你也在这儿？来！你喝茶吗？', "Let me tell you, hello! You're here too? Come! Want some tea?"]],
    steps: [
      { obj: 'qushuiting-3-1', m: ['喝 !不', '要 !不', '好 !不', '茶 !不', '是 !不'], say: [['我跟你说，这个茶很好！今天几号？', "Let me tell you, this tea is great! What's the date today?"]], try: ['好！我喝茶。'] },
      { obj: 'qushuiting-3-1', m: ['不喝', '不要'], say: [['不喝？好，好。我跟你说，今天几号？', "No? OK, OK. Let me tell you… what's the date today?"]], try: ['不喝，谢谢。'] },
      { obj: 'qushuiting-3-2', need: 'qushuiting-3-1', m: ['号', '月', '日', '星期'], say: [[['对！我跟你说，昨天一个先生来这儿了。', 'Right! Let me tell you, yesterday a gentleman came here.'], ['他看了很多家。很大的车！', 'He looked at lots of houses. A huge car!']]], try: ['今天十月十号。', '今天星期六。'] },
      { obj: 'qushuiting-3-3', need: 'qushuiting-3-2', m: ['什么先生', '哪个先生', '先生', '哪'], say: [['马先生！我跟你说，他想买这儿的房子。', 'Mr. Ma! Let me tell you, he wants to buy the houses here.']], try: ['什么先生？', '哪个先生？'] },
      { obj: 'qushuiting-3-4', need: 'qushuiting-3-3', m: ['马先生', '不', '是他', '他', '啊', '什么', '哦'], say: [['我跟你说，我不卖！', 'Let me tell you, I am not selling!']], try: ['马先生？是他！', '马先生！'] }
    ],
    done: [['我跟你说，曲水亭街，最好！', 'Let me tell you: Qushuiting Street is the best!']],
    words: []
  },

  'qushuiting-4': {   // 林姐 · level 18 · + 喜欢 想 会 能 看 · 听 说 读 写 做
    greet: [],
    open: [[['你看！你看！这是你的！', 'Look, look! This is yours!'], ['', 'She holds out a package with your name on it. A glossy flyer is stuck to the top.', { who: 'narr' }]]],
    steps: [
      { obj: 'qushuiting-4-1', m: ['@thx'], say: [['不客气！你会说中文！', "You're welcome! You speak Chinese!"]], try: ['谢谢！', '谢谢林姐！'] },
      { obj: 'qushuiting-4-2', need: 'qushuiting-4-1', m: ['会', '说', '写', '读', '听'], say: [['很好！我也想学英文。', 'Very good! I want to learn English too.']], try: ['我会说，不会写。', '我会说中文。'] },
      { obj: 'qushuiting-4-3', need: 'qushuiting-4-1', m: ['这是什么', '那是什么', '这个', '什么'], say: [[['你看……马先生。他想买这儿的房子。', 'Look… Mr. Ma. He wants to buy the houses here.'], ['', 'The flyer is thick and glossy, with a gold logo: 马 · Premium Courtyards. Its photo shows your street with every neighbor painted out.', { who: 'narr' }], ['你想卖吗？', 'Do you want to sell?']]], try: ['这是什么？'] },
      { obj: 'qushuiting-4-4', need: 'qushuiting-4-3', m: ['不', '喜欢', '我家'], say: [['我也不想！我喜欢这儿。', 'Me neither! I like it here.']], try: ['不！我喜欢这儿。', '我不想。'] }
    ],
    done: [['你看！你看！王奶奶来了。', 'Look, look! Here comes Grandma Wang.']],
    words: []
  },

  'qushuiting-5': {   // 王奶奶 + 小明 · level 20 · + 买 坐 天气 热 冷 下雨 大 小 多 · finale challenge
    greet: [],
    open: [[['孩子，来！来！你看，这是我的……小明！他在北京。', 'Child, come! Look, this is my… Xiao Ming! He lives in Beijing.'], ['你好！你好！', 'Hi! Hi!', { who: 'kid' }]]],
    challenge: { lives: 3, objs: ['qushuiting-5-2', 'qushuiting-5-3', 'qushuiting-5-4', 'qushuiting-5-5', 'qushuiting-5-6'],
      fail: [['小明？小明！……啊，手机没电了。', 'Xiao Ming? Xiao Ming!… Oh, the phone died.']],
      restart: [['', 'The call drops. Grandma Wang charges the phone and calls back.', { who: 'narr' }], ['你好！你叫什么名字？', "Hi! What's your name?", { who: 'kid' }]] },
    steps: [
      { obj: 'qushuiting-5-1', m: ['@hi', '小明'], say: [['你叫什么名字？', "What's your name?", { who: 'kid' }]], try: ['小明，你好！'] },
      { obj: 'qushuiting-5-2', need: 'qushuiting-5-1', m: ['{name}', '我叫', '名字'], say: [['你是哪国人？', 'Which country are you from?', { who: 'kid' }]], try: ['我叫……'] },
      { obj: 'qushuiting-5-3', need: 'qushuiting-5-2', m: ['{country}', '人', '国'], say: [['你在中国做什么？', 'What do you do in China?', { who: 'kid' }]], try: ['我是美国人。'] },
      { obj: 'qushuiting-5-4', need: 'qushuiting-5-3', m: ['学生', '学校', '中文', '老师', '工作', '读', '写'], say: [['你喜欢济南吗？', 'Do you like Jinan?', { who: 'kid' }]], try: ['我是学生。'] },
      { obj: 'qushuiting-5-5', need: 'qushuiting-5-4', m: ['喜欢 !不'], say: [['我也喜欢！济南今天热吗？', 'Me too! Is it hot in Jinan today?', { who: 'kid' }]], try: ['喜欢！'] },
      { obj: 'qushuiting-5-5', need: 'qushuiting-5-4', m: ['不喜欢', '不'], say: [['不喜欢？奶奶！……济南今天热吗？', "You don't? Grandma!… Is it hot in Jinan today?", { who: 'kid' }]], try: ['不喜欢。'] },
      { obj: 'qushuiting-5-6', need: 'qushuiting-5-5', m: ['热', '冷', '下雨', '天气'], say: [[['北京很冷！', "Beijing's cold!", { who: 'kid' }], ['小明，你看，这是我们的家。我们不卖！', 'Xiao Ming, look, this is our home. We are not selling!'], ['好！再见！', 'OK! Bye!', { who: 'kid' }]]], try: ['今天热。', '今天下雨。'] },
      { obj: 'qushuiting-5-7', need: 'qushuiting-5-6', m: ['@bye'], say: [['再见！再见！', 'Bye! Bye!', { who: 'kid' }]], try: ['再见！'] }
    ],
    done: [['孩子，你真好。我们是家人！', 'Child, you are so good. We are family!']],
    words: []
  }
});
