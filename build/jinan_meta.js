/* 天天 · Jinan v3 district metadata (titles, characters, settings, objectives, unlock levels, story).
   Writes into app/data/jinan.js. Scripts live in app/data/scripts/<district>.js. Usage: node build/jinan_meta.js */
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, '..', 'app', 'data', 'jinan.js');
const src = fs.readFileSync(F, 'utf8');
const head = src.slice(0, src.indexOf('window.JINAN ='));
global.window = {}; eval(src); const J = window.JINAN;
const Q = (id, level, character, title, setting, objs, extra) => ({ id, level, character, title, setting, objectives: objs.map((t, i) => ({ id: `${id}-${i + 1}`, text: t })), ...(extra || {}) });

const META = {
  qushuiting: {
    hsk: 'HSK 1', topic: 'Home & neighbors',
    story: { title: 'Moving in', zh: '搬家', premise: 'Your first week at number 14 Qushuiting Street: keys, neighbors, a teahouse over the stream, and a glossy flyer under the door.',
      recap: 'You moved into number 14. <b>Teacher Zhang</b> handed you the keys, <b>Grandma Wang</b> fed you, and Old Pan turned out to drink tea on your street. Then a glossy flyer came under the door: Mr. Ma wants to buy the courtyards. Grandma Wang showed you to her grandson on a video call and told him she isn\'t selling.' },
    quests: [
      Q('qushuiting-1', 12, 'zhang', 'Your keys', 'The courtyard gate at number 14. Your landlord is waiting with a key.', ['Greet Teacher Zhang', 'Ask where your room is', 'Answer his question', 'Thank him']),
      Q('qushuiting-2', 14, 'wang', 'Neighbor at the stream', "She's washing vegetables in the clear stream outside her door.", ['Say where you live', "Say whether you've eaten", 'Ask what time', 'Thank her']),
      Q('qushuiting-3', 16, 'pan', 'Teahouse over the water', 'A small teahouse over the stream. Old Pan waves you over.', ['Say yes to tea', "Tell him today's date", 'Ask which gentleman', 'React']),
      Q('qushuiting-4', 18, 'lin', 'Your package', 'Sister Lin lives across the courtyard and took in your package.', ['Thank her for the package', 'Say what you can do in Chinese', 'Ask what the flyer is', 'Say how you feel about it']),
      Q('qushuiting-5', 20, 'wang', 'Video call', 'Her doorway. She wants her grandson to meet you on a video call.', ['Greet her grandson', 'Give your name', 'Say where you are from', 'Say what you do here', 'Say whether you like Jinan', 'Tell him the weather', 'Say goodbye'], { challenge: true })
    ]
  },
  baotu: {
    hsk: 'HSK 1', topic: 'Springs & family',
    story: { title: "Grandma Wang's red cup", zh: '王奶奶的红杯子', premise: 'Grandma Wang has lost the little red cup she drinks spring water from every morning. Finding it is how you meet the regulars at Baotu Spring.',
      recap: "Grandma Wang lost the little red cup she drinks spring water from every morning. A photo of Xiao Xie's showed it on a bench, Lele had handed it in at Ms. Chen's window, and you carried it back to the springs." },
    quests: [
      Q('baotu-1', 22, 'chen', 'Park ticket', 'The ticket window at the Baotu Spring gate. Yes, it is Ms. Chen again.', ['Ask for a ticket', "Say you're a student", 'Pay', 'Thank her']),
      Q('baotu-2', 23, 'zhang', 'Morning tai chi', 'Tai chi beside the spring pool. Teacher Zhang is leading the group.', ['Greet Teacher Zhang', 'Say whether you know the group', 'Say where your family is', 'Ask where Grandma Wang is']),
      Q('baotu-cup', 25, 'wang', "Grandma Wang's red cup", "By the benches. Grandma Wang is looking under every seat.", ['Ask what happened', 'Ask what the cup is like', 'Ask where it was', 'Offer to look']),
      Q('baotu-photo', 27, 'xie', 'A photo by the spring', 'By the spring railing. Xiao Xie wants a photo.', ['Agree to take her photo', 'Point out the cup in her photo', 'Say whose cup it is', 'Ask what time she took it']),
      Q('baotu-lost', 28, 'chen', 'Lost and found', "Back at Ms. Chen's window, by the lost-and-found box.", ['Say what you lost', 'Say its color', 'Say its size', 'Say when it was there', 'Say whose it is', 'Thank Lele'], { challenge: true }),
      Q('baotu-return', 30, 'wang', 'Back to Grandma Wang', 'The stone spouts at Black Tiger Spring, where she fills her jugs.', ['Give back her cup', 'Say yes to spring water', "Say you'll come again", 'Answer about Mr. Ma'])
    ]
  },
  furong: {
    hsk: 'HSK 1', topic: 'Food & ordering',
    story: { title: "Master Sun's 油旋", zh: '孙师傅的油旋', premise: "A new stall across Furong Street sells \"Master Sun's 油旋\", and it isn't his. His recipe notebook went missing last week.",
      recap: "A copycat stall opened across from Master Sun, selling his 油旋 under his name, and his recipe notebook had vanished. Grandma Wang saw someone carry it off, Xiao Xie knew the cook worked for Mr. Ma, and you talked the notebook back across the counter." },
    quests: [
      Q('furong-1', 32, 'sun', 'Breakfast', 'His street cart, griddle sizzling.', ['Order 油旋', 'Order a drink', 'Ask the price', 'Ask what is wrong']),
      Q('furong-2', 34, 'sun', 'The missing notebook', 'His cart, between customers. He is not happy.', ['Ask what is missing', 'Ask when', 'Ask who', 'Offer to look for it']),
      Q('furong-3', 36, 'wang', 'Breakfast with Grandma Wang', 'Her favorite breakfast stall. She insists on treating you to 甜沫.', ['Accept', 'Order a bowl', 'Say how it tastes', 'Ask who took the notebook']),
      Q('furong-4', 38, 'xie', 'Lunch with Xiao Xie', 'A busy 把子肉 restaurant. She is starving.', ['Order lunch', 'Ask about the copycat cook', 'React to the news', 'Suggest going together']),
      Q('furong-5', 40, 'sun', 'The copycat stall', "Across the street at the copycat stall. Master Sun waits by his cart.", ['Correct his measure word for 油旋', 'Correct his measure word for 甜沫', 'Ask about the notebook', 'Say whose it is', 'Ask for it back', 'Reply to Master Sun'], { challenge: true })
    ]
  },
  daming: {
    hsk: 'HSK 1', topic: 'Time & weather',
    story: { title: 'The boat times', zh: '船的时间', premise: "Mr. Ma's company has taken over the pier at Daming Lake, and the new timetable is wrong. Boats leave when they like, and nobody can see the lights from the water.",
      recap: "Mr. Ma's company took over the Daming Lake pier and posted a timetable that was simply wrong. Teacher Zhang remembered the real times, Ms. Chen confessed she had never seen 超然楼 light up, and on her day off you found her lost, walked her to the lake, and watched it light up together." },
    quests: [
      Q('daming-1', 42, 'wang', 'Weather with Grandma Wang', 'Willows, a bench by the water.', ['Talk about the weather', 'Suggest a boat ride', 'Agree on a time', 'Say goodbye']),
      Q('daming-2', 44, 'zhang', 'When do the lights come on?', 'A late-afternoon stroll around the lake together.', ['Tell him your plan', 'Ask when the boat leaves', 'Ask what happened', 'Ask when 超然楼 lights up']),
      Q('daming-3', 46, 'chen', 'Rent a boat', 'The boat window at the pier. Yes, it is Ms. Chen again.', ['Say you want a boat', 'Say how many people', 'Ask about the two o\'clock boat', "Ask if she's seen the lights"]),
      Q('daming-4', 48, 'su', 'Photo by the lake', 'Lakeside, 超然楼 behind you. Xiao Su has your phone.', ['Agree to a photo', 'Look at the photo', "Say who's in the background", "Guess what she's doing"]),
      Q('daming-5', 50, 'chen', "Ms. Chen's day off", 'Her day off. Out of uniform, lost, and a little flustered.', ['Ask where she is going', 'Tell her the time', 'Tell her when the lights come on', 'Say where to go first', 'Say how to get there', 'Say what you think of the lights'], { challenge: true })
    ]
  },
  quancheng: {
    hsk: 'HSK 1', topic: 'Shopping',
    story: { title: 'The fake price tag', zh: '假的价格', premise: "Xiao Xie's birthday is coming, so you go shopping on Quancheng Square. Someone is selling copies of Grandma Wang's handmade knots, with a forged tag.",
      recap: "Shopping for Xiao Xie's birthday, you found a shop on the square selling machine-made copies of Grandma Wang's knots under a forged \"handmade\" tag. Sister Lin spotted the fake writing, and the shop turned out to be Mr. Ma's." },
    quests: [
      Q('quancheng-1', 52, 'lin', 'A phone card', 'The phone counter where Sister Lin works.', ['Ask for a phone card', 'Ask the price', 'Hand over your phone', 'Thank her']),
      Q('quancheng-2', 54, 'lin', 'Clothes for the party', 'The clothing floor. You need something for Saturday.', ['Say you want clothes', 'Choose a size', 'Ask the price', 'Buy it']),
      Q('quancheng-3', 56, 'wang', "Grandma Wang's knots", 'Her weekend stall on the square: knots shaped like springs.', ['Say you like her knots', 'Ask the price', "Buy one for Xiao Xie", 'Offer to check the other shop']),
      Q('quancheng-4', 58, 'lin', 'Return the shirt', 'The service desk. You also brought the tag from the other shop.', ['Say the shirt is too small', "Say you don't want it", 'Show her the tag', 'Ask if it is real']),
      Q('quancheng-5', 60, 'lin', 'The forged tag', 'The shop across the square. Sister Lin comes with you.', ["Say it isn't handmade", 'Point at the writing', 'Say who says so', 'Refuse to buy', 'Ask whose shop it is', 'Answer Sister Lin'], { challenge: true })
    ]
  },
  qianfo: {
    hsk: 'HSK 1', topic: 'Directions & the body',
    story: { title: "Teacher Zhang hasn't come down", zh: '张老师没下山', premise: 'Teacher Zhang climbed Qianfo Mountain at dawn, as he does every year, and has not come back. His phone is off.',
      recap: 'Teacher Zhang climbed Qianfo Mountain at dawn and never came down. Ms. Chen saw him start, Dr. Bai saw him rest, Master Sun sold him water, and Xiao Xie beat you to the top. You found him in the temple courtyard, tired and proud, and talked him into riding down with you.' },
    quests: [
      Q('qianfo-1', 62, 'chen', 'The cable car', 'The cable car booth at the foot of the mountain.', ['Ask about Teacher Zhang', 'Say how old he is', 'Ask for a ticket', 'Thank her']),
      Q('qianfo-2', 64, 'bai', 'Halfway up', 'Halfway up the stone steps. A calm hiker is resting.', ['Greet him', 'Ask about Teacher Zhang', 'Ask where he is', 'Ask how far']),
      Q('qianfo-3', 66, 'sun', 'Drink stall', "His weekend stall on a landing. \"What, you again?\"", ['Buy water', 'Ask which way Teacher Zhang went', "Say whether you're hungry", 'Pay']),
      Q('qianfo-4', 68, 'xie', 'The summit', 'The viewpoint at the top. Xiao Xie is already there.', ['Admit she won', 'Ask about Teacher Zhang', 'Suggest checking the temple', 'Agree to a rematch']),
      Q('qianfo-5', 70, 'zhang', 'The temple courtyard', 'The courtyard of 兴国禅寺. Teacher Zhang is sitting under a tree.', ['Greet him politely (您)', 'Ask if he is tired', 'Ask him to take the cable car', 'Ask why he climbs today', 'Offer to go down together'], { challenge: true })
    ]
  },
  shanda: {
    hsk: 'HSK 1', topic: 'School & study',
    story: { title: 'Old photos', zh: '老照片', premise: "Teacher Lü's class is collecting old photos of Jinan. Yours is about Kuanhouli, the street Mr. Ma wants.",
      recap: "Teacher Lü's class collected old photos of Jinan. Xiao Su found a 1950s photo of Kuanhouli, and when Mr. Ma came to class to sell his \"new Kuanhouli\", you held it up and talked back." },
    quests: [
      Q('shanda-1', 72, 'lu', 'First class', "Teacher Lü's classroom.", ['Greet Teacher Lü', 'Give your name', 'Say what you want to learn', 'Join the project']),
      Q('shanda-2', 74, 'su', 'A language partner', 'The campus café.', ['Greet Xiao Su', 'Ask for help', 'Explain the project', 'Agree when to meet']),
      Q('shanda-3', 76, 'lu', 'Homework check', 'Her office hours. Your draft is on the desk.', ['Ask which character is wrong', "Say you'll rewrite it", "Say whether you've been to Kuanhouli", 'Thank her']),
      Q('shanda-4', 78, 'su', 'Canteen lunch', 'The canteen line. Xiao Su has something on his phone.', ['Order lunch', 'React to the photo', 'Ask what year it is from', 'Suggest going to see it']),
      Q('shanda-5', 80, 'lu', 'Mr. Ma comes to class', "Teacher Lü's classroom. A visitor in a very good suit.", ['Say old houses are good', 'Show him the photo', 'Disagree with him', 'Say who lives there', "Tell him what you want", 'Answer Teacher Lü'], { challenge: true })
    ]
  },
  kuanhouli: {
    hsk: 'HSK 1', topic: 'Going out',
    story: { title: 'Everyone', zh: '大家', premise: 'Mr. Ma is making offers on every courtyard in Kuanhouli. You bring the street together for one big dinner.',
      recap: 'Mr. Ma made offers on every courtyard in Kuanhouli, so you gathered everyone for barbecue. Old Pan raised a glass, Xiao Su skipped KTV, and when Mr. Ma came to the table to buy the street, the whole table answered him. Master Sun had already paid the bill.' },
    quests: [
      Q('kuanhouli-1', 82, 'xie', 'Dinner plans', 'Texting on your phone.', ['Invite her to dinner', 'Say where', 'Say when', 'Ask her to tell everyone']),
      Q('kuanhouli-2', 84, 'sun', 'Barbecue for the group', 'His night barbecue stall. Smoke, lanterns, loud tables.', ['Say how many people', 'Order food', 'Order drinks', 'React to his news']),
      Q('kuanhouli-3', 86, 'pan', 'A toast', 'The long table. Old Pan raises a glass.', ['Say cheers', 'React to thirty years', 'Say you like it here', 'Agree with him']),
      Q('kuanhouli-4', 88, 'su', 'Decline politely', 'He wants you to come to KTV with his classmates.', ['Say no politely', 'Suggest next time', 'Say why', 'Ask him to stay']),
      Q('kuanhouli-5', 90, 'xie', 'Mr. Ma at the table', 'End of dinner. Mr. Ma pulls up a chair.', ["Say you won't sell", 'Say what this place is', "Say you don't want a mall", 'Ask if he lives here', 'Tell him not to buy', 'Thank everyone'], { challenge: true })
    ]
  },
  hospital: {
    hsk: 'HSK 1', topic: 'Health',
    story: { title: 'Drink more hot water', zh: '多喝热水', premise: 'Grandma Wang is unwell. Everyone you have met in Jinan is about to turn up at the hospital.',
      recap: 'Grandma Wang fell ill. Xiao Su got her registered, Dr. Bai looked after her, Old Pan raced Xiao Xie in when she fell, and the whole street squeezed into her room with hot water and buns. Mr. Ma came too, with a bag of fruit.' },
    quests: [
      Q('hospital-1', 92, 'su', 'The help desk', 'The hospital help desk. Xiao Su volunteers here.', ["Say who's sick", "Say what's wrong", 'Say where she is', 'Thank him']),
      Q('hospital-2', 95, 'bai', 'See the doctor', "Dr. Bai's consultation room. \"Haven't we met on the mountain?\"", ['Greet Dr. Bai', 'Describe the problem', 'Say since when', 'Ask if it is serious']),
      Q('hospital-3', 97, 'lu', 'Ask for a day off', 'A phone call from the hospital corridor.', ['Ask for leave', 'Explain why', 'Agree to read the text', 'Thank her']),
      Q('hospital-4', 100, 'pan', 'Emergency ride', "Xiao Xie fell on the stairs and can't walk. You call Old Pan.", ['Say what happened', 'Say where you are', 'Say where to go', 'Thank him']),
      Q('hospital-5', 102, 'bai', 'Visiting hours', "Grandma Wang's ward. The whole street is in the corridor.", ['Say how many people', 'Say who you are', 'Say when you will leave', 'Say what you brought', 'Promise to be quiet', 'Welcome Mr. Ma'], { challenge: true })
    ]
  }
};
for (const d of J.districts) {
  const m = META[d.id]; if (!m) continue;
  d.hsk = m.hsk; d.topic = m.topic; d.story = m.story;
  d.quests = m.quests.map((q, i) => ({ ...q, order: i + 1 }));
}
fs.writeFileSync(F, head + 'window.JINAN = ' + JSON.stringify(J) + ';\n');
console.log('ok', J.districts.map((d) => `${d.id}:${d.quests.map((q) => q.level).join(',')}`).join(' '));
