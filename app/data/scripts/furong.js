/* 芙蓉街 Furong Street · HSK 1, levels 31–40 · Food & ordering
   District story: "Master Sun's 油旋" (孙师傅的油旋). A copycat stall opens across the street under Master Sun's name, and
   his recipe notebook is gone. Grandma Wang saw someone carry it off; Xiao Xie knows the cook works for Mr. Ma.
   Finale (challenge, 3 lives): correct the copycat cook's measure words and talk the notebook back. */
Object.assign(window.JINAN_SCRIPTS.quests, {
  'furong-1': {   // 孙师傅 · level 32
    greet: [],
    open: [['来了！来了！朋友，你要什么？', "Coming, coming! Friend, what'll it be?"]],
    steps: [
      { obj: 'furong-1-1', m: ['油旋'], say: [['好！还要什么？', 'Great! Anything else?']], try: ['我要一个油旋。'] },
      { obj: 'furong-1-2', need: 'furong-1-1', m: ['茶', '水', '喝'], say: [['好！', 'Sure!']], try: ['我要茶。'] },
      { obj: 'furong-1-3', need: 'furong-1-1', m: ['@price'], say: [[['八块！', 'Eight yuan!'], ['', 'He glares across the street at a shiny new stall. Its sign says: 孙师傅的油旋.', { who: 'narr' }]]], try: ['多少钱？'] },
      { obj: 'furong-1-4', need: 'furong-1-3', m: ['怎么', '什么事', '什么'], say: [['你看那个新的……“孙师傅的油旋”！不是我的！', "Look at that new one… 'Master Sun's Youxuan'! It isn't mine!"]], try: ['怎么了？'] }
    ],
    done: [['朋友，明天再来！', 'Friend, come again tomorrow!']],
    words: [['油旋', 'yóuxuán', 'flaky scallion pastry (a Jinan specialty)']]
  },

  'furong-2': {   // 孙师傅 · level 34
    greet: [],
    open: [['来了……来了。朋友，你好。', 'Coming… coming. Hello, friend.']],
    steps: [
      { obj: 'furong-2-1', m: ['什么', '怎么'], say: [['我的本子没有了！我的油旋，都在本子里！', 'My notebook is gone! All my youxuan are in that notebook!']], try: ['怎么了？', '什么没有了？'] },
      { obj: 'furong-2-2', need: 'furong-2-1', m: ['什么时候', '几', '哪天', '星期'], say: [['上个星期！星期三！', 'Last week! Wednesday!']], try: ['什么时候？'] },
      { obj: 'furong-2-3', need: 'furong-2-1', m: ['谁'], say: [['我不知道！', "I don't know!"]], try: ['是谁？'] },
      { obj: 'furong-2-4', need: ['furong-2-2', 'furong-2-3'], m: ['找', '看看'], say: [['朋友，谢谢你！', 'Friend, thank you!']], try: ['我找找！', '我去找！'] }
    ],
    done: [['问问王奶奶。她天天在这儿吃早饭。', 'Ask Grandma Wang. She has breakfast here every day.']],
    words: [['本子', 'běnzi', 'notebook']]
  },

  'furong-3': {   // 王奶奶 · level 36
    greet: [],
    open: [['孩子！来，一起吃！我请你！', 'Child! Come, eat with me! My treat!']],
    steps: [
      { obj: 'furong-3-1', m: ['好', '谢谢', '行'], say: [['你要一碗甜沫吗？甜沫……不甜！', "Want a bowl of 甜沫? It isn't actually sweet!"]], try: ['好！谢谢王奶奶！'] },
      { obj: 'furong-3-2', need: 'furong-3-1', m: ['碗', '要'], say: [['好！一碗甜沫！', 'One bowl of 甜沫!']], try: ['我要一碗。'] },
      { obj: 'furong-3-3', need: 'furong-3-2', m: ['好吃', '甜', '不好吃'], say: [['对吧？不甜！好吃！', 'See? Not sweet! Delicious!']], try: ['很好吃！', '不甜！'] },
      { obj: 'furong-3-4', need: 'furong-3-3', m: ['谁', '本子', '看到'], say: [[['孙师傅的本子？我看到了！一个人拿着本子……去那儿了。', "Master Sun's notebook? I saw! Someone carrying a notebook… went over there."], ['', 'She points across the street at the new stall.', { who: 'narr' }], ['问问小谢吧。她认识很多人。', 'Ask Xiao Xie. She knows everyone.']]], try: ['你看到孙师傅的本子了吗？'] }
    ],
    done: [['孩子，多吃！', 'Eat up, child!']],
    words: [['碗', 'wǎn', 'bowl'], ['甜', 'tián', 'sweet']]
  },

  'furong-4': {   // 小谢 · level 38
    greet: [],
    open: [['走吧！走吧！我饿了！你想吃什么？', "Come on, come on! I'm starving! What do you want to eat?"]],
    steps: [
      { obj: 'furong-4-1', m: ['米饭', '面条', '吃', '要'], say: [['好！我要把子肉！', "OK! I'm having 把子肉!"]], try: ['我想吃米饭。', '我要面条。'] },
      { obj: 'furong-4-2', need: 'furong-4-1', m: ['认识', '那个', '谁'], say: [['那个新的饭店？我认识他！他是马先生的人！', 'That new place? I know him! He works for Mr. Ma!']], try: ['你认识那个新饭店的人吗？'] },
      { obj: 'furong-4-3', need: 'furong-4-2', m: ['马先生', '什么', '真', '不'], say: [['马先生很有钱。他想开很多饭店。', 'Mr. Ma has lots of money. He wants to open lots of restaurants.']], try: ['马先生？！', '是马先生！'] },
      { obj: 'furong-4-4', need: 'furong-4-3', m: ['一起', '我们去', '去'], say: [['走吧！走吧！一起去！', "Come on, come on! Let's go together!"]], try: ['我们一起去！'] }
    ],
    done: [['', 'She orders a second plate of 把子肉 "for the road" and eats it on the way.', { who: 'narr' }]],
    words: []
  },

  'furong-5': {   // 孙师傅 + 厨师 · level 40 · finale challenge
    greet: [],
    open: [[['来了！来了！朋友，我们去！', "Coming, coming! Friend, let's go!"], ['', 'At the copycat stall, a cook in a spotless apron smiles too widely. On the shelf behind him: a worn notebook.', { who: 'narr' }], ['你好！你好！我的油旋最好！你要一碗油旋吗？', 'Hello, hello! My youxuan are the best! Want a bowl of youxuan?', { who: 'cook' }]]],
    challenge: { lives: 3, objs: ['furong-5-1', 'furong-5-2', 'furong-5-3', 'furong-5-4', 'furong-5-5'],
      fail: [['你不买？下一个！', 'Not buying? Next!', { who: 'cook' }]],
      restart: [['', 'The cook turns back to his griddle. You take a breath and step up again.', { who: 'narr' }], ['你好！你要一碗油旋吗？', 'Hello! Want a bowl of youxuan?', { who: 'cook' }]] },
    steps: [
      { obj: 'furong-5-1', m: ['一个', '不是 碗'], say: [['一个……好，好。还要一个甜沫？', 'One… sure, sure. And one 甜沫?', { who: 'cook' }]], try: ['不是一碗，是一个！'] },
      { obj: 'furong-5-2', need: 'furong-5-1', m: ['一碗', '碗'], say: [['一碗……你中文很好啊。', 'One bowl… your Chinese is good.', { who: 'cook' }]], try: ['不是一个，是一碗！'] },
      { obj: 'furong-5-3', need: 'furong-5-2', m: ['本子', '那是什么', '这是什么', '什么'], say: [['那个本子？是我的！', "That notebook? It's mine!", { who: 'cook' }]], try: ['那是什么？'] },
      { obj: 'furong-5-4', need: 'furong-5-3', m: ['孙师傅', '不是你的', '不是'], say: [['孙……孙师傅的？谁说的？', "Ma… Master Sun's? Who says so?", { who: 'cook' }]], try: ['不是你的！是孙师傅的！'] },
      { obj: 'furong-5-5', need: 'furong-5-4', m: ['给', '请', '拿'], say: [[['好……好。给你。', 'Fine… fine. Here.', { who: 'cook' }], ['', 'He hands the notebook over the counter without meeting your eyes.', { who: 'narr' }], ['朋友！我的本子！谢谢你！', 'Friend! My notebook! Thank you!']]], try: ['请给我！'] },
      { obj: 'furong-5-6', need: 'furong-5-5', m: ['不客气', '@thx', '没', '好'], say: [['走！我请你吃油旋！', 'Come on! Youxuan on me!']], try: ['不客气！'] }
    ],
    done: [['', 'Back at his cart, Master Sun opens the notebook to the first page and laughs out loud.', { who: 'narr' }]],
    words: []
  }
});
