/**
 * 単語練習用データ
 * カテゴリー別・年齢別の単語リスト
 */

export const WORD_LISTS = {
  animals: {
    '4-6': [
      { english: 'cat', japanese: 'ねこ', syllables: 'cat' },
      { english: 'dog', japanese: 'いぬ', syllables: 'dog' },
      { english: 'bird', japanese: 'とり', syllables: 'bird' },
      { english: 'fish', japanese: 'さかな', syllables: 'fish' },
      { english: 'rabbit', japanese: 'うさぎ', syllables: 'rab-bit' },
    ],
    '7-9': [
      { english: 'elephant', japanese: 'ぞう', syllables: 'el-e-phant' },
      { english: 'monkey', japanese: 'さる', syllables: 'mon-key' },
      { english: 'giraffe', japanese: 'きりん', syllables: 'gi-raffe' },
      { english: 'penguin', japanese: 'ペンギン', syllables: 'pen-guin' },
      { english: 'dolphin', japanese: 'イルカ', syllables: 'dol-phin' },
    ],
    '10-12': [
      { english: 'chimpanzee', japanese: 'チンパンジー', syllables: 'chim-pan-zee' },
      { english: 'rhinoceros', japanese: 'サイ', syllables: 'rhi-noc-er-os' },
      { english: 'hippopotamus', japanese: 'カバ', syllables: 'hip-po-pot-a-mus' },
      { english: 'chameleon', japanese: 'カメレオン', syllables: 'cha-me-le-on' },
      { english: 'crocodile', japanese: 'ワニ', syllables: 'croc-o-dile' },
    ],
  },
  food: {
    '4-6': [
      { english: 'apple', japanese: 'りんご', syllables: 'ap-ple' },
      { english: 'banana', japanese: 'バナナ', syllables: 'ba-na-na' },
      { english: 'rice', japanese: 'ごはん', syllables: 'rice' },
      { english: 'milk', japanese: 'ミルク', syllables: 'milk' },
      { english: 'egg', japanese: 'たまご', syllables: 'egg' },
    ],
    '7-9': [
      { english: 'sandwich', japanese: 'サンドイッチ', syllables: 'sand-wich' },
      { english: 'pizza', japanese: 'ピザ', syllables: 'piz-za' },
      { english: 'hamburger', japanese: 'ハンバーガー', syllables: 'ham-bur-ger' },
      { english: 'spaghetti', japanese: 'スパゲッティ', syllables: 'spa-ghet-ti' },
      { english: 'chocolate', japanese: 'チョコレート', syllables: 'choc-o-late' },
    ],
    '10-12': [
      { english: 'vegetable', japanese: '野菜', syllables: 'veg-e-ta-ble' },
      { english: 'strawberry', japanese: 'いちご', syllables: 'straw-ber-ry' },
      { english: 'watermelon', japanese: 'すいか', syllables: 'wa-ter-mel-on' },
      { english: 'restaurant', japanese: 'レストラン', syllables: 'res-tau-rant' },
      { english: 'breakfast', japanese: '朝食', syllables: 'break-fast' },
    ],
  },
  colors: {
    '4-6': [
      { english: 'red', japanese: 'あか', syllables: 'red' },
      { english: 'blue', japanese: 'あお', syllables: 'blue' },
      { english: 'yellow', japanese: 'きいろ', syllables: 'yel-low' },
      { english: 'green', japanese: 'みどり', syllables: 'green' },
      { english: 'white', japanese: 'しろ', syllables: 'white' },
    ],
    '7-9': [
      { english: 'black', japanese: 'くろ', syllables: 'black' },
      { english: 'orange', japanese: 'オレンジ', syllables: 'or-ange' },
      { english: 'purple', japanese: 'むらさき', syllables: 'pur-ple' },
      { english: 'pink', japanese: 'ピンク', syllables: 'pink' },
      { english: 'brown', japanese: 'ちゃいろ', syllables: 'brown' },
    ],
    '10-12': [
      { english: 'gray', japanese: 'はいいろ', syllables: 'gray' },
      { english: 'silver', japanese: 'ぎんいろ', syllables: 'sil-ver' },
      { english: 'golden', japanese: 'きんいろ', syllables: 'gold-en' },
      { english: 'rainbow', japanese: 'にじ', syllables: 'rain-bow' },
      { english: 'colorful', japanese: 'カラフル', syllables: 'col-or-ful' },
    ],
  },
  numbers: {
    '4-6': [
      { english: 'one', japanese: 'いち', syllables: 'one' },
      { english: 'two', japanese: 'に', syllables: 'two' },
      { english: 'three', japanese: 'さん', syllables: 'three' },
      { english: 'four', japanese: 'よん', syllables: 'four' },
      { english: 'five', japanese: 'ご', syllables: 'five' },
    ],
    '7-9': [
      { english: 'six', japanese: 'ろく', syllables: 'six' },
      { english: 'seven', japanese: 'なな', syllables: 'sev-en' },
      { english: 'eight', japanese: 'はち', syllables: 'eight' },
      { english: 'nine', japanese: 'きゅう', syllables: 'nine' },
      { english: 'ten', japanese: 'じゅう', syllables: 'ten' },
    ],
    '10-12': [
      { english: 'eleven', japanese: 'じゅういち', syllables: 'e-lev-en' },
      { english: 'twelve', japanese: 'じゅうに', syllables: 'twelve' },
      { english: 'thirteen', japanese: 'じゅうさん', syllables: 'thir-teen' },
      { english: 'twenty', japanese: 'にじゅう', syllables: 'twen-ty' },
      { english: 'hundred', japanese: 'ひゃく', syllables: 'hun-dred' },
    ],
  },
  calendar: {
    '4-6': [
      { english: 'Sunday', japanese: 'にちようび', syllables: 'Sun-day' },
      { english: 'Monday', japanese: 'げつようび', syllables: 'Mon-day' },
      { english: 'today', japanese: 'きょう', syllables: 'to-day' },
      { english: 'morning', japanese: 'あさ', syllables: 'morn-ing' },
      { english: 'night', japanese: 'よる', syllables: 'night' },
    ],
    '7-9': [
      { english: 'Tuesday', japanese: 'かようび', syllables: 'Tues-day' },
      { english: 'Wednesday', japanese: 'すいようび', syllables: 'Wed-nes-day' },
      { english: 'Thursday', japanese: 'もくようび', syllables: 'Thurs-day' },
      { english: 'Friday', japanese: 'きんようび', syllables: 'Fri-day' },
      { english: 'Saturday', japanese: 'どようび', syllables: 'Sat-ur-day' },
    ],
    '10-12': [
      { english: 'January', japanese: 'いちがつ', syllables: 'Jan-u-ar-y' },
      { english: 'February', japanese: 'にがつ', syllables: 'Feb-ru-ar-y' },
      { english: 'March', japanese: 'さんがつ', syllables: 'March' },
      { english: 'April', japanese: 'しがつ', syllables: 'A-pril' },
      { english: 'December', japanese: 'じゅうにがつ', syllables: 'De-cem-ber' },
    ],
  },
};
