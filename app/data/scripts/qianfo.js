/* 千佛山 Qianfo Mountain · HSK 1, levels 61–70 · Directions & the body
   District story: "Teacher Zhang hasn't come down" (张老师没下山). He climbed at dawn and his phone is off. Ms. Chen saw
   him start; Dr. Bai saw him rest; Master Sun sold him water; Xiao Xie reached the top first. Finale (challenge,
   3 lives, an elder: use 您 and 请): find him in the temple courtyard and bring him down. No Mr. Ma in this one. */
Object.assign(window.JINAN_SCRIPTS.quests, {
  'qianfo-1': {   // 陈女士 · level 62
    greet: [],
    open: [[['', "Grandma Wang called at seven: Teacher Zhang went up Qianfo Mountain at dawn and hasn't come back. His phone is off.", { who: 'narr' }], ['一、二、三……好，下一个！……又是你。', 'One, two, three… OK, next!… You again.']]],
    steps: [
      { obj: 'qianfo-1-1', m: ['张老师', '看见'], say: [['张老师？什么样的？', 'Teacher Zhang? What does he look like?']], try: ['你看见张老师了吗？'] },
      { obj: 'qianfo-1-2', need: 'qianfo-1-1', m: ['岁', '老', '高'], say: [['六十八岁……啊！早上六点，他来了。他没坐车，他走上山了。', "Sixty-eight… ah! At six this morning he came. He didn't take the cable car; he walked up."]], try: ['他六十八岁。', '他很老，很高。'] },
      { obj: 'qianfo-1-3', need: 'qianfo-1-2', m: ['票', '坐车', '坐'], say: [['四十元。', 'Forty yuan.']], try: ['我要票。'] },
      { obj: 'qianfo-1-4', need: 'qianfo-1-3', m: ['@thx'], say: [['不客气。……你去找他吧。', "You're welcome. …Go find him."]], try: ['谢谢！'] }
    ],
    done: [['', 'The cable car swings up over the pines. It only goes halfway.', { who: 'narr' }]],
    words: [['爬山', 'pá shān', 'to climb a mountain']]
  },

  'qianfo-2': {   // 白大夫 · level 64
    greet: [],
    open: [['你好。别着急，慢慢来。', "Hello. Don't rush, take your time."]],
    steps: [
      { obj: 'qianfo-2-1', m: ['@hi'], say: [['你好。你也上山？', 'Hello. Climbing too?']], try: ['你好！'] },
      { obj: 'qianfo-2-2', need: 'qianfo-2-1', m: ['张老师', '看见'], say: [['看见了！他很累，在休息。', 'I did! He was tired, resting.']], try: ['你看见张老师了吗？'] },
      { obj: 'qianfo-2-3', need: 'qianfo-2-2', m: ['哪儿', '在哪', '哪里'], say: [['在上面。他没事……他说：我要上去！', "Further up. He's fine… he said: I'm going up!"]], try: ['他在哪儿？'] },
      { obj: 'qianfo-2-4', need: 'qianfo-2-3', m: ['远', '几', '小时'], say: [['不远。一个小时。', 'Not far. An hour.']], try: ['还远吗？'] }
    ],
    done: [['别着急。慢慢走。', "Don't rush. Walk slowly."]],
    words: []
  },

  'qianfo-3': {   // 孙师傅 · level 66
    greet: [],
    open: [['来了！来了！朋友，又是你！', 'Coming, coming! Friend, you again!']],
    steps: [
      { obj: 'qianfo-3-1', m: ['水', '喝', '要'], say: [['好！水！你饿吗？', 'Water it is! Hungry?']], try: ['我要水。'] },
      { obj: 'qianfo-3-2', need: 'qianfo-3-1', m: ['张老师', '左', '右', '哪'], say: [['张老师？他买了水，去左边了。', 'Teacher Zhang? He bought water and went left.']], try: ['张老师去哪儿了？'] },
      { obj: 'qianfo-3-3', need: 'qianfo-3-1', m: ['饿'], say: [['来，肉！吃了再走！', 'Here, meat! Eat before you go!']], try: ['饿！', '不饿。'] },
      { obj: 'qianfo-3-4', need: 'qianfo-3-3', m: ['@price', '钱', '@pay', '{n} 块', '元'], say: [['朋友，不用钱！找到张老师！', 'Friend, no charge! Find Teacher Zhang!']], try: ['多少钱？'] }
    ],
    done: [['', 'You take the left-hand steps two at a time.', { who: 'narr' }]],
    words: []
  },

  'qianfo-4': {   // 小谢 · level 68
    greet: [],
    open: [['哈哈，你来了！我第一！', "Haha, you made it! I'm first!"]],
    steps: [
      { obj: 'qianfo-4-1', m: ['第一', '对', '好'], say: [['哈哈！下次你第一！', "Haha! Next time you'll win!"]], try: ['你第一！'] },
      { obj: 'qianfo-4-2', need: 'qianfo-4-1', m: ['张老师', '看见'], say: [['张老师？没有。他不在这儿。', "Teacher Zhang? No. He's not up here."]], try: ['你看见张老师了吗？'] },
      { obj: 'qianfo-4-3', need: 'qianfo-4-2', m: ['进去', '看看'], say: [['进去？好！走吧！走吧！', 'Go in? OK! Come on, come on!']], try: ['我们进去看看！'] },
      { obj: 'qianfo-4-4', need: 'qianfo-4-1', m: ['再比', '比', '星期'], say: [['好！下个星期，再比！', 'Deal! Next week, rematch!']], try: ['下个星期再比！'] }
    ],
    done: [['', 'Behind the summit is a quiet temple courtyard, and under an old tree sits Teacher Zhang.', { who: 'narr' }]],
    words: []
  },

  'qianfo-5': {   // 张老师 · level 70 · finale challenge (an elder: 您, 请)
    greet: [],
    open: [['好，好……你们怎么来了？', 'Well, well… how did you two get here?']],
    challenge: { lives: 3, objs: ['qianfo-5-1', 'qianfo-5-2', 'qianfo-5-3'],
      fail: [['嗯……你们先回去吧。', 'Hm… you two go on back.']],
      restart: [['', 'Xiao Xie elbows you: "您! Say 您 to him!" You try again.', { who: 'narr' }], ['好，好……你们怎么来了？', 'Well, well… how did you get here?']] },
    steps: [
      { obj: 'qianfo-5-1', m: ['您'], say: [['好，好。很好。我没事。', "Good, good. Very good. I'm fine."]], try: ['张老师，您好！'] },
      { obj: 'qianfo-5-2', need: 'qianfo-5-1', m: ['您 累'], say: [['累？有一点……', 'Tired? A little…']], try: ['您累吗？'] },
      { obj: 'qianfo-5-3', need: 'qianfo-5-2', m: ['请 坐'], say: [['坐车？我……每年都走下山。', 'The cable car? I… walk down every year.']], try: ['请您坐车下山。'] },
      { obj: 'qianfo-5-4', need: 'qianfo-5-3', m: ['生日', '什么', '怎么'], say: [[['不是我的……是我爱人的生日。她最喜欢这个山。', "Not mine… it's my late wife's birthday. She loved this mountain most."], ['', 'He is quiet for a moment.', { who: 'narr' }]]], try: ['今天是您的生日吗？'] },
      { obj: 'qianfo-5-5', need: 'qianfo-5-4', m: ['一起'], say: [[['一起？……好，好。很好。', 'Together?… Good, good. Very good.'], ['', 'The three of you ride the cable car down. Teacher Zhang points out every temple roof on the way.', { who: 'narr' }]]], try: ['我们一起下山吧。'] }
    ],
    extra: [{ m: ['你 !您|你们'], miss: true, say: [['嗯？……', 'Hm?… (He waits. To an elder, say 您, not 你.)']] }],
    done: [['你们……真好。', 'You two… are very kind.']],
    words: [['爱人', 'àiren', 'husband or wife']]
  }
});
