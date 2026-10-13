/* 趵突泉 Baotu Spring · HSK 1, levels 21–30 · Springs & family
   District story: "Grandma Wang's red cup" (王奶奶的红杯子). Ms. Chen sells you a ticket; Teacher Zhang's tai chi group;
   Grandma Wang has lost her little red cup; Xiao Xie's photo shows it on a bench at 8; at Ms. Chen's lost and found
   (challenge, 3 lives) Lele turns out to have handed it in; you bring it back to Black Tiger Spring.
   The learner's lines use only levels 1…unlock level, plus taught words (build/check_levels.js). */
Object.assign(window.JINAN_SCRIPTS.quests, {
  'baotu-1': {   // 陈女士 · level 22
    greet: [],
    open: [['一、二、三……好，下一个！……又是你？你好。', 'One, two, three… OK, next!… You again? Hello.']],
    steps: [
      { obj: 'baotu-1-1', m: ['票', '我要', '买'], say: [['一张？四十块。你是学生吗？', 'One? Forty yuan. Are you a student?']], try: ['我要票。'] },
      { obj: 'baotu-1-2', need: 'baotu-1-1', m: ['学生', '是 !不'], say: [['学生？二十块。', 'A student? Twenty yuan.']], try: ['是，我是学生。'] },
      { obj: 'baotu-1-2', need: 'baotu-1-1', m: ['不是'], say: [['不是？好，四十块。', 'No? OK, forty.']], try: ['不是。'] },
      { obj: 'baotu-1-3', need: 'baotu-1-2', m: ['{n} 块', '@pay', '二十', '四十', '钱'], say: [['好。这是你的票。', "OK. Here's your ticket."]], try: ['二十块。'] },
      { obj: 'baotu-1-4', need: 'baotu-1-3', m: ['@thx'], say: [['不客气……下一个！', "You're welcome… next!"]], try: ['谢谢！'] }
    ],
    done: [['', 'Through the gate, the spring boils up in three white domes. Somewhere by the benches, someone is calling out about a cup.', { who: 'narr' }]],
    words: [['票', 'piào', 'ticket'], ['泉', 'quán', 'spring (of water)']]
  },

  'baotu-2': {   // 张老师 · level 23 · + 很 太 爸爸 妈妈 · 认识 高兴 家人 · 住 工作
    greet: [],
    open: [['好，好。很好。你也来了！来，一起！', 'Good, good. Very good. You came too! Come, join us!']],
    steps: [
      { obj: 'baotu-2-1', m: ['@hi', '张老师'], say: [['你好！你认识他们吗？', 'Hello! Do you know these people?']], try: ['张老师好！', '张老师，你好！'] },
      { obj: 'baotu-2-2', need: 'baotu-2-1', m: ['认识', '不'], say: [['他们都是我的朋友！你家人呢？在中国吗？', "They're all my friends! And your family? Are they in China?"]], try: ['不认识。'] },
      { obj: 'baotu-2-3', need: 'baotu-2-2', m: ['爸爸', '妈妈', '家人', '在', '不'], say: [[['好，好。你一个人在济南……我们都是你的家人！', "I see. You're on your own in Jinan… then we are all your family!"], ['你看，王奶奶。她不高兴。', "Look, Grandma Wang. She isn't happy."]]], try: ['我爸爸妈妈不在中国。'] },
      { obj: 'baotu-2-4', need: 'baotu-2-3', m: ['王奶奶', '哪儿', '在哪'], say: [['在那儿。你去看看吧。', 'Over there. Go and see.']], try: ['王奶奶在哪儿？'] }
    ],
    done: [['好，好。很好。', 'Good, good. Very good.']],
    words: []
  },

  'baotu-cup': {   // 王奶奶 · level 25 · + 杯子 手机 的 了 · 个 和 也 都
    greet: [],
    open: [['孩子……我的杯子……没有了！', "Child… my cup… it's gone!"]],
    steps: [
      { obj: 'baotu-cup-1', m: ['什么', '没有', '怎么'], say: [['我的杯子！我天天用的杯子！', 'My cup! The cup I use every day!']], try: ['什么没有了？'] },
      { obj: 'baotu-cup-2', need: 'baotu-cup-1', m: ['杯子', '大', '小'], say: [['红的！一个小杯子！', 'A red one! A little cup!']], try: ['什么杯子？', '杯子大吗？'] },
      { obj: 'baotu-cup-3', need: 'baotu-cup-2', m: ['哪儿', '在哪', '几点', '什么时候'], say: [['早上……在那儿！我坐在那儿。', 'This morning… over there! I was sitting there.']], try: ['杯子在哪儿？'] },
      { obj: 'baotu-cup-4', need: 'baotu-cup-3', m: ['看', '我们', '我去', '我来'], say: [['孩子，你真好！', 'Child, you are so good!']], try: ['我看看。', '我去看看。'] }
    ],
    done: [['', 'You check under every bench. No cup. But Xiao Xie is by the railing, taking photos of everything.', { who: 'narr' }]],
    words: [['红', 'hóng', 'red']]
  },

  'baotu-photo': {   // 小谢 · level 27 · + 对 到 上 还 着 · 给 他们 吧 过 没
    greet: [],
    open: [['哈哈，你好！走吧！走吧！你能给我照一张吗？', 'Haha, hi! Come on! Can you take one of me?']],
    steps: [
      { obj: 'baotu-photo-1', m: ['好', '能', '可以', '行'], say: [[['', 'You take her photo. She checks it and laughs.', { who: 'narr' }], ['哈哈，很好！你看，还有这个……早上的。', "Haha, great! Look, there's this one too… from this morning."]]], try: ['好！', '能！'] },
      { obj: 'baotu-photo-2', need: 'baotu-photo-1', m: ['杯子', '你看', '什么'], say: [['杯子？哦！一个红杯子！', 'A cup? Oh! A red cup!']], try: ['你看！杯子！', '这是什么？'] },
      { obj: 'baotu-photo-3', need: 'baotu-photo-2', m: ['王奶奶', '奶奶'], say: [['王奶奶的？那我们给她吧！', "Grandma Wang's? Then let's get it back to her!"]], try: ['这是王奶奶的杯子！'] },
      { obj: 'baotu-photo-4', need: 'baotu-photo-2', m: ['几点', '什么时候', '@when'], say: [['早上八点。现在……那儿没有了。', "Eight this morning. Now… it's not there anymore."]], try: ['这是几点？'] }
    ],
    done: [['走吧！走吧！问问陈女士！', "Come on, come on! Let's ask Ms. Chen!"]],
    words: []
  },

  'baotu-lost': {   // 陈女士 + 乐乐 · level 28 · + 从 下 中 里 真 · finale challenge
    greet: [],
    open: [['一、二、三……好，下一个！……又是你。你要什么？', 'One, two, three… OK, next!… You again. What do you need?']],
    challenge: { lives: 3, objs: ['baotu-lost-2', 'baotu-lost-3', 'baotu-lost-4', 'baotu-lost-5'],
      fail: [['……好，下一个！', '…OK, next!']],
      restart: [['', 'Ms. Chen sighs and pulls out a fresh form.', { who: 'narr' }], ['杯子。什么颜色？', 'A cup. What color?']] },
    steps: [
      { obj: 'baotu-lost-1', m: ['杯子'], say: [['杯子？好。一、二、三……什么颜色？', 'A cup? OK. One, two, three… What color?']], try: ['王奶奶的杯子没有了。'] },
      { obj: 'baotu-lost-2', need: 'baotu-lost-1', m: ['红'], say: [['红的。大的，小的？', 'Red. Big or small?']], try: ['红的。'] },
      { obj: 'baotu-lost-3', need: 'baotu-lost-2', m: ['小 !大'], say: [['小的。几点在那儿？', 'Small. What time was it there?']], try: ['小的。'] },
      { obj: 'baotu-lost-4', need: 'baotu-lost-3', m: ['八点', '8点', '早上'], say: [['早上八点。是你的吗？', 'Eight in the morning. Is it yours?']], try: ['早上八点。'] },
      { obj: 'baotu-lost-5', need: 'baotu-lost-4', m: ['王奶奶', '奶奶'], say: [[['王奶奶的……好。等一下。', "Grandma Wang's… OK. Wait a moment."], ['妈妈！是我！我给你了！', 'Mom! It was me! I gave it to you!', { who: 'lele' }], ['', 'Lele points at a shelf. There it is: a little red cup, washed and dried.', { who: 'narr' }]]], try: ['不是，是王奶奶的。'] },
      { obj: 'baotu-lost-6', need: 'baotu-lost-5', m: ['@thx', '乐乐'], say: [['不客气！你知道吗？你不知道！', "You're welcome! You know what? You don't know!", { who: 'lele' }]], try: ['谢谢乐乐！', '谢谢你！'] }
    ],
    extra: [{ m: ['大 !小'], say: [['大的？……你看看。', 'Big?… Have a look.']] }],
    done: [['一、二、三……好。拿着！', 'One, two, three… OK. Take it!']],
    words: []
  },

  'baotu-return': {   // 王奶奶 · level 30 · + 用 两 等 天 出 · 最 再 呢 次 知道
    greet: [],
    open: [['孩子！你来了！', "Child! You came!"]],
    steps: [
      { obj: 'baotu-return-1', m: ['杯子', '给你', '你的'], say: [[['我的杯子！孩子，谢谢你！', 'My cup! Child, thank you!'], ['你喝泉水吗？这个水最好！', 'Will you have some spring water? This water is the best!']]], try: ['王奶奶，你的杯子！', '给你！'] },
      { obj: 'baotu-return-2', need: 'baotu-return-1', m: ['喝 !不', '好 !不', '要 !不'], say: [['很好喝吧？你明天再来吗？', 'Tasty, right? Will you come again tomorrow?']], try: ['喝！', '好！'] },
      { obj: 'baotu-return-2', need: 'baotu-return-1', m: ['不喝', '不要'], say: [['不喝？下次吧！你明天再来吗？', 'No? Next time, then! Will you come again tomorrow?']], try: ['不喝，谢谢。'] },
      { obj: 'baotu-return-3', need: 'baotu-return-2', m: ['来', '再', '明天'], say: [[['好！我天天在这儿。', "Good! I'm here every day."], ['孩子，你知道吗？那个马先生……他也来这儿了。他想买泉水！', 'Child, do you know? That Mr. Ma… he came here too. He wants to buy the spring water!']]], try: ['我明天再来！', '来！'] },
      { obj: 'baotu-return-4', need: 'baotu-return-3', m: ['不', '马先生', '什么'], say: [['对！泉水是我们的！', 'Right! The spring water is ours!']], try: ['什么？不能买！'] }
    ],
    done: [['', 'She fills her red cup at the stone spout and hands it to you first.', { who: 'narr' }]],
    words: []
  }
});
