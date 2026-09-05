/**
 * サイトワード（高頻出語）データ
 * Dolch Sight Wordsベースの高頻度語リスト（7-9歳向け中心）
 *
 * blankType:
 *   - 'word': 単語レベルの穴埋め（文中の単語を空欄にする）
 *   - 'char': 文字レベルの穴埋め（単語内の文字を空欄にする）
 *   - 'both': 両方で使用可能
 *
 * phonicsPattern: フォニックスパターン（文字レベル穴埋め時のヒント）
 */

export const SIGHT_WORDS = [
  // --- 基本動詞 ---
  { word: 'are', japanese: '〜です', blankType: 'word', phonicsPattern: 'ar' },
  { word: 'is', japanese: '〜です', blankType: 'word', phonicsPattern: 'is' },
  { word: 'am', japanese: '〜です', blankType: 'word', phonicsPattern: 'am' },
  { word: 'was', japanese: '〜でした', blankType: 'word', phonicsPattern: 'as' },
  { word: 'were', japanese: '〜でした', blankType: 'word', phonicsPattern: 'ere' },
  { word: 'do', japanese: 'する', blankType: 'word', phonicsPattern: 'oo' },
  { word: 'does', japanese: 'する', blankType: 'word', phonicsPattern: 'oe' },
  { word: 'did', japanese: 'した', blankType: 'word', phonicsPattern: 'id' },
  { word: 'have', japanese: 'もっている', blankType: 'both', phonicsPattern: 'ave' },
  { word: 'has', japanese: 'もっている', blankType: 'word', phonicsPattern: 'as' },
  { word: 'can', japanese: 'できる', blankType: 'both', phonicsPattern: 'an' },
  { word: 'will', japanese: '〜するつもり', blankType: 'word', phonicsPattern: 'ill' },
  { word: 'like', japanese: 'すき', blankType: 'both', phonicsPattern: 'ike' },
  { word: 'want', japanese: 'ほしい', blankType: 'both', phonicsPattern: 'ant' },
  { word: 'come', japanese: 'くる', blankType: 'both', phonicsPattern: 'ome' },
  { word: 'go', japanese: 'いく', blankType: 'word', phonicsPattern: 'go' },
  { word: 'see', japanese: 'みる', blankType: 'both', phonicsPattern: 'ee' },
  { word: 'look', japanese: 'みる', blankType: 'both', phonicsPattern: 'ook' },
  { word: 'play', japanese: 'あそぶ', blankType: 'both', phonicsPattern: 'ay' },
  { word: 'make', japanese: 'つくる', blankType: 'both', phonicsPattern: 'ake' },
  { word: 'help', japanese: 'たすける', blankType: 'both', phonicsPattern: 'elp' },
  { word: 'know', japanese: 'しる', blankType: 'both', phonicsPattern: 'ow' },
  { word: 'think', japanese: 'おもう', blankType: 'both', phonicsPattern: 'th' },
  { word: 'thank', japanese: 'おれいを いう', blankType: 'both', phonicsPattern: 'th' },

  // --- 代名詞・冠詞 ---
  { word: 'you', japanese: 'あなた', blankType: 'word', phonicsPattern: 'ou' },
  { word: 'your', japanese: 'あなたの', blankType: 'word', phonicsPattern: 'our' },
  { word: 'my', japanese: 'わたしの', blankType: 'word', phonicsPattern: 'my' },
  { word: 'the', japanese: 'その', blankType: 'word', phonicsPattern: 'th' },
  { word: 'this', japanese: 'これ', blankType: 'both', phonicsPattern: 'th' },
  { word: 'that', japanese: 'あれ', blankType: 'both', phonicsPattern: 'th' },
  { word: 'they', japanese: 'かれら', blankType: 'word', phonicsPattern: 'th' },
  { word: 'we', japanese: 'わたしたち', blankType: 'word', phonicsPattern: 'we' },
  { word: 'he', japanese: 'かれ', blankType: 'word', phonicsPattern: 'he' },
  { word: 'she', japanese: 'かのじょ', blankType: 'word', phonicsPattern: 'sh' },
  { word: 'it', japanese: 'それ', blankType: 'word', phonicsPattern: 'it' },

  // --- 前置詞・接続詞 ---
  { word: 'to', japanese: '〜へ', blankType: 'word', phonicsPattern: 'oo' },
  { word: 'in', japanese: '〜の なかに', blankType: 'word', phonicsPattern: 'in' },
  { word: 'on', japanese: '〜の うえに', blankType: 'word', phonicsPattern: 'on' },
  { word: 'at', japanese: '〜で', blankType: 'word', phonicsPattern: 'at' },
  { word: 'for', japanese: '〜のために', blankType: 'word', phonicsPattern: 'or' },
  { word: 'with', japanese: '〜と いっしょに', blankType: 'both', phonicsPattern: 'ith' },
  { word: 'and', japanese: 'と', blankType: 'word', phonicsPattern: 'and' },
  { word: 'but', japanese: 'でも', blankType: 'word', phonicsPattern: 'ut' },

  // --- 形容詞・副詞 ---
  { word: 'good', japanese: 'よい', blankType: 'both', phonicsPattern: 'oo' },
  { word: 'nice', japanese: 'すてきな', blankType: 'both', phonicsPattern: 'ice' },
  { word: 'fine', japanese: 'げんきな', blankType: 'both', phonicsPattern: 'ine' },
  { word: 'happy', japanese: 'うれしい', blankType: 'both', phonicsPattern: 'appy' },
  { word: 'sorry', japanese: 'ごめん', blankType: 'both', phonicsPattern: 'orry' },
  { word: 'please', japanese: 'おねがい', blankType: 'both', phonicsPattern: 'ea' },
  { word: 'very', japanese: 'とても', blankType: 'word', phonicsPattern: 'ery' },
  { word: 'how', japanese: 'どう', blankType: 'word', phonicsPattern: 'ow' },
  { word: 'what', japanese: 'なに', blankType: 'word', phonicsPattern: 'wh' },
  { word: 'where', japanese: 'どこ', blankType: 'word', phonicsPattern: 'wh' },
  { word: 'when', japanese: 'いつ', blankType: 'word', phonicsPattern: 'wh' },

  // --- 名詞（高頻出） ---
  { word: 'name', japanese: 'なまえ', blankType: 'both', phonicsPattern: 'ame' },
  { word: 'day', japanese: 'ひ', blankType: 'both', phonicsPattern: 'ay' },
  { word: 'time', japanese: 'じかん', blankType: 'both', phonicsPattern: 'ime' },
  { word: 'home', japanese: 'いえ', blankType: 'both', phonicsPattern: 'ome' },
  { word: 'school', japanese: 'がっこう', blankType: 'both', phonicsPattern: 'ool' },
  { word: 'friend', japanese: 'ともだち', blankType: 'both', phonicsPattern: 'iend' },
  { word: 'morning', japanese: 'あさ', blankType: 'both', phonicsPattern: 'ing' },
];

/**
 * サイトワードのセットを取得（wordで検索用）
 */
export const SIGHT_WORD_SET = new Set(SIGHT_WORDS.map((sw) => sw.word.toLowerCase()));

/**
 * サイトワードのマップ（高速検索用）
 */
export const SIGHT_WORD_MAP = new Map(SIGHT_WORDS.map((sw) => [sw.word.toLowerCase(), sw]));
