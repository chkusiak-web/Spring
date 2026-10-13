/* 大明湖 Daming Lake · HSK 1, levels 41–50 · Time & weather
   District story: "The boat times" (船的时间). Mr. Ma's company took over the pier and posted a wrong timetable.
   Grandma Wang wants a sunny boat ride; Teacher Zhang knows the real times and when 超然楼 lights up; Ms. Chen has never
   seen it; Xiao Su's photo catches her, lost on her day off. Finale (challenge, 3 lives): get her to the lake by seven. */
Object.assign(window.JINAN_SCRIPTS.quests, {
  'daming-1': {   // 王奶奶 · level 42
    greet: [],
    open: [['孩子，你看，今天天气真好！明天下雨。', 'Child, look, the weather is lovely today! Tomorrow it rains.']],
    steps: [
      { obj: 'daming-1-1', m: ['天气', '热', '冷', '好', '下雨'], say: [['晴天！不冷，不热。最好的天！', "Sunny! Not cold, not hot. The best kind of day!"]], try: ['今天不热。', '天气很好！'] },
      { obj: 'daming-1-2', need: 'daming-1-1', m: ['船', '坐'], say: [['坐船？好！我也想！', 'A boat ride? Yes! I want to as well!']], try: ['我们去坐船吧！'] },
      { obj: 'daming-1-3', need: 'daming-1-2', m: ['几点', '点'], say: [['下午两点！我先回家……', "Two this afternoon! I'll go home first…"]], try: ['下午两点？', '几点？'] },
      { obj: 'daming-1-4', need: 'daming-1-3', m: ['@bye'], say: [['两点见！', 'See you at two!']], try: ['再见！'] }
    ],
    done: [['', 'Across the water, the old tower 超然楼 catches the light. A new sign on the pier carries a gold logo: 马.', { who: 'narr' }]],
    words: [['船', 'chuán', 'boat'], ['晴', 'qíng', 'sunny']]
  },

  'daming-2': {   // 张老师 · level 44
    greet: [],
    open: [['好，好。很好。你们下午坐船？', 'Good, good. Very good. You are taking a boat this afternoon?']],
    steps: [
      { obj: 'daming-2-1', m: ['船', '对', '是', '两点'], say: [['好！你看那个时间……', 'Good! Look at that timetable…']], try: ['对！两点坐船。'] },
      { obj: 'daming-2-2', need: 'daming-2-1', m: ['几点', '什么时候', '@when'], say: [['上面写着：三点半。不对！船两点走！', 'It says half past three. Wrong! The boat leaves at two!']], try: ['船几点走？'] },
      { obj: 'daming-2-3', need: 'daming-2-2', m: ['怎么', '什么'], say: [['马先生的人……他们的时间都错了。', "Mr. Ma's people… their times are all wrong."]], try: ['怎么了？'] },
      { obj: 'daming-2-4', need: 'daming-2-1', m: ['超然楼', '晚上'], say: [['超然楼？晚上七点！非常好看！', 'Chaoran Tower? Seven in the evening! Beautiful!']], try: ['超然楼几点？'] }
    ],
    done: [['好，好。很好。七点，别忘了！', "Good, good. Very good. Seven o'clock, don't forget!"]],
    words: []
  },

  'daming-3': {   // 陈女士 · level 46
    greet: [],
    open: [['一、二、三……好，下一个！……又是你。', 'One, two, three… OK, next!… You again.']],
    steps: [
      { obj: 'daming-3-1', m: ['船', '坐'], say: [['几个人？', 'How many people?']], try: ['我们要坐船。'] },
      { obj: 'daming-3-2', need: 'daming-3-1', m: ['{n} 个', '两个', '人'], say: [['两个人，一个小时，八十块。', 'Two people, one hour, eighty yuan.']], try: ['两个人。'] },
      { obj: 'daming-3-3', need: 'daming-3-2', m: ['两点', '2点'], say: [['两点？没有。马先生的时间……三点半。', "Two? No. Mr. Ma's timetable… half past three."]], try: ['两点有船吗？'] },
      { obj: 'daming-3-4', need: 'daming-3-3', m: ['超然楼', '看过', '你看'], say: [[['超然楼？我……没看过。晚上我在工作。', "Chaoran Tower? I… have never seen it. In the evenings I'm working."], ['', 'For a second, Ms. Chen looks very tired.', { who: 'narr' }]]], try: ['你看过超然楼吗？'] }
    ],
    done: [['……下一个。', '…Next.']],
    words: []
  },

  'daming-4': {   // 小苏 · level 48
    greet: [],
    open: [['你好！来，我给你们照一张！', "Hi! Come on, I'll take one of you!"]],
    steps: [
      { obj: 'daming-4-1', m: ['好', '谢谢', '能'], say: [['笑一笑！……好！', 'Smile!… Got it!']], try: ['好，谢谢！'] },
      { obj: 'daming-4-2', need: 'daming-4-1', m: ['看'], say: [['你看！很好看！……那个女人是谁？', 'Look! Nice! …Who is that woman?']], try: ['我看看！'] },
      { obj: 'daming-4-3', need: 'daming-4-2', m: ['陈女士', '陈'], say: [['陈女士？她没穿……那个衣服！', "Ms. Chen? She isn't wearing… her uniform!"]], try: ['是陈女士！'] },
      { obj: 'daming-4-4', need: 'daming-4-3', m: ['找', '路', '干', '走', '不知道'], say: [['她在找路？我们去帮她吧！', "Is she lost? Let's go help her!"]], try: ['她在找路？'] }
    ],
    done: [['走！快！', 'Go! Quick!']],
    words: [['照片', 'zhàopiàn', 'photo']]
  },

  'daming-5': {   // 陈女士 · level 50 · finale challenge
    greet: [],
    open: [[['', 'Ms. Chen, in a flowered blouse, is turning in slow circles at a crossroads.', { who: 'narr' }], ['你好……我……我不知道路！', "Hello… I… I don't know the way!"]]],
    challenge: { lives: 3, objs: ['daming-5-2', 'daming-5-3', 'daming-5-4', 'daming-5-5'],
      fail: [['我……我回家了。', "I… I'll just go home."]],
      restart: [['', 'She takes a breath. So do you.', { who: 'narr' }], ['现在几点？', 'What time is it now?']] },
    steps: [
      { obj: 'daming-5-1', m: ['去哪', '哪儿', '去'], say: [['我想看超然楼。现在几点？', 'I want to see Chaoran Tower. What time is it now?']], try: ['你去哪儿？'] },
      { obj: 'daming-5-2', need: 'daming-5-1', m: ['点'], say: [['超然楼几点……那个？', 'And the tower… what time does it…?']], try: ['现在六点。'] },
      { obj: 'daming-5-3', need: 'daming-5-2', m: ['七点', '7点'], say: [['七点！我们先去哪儿？', 'Seven! Where do we go first?']], try: ['晚上七点。'] },
      { obj: 'daming-5-4', need: 'daming-5-3', m: ['先', '船', '那儿'], say: [['坐车？走？', 'By car? On foot?']], try: ['先去船那儿。'] },
      { obj: 'daming-5-5', need: 'daming-5-4', m: ['走', '坐车', '车'], say: [[['好！走吧！', "OK! Let's go!"], ['', 'At seven exactly, 超然楼 lights up gold over the water. Ms. Chen stops walking.', { who: 'narr' }], ['……好看吗？', '…Is it beautiful?']]], try: ['我们走。'] },
      { obj: 'daming-5-6', need: 'daming-5-5', m: ['好看', '很好', '非常', '好'], say: [[['', 'She laughs. It is the first time you have heard her laugh.', { who: 'narr' }], ['我家里有……以前的船的时间！明天我给你们！', "At home I have… the old boat timetable! I'll bring it tomorrow!"]]], try: ['很好！', '非常好！'] }
    ],
    done: [['谢谢你。……下一个！', 'Thank you. …Next!']],
    words: []
  }
});
