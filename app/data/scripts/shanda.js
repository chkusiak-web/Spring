/* 山东大学 Shandong University · HSK 1, levels 71–80 · School & study
   District story: "Old photos" (老照片). Teacher Lü's class collects old photos of Jinan; yours is Kuanhouli. Xiao Su finds
   a 1955 photo of the lane. Finale (challenge, 3 lives, a rival): Mr. Ma visits class to sell his "new Kuanhouli". */
Object.assign(window.JINAN_SCRIPTS.quests, {
  'shanda-1': {   // 吕老师 · level 72
    greet: [],
    open: [['你好！请进来！', 'Hello! Please come in!']],
    steps: [
      { obj: 'shanda-1-1', m: ['@hi', '吕老师'], say: [['你好！你叫什么名字？', "Hello! What's your name?"]], try: ['吕老师，您好！'] },
      { obj: 'shanda-1-2', need: 'shanda-1-1', m: ['{name}', '我叫', '名字'], say: [['好！你想学什么？', 'Great! What do you want to learn?']], try: ['我叫……'] },
      { obj: 'shanda-1-3', need: 'shanda-1-2', m: ['中文', '汉字', '说', '写', '学'], say: [[['很好！我们班……在找济南的老照片。', 'Very good! Our class… is looking for old photos of Jinan.'], ['你也来吧？', 'Will you join in?']]], try: ['我想学中文。'] },
      { obj: 'shanda-1-4', need: 'shanda-1-3', m: ['好', '来', '行', '想'], say: [['太好了！你的……宽厚里。', 'Wonderful! Yours will be… Kuanhouli.']], try: ['好！我来！'] }
    ],
    done: [['下次上课见！', 'See you next class!']],
    words: [['作业', 'zuòyè', 'homework']]
  },

  'shanda-2': {   // 小苏 · level 74
    greet: [],
    open: [['你好！又见面了！', 'Hi! We meet again!']],
    steps: [
      { obj: 'shanda-2-1', m: ['@hi', '小苏'], say: [['今天干什么？', 'What are you up to today?']], try: ['小苏，你好！'] },
      { obj: 'shanda-2-2', need: 'shanda-2-1', m: ['帮忙', '帮'], say: [['能！什么事？', 'Sure! What is it?']], try: ['你能帮忙吗？'] },
      { obj: 'shanda-2-3', need: 'shanda-2-2', m: ['照片', '宽厚里', '老'], say: [['老照片？我知道一个地方！学校的……图书馆！', "Old photos? I know a place! The school's… library!"]], try: ['我们在找宽厚里的老照片。'] },
      { obj: 'shanda-2-4', need: 'shanda-2-3', m: ['明天', '下午', '点', '见'], say: [['好！明天下午见！', 'Great! See you tomorrow afternoon!']], try: ['明天下午见！'] }
    ],
    done: [['', 'He is already searching on his phone before you leave.', { who: 'narr' }]],
    words: []
  },

  'shanda-3': {   // 吕老师 · level 76
    greet: [],
    open: [['你好！请坐。你看，这个字……', 'Hello! Have a seat. Look, this character…']],
    steps: [
      { obj: 'shanda-3-1', m: ['哪个', '什么字', '哪'], say: [['这个：“宽”。你写错了。', 'This one: 宽. You wrote it wrong.']], try: ['哪个字？'] },
      { obj: 'shanda-3-2', need: 'shanda-3-1', m: ['再写', '写', '对不起'], say: [['好！……很好！', 'OK!… Very good!']], try: ['对不起，我再写。'] },
      { obj: 'shanda-3-3', need: 'shanda-3-2', m: ['去过', '没去', '去'], say: [['你一定要去！那边的老房子……非常好看。', 'You must go! The old houses there… are beautiful.']], try: ['我没去过。', '我去过。'] },
      { obj: 'shanda-3-4', need: 'shanda-3-3', m: ['@thx'], say: [['不客气！下次上课见！', "You're welcome! See you in class!"]], try: ['谢谢吕老师！'] }
    ],
    done: [['', 'At the bottom of your draft she writes 「很好！」 and a small smiling face.', { who: 'narr' }]],
    words: []
  },

  'shanda-4': {   // 小苏 · level 78
    greet: [],
    open: [['你好！你吃什么？我要面条。', "Hi! What are you having? I'm getting noodles."]],
    steps: [
      { obj: 'shanda-4-1', m: ['米饭', '面条', '要', '吃'], say: [[['好！你看这个！', 'OK! Look at this!'], ['', 'He holds up his phone: a black-and-white photo of a crowded lane, washing strung overhead, children everywhere.', { who: 'narr' }]]], try: ['我要米饭。'] },
      { obj: 'shanda-4-2', need: 'shanda-4-1', m: ['好看', '真', '很'], say: [['这是宽厚里……很多年前！这个门，现在还在！', 'This is Kuanhouli… many years ago! That gate is still there now!']], try: ['真好看！'] },
      { obj: 'shanda-4-3', need: 'shanda-4-2', m: ['哪年', '几年', '年'], say: [['一九五五年！', '1955!']], try: ['这是哪年？'] },
      { obj: 'shanda-4-4', need: 'shanda-4-3', m: ['去', '看看', '一起'], say: [['好！星期六一起去！', "OK! Let's go together on Saturday!"]], try: ['我们去那边看看吧！'] }
    ],
    done: [['', 'You save the photo to your phone. You have a feeling you will need it.', { who: 'narr' }]],
    words: []
  },

  'shanda-5': {   // 吕老师 + 马先生 · level 80 · finale challenge (a rival)
    greet: [],
    open: [[['同学们，今天……有一个先生来我们班。', 'Class, today… a gentleman is visiting.'], ['大家好！我是马先生。老房子……不好！我想做一个新的宽厚里！', "Hello everyone! I'm Mr. Ma. Old houses… no good! I want to build a new Kuanhouli!", { who: 'ma' }]]],
    challenge: { lives: 3, objs: ['shanda-5-1', 'shanda-5-2', 'shanda-5-3', 'shanda-5-4', 'shanda-5-5'],
      fail: [['好了，好了，学生……', 'Alright, alright, students…', { who: 'ma' }]],
      restart: [['', 'Teacher Lü nods at you: try again.', { who: 'narr' }], ['老房子……不好！', 'Old houses… no good!', { who: 'ma' }]] },
    steps: [
      { obj: 'shanda-5-1', m: ['老房子 好', '好看', '很好'], say: [['好？老房子太老了！', 'Good? Old houses are too old!', { who: 'ma' }]], try: ['老房子很好！'] },
      { obj: 'shanda-5-2', need: 'shanda-5-1', m: ['照片', '看'], say: [['照片？……一九五五年……', 'A photo?… 1955…', { who: 'ma' }]], try: ['你看这个照片！'] },
      { obj: 'shanda-5-3', need: 'shanda-5-2', m: ['不对', '好看', '不是'], say: [['你是学生，你知道什么？', "You're a student. What do you know?", { who: 'ma' }]], try: ['不对！老的也很好看！'] },
      { obj: 'shanda-5-4', need: 'shanda-5-3', m: ['住', '人', '家'], say: [['那……你想怎么样？', 'Then… what do you want?', { who: 'ma' }]], try: ['很多人住在那儿！'] },
      { obj: 'shanda-5-5', need: 'shanda-5-4', m: ['别', '不要', '不能'], say: [[['好，好……我们……下次再说。', "Fine, fine… we'll… talk another time.", { who: 'ma' }], ['', 'He straightens his tie and leaves. The room is silent, then someone claps.', { who: 'narr' }], ['很好！你说得很好！', 'Very good! You spoke very well!']]], try: ['别买！'] },
      { obj: 'shanda-5-6', need: 'shanda-5-5', m: ['@thx', '好'], say: [['下次上课，你介绍宽厚里！', 'Next class, you introduce Kuanhouli!']], try: ['谢谢吕老师！'] }
    ],
    done: [['', 'Afterwards, three classmates ask to come to Kuanhouli with you.', { who: 'narr' }]],
    words: []
  }
});
