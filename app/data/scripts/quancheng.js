/* 泉城广场 Quancheng Square · HSK 1, levels 51–60 · Shopping
   District story: "The fake price tag" (假的价格). Shopping for Xiao Xie's birthday with Sister Lin's help, you find a
   shop selling machine-made copies of Grandma Wang's knots with a forged "handmade" tag. Finale (challenge, 3 lives):
   face down the shop owner. It is Mr. Ma's shop. */
Object.assign(window.JINAN_SCRIPTS.quests, {
  'quancheng-1': {   // 林姐 · level 52
    greet: [],
    open: [['你看！你看！你好！你要什么？', 'Look, look! Hello! What do you need?']],
    steps: [
      { obj: 'quancheng-1-1', m: ['卡', '手机'], say: [['手机卡？好！', 'A SIM card? Sure!']], try: ['我要一个手机卡。'] },
      { obj: 'quancheng-1-2', need: 'quancheng-1-1', m: ['@price'], say: [['一个月三十元。', 'Thirty yuan a month.']], try: ['多少钱？'] },
      { obj: 'quancheng-1-3', need: 'quancheng-1-2', m: ['给', '手机', '好'], say: [[['好……好了！你看！', 'OK… done! Look!'], ['', 'Your phone buzzes at once: a message from Xiao Xie. 「星期六是我的生日！来吧！」', { who: 'narr' }]]], try: ['好，给你我的手机。'] },
      { obj: 'quancheng-1-4', need: 'quancheng-1-3', m: ['@thx'], say: [['不客气！小谢的生日？你要买礼物！', "You're welcome! Xiao Xie's birthday? You need to buy a present!"]], try: ['谢谢林姐！'] }
    ],
    done: [['你看！你看！衣服在楼上。', 'Look, look! Clothes are upstairs.']],
    words: [['卡', 'kǎ', 'card'], ['生日', 'shēngrì', 'birthday'], ['礼物', 'lǐwù', 'present; gift']]
  },

  'quancheng-2': {   // 林姐 · level 54
    greet: [],
    open: [['你看！你看！又是你！要什么？', 'Look, look! You again! What do you need?']],
    steps: [
      { obj: 'quancheng-2-1', m: ['衣服', '买'], say: [['好！大的还是小的？', 'Sure! Big or small?']], try: ['我想买衣服。'] },
      { obj: 'quancheng-2-2', need: 'quancheng-2-1', m: ['大', '小'], say: [['这个！你试试。', 'This one! Try it on.']], try: ['大的。', '小的。'] },
      { obj: 'quancheng-2-3', need: 'quancheng-2-2', m: ['@price'], say: [['一百二十元。', 'A hundred and twenty yuan.']], try: ['多少钱？'] },
      { obj: 'quancheng-2-4', need: 'quancheng-2-3', m: ['买', '要', '好'], say: [['好！星期六，你很好看！', "Great! You'll look great on Saturday!"]], try: ['好，我买。'] }
    ],
    done: [['你看！你看！王奶奶也在外边。', 'Look, look! Grandma Wang is outside too.']],
    words: []
  },

  'quancheng-3': {   // 王奶奶 · level 56
    greet: [],
    open: [[['孩子！你看，这是我做的！', 'Child! Look, I made these!'], ['', 'Little red knots, each tied in the shape of a bubbling spring.', { who: 'narr' }]]],
    steps: [
      { obj: 'quancheng-3-1', m: ['喜欢', '好看', '很好'], say: [['你喜欢？太好了！', 'You like them? Wonderful!']], try: ['我很喜欢！'] },
      { obj: 'quancheng-3-2', need: 'quancheng-3-1', m: ['@price'], say: [['二十元……你，十元！', 'Twenty yuan… for you, ten!']], try: ['多少钱？'] },
      { obj: 'quancheng-3-3', need: 'quancheng-3-2', m: ['买', '要', '小谢', '礼物'], say: [[['给小谢？好孩子！', 'For Xiao Xie? Good child!'], ['孩子，你看那个商店。他们的也是泉……可是不是我做的！', "Child, look at that shop. Theirs are springs too… but I didn't make them!"]]], try: ['我买一个，给小谢。'] },
      { obj: 'quancheng-3-4', need: 'quancheng-3-3', m: ['看', '去'], say: [['好！你去看看！', 'Yes! Go and look!']], try: ['我去看看！'] }
    ],
    done: [['', 'Across the square, a bright shop sells the same knots for five yuan, each with a tag: 「手做的」 "Handmade".', { who: 'narr' }]],
    words: []
  },

  'quancheng-4': {   // 林姐 · level 58
    greet: [],
    open: [['你看！你看！你好！怎么了？', "Look, look! Hello! What's up?"]],
    steps: [
      { obj: 'quancheng-4-1', m: ['小', '大'], say: [['太小了？大的……没有了。', 'Too small? There are no bigger ones…']], try: ['这个衣服太小了。'] },
      { obj: 'quancheng-4-2', need: 'quancheng-4-1', m: ['不要', '不想'], say: [['好。钱给你。', "OK. Here's your money."]], try: ['我不要了。'] },
      { obj: 'quancheng-4-3', need: 'quancheng-4-1', m: ['看', '这个'], say: [['这个字……不对！这个不是手做的！是电脑做的！', "This writing… it's wrong! This isn't handmade! A computer made it!"]], try: ['你看这个！'] },
      { obj: 'quancheng-4-4', need: 'quancheng-4-3', m: ['真', '吗'], say: [['我认真看了。不是真的！', 'I looked carefully. It is not real!']], try: ['真的吗？'] }
    ],
    done: [['你看！你看！我们一起去！', "Look, look! Let's go together!"]],
    words: []
  },

  'quancheng-5': {   // 林姐 + 老板 · level 60 · finale challenge
    greet: [],
    open: [[['', 'The shop across the square. A man in a gold-logo apron stands behind a pile of knots.', { who: 'narr' }], ['你好！手做的！五元！便宜！', 'Hello! Handmade! Five yuan! Cheap!', { who: 'seller' }]]],
    challenge: { lives: 3, objs: ['quancheng-5-1', 'quancheng-5-2', 'quancheng-5-3', 'quancheng-5-4', 'quancheng-5-5'],
      fail: [['不买？那你走吧！', 'Not buying? Then off you go!', { who: 'seller' }]],
      restart: [['', 'Sister Lin squeezes your arm. You walk back in.', { who: 'narr' }], ['你好！手做的！五元！', 'Hello! Handmade! Five yuan!', { who: 'seller' }]] },
    steps: [
      { obj: 'quancheng-5-1', m: ['不是'], say: [['是手做的！你看！', 'It IS handmade! Look!', { who: 'seller' }]], try: ['这不是手做的！'] },
      { obj: 'quancheng-5-2', need: 'quancheng-5-1', m: ['字', '看'], say: [['字？……字很好！', 'The writing?… The writing is fine!', { who: 'seller' }]], try: ['你看这个字！'] },
      { obj: 'quancheng-5-3', need: 'quancheng-5-2', m: ['林姐', '电脑'], say: [[['她……她不认识！', "She… she doesn't know!", { who: 'seller' }], ['我认识！我天天看这些！', 'I DO know! I look at these every day!']]], try: ['林姐说这是电脑做的。'] },
      { obj: 'quancheng-5-4', need: 'quancheng-5-3', m: ['不买', '不要'], say: [['那……三元？', 'Then… three yuan?', { who: 'seller' }]], try: ['我不买。'] },
      { obj: 'quancheng-5-5', need: 'quancheng-5-4', m: ['谁的', '商店'], say: [[['马……马先生的。', "Ma… Mr. Ma's.", { who: 'seller' }], ['', 'He takes down the 「手做的」 sign.', { who: 'narr' }], ['你真认真！小谢的礼物，你买了吗？', "You're so thorough! Did you get Xiao Xie's present?"]]], try: ['这是谁的商店？'] },
      { obj: 'quancheng-5-6', need: 'quancheng-5-5', m: ['买', '王奶奶'], say: [['王奶奶做的？太好了！', "Grandma Wang's? Perfect!"]], try: ['买了！王奶奶做的！'] }
    ],
    done: [['', "On Saturday, Xiao Xie opens the knot, reads the little tag in Grandma Wang's handwriting, and cries a bit.", { who: 'narr' }]],
    words: [['便宜', 'piányi', 'cheap']]
  }
});
