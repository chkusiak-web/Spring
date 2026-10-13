/* 宽厚里 Kuanhouli · HSK 1, levels 81–90 · Going out
   District story: "Everyone" (大家). Mr. Ma is making offers on every courtyard, so you bring the street together for
   barbecue. Old Pan toasts; Xiao Su skips KTV. Finale (challenge, 3 lives, a rival): Mr. Ma pulls up a chair to buy the
   street, and the whole table answers him. Master Sun has already paid. */
Object.assign(window.JINAN_SCRIPTS.quests, {
  'kuanhouli-1': {   // 小谢 · level 82 (texting)
    greet: [],
    open: [['哈哈，你好！今天晚上干什么？', "Haha, hi! What are you doing tonight?"]],
    steps: [
      { obj: 'kuanhouli-1-1', m: ['吃饭', '请', '一起'], say: [['好啊！在哪儿？', 'Sure! Where?']], try: ['我想请大家吃饭。'] },
      { obj: 'kuanhouli-1-2', need: 'kuanhouli-1-1', m: ['宽厚里'], say: [['宽厚里！几点？', 'Kuanhouli! What time?']], try: ['在宽厚里。'] },
      { obj: 'kuanhouli-1-3', need: 'kuanhouli-1-2', m: ['点'], say: [['七点？好！', 'Seven? OK!']], try: ['晚上七点。'] },
      { obj: 'kuanhouli-1-4', need: 'kuanhouli-1-3', m: ['告诉', '大家', '他们'], say: [['走吧！走吧！我告诉大家！', "Come on, come on! I'll tell everyone!"]], try: ['你告诉大家吧！'] }
    ],
    done: [['', 'Within ten minutes, eleven people have replied. Grandma Wang has replied twice.', { who: 'narr' }]],
    words: [['大家', 'dàjiā', 'everyone']]
  },

  'kuanhouli-2': {   // 孙师傅 · level 84
    greet: [],
    open: [['来了！来了！朋友，几个人？', 'Coming, coming! Friend, how many of you?']],
    steps: [
      { obj: 'kuanhouli-2-1', m: ['{n} 人', '人'], say: [['{n|很多}个人？好！要什么？', "{n|That many} people? Great! What'll it be?"]], try: ['十一个人。'] },
      { obj: 'kuanhouli-2-2', need: 'kuanhouli-2-1', m: ['肉', '菜', '烤串', '吃', '要'], say: [['好！喝什么？', 'Sure! And to drink?']], try: ['我们要肉和菜。'] },
      { obj: 'kuanhouli-2-3', need: 'kuanhouli-2-2', m: ['茶', '水', '牛奶', '喝'], say: [[['好！', 'Sure!'], ['朋友……那个马先生，昨天来了。他说，明年这儿……没有了。', 'Friend… that Mr. Ma came yesterday. He said that next year this place… will be gone.']]], try: ['我们喝茶。'] },
      { obj: 'kuanhouli-2-4', need: 'kuanhouli-2-3', m: ['不', '没有', '什么', '马先生'], say: [['对！不能！今天……我们都在！', "Right! Can't happen! Tonight… we're all here!"]], try: ['不能！'] }
    ],
    done: [['', 'Smoke rolls over the tables. Someone strings lanterns between the trees.', { who: 'narr' }]],
    words: [['烤串', 'kǎochuàn', 'barbecue skewers']]
  },

  'kuanhouli-3': {   // 老潘 · level 86
    greet: [],
    open: [['我跟你说，干杯！', 'Let me tell you: cheers!']],
    steps: [
      { obj: 'kuanhouli-3-1', m: ['干杯'], say: [['我跟你说，我在这儿住了三十年！', 'Let me tell you, I have lived here thirty years!']], try: ['干杯！'] },
      { obj: 'kuanhouli-3-2', need: 'kuanhouli-3-1', m: ['三十', '真', '很'], say: [['你喜欢这儿吗？', 'Do you like it here?']], try: ['三十年！真好！'] },
      { obj: 'kuanhouli-3-3', need: 'kuanhouli-3-2', m: ['喜欢'], say: [['我跟你说，我们都不走！', "Let me tell you, none of us are leaving!"]], try: ['我非常喜欢这儿！'] },
      { obj: 'kuanhouli-3-4', need: 'kuanhouli-3-3', m: ['对', '是', '不走', '好'], say: [['干杯！', 'Cheers!', { who: 'cheers' }]], try: ['对！我们都不走！'] }
    ],
    done: [['我跟你说……我们是一家人！', 'Let me tell you… we are one family!']],
    words: [['干杯', 'gānbēi', 'cheers!']]
  },

  'kuanhouli-4': {   // 小苏 · level 88
    greet: [],
    open: [['我们去唱歌吧！我同学都去！你也来！', "Let's go sing! All my classmates are going! You come too!"]],
    steps: [
      { obj: 'kuanhouli-4-1', m: ['对不起', '不去', '不能'], say: [['不去？为什么？', 'Not coming? Why?']], try: ['对不起，今天不去。'] },
      { obj: 'kuanhouli-4-2', need: 'kuanhouli-4-1', m: ['下次'], say: [['好……下次！', 'OK… next time!']], try: ['下次吧！'] },
      { obj: 'kuanhouli-4-3', need: 'kuanhouli-4-1', m: ['大家', '今天', '这儿', '朋友'], say: [['大家在这儿……对。', "Everyone's here… right."]], try: ['今天大家都在这儿。'] },
      { obj: 'kuanhouli-4-4', need: 'kuanhouli-4-3', m: ['坐下', '坐', '一起'], say: [['好！我也不去了！', "OK! I'm not going either!"]], try: ['你也坐下吧！'] }
    ],
    done: [['', 'He texts his classmates 「下次！」 and grabs a skewer.', { who: 'narr' }]],
    words: []
  },

  'kuanhouli-5': {   // 小谢 + 马先生 + 大家 · level 90 · finale challenge (a rival)
    greet: [],
    open: [[['', 'As the plates empty, a long black car stops at the end of the lane. Mr. Ma pulls up a chair.', { who: 'narr' }], ['大家好……这儿的房子，我都想买。', 'Good evening, everyone… I want to buy every house here.', { who: 'ma' }]]],
    challenge: { lives: 3, objs: ['kuanhouli-5-1', 'kuanhouli-5-2', 'kuanhouli-5-3', 'kuanhouli-5-4', 'kuanhouli-5-5'],
      fail: [['……我们下次再说。', "…We'll talk another time.", { who: 'ma' }]],
      restart: [['', 'Xiao Xie squeezes your hand under the table. Mr. Ma sits back down.', { who: 'narr' }], ['这儿的房子，我都想买。', 'I want to buy every house here.', { who: 'ma' }]] },
    steps: [
      { obj: 'kuanhouli-5-1', m: ['不卖', '不'], say: [['你知道这个地方多少钱吗？', 'Do you know what this place is worth?', { who: 'ma' }]], try: ['我们不卖！'] },
      { obj: 'kuanhouli-5-2', need: 'kuanhouli-5-1', m: ['家', '我们的'], say: [['新的商场……很好！', 'A new shopping mall… would be wonderful!', { who: 'ma' }]], try: ['这是我们的家！'] },
      { obj: 'kuanhouli-5-3', need: 'kuanhouli-5-2', m: ['商场', '不要'], say: [[['你们……都这么想？', 'You… all think so?', { who: 'ma' }], ['对！', 'Yes!', { who: 'cheers' }]]], try: ['我们不要商场！'] },
      { obj: 'kuanhouli-5-4', need: 'kuanhouli-5-3', m: ['住', '请问'], say: [['我……不住这儿。', "I… don't live here.", { who: 'ma' }]], try: ['请问，你住在这儿吗？'] },
      { obj: 'kuanhouli-5-5', need: 'kuanhouli-5-4', m: ['别', '不要', '不能'], say: [[['', 'Old Pan, Master Sun and Grandma Wang stand up together. Then the whole table does.', { who: 'narr' }], ['……好。我明白了。', '…Alright. I understand.', { who: 'ma' }], ['', 'Mr. Ma looks at the lanterns for a long moment. Then he picks his card back up off the table.', { who: 'narr' }], ['你看！钱……孙师傅给了！', 'Look! The bill… Master Sun already paid it!']]], try: ['那你别买！'] },
      { obj: 'kuanhouli-5-6', need: 'kuanhouli-5-5', m: ['@thx', '大家'], say: [['谢谢！', 'Thank you!', { who: 'cheers' }]], try: ['谢谢大家！'] }
    ],
    done: [['哈哈！走吧！走吧！唱歌去！', "Haha! Come on, come on! Let's go sing!"]],
    words: [['卖', 'mài', 'to sell']]
  }
});
