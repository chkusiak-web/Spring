/* Jinan map layout — base art + positions.
   Everything is in % of the base image (x from the left, y from the top), so markers stay locked to the art
   at any window size and zoom.
   - image / imageDetail: the pixel-art map, city view (1×: ground and the ten landmarks) and district view (3×: every
     house, tree and passer-by). Both are 1600 × 1000 and drawn with crisp pixels. The PNGs live in data/jinan-art.js as
     data URLs, because the gray-out reads their pixels and a canvas refuses pixels from file:// images.
   - mask / maskDetail (in jinan-art.js): which district owns each pixel, for graying out locked districts. maskIds is the
     bit order. Streets and water on a border belong to both sides; the long waters need every district along them.
   - spots: the foot of each district's landmark; the name tag hangs just below it and the district view zooms here.
   - quests: position of each quest marker when zoomed into a district. Tweak freely.
   - names: street, water and place labels. roads: [汉字, pinyin, English, vertical, city-view anchors, district-view anchors];
     waters: [汉字, pinyin, English, size, anchor, districts that must all be open before it shows in colour];
     places: [汉字, pinyin, English, anchor, district] (district view only).
   - zoom: district zoom level. Built from the map layout in visual-language/map-layout-v2.js. */
window.JINAN_MAP = {
  width: 1600, height: 1000, zoom: 2.5,
  maskIds: ["west", "hospital", "baotu", "quancheng", "furong", "qushuiting", "kuanhouli", "daming", "qianfo", "shanda"],
  alwaysOpen: [],
  spots: {
    baotu: [27.5, 64.0],
    furong: [41.2, 64.0],
    daming: [68.8, 34.0],
    quancheng: [46.9, 72.2],
    qianfo: [57.9, 91.6],
    west: [6.9, 45.0],
    qushuiting: [45.5, 44.6],
    shanda: [93.8, 38.0],
    kuanhouli: [74.8, 70.0],
    hospital: [6.9, 66.0]
  },
  icons: {},
  labels: {},
  quests: {
    "baotu-1": [27.5, 57.0],
    "baotu-2": [31.4, 59.8],
    "baotu-cup": [31.4, 65.4],
    "baotu-photo": [27.5, 68.2],
    "baotu-lost": [23.6, 65.4],
    "baotu-return": [23.6, 59.8],
    "furong-1": [41.5, 57.3],
    "furong-2": [45.4, 61.0],
    "furong-3": [43.3, 63.1],
    "furong-4": [38.7, 63.0],
    "furong-5": [37.1, 61.0],
    "daming-1": [68.8, 24.9],
    "daming-2": [72.6, 29.3],
    "daming-3": [71.3, 35.6],
    "daming-4": [66.2, 35.6],
    "daming-5": [65.6, 29.0],
    "quancheng-1": [48.8, 66.8],
    "quancheng-2": [51.1, 67.4],
    "quancheng-3": [49.5, 74.1],
    "quancheng-4": [44.3, 74.1],
    "quancheng-5": [42.8, 67.4],
    "qianfo-1": [60.3, 87.5],
    "qianfo-2": [62.2, 87.8],
    "qianfo-3": [60.1, 93.5],
    "qianfo-4": [55.7, 93.5],
    "qianfo-5": [54.3, 87.8],
    "west-1": [7.0, 37.3],
    "west-2": [11.7, 41.3],
    "west-3": [9.9, 49.1],
    "west-4": [3.9, 49.1],
    "west-5": [2.0, 41.3],
    "qushuiting-1": [45.8, 39.3],
    "qushuiting-2": [49.7, 40.9],
    "qushuiting-3": [48.1, 47.5],
    "qushuiting-4": [43.8, 48.3],
    "qushuiting-5": [43.9, 39.4],
    "shanda-1": [93.8, 30.0],
    "shanda-2": [98.1, 34.4],
    "shanda-3": [96.5, 41.4],
    "shanda-4": [91.0, 41.4],
    "shanda-5": [89.6, 34.4],
    "kuanhouli-1": [74.8, 62.4],
    "kuanhouli-2": [78.9, 66.5],
    "kuanhouli-3": [76.7, 73.7],
    "kuanhouli-4": [72.2, 73.1],
    "kuanhouli-5": [70.7, 66.8],
    "hospital-1": [6.9, 58.6],
    "hospital-2": [11.0, 62.7],
    "hospital-3": [9.5, 69.3],
    "hospital-4": [4.3, 69.3],
    "hospital-5": [2.7, 62.7]
  },
  names: {"roads": [["北园大街", "Běiyuán Dàjiē", "Beiyuan Avenue", 0, [[43.8, 10.0]], []], ["泉城路", "Quánchéng Lù", "Quancheng Road", 0, [[62.5, 56.0]], [[27.5, 56.0], [12.5, 56.0], [47.5, 56.0], [62.5, 56.0], [87.5, 56.0]]], ["泺源大街", "Luòyuán Dàjiē", "Luoyuan Avenue", 0, [[67.5, 78.0]], [[37.5, 78.0], [67.5, 78.0], [87.5, 78.0]]], ["经十路", "Jīngshí Lù", "Jingshi Road", 0, [[26.2, 85.6]], [[26.2, 85.6], [68.8, 85.6], [87.5, 85.6]]], ["经七路", "Jīngqī Lù", "Jingqi Road", 0, [[10.6, 36.0]], [[27.5, 36.0], [3.8, 36.0]]], ["顺河街", "Shùnhé Jiē", "Shunhe Street", 1, [[20.0, 25.0]], [[20.0, 45.0], [20.0, 68.0], [20.0, 20.0]]], ["历山路", "Lìshān Lù", "Lishan Road", 1, [[77.5, 30.0]], [[77.5, 30.0], [77.5, 70.0]]], ["千佛山路", "Qiānfóshān Lù", "Qianfoshan Road", 1, [], [[56.2, 72.0]]], ["山大路", "Shāndà Lù", "Shanda Road", 1, [[88.8, 18.0]], [[88.8, 18.0], [88.8, 50.0]]]], "waters": [["黄河", "Huáng Hé", "Yellow River", "big", [50.0, 4.0], ["west", "baotu", "daming", "shanda"]], ["大明湖", "Dàmíng Hú", "Daming Lake", "mid", [51.9, 30.0], ["daming"]], ["护城河", "Hùchéng Hé", "City Moat", "small", [54.4, 17.0], ["baotu", "daming", "furong", "qushuiting", "kuanhouli", "quancheng"]], ["小清河", "Xiǎoqīng Hé", "Xiaoqing River", "small", [14.9, 15.0], ["west", "hospital", "baotu"]]], "places": [["五龙潭", "Wǔlóng Tán", "Five Dragon Pool", [27.5, 35.2], "baotu"], ["泺源堂", "Luòyuán Táng", "Luoyuan Hall", [27.5, 57.2], "baotu"], ["漱玉泉", "Shùyù Quán", "Shuyu Spring", [23.2, 71.6], "baotu"], ["金线泉", "Jīnxiàn Quán", "Golden Thread Spring", [31.6, 71.8], "baotu"], ["珍珠泉", "Zhēnzhū Quán", "Pearl Spring", [50.0, 55.2], "qushuiting"], ["黑虎泉", "Hēihǔ Quán", "Black Tiger Spring", [66.2, 69.0], "kuanhouli"]]}
};
