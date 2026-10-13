/* 山东省立医院 Shandong Provincial Hospital · HSK 1, levels 91–102 · Health
   District story: "Drink more hot water" (多喝热水). Grandma Wang is unwell: Xiao Su registers her, Dr. Bai looks after her,
   you take a day off, and Old Pan races Xiao Xie in when she falls. Finale (challenge, 3 lives, a clerk): Dr. Bai's ward
   rules, with the whole street in the corridor. Mr. Ma arrives with fruit. */
Object.assign(window.JINAN_SCRIPTS.quests, {
  'hospital-1': {   // 小苏 · level 92
    greet: [],
    open: [['你好！请问，你看病吗？', 'Hello! Excuse me, are you here to see a doctor?']],
    steps: [
      { obj: 'hospital-1-1', m: ['王奶奶', '不是我', '奶奶'], say: [['王奶奶？她怎么了？', "Grandma Wang? What's wrong?"]], try: ['不是我，是王奶奶。'] },
      { obj: 'hospital-1-2', need: 'hospital-1-1', m: ['生病', '病', '不想吃', '累'], say: [['她在哪儿？', 'Where is she?']], try: ['她生病了。'] },
      { obj: 'hospital-1-3', need: 'hospital-1-2', m: ['外边', '车上', '门口', '在'], say: [['好！先挂号。请坐，我去叫白大夫！', "OK! Register first. Have a seat, I'll get Dr. Bai!"]], try: ['她在车上。'] },
      { obj: 'hospital-1-4', need: 'hospital-1-3', m: ['@thx'], say: [['不客气！别着急。', "You're welcome! Don't worry."]], try: ['谢谢小苏！'] }
    ],
    done: [['', 'Old Pan carries Grandma Wang in from the taxi, complaining the whole way that she is too light.', { who: 'narr' }]],
    words: [['挂号', 'guàhào', 'to register (at a hospital)']]
  },

  'hospital-2': {   // 白大夫 · level 95
    greet: [],
    open: [['你好。别着急……啊，又见面了！山上！', "Hello. Don't worry… ah, we meet again! On the mountain!"]],
    steps: [
      { obj: 'hospital-2-1', m: ['@hi', '白大夫'], say: [['王奶奶，哪儿不舒服？', 'Grandma Wang, where does it hurt?']], try: ['白大夫，您好！'] },
      { obj: 'hospital-2-2', need: 'hospital-2-1', m: ['舒服', '不想吃', '身体', '累', '病'], say: [['几天了？', 'How long has it been?']], try: ['她身体不舒服，不想吃饭。'] },
      { obj: 'hospital-2-3', need: 'hospital-2-2', m: ['天', '前天', '昨天', '星期'], say: [['好。……没事儿。多喝热水，多休息。', 'OK… Nothing serious. Drink lots of hot water and rest a lot.']], try: ['前天。', '两天了。'] },
      { obj: 'hospital-2-4', need: 'hospital-2-3', m: ['没事', '真的', '吗'], say: [['没事儿！她……今天晚上在这儿住。', "Nothing serious! She'll… stay here tonight."]], try: ['真的没事儿吗？'] }
    ],
    done: [['多喝热水！', 'Drink more hot water!']],
    words: [['舒服', 'shūfu', 'comfortable; well'], ['药', 'yào', 'medicine']]
  },

  'hospital-3': {   // 吕老师 · level 97 (phone)
    greet: [],
    open: [['喂？你好！', 'Hello? Hi!']],
    steps: [
      { obj: 'hospital-3-1', m: ['请假'], say: [['请假？怎么了？你生病了吗？', "Time off? What's wrong? Are you sick?"]], try: ['吕老师，我明天想请假。'] },
      { obj: 'hospital-3-2', need: 'hospital-3-1', m: ['王奶奶', '医院', '生病', '不是'], say: [['哦……没事儿。你看看课文吧。', 'Oh… no problem. Have a look at the text.']], try: ['不是我，王奶奶生病了。'] },
      { obj: 'hospital-3-3', need: 'hospital-3-2', m: ['好', '看', '行'], say: [['好！你真好。', 'Good! You are very kind.']], try: ['好，我看看。'] },
      { obj: 'hospital-3-4', need: 'hospital-3-3', m: ['@thx'], say: [['不客气！再见！', "You're welcome! Bye!"]], try: ['谢谢吕老师！'] }
    ],
    done: [['', 'As you hang up, you hear a shout from the stairwell: Xiao Xie.', { who: 'narr' }]],
    words: []
  },

  'hospital-4': {   // 老潘 · level 100 (phone)
    greet: [],
    open: [['我跟你说……喂？你好！', 'Let me tell you… hello?']],
    steps: [
      { obj: 'hospital-4-1', m: ['小谢', '不能走', '走'], say: [['什么？小谢不能走？在哪儿？', "What? Xiao Xie can't walk? Where?"]], try: ['老潘！小谢不能走了！'] },
      { obj: 'hospital-4-2', need: 'hospital-4-1', m: ['楼下', '门口', '前边', '学校', '在'], say: [['我马上来！去哪个医院？', "I'm coming right now! Which hospital?"]], try: ['在楼下门口。'] },
      { obj: 'hospital-4-3', need: 'hospital-4-2', m: ['医院', '省立'], say: [['好！我跟你说，十分钟！', 'Got it! Let me tell you: ten minutes!']], try: ['去省立医院！'] },
      { obj: 'hospital-4-4', need: 'hospital-4-3', m: ['@thx'], say: [['我跟你说，别谢！', "Let me tell you, don't thank me!"]], try: ['谢谢老潘！'] }
    ],
    done: [['', 'Old Pan makes the trip in eight minutes and talks the entire way.', { who: 'narr' }]],
    words: []
  },

  'hospital-5': {   // 白大夫 (+ 马先生) · level 102 · finale challenge (a clerk: ward rules)
    greet: [],
    open: [[['', "Grandma Wang's ward. In the corridor: Teacher Zhang, Master Sun, Sister Lin, Ms. Chen and Lele, Xiao Su, Old Pan, and Xiao Xie on crutches.", { who: 'narr' }], ['你们……几个人？', 'You… how many of you are there?']]],
    challenge: { lives: 3, objs: ['hospital-5-1', 'hospital-5-2', 'hospital-5-3', 'hospital-5-4', 'hospital-5-5'],
      fail: [['不行。你们明天再来。', 'No. Come back tomorrow.']],
      restart: [['', 'Dr. Bai sighs and starts again.', { who: 'narr' }], ['你们几个人？', 'How many of you?']] },
    steps: [
      { obj: 'hospital-5-1', m: ['{n}', '人'], say: [['太多了！两个人一块儿进去。你们是她的家人吗？', 'Too many! Two at a time. Are you her family?']], try: ['九个人。'] },
      { obj: 'hospital-5-2', need: 'hospital-5-1', m: ['朋友', '家人', '是', '不是'], say: [['好。你们几点走？', 'OK. What time will you leave?']], try: ['我们是她的朋友。'] },
      { obj: 'hospital-5-3', need: 'hospital-5-2', m: ['点'], say: [['好。你们拿了什么？', 'OK. What have you brought?']], try: ['晚上八点。'] },
      { obj: 'hospital-5-4', need: 'hospital-5-3', m: ['热水', '包子', '水果', '水', '面条'], say: [['好。别大声说话！', 'Good. No loud talking!']], try: ['热水和包子。'] },
      { obj: 'hospital-5-5', need: 'hospital-5-4', m: ['好', '不', '对', '会', '行'], say: [[['好。请进。', 'Good. Go in.'], ['', 'Grandma Wang sits up and beams: 「孩子们！」 Then the door opens again: Mr. Ma, holding a bag of fruit.', { who: 'narr' }], ['王奶奶……这是给您的。', 'Grandma Wang… this is for you.', { who: 'ma' }]]], try: ['好！'] },
      { obj: 'hospital-5-6', need: 'hospital-5-5', m: ['请进', '进来', '谢谢', '你好', '马先生'], say: [['……谢谢。', '…Thank you.', { who: 'ma' }]], try: ['马先生，请进！'] }
    ],
    done: [['', 'Grandma Wang pours hot water for everyone, Mr. Ma included, and tells him to drink more of it.', { who: 'narr' }]],
    words: []
  }
});
