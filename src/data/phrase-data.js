/**
 * フレーズ練習用データ
 * カテゴリー別・年齢別のフレーズリスト
 */

const CATEGORY_USAGE_HINT = {
  greetings: 'core',
  self_introduction: 'core',
  school: 'common',
  shopping: 'situational',
  travel: 'situational',
  feelings: 'common',
  daily_life: 'core',
  classroom_english: 'core',
  friend_making: 'common',
  cultural_exchange: 'common',
  emergency_situations: 'critical',
  numbers_math: 'common',
};

const KEY_VOCABULARY_PHRASES = [
  { key: 'thank you', display: 'thank you' },
  { key: "you're welcome", display: "you're welcome" },
  { key: 'excuse me', display: 'excuse me' },
  { key: 'see you later', display: 'see you later' },
  { key: 'see you soon', display: 'see you soon' },
  { key: 'see you tomorrow', display: 'see you tomorrow' },
  { key: 'good luck', display: 'good luck' },
  { key: 'have a good', display: 'have a good' },
  { key: 'take care', display: 'take care' },
  { key: 'nice to meet you', display: 'nice to meet you' },
];

const KEY_VOCABULARY_WORDS = new Map([
  ['please', 'please'],
  ['hello', 'hello'],
  ['morning', 'morning'],
  ['afternoon', 'afternoon'],
  ['evening', 'evening'],
  ['congratulations', 'congratulations'],
  ['sorry', 'sorry'],
  ['introduce', 'introduce'],
  ['favorite', 'favorite'],
  ['hobby', 'hobby'],
  ['passport', 'passport'],
  ['ticket', 'ticket'],
  ['station', 'station'],
  ['airport', 'airport'],
  ['museum', 'museum'],
  ['library', 'library'],
  ['borrow', 'borrow'],
  ['homework', 'homework'],
  ['project', 'project'],
  ['practice', 'practice'],
  ['concert', 'concert'],
  ['because', 'because'],
  ['should', 'should'],
  ['nervous', 'nervous'],
  ['excited', 'excited'],
  ['worried', 'worried'],
  ['hungry', 'hungry'],
  ['thirsty', 'thirsty'],
  ['emergency', 'emergency'],
  ['ambulance', 'ambulance'],
  ['medicine', 'medicine'],
  ['appointment', 'appointment'],
  ['temperature', 'temperature'],
  ['dangerous', 'dangerous'],
  ['earthquake', 'earthquake'],
  ['help', 'help'],
  ['map', 'map'],
  ['change', 'change'],
  ['cash', 'cash'],
  ['credit', 'credit card'],
  ['receipt', 'receipt'],
  ['reservation', 'reservation'],
  ['luggage', 'luggage'],
  ['suitcase', 'suitcase'],
  ['culture', 'culture'],
  ['history', 'history'],
  ['festival', 'festival'],
  ['volunteer', 'volunteer'],
  ['recycle', 'recycle'],
  ['environment', 'environment'],
  ['teamwork', 'teamwork'],
  ['score', 'score'],
  ['competition', 'competition'],
  ['accident', 'accident'],
  ['fire', 'fire'],
  ['allergic', 'allergic'],
  ['nurse', 'nurse'],
  ['doctor', 'doctor'],
  ['train', 'train'],
  ['bus', 'bus'],
  ['subway', 'subway'],
  ['hotel', 'hotel'],
  ['guide', 'guide'],
]);

function inferUsageFrequency(category, english) {
  const base = CATEGORY_USAGE_HINT[category] || 'common';
  const lower = english.toLowerCase();

  if (
    lower.includes('emergency') ||
    lower.includes('help') ||
    category === 'emergency_situations'
  ) {
    return 'critical';
  }
  if (lower.includes('please') || lower.includes('thank')) {
    return 'core';
  }
  if (lower.includes('homework') || lower.includes('practice') || lower.includes('project')) {
    return base === 'core' ? 'core' : 'common';
  }
  return base;
}

function extractFocusWords(english) {
  const focusWords = [];
  const lower = english.toLowerCase();

  for (const phrase of KEY_VOCABULARY_PHRASES) {
    if (lower.includes(phrase.key) && !focusWords.includes(phrase.display)) {
      focusWords.push(phrase.display);
    }
  }

  const tokens = english.match(/[A-Za-z']+/g) || [];
  for (const token of tokens) {
    const normalized = token.toLowerCase();
    if (KEY_VOCABULARY_WORDS.has(normalized)) {
      const display = KEY_VOCABULARY_WORDS.get(normalized) || token;
      if (!focusWords.includes(display)) {
        focusWords.push(display);
      }
    }
  }

  return focusWords;
}

function inferPattern(english) {
  const trimmed = english.trim();
  const lower = trimmed.toLowerCase();

  if (
    /[?？]$/.test(trimmed) ||
    /^(can|could|may|do|does|did|will|would|shall|should|have|has|are|is|am|were|was|where|what|why|how|when|who)\b/.test(
      lower
    )
  ) {
    return 'question';
  }
  if (/^(let's|let us)\b/.test(lower)) {
    return 'invitation';
  }
  if (/^(please|could you|can you|would you|don't forget|remember to|may i)\b/.test(lower)) {
    return 'request';
  }
  if (/^(my name is|i am|i'm|we are|we're)\b/.test(lower)) {
    return 'introduction';
  }
  if (
    /^(yes|no|sure|of course|that's|that is|it's|it is|i can|i will|i'd love|i would|sounds good)/.test(
      lower
    )
  ) {
    return 'response';
  }
  if (/!$/.test(trimmed)) {
    return 'exclamation';
  }
  return 'statement';
}

function inferTags(category, english, pattern) {
  const tags = new Set([category]);
  const lower = english.toLowerCase();

  if (pattern) {
    tags.add(pattern);
  }
  if (lower.includes('please') || lower.includes('thank')) {
    tags.add('polite');
  }
  if (lower.includes('help') || category === 'emergency_situations') {
    tags.add('help');
  }
  if (lower.includes('feel') || category === 'feelings') {
    tags.add('emotion');
  }
  if (lower.includes('favorite') || lower.includes('hobby')) {
    tags.add('preference');
  }
  if (lower.includes('introduce') || category === 'self_introduction') {
    tags.add('introduction');
  }
  if (lower.includes('because')) {
    tags.add('reasoning');
  }
  if (lower.includes('homework') || lower.includes('project') || lower.includes('practice')) {
    tags.add('study');
  }

  return Array.from(tags);
}

function enrichPhrase(phrase, context) {
  const pattern = phrase.pattern || inferPattern(phrase.english);
  const usageFrequency =
    phrase.usageFrequency || inferUsageFrequency(context.category, phrase.english);
  const focusWords = phrase.focusWords || extractFocusWords(phrase.english);
  const tags = phrase.tags || inferTags(context.category, phrase.english, pattern);

  return {
    ...phrase,
    usageFrequency,
    focusWords,
    pattern,
    tags,
  };
}

export const PHRASE_DATA = {
  greetings: {
    '4-6': [
      { english: 'Hello!', japanese: 'こんにちは！', situation: 'ともだちに あった とき' },
      { english: 'Good morning!', japanese: 'おはよう！', situation: 'あさのあいさつ' },
      { english: 'Good night!', japanese: 'おやすみ！', situation: 'ねるとき' },
      { english: 'See you later!', japanese: 'またあとで！', situation: 'わかれるとき' },
      { english: 'Thank you!', japanese: 'ありがとう！', situation: 'かんしゃする とき' },
      { english: 'Hi!', japanese: 'やあ！', situation: 'カジュアルな あいさつ' },
      { english: 'Bye!', japanese: 'バイバイ！', situation: 'わかれるとき' },
      {
        english: 'Good afternoon!',
        japanese: 'こんにちは！（ごごの あいさつ）',
        situation: 'ごごのあいさつ',
      },
      { english: 'Good evening!', japanese: 'こんばんは！', situation: 'ゆうがたの あいさつ' },
      {
        english: 'See you tomorrow!',
        japanese: 'またあした！',
        situation: 'がっこうで わかれる とき',
      },
      { english: 'Welcome!', japanese: 'ようこそ！', situation: 'ひとを むかえる とき' },
      { english: 'Come in!', japanese: 'はいって！', situation: 'いえに まねく とき' },
      {
        english: "You're welcome!",
        japanese: 'どういたしまして！',
        situation: 'おれいを いわれた とき',
      },
      { english: 'Please!', japanese: 'どうぞ！', situation: 'なにかを すすめる とき' },
      { english: 'Excuse me!', japanese: 'ごめんなさい！', situation: 'あやまるとき' },
    ],
    '7-9': [
      { english: 'How are you?', japanese: '元気ですか？', situation: 'あいてのようすを聞くとき' },
      {
        english: "I'm fine, thank you.",
        japanese: '元気です、ありがとう。',
        situation: 'へんじをするとき',
      },
      { english: 'Nice to meet you.', japanese: 'はじめまして。', situation: 'はじめて会うとき' },
      { english: 'Have a good day!', japanese: 'よい一日を！', situation: 'わかれぎわのあいさつ' },
      { english: 'Excuse me.', japanese: 'すみません。', situation: '人に声をかけるとき' },
      {
        english: 'How have you been?',
        japanese: 'さいきんどう？',
        situation: 'ひさしぶりに会ったとき',
      },
      {
        english: 'See you soon!',
        japanese: 'またすぐに！',
        situation: '近いうちに会うよていのとき',
      },
      { english: 'Take care!', japanese: '気をつけて！', situation: 'わかれぎわにしんぱいして' },
      { english: "I'm sorry.", japanese: 'ごめんなさい。', situation: 'あやまるとき' },
      {
        english: "That's okay.",
        japanese: 'だいじょうぶだよ。',
        situation: 'あやまりをうけ入れるとき',
      },
      {
        english: 'Nice to see you again.',
        japanese: 'また会えてうれしい。',
        situation: 'また会ったとき',
      },
      { english: 'Good luck!', japanese: 'がんばって！', situation: 'おうえんするとき' },
      { english: 'Congratulations!', japanese: 'おめでとう！', situation: 'おいわいするとき' },
      { english: 'Welcome back!', japanese: 'おかえり！', situation: '帰ってきた人をむかえるとき' },
      { english: "I'm home!", japanese: 'ただいま！', situation: '家に帰ったとき' },
    ],
    '10-12': [
      {
        english: 'How was your weekend?',
        japanese: '週末はどうでしたか？',
        situation: '月曜日のあいさつ',
      },
      {
        english: 'I hope you have a great day.',
        japanese: 'すばらしい一日になることを願っています。',
        situation: 'ていねいな別れのあいさつ',
      },
      {
        english: "It's been a while.",
        japanese: 'おひさしぶりです。',
        situation: 'ひさしぶりに会ったとき',
      },
      {
        english: 'Take care of yourself.',
        japanese: 'お体に気をつけて。',
        situation: '心配して別れるとき',
      },
      {
        english: "I'm looking forward to seeing you again.",
        japanese: 'また会えるのを楽しみにしています。',
        situation: 'また会うのを期待するとき',
      },
      {
        english: 'How do you do?',
        japanese: 'はじめまして。（フォーマル）',
        situation: 'フォーマルな初対面のあいさつ',
      },
      {
        english: "It's a pleasure to meet you.",
        japanese: 'お会いできて光栄です。',
        situation: 'ていねいな初対面のあいさつ',
      },
      {
        english: 'Have a wonderful day!',
        japanese: 'すてきな一日を！',
        situation: '別れぎわの明るいあいさつ',
      },
      {
        english: 'See you next time!',
        japanese: 'また次回！',
        situation: '次の機会を約束して別れるとき',
      },
      {
        english: 'Long time no see!',
        japanese: 'ひさしぶり！',
        situation: 'カジュアルなひさしぶりのあいさつ',
      },
      { english: "What's up?", japanese: '調子はどう？', situation: 'カジュアルなあいさつ' },
      {
        english: "I'm doing well, thanks.",
        japanese: '元気です、ありがとう。',
        situation: '体調を聞かれたときの返事',
      },
      { english: 'Best wishes!', japanese: '幸運をいのります！', situation: '祝福するとき' },
      {
        english: 'Have a safe trip!',
        japanese: '気をつけて！（旅行）',
        situation: '旅行に行く人へのあいさつ',
      },
      {
        english: 'Welcome to our school!',
        japanese: 'わたしたちの学校へようこそ！',
        situation: '新入生をむかえるとき',
      },
    ],
  },
  self_introduction: {
    '4-6': [
      {
        english: 'My name is Tom.',
        japanese: 'わたしの なまえは トムです。',
        situation: 'じぶんの なまえを いう とき',
      },
      {
        english: 'I am six years old.',
        japanese: 'わたしは 6さいです。',
        situation: 'なんさいかを いう とき',
      },
      {
        english: 'I like apples.',
        japanese: 'わたしは りんごが すきです。',
        situation: 'すきな ものを いう とき',
      },
      {
        english: 'This is my friend.',
        japanese: 'これは わたしの ともだちです。',
        situation: 'ともだちを しょうかいする とき',
      },
      {
        english: 'I am a boy.',
        japanese: 'わたしは おとこのこです。',
        situation: 'おとこか おんなかを つたえるとき',
      },
      {
        english: 'I am a girl.',
        japanese: 'わたしは おんなのこです。',
        situation: 'おとこか おんなかを つたえるとき',
      },
      {
        english: 'I like dogs.',
        japanese: 'わたしは いぬが すきです。',
        situation: 'すきな どうぶつを いう とき',
      },
      {
        english: 'I like cats.',
        japanese: 'わたしは ねこが すきです。',
        situation: 'すきな どうぶつを いう とき',
      },
      {
        english: 'My favorite color is blue.',
        japanese: 'わたしの すきな いろは あおです。',
        situation: 'すきな いろを いう とき',
      },
      {
        english: 'I have a sister.',
        japanese: 'わたしには おねえちゃんが います。',
        situation: 'かぞくに ついて はなす とき',
      },
      {
        english: 'I have a brother.',
        japanese: 'わたしには おにいちゃんが います。',
        situation: 'かぞくに ついて はなす とき',
      },
      {
        english: 'I live in Tokyo.',
        japanese: 'わたしは とうきょうに すんでいます。',
        situation: 'すんでいる ばしょを いう とき',
      },
    ],
    '7-9': [
      {
        english: "I'm from Japan.",
        japanese: 'わたしは日本しゅっしんです。',
        situation: '生まれたところを言うとき',
      },
      {
        english: "I'm in third grade.",
        japanese: 'わたしは3年生です。',
        situation: '学年を言うとき',
      },
      {
        english: 'My hobby is reading.',
        japanese: 'わたしのしゅみは読書です。',
        situation: 'しゅみをしょうかいするとき',
      },
      {
        english: 'I have one brother.',
        japanese: 'わたしには兄弟が一人います。',
        situation: 'かぞくについて話すとき',
      },
      {
        english: 'I like playing soccer.',
        japanese: 'わたしはサッカーをするのがすきです。',
        situation: 'すきなスポーツを言うとき',
      },
      {
        english: 'I like drawing pictures.',
        japanese: 'わたしは絵をかくのがすきです。',
        situation: 'すきなかつどうを言うとき',
      },
      {
        english: 'I live with my family.',
        japanese: 'わたしはかぞくとすんでいます。',
        situation: 'かぞくのことを言うとき',
      },
      {
        english: 'I have a pet dog.',
        japanese: 'わたしはペットの犬をかっています。',
        situation: 'ペットについて話すとき',
      },
      {
        english: 'I go to elementary school.',
        japanese: 'わたしは小学校に通っています。',
        situation: '学校について話すとき',
      },
      {
        english: 'My birthday is in May.',
        japanese: 'わたしのたんじょう日は5月です。',
        situation: 'たんじょう日を言うとき',
      },
      {
        english: 'I can swim.',
        japanese: 'わたしはおよげます。',
        situation: 'できることを言うとき',
      },
      {
        english: 'I want to be a teacher.',
        japanese: 'わたしは先生になりたいです。',
        situation: 'しょうらいのゆめを言うとき',
      },
    ],
    '10-12': [
      {
        english: "I'm interested in science.",
        japanese: 'わたしは科学にきょうみがあります。',
        situation: 'きょうみを伝えるとき',
      },
      {
        english: 'My dream is to become a teacher.',
        japanese: 'わたしのゆめは先生になることです。',
        situation: 'しょうらいのゆめを語るとき',
      },
      {
        english: "I've been studying English for three years.",
        japanese: 'わたしは3年間英語を勉強しています。',
        situation: '学習歴を説明するとき',
      },
      {
        english: "I'm good at playing the piano.",
        japanese: 'わたしはピアノをひくのが得意です。',
        situation: 'とくいなことをしょうかいするとき',
      },
      {
        english: 'I enjoy playing video games.',
        japanese: 'わたしはビデオゲームをするのが楽しいです。',
        situation: 'しゅみを話すとき',
      },
      {
        english: 'I have two younger sisters.',
        japanese: 'わたしには2人の妹がいます。',
        situation: '家族のことをくわしく説明するとき',
      },
      {
        english: 'I was born in Osaka.',
        japanese: 'わたしは大阪で生まれました。',
        situation: '出生地を言うとき',
      },
      {
        english: "I'm a member of the tennis club.",
        japanese: 'わたしはテニス部の一員です。',
        situation: '部活動をしょうかいするとき',
      },
      {
        english: 'I speak both Japanese and English.',
        japanese: 'わたしは日本語と英語の両方を話します。',
        situation: 'ことばの力をしょうかいするとき',
      },
      {
        english: 'My favorite subject is math.',
        japanese: 'わたしの好きな科目は数学です。',
        situation: '好きな科目を言うとき',
      },
      {
        english: "I'm passionate about environmental issues.",
        japanese: 'わたしはかんきょう問題にじょうねつを持っています。',
        situation: '関心事を伝えるとき',
      },
      {
        english: 'I would like to study abroad in the future.',
        japanese: 'わたしはしょうらい、りゅうがくしたいです。',
        situation: 'しょうらいの目標を語るとき',
      },
    ],
  },
  school: {
    '4-6': [
      {
        english: 'I go to school.',
        japanese: 'わたしは がっこうに いきます。',
        situation: 'がっこうに ついて はなす とき',
      },
      {
        english: 'I like my teacher.',
        japanese: 'わたしは せんせいが すきです。',
        situation: 'せんせいに ついて はなす とき',
      },
      {
        english: "Let's play together.",
        japanese: 'いっしょに あそびましょう。',
        situation: 'ともだちを さそう とき',
      },
      {
        english: 'Time for lunch!',
        japanese: 'おひるの じかんです！',
        situation: 'おひるごはんの とき',
      },
      {
        english: 'I can write my name.',
        japanese: 'わたしは じぶんの なまえが かけます。',
        situation: 'かく れんしゅうを する とき',
      },
      {
        english: 'Where is my pencil?',
        japanese: 'わたしの えんぴつは どこ？',
        situation: 'ぶんぼうぐを さがす とき',
      },
      {
        english: 'Can I use the crayon?',
        japanese: 'クレヨンを つかっても いい？',
        situation: 'どうぐを かりる とき',
      },
      {
        english: 'I like art class.',
        japanese: 'わたしは ずこうが すきです。',
        situation: 'すきな じゅぎょうを いう とき',
      },
      {
        english: 'I like music class.',
        japanese: 'わたしは おんがくが すきです。',
        situation: 'すきな じゅぎょうを いう とき',
      },
      {
        english: 'I finished my work.',
        japanese: 'わたしは さぎょうを おえました。',
        situation: 'かだいが おわった とき',
      },
      {
        english: 'May I go to the bathroom?',
        japanese: 'トイレに いっても いいですか？',
        situation: 'トイレに いきたい とき',
      },
      {
        english: 'School is fun!',
        japanese: 'がっこうは たのしい！',
        situation: 'がっこうの かんそうを いう とき',
      },
    ],
    '7-9': [
      {
        english: 'What subject do you like?',
        japanese: 'どの教科がすきですか？',
        situation: 'すきな教科を聞くとき',
      },
      {
        english: 'I have math class next.',
        japanese: 'つぎは算数のじゅぎょうです。',
        situation: 'つぎのじゅぎょうについて話すとき',
      },
      {
        english: 'Can you help me with my homework?',
        japanese: 'しゅくだいをてつだってもらえますか？',
        situation: 'しゅくだいのてだすけをもとめるとき',
      },
      {
        english: 'The test was difficult.',
        japanese: 'テストはむずかしかったです。',
        situation: 'テストのかんそうを言うとき',
      },
      {
        english: 'I did well on the test.',
        japanese: 'わたしはテストでよくできました。',
        situation: 'テストのけっかを知らせるとき',
      },
      {
        english: 'I forgot my textbook.',
        japanese: '教科書をわすれました。',
        situation: 'わすれものをしたとき',
      },
      {
        english: 'May I borrow your eraser?',
        japanese: 'けしゴムをかしてもらえますか？',
        situation: 'ぶんぼうぐをかりるとき',
      },
      {
        english: 'When is the homework due?',
        japanese: 'しゅくだいのしめ切りはいつですか？',
        situation: '出す日を聞くとき',
      },
      {
        english: 'I like science class.',
        japanese: 'わたしは理科がすきです。',
        situation: 'すきな科目を言うとき',
      },
      {
        english: 'We have gym class today.',
        japanese: '今日はたいいくがあります。',
        situation: 'じゅぎょうのよていを言うとき',
      },
      {
        english: 'I need to study more.',
        japanese: 'もっとべんきょうするひつようがあります。',
        situation: 'もっとべんきょうしたいと思ったとき',
      },
      {
        english: 'Our teacher is kind.',
        japanese: 'わたしたちの先生はやさしいです。',
        situation: '先生について話すとき',
      },
    ],
    '10-12': [
      {
        english: 'I need to study for the exam.',
        japanese: '試験のために勉強する必要があります。',
        situation: '試験勉強について話すとき',
      },
      {
        english: 'Our school festival is next month.',
        japanese: '学校祭は来月です。',
        situation: '学校行事について話すとき',
      },
      {
        english: 'I joined the basketball club.',
        japanese: 'わたしはバスケットボール部に入りました。',
        situation: '部活動について話すとき',
      },
      {
        english: 'The presentation went well.',
        japanese: '発表はうまくいきました。',
        situation: '発表の結果を知らせるとき',
      },
      {
        english: 'I have a lot of homework this week.',
        japanese: '今週は宿題がたくさんあります。',
        situation: '宿題の量について話すとき',
      },
      {
        english: 'We have a group project due next Friday.',
        japanese: '来週の金曜日までに、グループプロジェクトを出さなければなりません。',
        situation: 'プロジェクトのしめ切りについて話すとき',
      },
      {
        english: 'I got an A on my report.',
        japanese: 'レポートでAをもらいました。',
        situation: 'せいせきについて知らせるとき',
      },
      {
        english: 'I attend cram school twice a week.',
        japanese: 'わたしは週2回じゅくに通っています。',
        situation: 'じゅくについて話すとき',
      },
      {
        english: 'Our class is preparing for the sports day.',
        japanese: 'わたしたちのクラスは運動会のじゅんびをしています。',
        situation: '学校行事のじゅんびについて話すとき',
      },
      {
        english: 'I was elected as class president.',
        japanese: 'わたしはクラス委員長に選ばれました。',
        situation: '役わりについて知らせるとき',
      },
      {
        english: 'We had a field trip to the museum.',
        japanese: 'わたしたちは博物館に校外学習に行きました。',
        situation: '校外学習について話すとき',
      },
      {
        english: 'I want to improve my English skills.',
        japanese: 'わたしは英語力を向上させたいです。',
        situation: '学習目標を言うとき',
      },
    ],
  },
  daily_life: {
    '4-6': [
      {
        english: 'I wake up at seven.',
        japanese: 'わたしは 7じに おきます。',
        situation: 'おきる じかんを いう とき',
      },
      {
        english: 'I brush my teeth.',
        japanese: 'わたしは はを みがきます。',
        situation: 'はみがきに ついて はなす とき',
      },
      {
        english: "It's time to eat.",
        japanese: 'ごはんの じかんです。',
        situation: 'ごはんの じかんの とき',
      },
      {
        english: 'I help my mom.',
        japanese: 'わたしは おかあさんを てつだいます。',
        situation: 'おてつだいに ついて はなす とき',
      },
      {
        english: 'I wash my face.',
        japanese: 'わたしは かおを あらいます。',
        situation: 'あさの しゅうかんに ついて はなす とき',
      },
      {
        english: 'I get dressed.',
        japanese: 'わたしは ふくを きます。',
        situation: 'きがえるとき',
      },
      {
        english: 'I eat breakfast.',
        japanese: 'わたしは あさごはんを たべます。',
        situation: 'あさごはんに ついて はなす とき',
      },
      {
        english: 'I go to bed at eight.',
        japanese: 'わたしは 8じに ねます。',
        situation: 'ねる じかんを いう とき',
      },
      {
        english: 'I take a bath.',
        japanese: 'わたしは おふろに はいります。',
        situation: 'おふろに ついて はなす とき',
      },
      {
        english: 'I play outside.',
        japanese: 'わたしは そとで あそびます。',
        situation: 'あそびに ついて はなす とき',
      },
      {
        english: 'I watch TV.',
        japanese: 'わたしは テレビを みます。',
        situation: 'テレビを みる とき',
      },
      {
        english: 'I clean my room.',
        japanese: 'わたしは へやを そうじします。',
        situation: 'そうじに ついて はなす とき',
      },
    ],
    '7-9': [
      {
        english: 'What time do you go to bed?',
        japanese: '何時にねますか？',
        situation: 'ねる時間を聞くとき',
      },
      {
        english: 'I usually watch TV after dinner.',
        japanese: 'わたしは夕食後によくテレビを見ます。',
        situation: '夕食後のすごし方を言うとき',
      },
      {
        english: 'Today is a beautiful day.',
        japanese: '今日はとてもよい天気です。',
        situation: '天気について話すとき',
      },
      {
        english: "I'm going to the park.",
        japanese: 'わたしは公園に行くよていです。',
        situation: '出かけるよていを言うとき',
      },
      {
        english: 'I do my homework after school.',
        japanese: 'わたしはほうかごにしゅくだいをします。',
        situation: 'ほうかごのすごし方を言うとき',
      },
      {
        english: 'I take out the trash.',
        japanese: 'わたしはゴミを出します。',
        situation: 'おてつだいについて話すとき',
      },
      {
        english: 'I set the table.',
        japanese: 'わたしはしょくたくのじゅんびをします。',
        situation: 'しょくじのじゅんびをてつだうとき',
      },
      {
        english: "It's raining today.",
        japanese: '今日は雨がふっています。',
        situation: '雨の日について話すとき',
      },
      {
        english: 'I practice piano every day.',
        japanese: 'わたしは毎日ピアノをれんしゅうします。',
        situation: 'ならいごとについて話すとき',
      },
      {
        english: 'I walk my dog.',
        japanese: 'わたしは犬のさんぽをします。',
        situation: 'ペットのせわについて話すとき',
      },
      {
        english: 'I read a book before bed.',
        japanese: 'わたしはねる前に本を読みます。',
        situation: 'ねる前のしゅうかんを言うとき',
      },
      {
        english: 'I help with cooking.',
        japanese: 'わたしはりょうりをてつだいます。',
        situation: 'りょうりのてつだいについて話すとき',
      },
    ],
    '10-12': [
      {
        english: 'I have a busy schedule today.',
        japanese: '今日はいそがしいスケジュールです。',
        situation: 'いそがしい日について話すとき',
      },
      {
        english: 'I prefer to exercise in the morning.',
        japanese: 'わたしは朝に運動するのが好きです。',
        situation: '運動のしゅうかんについて話すとき',
      },
      {
        english: "We're planning a family trip.",
        japanese: 'わたしたちは家族旅行を計画しています。',
        situation: '旅行の計画について話すとき',
      },
      {
        english: "I'm trying to eat more vegetables.",
        japanese: 'わたしはもっと野菜を食べるようにしています。',
        situation: '食生活のかいぜんについて話すとき',
      },
      {
        english: 'I usually wake up at six thirty.',
        japanese: 'わたしはふだん6時半に起きます。',
        situation: '起きる時間について話すとき',
      },
      {
        english: 'I commute to school by bicycle.',
        japanese: 'わたしは自転車で通学しています。',
        situation: '通学方法について話すとき',
      },
      {
        english: 'I spend about two hours on homework.',
        japanese: 'わたしは宿題に約2時間かけます。',
        situation: '勉強時間について話すとき',
      },
      {
        english: 'I try to get eight hours of sleep.',
        japanese: 'わたしは8時間のすいみんを取るようにしています。',
        situation: 'すいみんのしゅうかんについて話すとき',
      },
      {
        english: 'I help with household chores on weekends.',
        japanese: 'わたしは週末に家事を手伝います。',
        situation: '週末の手伝いについて話すとき',
      },
      {
        english: 'I manage my time using a schedule.',
        japanese: 'わたしはスケジュールを使って時間を管理しています。',
        situation: '時間管理について話すとき',
      },
      {
        english: 'I enjoy listening to music while studying.',
        japanese: 'わたしは勉強しながら音楽を聞くのが好きです。',
        situation: '勉強方法について話すとき',
      },
      {
        english: 'I make my own lunch on school days.',
        japanese: 'わたしは学校がある日は自分でおべんとうを作ります。',
        situation: 'おべんとう作りについて話すとき',
      },
    ],
  },
  shopping: {
    '4-6': [
      {
        english: 'I want this.',
        japanese: 'これが ほしいです。',
        situation: 'ほしい ものを つたえる とき',
      },
      { english: 'How much?', japanese: 'いくら？', situation: 'ねだんを きく とき' },
      { english: 'Thank you.', japanese: 'ありがとう。', situation: 'かいものを おえる とき' },
      {
        english: 'Can I have one?',
        japanese: 'ひとつください。',
        situation: 'ほしい ものを たのむ とき',
      },
      {
        english: 'I like this one.',
        japanese: 'これがすきです。',
        situation: 'ほしい ものを えらぶ とき',
      },
      {
        english: 'Can I see that?',
        japanese: 'あれを みせて もらえますか？',
        situation: 'ほしい ものを みたい とき',
      },
      {
        english: 'This is too big.',
        japanese: 'これは おおき すぎます。',
        situation: 'サイズが あわない とき',
      },
      {
        english: 'This is too small.',
        japanese: 'これは ちいさ すぎます。',
        situation: 'サイズが あわない とき',
      },
      {
        english: 'I need help.',
        japanese: 'てつだって ください。',
        situation: 'おみせの ひとに たすけを もとめる とき',
      },
      {
        english: "I'll buy this.",
        japanese: 'これをかいます。',
        situation: 'かうことを きめた とき',
      },
      {
        english: 'Can I have a bag?',
        japanese: 'ふくろを もらえますか？',
        situation: 'ふくろが ほしい とき',
      },
      {
        english: 'Where is the candy?',
        japanese: 'おかしは どこですか？',
        situation: 'おかしうりばを さがす とき',
      },
    ],
    '7-9': [
      {
        english: 'How much is this?',
        japanese: 'これはいくらですか？',
        situation: 'ねだんをたずねるとき',
      },
      {
        english: 'Can I buy this?',
        japanese: 'これを買ってもいいですか？',
        situation: '買うきょかをもとめるとき',
      },
      {
        english: 'I need a bag.',
        japanese: 'ふくろがひつようです。',
        situation: 'ふくろをもらうとき',
      },
      {
        english: 'Where is the toy section?',
        japanese: 'おもちゃ売り場はどこですか？',
        situation: '売り場をさがすとき',
      },
      {
        english: 'Is this on sale?',
        japanese: 'これはセール中ですか？',
        situation: 'セールをたしかめるとき',
      },
      {
        english: 'Do you have any more?',
        japanese: 'もっとありますか？',
        situation: 'のこりがあるかをたしかめるとき',
      },
      {
        english: 'Can I get a receipt?',
        japanese: 'レシートをもらえますか？',
        situation: 'レシートがほしいとき',
      },
      {
        english: 'Where can I pay?',
        japanese: 'どこではらえますか？',
        situation: 'レジのばしょを聞くとき',
      },
      {
        english: 'I have enough money.',
        japanese: '十分なお金があります。',
        situation: 'お金が足りることをたしかめるとき',
      },
      {
        english: 'This is my favorite store.',
        japanese: 'これはわたしのお気に入りの店です。',
        situation: 'お気に入りの店について話すとき',
      },
      {
        english: 'Can I return this?',
        japanese: 'これをへんぴんできますか？',
        situation: 'へんぴんしたいとき',
      },
      {
        english: 'Where is the bookstore?',
        japanese: '本やはどこですか？',
        situation: '本やをさがすとき',
      },
    ],
    '10-12': [
      {
        english: 'Do you have this in another color?',
        japanese: '他の色はありますか？',
        situation: '色ちがいをさがすとき',
      },
      {
        english: 'Can I try this on?',
        japanese: 'これを試着してもいいですか？',
        situation: '試着したいとき',
      },
      { english: "I'll take this one.", japanese: 'これにします。', situation: '買うと決めたとき' },
      {
        english: 'Can I pay by card?',
        japanese: 'カードではらえますか？',
        situation: 'しはらい方法をたしかめるとき',
      },
      {
        english: 'Do you have this in a larger size?',
        japanese: 'もっと大きいサイズはありますか？',
        situation: '大きいサイズをさがすとき',
      },
      {
        english: "I'm looking for a birthday present.",
        japanese: 'たんじょう日プレゼントをさがしています。',
        situation: 'プレゼントをさがすとき',
      },
      {
        english: 'Can I get a discount?',
        japanese: 'わりびきしてもらえますか？',
        situation: 'わりびきを希望するとき',
      },
      {
        english: 'Is there a warranty?',
        japanese: 'ほしょうはありますか？',
        situation: 'ほしょうをたしかめるとき',
      },
      {
        english: 'Can you gift wrap this?',
        japanese: 'これをプレゼント用につつんでもらえますか？',
        situation: 'ギフトラッピングをたのむとき',
      },
      {
        english: "I'm just looking, thank you.",
        japanese: '見ているだけです、ありがとう。',
        situation: '店員に声をかけられたとき',
      },
      {
        english: 'Where is the fitting room?',
        japanese: '試着室はどこですか？',
        situation: '試着室をさがすとき',
      },
      {
        english: "Can I exchange this if it doesn't fit?",
        japanese: 'サイズが合わない場合、こうかんできますか？',
        situation: 'こうかんについてたしかめるとき',
      },
    ],
  },
  travel: {
    '4-6': [
      {
        english: 'Where are we going?',
        japanese: 'どこにいくの？',
        situation: 'いきさきを きく とき',
      },
      {
        english: 'Are we there yet?',
        japanese: 'もうついた？',
        situation: 'ついたかを たしかめる とき',
      },
      { english: "I'm tired.", japanese: 'つかれた。', situation: 'つかれたと つたえる とき' },
      { english: "Let's go!", japanese: 'いこう！', situation: 'しゅっぱつする とき' },
      {
        english: 'Can I sit here?',
        japanese: 'ここに すわっても いい？',
        situation: 'せきを たしかめる とき',
      },
      {
        english: 'I need to go to the bathroom.',
        japanese: 'トイレに いきたい。',
        situation: 'トイレに いきたい とき',
      },
      {
        english: "I'm hungry.",
        japanese: 'おなかがすいた。',
        situation: 'おなかが すいたと つたえる とき',
      },
      {
        english: "I'm thirsty.",
        japanese: 'のどがかわいた。',
        situation: 'のどが かわいたと つたえる とき',
      },
      {
        english: 'Can we stop here?',
        japanese: 'ここでとまれる？',
        situation: 'やすみを もとめる とき',
      },
      { english: 'I see a bus!', japanese: 'バスがみえる！', situation: 'バスを みつけた とき' },
      { english: 'Wait for me!', japanese: 'まって！', situation: 'まって ほしい とき' },
      {
        english: 'This is fun!',
        japanese: 'たのしい！',
        situation: 'りょこうを たのしんでいる とき',
      },
    ],
    '7-9': [
      {
        english: 'Where is the station?',
        japanese: 'えきはどこですか？',
        situation: 'えきをさがすとき',
      },
      {
        english: 'What time does it leave?',
        japanese: '何時にしゅっぱつしますか？',
        situation: 'しゅっぱつの時間を聞くとき',
      },
      {
        english: 'I need a ticket.',
        japanese: 'チケットがひつようです。',
        situation: 'チケットを買うとき',
      },
      {
        english: 'Is this seat taken?',
        japanese: 'このせきは空いていますか？',
        situation: 'せきをたしかめるとき',
      },
      {
        english: 'Which bus should I take?',
        japanese: 'どのバスにのればいいですか？',
        situation: 'バスをたしかめるとき',
      },
      {
        english: 'When does the next train arrive?',
        japanese: 'つぎの電車はいつ来ますか？',
        situation: 'つぎの電車をたしかめるとき',
      },
      {
        english: 'Can you tell me when to get off?',
        japanese: 'いつおりればいいか教えてもらえますか？',
        situation: 'おりるえきをたしかめるとき',
      },
      {
        english: 'How much is the fare?',
        japanese: 'りょうきんはいくらですか？',
        situation: 'りょうきんを聞くとき',
      },
      {
        english: 'We got on the wrong train.',
        japanese: 'まちがった電車にのってしまいました。',
        situation: 'のりまちがえたとき',
      },
      {
        english: 'Where can I buy a ticket?',
        japanese: 'どこでチケットを買えますか？',
        situation: 'チケット売り場をさがすとき',
      },
      {
        english: 'Is this the right platform?',
        japanese: 'これは正しいホームですか？',
        situation: 'ホームをたしかめるとき',
      },
      {
        english: 'I lost my ticket.',
        japanese: 'チケットをなくしました。',
        situation: 'チケットをなくしたとき',
      },
    ],
    '10-12': [
      {
        english: 'Could you tell me how to get there?',
        japanese: 'そこへの行き方を教えていただけますか？',
        situation: '道をたずねるとき',
      },
      {
        english: 'What platform does it leave from?',
        japanese: '何番ホームから出発しますか？',
        situation: 'ホームをたしかめるとき',
      },
      {
        english: 'Is there a direct train?',
        japanese: '直通電車はありますか？',
        situation: '乗りかえをたしかめるとき',
      },
      {
        english: 'How long does it take?',
        japanese: 'どのくらい時間がかかりますか？',
        situation: '所要時間を聞くとき',
      },
      {
        english: 'Do I need to transfer?',
        japanese: '乗りかえる必要がありますか？',
        situation: '乗りかえの必要かどうかをたしかめるとき',
      },
      {
        english: 'Where should I transfer?',
        japanese: 'どこで乗りかえればいいですか？',
        situation: '乗りかえ駅を聞くとき',
      },
      {
        english: 'Is this train going to Tokyo?',
        japanese: 'この電車は東京に行きますか？',
        situation: '行き先をたしかめるとき',
      },
      {
        english: 'Can I reserve a seat?',
        japanese: '席を予約できますか？',
        situation: 'せきの予約について聞くとき',
      },
      {
        english: 'What is the platform number for the express train?',
        japanese: '急行電車のホーム番号は何番ですか？',
        situation: '急行電車のホームを聞くとき',
      },
      {
        english: 'I would like to buy a round-trip ticket.',
        japanese: 'おうふくチケットを買いたいです。',
        situation: 'おうふくのきっぷを買うとき',
      },
      {
        english: 'Does this bus stop at the museum?',
        japanese: 'このバスは博物館に止まりますか？',
        situation: 'バスの停車駅をたしかめるとき',
      },
      {
        english: 'Excuse me, I think this is my seat.',
        japanese: 'すみません、これはわたしの席だと思います。',
        situation: '席のまちがいを教えるとき',
      },
    ],
  },
  feelings: {
    '4-6': [
      { english: "I'm happy!", japanese: 'うれしい！', situation: 'うれしいと つたえる とき' },
      { english: "I'm sad.", japanese: 'かなしい。', situation: 'かなしいと つたえる とき' },
      { english: "I'm angry.", japanese: 'おこってる。', situation: 'おこったと つたえる とき' },
      { english: "I'm scared.", japanese: 'こわい。', situation: 'こわい きもちを つたえる とき' },
      { english: 'I love you!', japanese: 'だいすき！', situation: 'すきだと つたえる とき' },
      {
        english: "I'm okay.",
        japanese: 'だいじょうぶ。',
        situation: 'だいじょうぶだと つたえる とき',
      },
      { english: "I'm sleepy.", japanese: 'ねむい。', situation: 'ねむいと つたえる とき' },
      {
        english: "I'm excited!",
        japanese: 'ワクワクする！',
        situation: 'わくわくすると つたえる とき',
      },
      {
        english: "I don't like it.",
        japanese: 'すきじゃない。',
        situation: 'きらいだと つたえる とき',
      },
      {
        english: "I'm surprised!",
        japanese: 'びっくりした！',
        situation: 'びっくりしたと つたえる とき',
      },
      { english: 'That hurts!', japanese: 'いたい！', situation: 'いたみを つたえる とき' },
      { english: "I'm sorry.", japanese: 'ごめんなさい。', situation: 'あやまるとき' },
    ],
    '7-9': [
      {
        english: "I'm excited!",
        japanese: 'ワクワクする！',
        situation: 'わくわくするきもちをつたえるとき',
      },
      { english: "I'm worried.", japanese: 'しんぱいだ。', situation: 'しんぱいをつたえるとき' },
      { english: "I'm bored.", japanese: 'たいくつだ。', situation: 'たいくつをつたえるとき' },
      {
        english: "I'm proud of you.",
        japanese: 'あなたをほこりに思う。',
        situation: 'ほこりをつたえるとき',
      },
      {
        english: "I'm nervous.",
        japanese: 'きんちょうしてる。',
        situation: 'きんちょうをつたえるとき',
      },
      {
        english: "I'm curious.",
        japanese: '気になる。',
        situation: 'ふしぎに思うきもちをつたえるとき',
      },
      {
        english: "I'm jealous.",
        japanese: 'うらやましい。',
        situation: 'うらやましいきもちをつたえるとき',
      },
      {
        english: "I'm embarrassed.",
        japanese: 'はずかしい。',
        situation: 'はずかしさをつたえるとき',
      },
      {
        english: 'I feel lonely.',
        japanese: 'さびしい。',
        situation: 'ひとりぼっちのきもちをつたえるとき',
      },
      { english: "I'm relieved.", japanese: 'ホッとした。', situation: 'あんしんをつたえるとき' },
      {
        english: "I'm confused.",
        japanese: 'こんらんしてる。',
        situation: 'こんらんをつたえるとき',
      },
      {
        english: 'I feel great!',
        japanese: 'さいこうの気分！',
        situation: 'すばらしい気分をつたえるとき',
      },
    ],
    '10-12': [
      {
        english: "I'm frustrated.",
        japanese: 'イライラする。',
        situation: 'フラストレーションを伝えるとき',
      },
      { english: 'I feel confident.', japanese: '自信がある。', situation: '自信を伝えるとき' },
      { english: "I'm disappointed.", japanese: 'がっかりした。', situation: '失望を伝えるとき' },
      {
        english: "I'm grateful for your help.",
        japanese: 'あなたの助けにかんしゃしています。',
        situation: 'かんしゃを伝えるとき',
      },
      {
        english: "I'm overwhelmed.",
        japanese: 'あっとうされている。',
        situation: 'あっとうされていることを伝えるとき',
      },
      {
        english: 'I feel anxious about the test.',
        japanese: 'テストのことで不安です。',
        situation: '不安を伝えるとき',
      },
      {
        english: "I'm inspired by your story.",
        japanese: 'あなたの話に、とても感動しました。',
        situation: '感動を伝えるとき',
      },
      {
        english: "I'm homesick.",
        japanese: 'ホームシックです。',
        situation: 'ホームシックを伝えるとき',
      },
      {
        english: 'I feel proud of my achievement.',
        japanese: '自分の成果をほこりに思います。',
        situation: '達成感を伝えるとき',
      },
      {
        english: "I'm sympathetic to your situation.",
        japanese: 'あなたの気持ち、よくわかります。',
        situation: '思いやりを伝えるとき',
      },
      {
        english: 'I feel motivated to do better.',
        japanese: 'もっと良くしようというやる気がわきます。',
        situation: '気持ちを伝えるとき',
      },
      {
        english: "I'm content with my life.",
        japanese: '自分の人生に満足しています。',
        situation: '満足を伝えるとき',
      },
    ],
  },
  classroom_english: {
    '4-6': [
      {
        english: 'Listen carefully.',
        japanese: 'よくきいて。',
        situation: 'ちゅういを うながす とき',
      },
      {
        english: 'Repeat after me.',
        japanese: 'わたしの あとに ついて いって。',
        situation: 'まねして いうのを もとめる とき',
      },
      {
        english: 'Raise your hand.',
        japanese: 'てをあげて。',
        situation: 'てを あげるのを もとめる とき',
      },
      { english: 'Good job!', japanese: 'よくできました！', situation: 'ほめるとき' },
      {
        english: 'Sit down, please.',
        japanese: 'すわって ください。',
        situation: 'すわるのを うながす とき',
      },
      {
        english: 'Stand up, please.',
        japanese: 'たってください。',
        situation: 'たつのを うながす とき',
      },
      {
        english: 'Be quiet.',
        japanese: 'しずかにして。',
        situation: 'しずかに するよう うながす とき',
      },
      {
        english: 'Look at the board.',
        japanese: 'こくばんをみて。',
        situation: 'こくばんを みるよう うながす とき',
      },
      {
        english: 'Open your book.',
        japanese: 'ほんをひらいて。',
        situation: 'ほんを ひらくよう うながす とき',
      },
      {
        english: 'Close your book.',
        japanese: 'ほんをとじて。',
        situation: 'ほんを とじるよう うながす とき',
      },
      {
        english: "Let's start!",
        japanese: 'はじめましょう！',
        situation: 'じゅぎょうを はじめる とき',
      },
      {
        english: 'Try again!',
        japanese: 'もう いちど やって みて！',
        situation: 'もう いちど やるのを うながす とき',
      },
    ],
    '7-9': [
      {
        english: 'May I go to the bathroom?',
        japanese: 'トイレに行ってもいいですか？',
        situation: 'トイレのきょかをもとめるとき',
      },
      { english: "I don't understand.", japanese: '分かりません。', situation: 'わからないとき' },
      {
        english: 'Can you help me?',
        japanese: 'てつだってもらえますか？',
        situation: 'たすけをもとめるとき',
      },
      {
        english: 'How do you spell it?',
        japanese: 'どうつづりますか？',
        situation: 'スペルを聞くとき',
      },
      {
        english: 'Can you say that again?',
        japanese: 'もういちど言ってもらえますか？',
        situation: '聞きかえすとき',
      },
      {
        english: 'I have a question.',
        japanese: 'しつもんがあります。',
        situation: 'しつもんがあるとき',
      },
      {
        english: 'I finished my work.',
        japanese: 'さぎょうをおえました。',
        situation: 'かだいがおわったとき',
      },
      {
        english: "I'm ready.",
        japanese: 'じゅんびができました。',
        situation: 'じゅんびができたことをつたえるとき',
      },
      {
        english: 'Can you speak louder?',
        japanese: 'もっと大きな声で話してもらえますか？',
        situation: '声が小さいとき',
      },
      {
        english: 'What does this word mean?',
        japanese: 'このたんごはどういういみですか？',
        situation: 'たんごのいみを聞くとき',
      },
      { english: 'May I answer?', japanese: '答えてもいいですか？', situation: '答えたいとき' },
      {
        english: 'Can I work with a partner?',
        japanese: 'パートナーといっしょにさぎょうしてもいいですか？',
        situation: 'ペアワークをしたいとき',
      },
    ],
    '10-12': [
      {
        english: 'How does this connect to the lesson?',
        japanese: 'これは今日のじゅぎょうとどうつながっていますか？',
        situation: 'ないようとじゅぎょうのつながりをたしかめるとき',
      },
      {
        english: 'Why is this important?',
        japanese: 'なぜこれは大切なのですか？',
        situation: '学ぶ意味や大切さをたずねるとき',
      },
      {
        english: 'May I ask a question?',
        japanese: 'しつもんしてもいいですか？',
        situation: 'しつもんしてよいか聞くとき',
      },
      {
        english: 'I have a different opinion.',
        japanese: 'わたしはちがう意見があります。',
        situation: 'ちがう意見を言うとき',
      },
      {
        english: 'Could you speak more slowly?',
        japanese: 'もっとゆっくり話していただけますか？',
        situation: '話すペースをおそくしてほしいとき',
      },
      {
        english: 'I need more time to finish.',
        japanese: '終えるのにもっと時間が必要です。',
        situation: '時間をのばしてほしいとき',
      },
      {
        english: "I'm not sure I understand.",
        japanese: 'りかいできているか自信がありません。',
        situation: 'りかいがあやふやなとき',
      },
      {
        english: 'Can you give me an example?',
        japanese: '例を挙げてもらえますか？',
        situation: '具体例を求めるとき',
      },
      {
        english: 'I would like to add something.',
        japanese: '何か付け加えたいことがあります。',
        situation: '追加発言したいとき',
      },
      {
        english: 'Could you clarify that point?',
        japanese: 'その点をはっきりさせていただけますか？',
        situation: 'はっきりさせたいとき',
      },
      {
        english: 'I agree with your opinion.',
        japanese: 'あなたの意見にさんせいです。',
        situation: 'さんせいを表明するとき',
      },
      {
        english: 'May I present my idea?',
        japanese: '自分の考えを発表してもいいですか？',
        situation: 'アイデア発表のきょかを求めるとき',
      },
    ],
  },
  friend_making: {
    '4-6': [
      { english: "Let's play!", japanese: 'あそぼう！', situation: 'あそびに さそう とき' },
      {
        english: 'Be my friend.',
        japanese: 'わたしの ともだちに なって。',
        situation: 'ともだちに なりたい とき',
      },
      { english: 'Share with me.', japanese: 'わけて。', situation: 'わけて ほしい とき' },
      { english: "That's cool!", japanese: 'かっこいい！', situation: 'あいてを ほめる とき' },
      {
        english: 'Can I play with you?',
        japanese: 'いっしょに あそんでも いい？',
        situation: 'あそびに くわわりたい とき',
      },
      {
        english: 'What is your name?',
        japanese: 'なまえは なんですか？',
        situation: 'なまえを きく とき',
      },
      { english: 'I like you!', japanese: 'あなたがすき！', situation: 'すきだと つたえる とき' },
      {
        english: 'You are nice.',
        japanese: 'あなたは やさしいね。',
        situation: 'やさしさを ほめる とき',
      },
      { english: 'Do you want this?', japanese: 'これほしい？', situation: 'なにかを わける とき' },
      {
        english: "Let's be friends!",
        japanese: 'ともだちに なろう！',
        situation: 'ともだちに なろうと さそう とき',
      },
      {
        english: 'Can I sit here?',
        japanese: 'ここに すわっても いい？',
        situation: 'となりに すわりたい とき',
      },
      {
        english: 'You are funny!',
        japanese: 'おもしろいね！',
        situation: 'おもしろさを ほめる とき',
      },
    ],
    '7-9': [
      {
        english: 'Do you want to play with us?',
        japanese: 'いっしょにあそばない？',
        situation: 'グループにさそうとき',
      },
      {
        english: 'What do you like to do?',
        japanese: '何をするのがすき？',
        situation: 'しゅみを聞くとき',
      },
      {
        english: "You're really good at this!",
        japanese: 'これ本当に上手だね！',
        situation: 'じょうずなところをほめるとき',
      },
      {
        english: "Let's hang out sometime.",
        japanese: 'いつかあそぼうよ。',
        situation: 'やくそくをするとき',
      },
      {
        english: 'Can I join you?',
        japanese: 'なかまに入れてもらえる？',
        situation: 'グループにくわわりたいとき',
      },
      {
        english: 'Where do you live?',
        japanese: 'どこにすんでるの？',
        situation: 'すんでいるばしょを聞くとき',
      },
      { english: 'What grade are you in?', japanese: '何年生？', situation: '学年を聞くとき' },
      {
        english: "That's awesome!",
        japanese: 'すごいね！',
        situation: 'おどろきやほめるきもちをつたえるとき',
      },
      {
        english: 'We should be friends.',
        japanese: '友だちになろうよ。',
        situation: 'ゆうじょうをていあんするとき',
      },
      {
        english: 'Do you have any hobbies?',
        japanese: 'しゅみはある？',
        situation: 'しゅみについて聞くとき',
      },
      {
        english: 'Can I have your phone number?',
        japanese: 'でんわばんごうを教えてもらえる？',
        situation: 'れんらくさきをこうかんするとき',
      },
      {
        english: 'You are a good friend.',
        japanese: 'あなたはよい友だちだね。',
        situation: 'ゆうじょうをつたえるとき',
      },
    ],
    '10-12': [
      {
        english: 'We have a lot in common.',
        japanese: 'わたしたちには共通点が多いね。',
        situation: '共通点を見つけたとき',
      },
      {
        english: 'Would you like to join our group?',
        japanese: 'わたしたちのグループに参加しない？',
        situation: 'グループにさそうとき',
      },
      {
        english: 'I really enjoy talking with you.',
        japanese: 'あなたと話すのが本当に楽しい。',
        situation: '会話を楽しんでいるとき',
      },
      {
        english: 'Thanks for being such a good friend.',
        japanese: 'こんなに良い友達でいてくれてありがとう。',
        situation: 'ゆうじょうにかんしゃするとき',
      },
      {
        english: 'I appreciate your friendship.',
        japanese: 'あなたのゆうじょうにかんしゃしています。',
        situation: 'ゆうじょうへのかんしゃを伝えるとき',
      },
      {
        english: 'You can always count on me.',
        japanese: 'いつでもたよってね。',
        situation: 'しんらいを伝えるとき',
      },
      {
        english: 'I admire your personality.',
        japanese: 'あなたのせいかくをそんけいします。',
        situation: '人がらをほめるとき',
      },
      {
        english: "Let's stay in touch.",
        japanese: 'れんらくを取り合おうね。',
        situation: 'これからもれんらくを取り合おうとさそうとき',
      },
      {
        english: 'I value our friendship.',
        japanese: 'わたしたちのゆうじょうを大切にしています。',
        situation: 'ゆうじょうの大切さを伝えるとき',
      },
      {
        english: 'Would you like to exchange social media?',
        japanese: 'SNSをこうかんしない？',
        situation: 'SNSアカウントをこうかんするとき',
      },
      {
        english: "You're a great listener.",
        japanese: 'あなたは話を聞くのが上手だね。',
        situation: '聞き上手をほめるとき',
      },
      {
        english: "I'm glad we became friends.",
        japanese: '友達になれてうれしいです。',
        situation: 'ゆうじょうへの喜びを伝えるとき',
      },
    ],
  },
  cultural_exchange: {
    '4-6': [
      {
        english: 'This is from Japan.',
        japanese: 'これは にほんの ものです。',
        situation: 'にほんの ものを しょうかいする とき',
      },
      {
        english: 'We eat with chopsticks.',
        japanese: 'わたしたちは おはしで たべます。',
        situation: 'たべものの ことを せつめいする とき',
      },
      {
        english: 'Do you have this?',
        japanese: 'これもってる？',
        situation: 'あいての ぶんかに ついて きく とき',
      },
      {
        english: "It's fun!",
        japanese: 'たのしいよ！',
        situation: 'ぶんかたいけんの かんそうを いう とき',
      },
      {
        english: 'I like sushi.',
        japanese: 'おすしが すきです。',
        situation: 'にほんの たべものに ついて はなす とき',
      },
      {
        english: 'This is a kimono.',
        japanese: 'これは きものです。',
        situation: 'にほんの きものを しょうかいする とき',
      },
      {
        english: 'What is this?',
        japanese: 'これは なんですか？',
        situation: 'しらない ものに ついて きく とき',
      },
      {
        english: 'Can you show me?',
        japanese: 'みせてもらえる？',
        situation: 'みせて ほしい とき',
      },
      {
        english: 'I want to try it!',
        japanese: 'やってみたい！',
        situation: 'たいけん したい とき',
      },
      {
        english: 'This looks yummy!',
        japanese: 'おいしそう！',
        situation: 'たべものの かんそうを いう とき',
      },
      {
        english: 'We say "arigatou."',
        japanese: 'わたしたちは 「ありがとう」と いいます。',
        situation: 'にほんごを おしえる とき',
      },
      {
        english: "That's different!",
        japanese: 'それはちがうね！',
        situation: 'ちがいに きづいた とき',
      },
    ],
    '7-9': [
      {
        english: 'In Japan, we celebrate New Year like this.',
        japanese: '日本ではこのようにお正月をいわいます。',
        situation: '日本のぎょうじをせつめいするとき',
      },
      {
        english: "What's your traditional food?",
        japanese: 'あなたの国のでんとうのりょうりは何ですか？',
        situation: 'あいての食べもののぶんかを聞くとき',
      },
      {
        english: 'Can you teach me your language?',
        japanese: 'あなたの言語を教えてもらえる？',
        situation: '言語を学びたいとき',
      },
      {
        english: 'This is a Japanese game.',
        japanese: 'これは日本のゲームです。',
        situation: '日本のあそびをしょうかいするとき',
      },
      {
        english: 'How do you say this in your language?',
        japanese: 'あなたの言語でこれは何て言いますか？',
        situation: '日本語でなんと言うか聞くとき',
      },
      {
        english: 'We have a similar custom.',
        japanese: 'にたしゅうかんがあります。',
        situation: 'にているところを教えるとき',
      },
      {
        english: 'This is a Japanese festival.',
        japanese: 'これは日本のおまつりです。',
        situation: '日本のまつりをしょうかいするとき',
      },
      {
        english: "What's your country famous for?",
        japanese: 'あなたの国は何でゆうめいですか？',
        situation: 'あいての国について聞くとき',
      },
      {
        english: 'I want to visit your country.',
        japanese: 'あなたの国に行ってみたいです。',
        situation: '行ってみたいきもちをつたえるとき',
      },
      {
        english: 'We bow when we greet.',
        japanese: 'わたしたちはあいさつするときにおじぎをします。',
        situation: '日本のマナーをせつめいするとき',
      },
      {
        english: 'Can you teach me how to use chopsticks?',
        japanese: 'はしのつかい方を教えてもらえますか？',
        situation: 'つかい方を教えてほしいとき',
      },
      {
        english: 'This is very interesting!',
        japanese: 'これはとてもおもしろいです！',
        situation: 'きょうみをつたえるとき',
      },
    ],
    '10-12': [
      {
        english: 'Our culture values respect and harmony.',
        japanese: 'わたしたちの文化では、相手をうやまう心となかよくすることを大切にします。',
        situation: '文化の考え方を説明するとき',
      },
      {
        english: 'How do you celebrate this festival?',
        japanese: 'このお祭りはどのように祝いますか？',
        situation: '祭りの祝い方を聞くとき',
      },
      {
        english: "I'd like to learn more about your country.",
        japanese: 'あなたの国についてもっと知りたいです。',
        situation: '相手の国にきょうみをしめすとき',
      },
      {
        english: 'Cultural differences are interesting.',
        japanese: '文化のちがいはおもしろいです。',
        situation: '文化のちがいをみとめるとき',
      },
      {
        english: 'What are the main traditions in your culture?',
        japanese: 'あなたの文化の主なでんとうは何ですか？',
        situation: 'でんとうについて聞くとき',
      },
      {
        english: 'I appreciate the opportunity to learn about your culture.',
        japanese: 'あなたの文化について学ぶ機会にかんしゃします。',
        situation: 'かんしゃを伝えるとき',
      },
      {
        english: 'Cultural exchange enriches both of us.',
        japanese: '文化交流はわたしたち両方をゆたかにします。',
        situation: '文化交流のよさを伝えるとき',
      },
      {
        english: 'What is the significance of this symbol?',
        japanese: 'このシンボルの意味は何ですか？',
        situation: 'シンボルの意味を聞くとき',
      },
      {
        english: 'I respect your cultural practices.',
        japanese: 'あなたの文化やしゅうかんを大切にします。',
        situation: '大切にする気持ちを伝えるとき',
      },
      {
        english: 'Our countries have different customs.',
        japanese: 'わたしたちの国にはちがうしゅうかんがあります。',
        situation: 'ちがいを教えるとき',
      },
      {
        english: 'I would love to experience your culture firsthand.',
        japanese: 'あなたの文化をじかに体験したいです。',
        situation: '体験したい気持ちを伝えるとき',
      },
      {
        english: 'Cultural diversity makes the world interesting.',
        japanese: 'いろいろな文化があることが、世界をおもしろくします。',
        situation: 'いろいろな文化のよさを伝えるとき',
      },
    ],
  },
  emergency_situations: {
    '4-6': [
      {
        english: 'Help me!',
        japanese: 'わたしを たすけて！',
        situation: 'たすけが ひつような とき',
      },
      { english: "I'm lost.", japanese: 'まいごになった。', situation: 'みちに まよった とき' },
      { english: 'It hurts.', japanese: 'いたい。', situation: 'いたみを つたえる とき' },
      {
        english: 'Call my mom.',
        japanese: 'ママに でんわして。',
        situation: 'おうちの ひとに しらせて ほしい とき',
      },
      { english: "I'm scared.", japanese: 'こわい。', situation: 'こわいと かんじている とき' },
      {
        english: 'Where is my mom?',
        japanese: 'ママはどこ？',
        situation: 'おうちの ひとを さがしている とき',
      },
      {
        english: "I can't find my way.",
        japanese: 'みちが わからない。',
        situation: 'みちに まよった とき',
      },
      {
        english: 'Please help!',
        japanese: 'たすけて ください！',
        situation: 'ていねいに たすけを もとめる とき',
      },
      {
        english: "I don't feel good.",
        japanese: 'きぶんがわるい。',
        situation: 'ぐあいが わるいと つたえる とき',
      },
      {
        english: 'I need a grown-up.',
        japanese: 'おとなの ひとに きて ほしいです。',
        situation: 'おとなの たすけが ひつような とき',
      },
      {
        english: "It's an emergency!",
        japanese: 'たいへんです！',
        situation: 'たいへんだと つたえる とき',
      },
      {
        english: 'Call 911!',
        japanese: '911に でんわして！',
        situation: 'たすけを よんで ほしい とき',
      },
    ],
    '7-9': [
      {
        english: 'I need help.',
        japanese: 'たすけがひつようです。',
        situation: 'たすけをもとめるとき',
      },
      {
        english: 'Where is the hospital?',
        japanese: 'びょういんはどこですか？',
        situation: 'びょういんをさがすとき',
      },
      {
        english: "I don't feel well.",
        japanese: '気分がわるいです。',
        situation: 'ぐあいがわるいことをつたえるとき',
      },
      {
        english: 'Can you call an ambulance?',
        japanese: 'きゅうきゅう車をよんでもらえますか？',
        situation: 'きゅうきゅう車がひつようなとき',
      },
      {
        english: 'Someone is hurt.',
        japanese: 'だれかがケガをしています。',
        situation: 'ほかの人のケガを知らせるとき',
      },
      {
        english: 'I need to see a doctor.',
        japanese: 'おいしゃさんに見てもらうひつようがあります。',
        situation: 'ちりょうをもとめるとき',
      },
      {
        english: "I can't find my parents.",
        japanese: 'りょうしんが見つかりません。',
        situation: '親とはなれたとき',
      },
      {
        english: 'Where is the nearest police station?',
        japanese: 'いちばん近いけいさつしょはどこですか？',
        situation: 'けいさつしょをさがすとき',
      },
      {
        english: 'My friend is missing.',
        japanese: '友だちがいなくなりました。',
        situation: '友だちがいなくなったとき',
      },
      {
        english: 'I have a fever.',
        japanese: 'ねつがあります。',
        situation: 'ねつが出たことをつたえるとき',
      },
      {
        english: 'Can you help me find my way?',
        japanese: '道を見つけるのをてつだってもらえますか？',
        situation: '道あんないをもとめるとき',
      },
      {
        english: 'I twisted my ankle.',
        japanese: '足首をひねりました。',
        situation: 'ケガを知らせるとき',
      },
    ],
    '10-12': [
      {
        english: 'This is an emergency.',
        japanese: 'これはきんきゅうじたいです。',
        situation: 'いそいでほしいと伝えるとき',
      },
      {
        english: 'I need to contact my parents.',
        japanese: '両親にれんらくする必要があります。',
        situation: '親へのれんらくが必要なとき',
      },
      {
        english: 'Is there a doctor nearby?',
        japanese: '近くに医者はいますか？',
        situation: '医者をさがすとき',
      },
      {
        english: 'Please call the police.',
        japanese: 'けいさつをよんでください。',
        situation: 'けいさつが必要なとき',
      },
      {
        english: 'I need immediate medical attention.',
        japanese: 'きんきゅうのちりょうが必要です。',
        situation: 'きんきゅうのちりょうを求めるとき',
      },
      {
        english: 'Someone has been injured.',
        japanese: 'だれかがケガをしました。',
        situation: 'ケガ人を知らせるとき',
      },
      {
        english: 'Where is the emergency exit?',
        japanese: 'ひじょうぐちはどこですか？',
        situation: 'ひじょうぐちをさがすとき',
      },
      {
        english: 'I witnessed an accident.',
        japanese: 'じこを見ました。',
        situation: 'じこを知らせるとき',
      },
      {
        english: 'Can you direct me to the nearest hospital?',
        japanese: 'いちばん近い病院まで案内してもらえますか？',
        situation: '病院への道を聞くとき',
      },
      {
        english: 'I have important medical information.',
        japanese: '体について、知っておいてほしいことがあります。',
        situation: '体のことを伝えるとき',
      },
      {
        english: 'Please remain calm.',
        japanese: '落ち着いてください。',
        situation: '相手を落ち着かせるとき',
      },
      {
        english: 'I need to report a missing person.',
        japanese: '行方不明者を知らせる必要があります。',
        situation: '行方不明を知らせるとき',
      },
    ],
  },
  numbers_math: {
    '4-6': [
      {
        english: 'One plus one equals two.',
        japanese: '1たす1は 2です。',
        situation: 'たしざんの きほん',
      },
      {
        english: 'I have two apples.',
        japanese: 'わたしは リンゴを 2つ もっています。',
        situation: 'かずを かぞえる とき',
      },
      {
        english: 'Three minus one equals two.',
        japanese: '3ひく1は 2です。',
        situation: 'ひきざんの きほん',
      },
      {
        english: 'Five is bigger than three.',
        japanese: '5は 3より おおきいです。',
        situation: 'かずの くらべかた',
      },
      {
        english: 'I can count to ten.',
        japanese: '10まで かぞえられます。',
        situation: 'かぞえかた',
      },
      {
        english: 'Two plus three equals five.',
        japanese: '2たす3は 5です。',
        situation: 'たしざんの れんしゅう',
      },
      {
        english: 'Four is smaller than six.',
        japanese: '4は 6より ちいさいです。',
        situation: 'かずの おおきい・ちいさい',
      },
      {
        english: 'I have one, two, three pencils.',
        japanese: 'えんぴつが 1、2、3ほん あります。',
        situation: 'じゅんばんに かぞえる',
      },
      {
        english: 'Four plus two equals six.',
        japanese: '4たす2は 6です。',
        situation: 'たしざんの れんしゅう',
      },
      {
        english: 'Six minus two equals four.',
        japanese: '6ひく2は 4です。',
        situation: 'ひきざんの れんしゅう',
      },
      {
        english: 'I can count to twenty.',
        japanese: '20まで かぞえられます。',
        situation: 'かずの れんしゅう',
      },
      {
        english: 'Seven is bigger than five.',
        japanese: '7は 5より おおきいです。',
        situation: 'かずの くらべかた',
      },
      {
        english: 'Three plus four equals seven.',
        japanese: '3たす4は 7です。',
        situation: 'たしざん',
      },
      {
        english: 'Eight minus three equals five.',
        japanese: '8ひく3は 5です。',
        situation: 'ひきざん',
      },
      {
        english: 'I have five fingers.',
        japanese: 'わたしは ゆびが 5ほん あります。',
        situation: 'からだを かぞえる',
      },
      {
        english: 'Nine is bigger than seven.',
        japanese: '9は 7より おおきいです。',
        situation: 'かずの くらべかた',
      },
      {
        english: 'Five plus five equals ten.',
        japanese: '5たす5は 10です。',
        situation: 'たしざん',
      },
      {
        english: 'Ten minus four equals six.',
        japanese: '10ひく4は 6です。',
        situation: 'ひきざん',
      },
      {
        english: 'Count from one to ten.',
        japanese: '1から 10まで かぞえて。',
        situation: 'かぞえる れんしゅう',
      },
      {
        english: 'I see three birds.',
        japanese: 'とりが 3わ みえます。',
        situation: 'どうぶつを かぞえる とき',
      },
      {
        english: 'Six plus one equals seven.',
        japanese: '6たす1は 7です。',
        situation: 'たしざん',
      },
      {
        english: 'Seven minus two equals five.',
        japanese: '7ひく2は 5です。',
        situation: 'ひきざん',
      },
      {
        english: 'Which number is bigger?',
        japanese: 'どちらの すうじが おおきいですか？',
        situation: 'かずの くらべかた',
      },
      {
        english: 'I have four toys.',
        japanese: 'わたしは おもちゃを 4つ もっています。',
        situation: 'もちものを かぞえる',
      },
      {
        english: 'What comes after five?',
        japanese: '5の つぎは なんですか？',
        situation: 'かずの じゅんばん',
      },
      {
        english: 'I am first in line.',
        japanese: 'わたしが れつの 1ばんめです。',
        situation: 'じゅんばんを あらわす',
      },
      {
        english: 'You are second, I am third.',
        japanese: 'あなたが 2ばんめ、わたしが 3ばんめです。',
        situation: 'じゅんばんの かず',
      },
      {
        english: 'Zero means nothing.',
        japanese: 'ゼロは なにも ないと いう いみです。',
        situation: 'ゼロのこと',
      },
      {
        english: 'I see two circles and one square.',
        japanese: 'まるが 2つと しかくが 1つ みえます。',
        situation: 'かたちを かぞえる',
      },
      {
        english: 'How many stars are there?',
        japanese: 'ほしは いくつ ありますか？',
        situation: 'かずをたずねる',
      },
      {
        english: 'Eight plus one equals nine.',
        japanese: '8たす1は 9です。',
        situation: 'たしざん',
      },
      {
        english: 'Nine minus three equals six.',
        japanese: '9ひく3は 6です。',
        situation: 'ひきざん',
      },
      { english: "It's three o'clock.", japanese: '3じです。', situation: 'じこくのきほん' },
      {
        english: 'I have more than you.',
        japanese: 'わたしの ほうが あなたより おおいです。',
        situation: 'かずの くらべかた',
      },
      {
        english: 'You have less than me.',
        japanese: 'あなたは わたしより すくないです。',
        situation: 'かずの くらべかた',
      },
      {
        english: 'We have the same number.',
        japanese: 'わたしたちは おなじ かずを もっています。',
        situation: 'おなじかず',
      },
      {
        english: 'This pencil is longer than that one.',
        japanese: 'この ペンは あちらより ながいです。',
        situation: 'ながさの くらべかた',
      },
      {
        english: 'I am taller than you.',
        japanese: 'わたしは あなたより せが たかいです。',
        situation: 'たかさの くらべかた',
      },
      {
        english: 'Your book is thicker than mine.',
        japanese: 'あなたの ほんは わたしのより あついです。',
        situation: 'あつさの くらべかた',
      },
      {
        english: 'This rope is shorter than that rope.',
        japanese: 'この ロープは あの ロープより みじかいです。',
        situation: 'みじかさの くらべかた',
      },
    ],
    '7-9': [
      {
        english: 'Ten plus five equals fifteen.',
        japanese: '10たす5は15です。',
        situation: '2けたの足し算',
      },
      {
        english: 'Twenty is two tens.',
        japanese: '20は10が2つです。',
        situation: 'くらいのかんがえ方',
      },
      {
        english: 'Fifteen is one ten and five ones.',
        japanese: '15は10が1つと1が5つです。',
        situation: 'くらいの分け方',
      },
      {
        english: 'Ten is one less than eleven.',
        japanese: '10は11より1小さいです。',
        situation: '数のくらべ方',
      },
      {
        english: 'I have twelve pencils and you have eight.',
        japanese: 'わたしはえんぴつを12本、あなたは8本もっています。',
        situation: 'ぶんしょうだい',
      },
      {
        english: 'Half of ten is five.',
        japanese: '10の半分は5です。',
        situation: '半分のかんがえ方',
      },
      {
        english: 'Thirteen is three more than ten.',
        japanese: '13は10より3大きいです。',
        situation: 'ひきざんの計算',
      },
      {
        english: 'Twenty minus seven equals thirteen.',
        japanese: '20ひく7は13です。',
        situation: '2けたの引き算',
      },
      {
        english: 'Thirty is three tens.',
        japanese: '30は10が3つです。',
        situation: 'くらいのかんがえ方',
      },
      {
        english: 'Eighteen plus twelve equals thirty.',
        japanese: '18たす12は30です。',
        situation: '2けたの足し算',
      },
      {
        english: 'Twenty-five is two tens and five ones.',
        japanese: '25は10が2つと1が5つです。',
        situation: 'くらいの分け方',
      },
      {
        english: 'Count by twos: two, four, six, eight.',
        japanese: '2ずつ数える：2、4、6、8。',
        situation: 'スキップカウント',
      },
      {
        english: 'Count by fives: five, ten, fifteen, twenty.',
        japanese: '5ずつ数える：5、10、15、20。',
        situation: 'スキップカウント',
      },
      {
        english: 'Half of twenty is ten.',
        japanese: '20の半分は10です。',
        situation: '半分のかんがえ方',
      },
      {
        english: 'One quarter of twenty is five.',
        japanese: '20の4分の1は5です。',
        situation: '分数のきほん',
      },
      {
        english: 'Forty minus fifteen equals twenty-five.',
        japanese: '40ひく15は25です。',
        situation: '2けたの引き算',
      },
      {
        english: 'Fourteen is four more than ten.',
        japanese: '14は10より4大きいです。',
        situation: 'ひきざんの計算',
      },
      {
        english: 'Thirty-two is thirty plus two.',
        japanese: '32は30たす2です。',
        situation: 'くらいのりかい',
      },
      {
        english: 'Count by tens: ten, twenty, thirty, forty.',
        japanese: '10ずつ数える：10、20、30、40。',
        situation: 'スキップカウント',
      },
      {
        english: 'I have fifty cents.',
        japanese: 'わたしは50セントもっています。',
        situation: 'お金を数える',
      },
      {
        english: 'Twenty-three is twenty and three.',
        japanese: '23は20と3です。',
        situation: 'くらいの分け方',
      },
      {
        english: 'Twelve plus eighteen equals thirty.',
        japanese: '12たす18は30です。',
        situation: '2けたの足し算',
      },
      {
        english: 'Fifty is five tens.',
        japanese: '50は10が5つです。',
        situation: 'くらいのかんがえ方',
      },
      {
        english: 'Thirty-six minus twenty-one equals fifteen.',
        japanese: '36ひく21は15です。',
        situation: '2けたの引き算',
      },
      {
        english: 'Two times three equals six.',
        japanese: '2かける3は6です。',
        situation: 'かけ算のきほん',
      },
      {
        english: 'Three times four equals twelve.',
        japanese: '3かける4は12です。',
        situation: 'かけ算',
      },
      {
        english: 'Four times five equals twenty.',
        japanese: '4かける5は20です。',
        situation: 'かけ算',
      },
      {
        english: 'Six divided by two equals three.',
        japanese: '6わる2は3です。',
        situation: 'わり算のきほん',
      },
      {
        english: 'Eight divided by four equals two.',
        japanese: '8わる4は2です。',
        situation: 'わり算',
      },
      { english: "It's half past three.", japanese: '3時半です。', situation: '時こく（30分）' },
      {
        english: "It's quarter past four.",
        japanese: '4時15分です。',
        situation: '時こく（15分）',
      },
      {
        english: 'One meter is one hundred centimeters.',
        japanese: '1メートルは100センチメートルです。',
        situation: '長さのたんい',
      },
      {
        english: 'One kilogram is one thousand grams.',
        japanese: '1キログラムは1000グラムです。',
        situation: 'おもさのたんい',
      },
      {
        english: 'How much does it weigh?',
        japanese: 'それはどれくらいのおもさですか？',
        situation: 'おもさをたずねる',
      },
      {
        english: 'How long is this?',
        japanese: 'これはどれくらいの長さですか？',
        situation: '長さをたずねる',
      },
      {
        english: 'I have thirty-seven marbles, you have twenty-four.',
        japanese: 'わたしはビー玉を37こ、あなたは24こもっています。',
        situation: 'ぶんしょうだい',
      },
      {
        english: 'If I buy two pencils at five dollars each, I pay ten dollars.',
        japanese: 'えんぴつを1本5ドルで2本買ったら、10ドルはらいます。',
        situation: 'かけ算のぶんしょうだい',
      },
      {
        english: 'Sixty-five is five more than sixty.',
        japanese: '65は60より5大きいです。',
        situation: 'ひきざんの計算',
      },
      {
        english: 'Two plus two plus two equals six.',
        japanese: '2たす2たす2は6です。',
        situation: 'つづけての足し算',
      },
      {
        english: 'Twenty-nine is one less than thirty.',
        japanese: '29は30より1小さいです。',
        situation: '数のくらべ方',
      },
      {
        english: 'This line is shorter than that line.',
        japanese: 'この線はあの線よりみじかいです。',
        situation: '長さのくらべ方',
      },
      {
        english: 'This box is heavier than that box.',
        japanese: 'このはこはあのはこよりおもいです。',
        situation: 'おもさのくらべ方',
      },
      {
        english: 'My bag is lighter than your bag.',
        japanese: 'わたしのカバンはあなたのカバンよりかるいです。',
        situation: 'かるさのくらべ方',
      },
      {
        english: 'The river is wider than the stream.',
        japanese: '川は小川よりはばが広いです。',
        situation: 'はばのくらべ方',
      },
      {
        english: 'This building is taller than that house.',
        japanese: 'このたてものはあの家より高いです。',
        situation: '高さのくらべ方',
      },
      {
        english: 'Running is faster than walking.',
        japanese: '走ることは歩くことよりはやいです。',
        situation: 'はやさのくらべ方',
      },
    ],
    '10-12': [
      {
        english: 'Thirty-five is three tens and five ones.',
        japanese: '35は10が3つと1が5つです。',
        situation: '位の考え方のおうよう',
      },
      {
        english: 'If you have twenty apples and give away seven, you have thirteen left.',
        japanese: 'リンゴを20こ持っていて7こあげたら、13こ残ります。',
        situation: '文章問題',
      },
      {
        english: 'Ten times three equals thirty.',
        japanese: '10かける3は30です。',
        situation: 'かけ算',
      },
      {
        english: 'Fifty divided by five equals ten.',
        japanese: '50わる5は10です。',
        situation: 'わり算',
      },
      {
        english: 'The sum of fifteen and twenty-five is forty.',
        japanese: '15と25の合計は40です。',
        situation: '合計の計算',
      },
      {
        english: 'One hundred is ten tens or one hundred ones.',
        japanese: '100は10が10こ、または1が100こです。',
        situation: '100の位',
      },
      {
        english: 'Forty-two is six less than forty-eight.',
        japanese: '42は48より6小さいです。',
        situation: '差の計算',
      },
      {
        english: 'If one book costs eight dollars, three books cost twenty-four dollars.',
        japanese: '本が1さつ8ドルなら、3さつで24ドルです。',
        situation: 'かけ算の文章問題',
      },
      {
        english: 'Twelve times five equals sixty.',
        japanese: '12かける5は60です。',
        situation: 'かけ算',
      },
      {
        english: 'One hundred divided by ten equals ten.',
        japanese: '100わる10は10です。',
        situation: 'わり算',
      },
      {
        english: 'Two hundred is two hundreds.',
        japanese: '200は100が2つです。',
        situation: '100の位',
      },
      {
        english: 'Three quarters equals seventy-five percent.',
        japanese: '4分の3は75パーセントです。',
        situation: '分数とパーセント',
      },
      {
        english: 'Half equals fifty percent.',
        japanese: '半分は50パーセントです。',
        situation: '分数とパーセント',
      },
      {
        english: 'Sixty plus forty equals one hundred.',
        japanese: '60たす40は100です。',
        situation: '2けたの足し算',
      },
      {
        english: 'Ninety minus thirty-five equals fifty-five.',
        japanese: '90ひく35は55です。',
        situation: '2けたの引き算',
      },
      {
        english: 'Fifteen times four equals sixty.',
        japanese: '15かける4は60です。',
        situation: 'かけ算',
      },
      {
        english: 'Eighty divided by four equals twenty.',
        japanese: '80わる4は20です。',
        situation: 'わり算',
      },
      {
        english: 'One thousand is ten hundreds.',
        japanese: '1000は100が10こです。',
        situation: '1000の位',
      },
      {
        english: 'If you buy three items at fifteen dollars each, the total is forty-five dollars.',
        japanese: '15ドルの商品を3つ買ったら、合計45ドルです。',
        situation: 'かけ算の文章問題',
      },
      {
        english: 'The difference between seventy and twenty-five is forty-five.',
        japanese: '70と25の差は45です。',
        situation: '差の計算',
      },
      {
        english: 'Twenty-five percent of one hundred is twenty-five.',
        japanese: '100の25パーセントは25です。',
        situation: 'パーセントの計算',
      },
      {
        english: 'One-third of ninety is thirty.',
        japanese: '90の3分の1は30です。',
        situation: '分数の計算',
      },
      {
        english: 'Seventy-two divided by eight equals nine.',
        japanese: '72わる8は9です。',
        situation: 'わり算',
      },
      {
        english:
          'If a train travels sixty kilometers per hour for two hours, it goes one hundred twenty kilometers.',
        japanese: '電車が時速60キロで2時間走ると、120キロ進みます。',
        situation: '速度の文章問題',
      },
      {
        english: 'Two-thirds equals approximately sixty-seven percent.',
        japanese: '3分の2は約67パーセントです。',
        situation: '分数とパーセント',
      },
      {
        english: 'One-fifth of one hundred is twenty.',
        japanese: '100の5分の1は20です。',
        situation: '分数の計算',
      },
      {
        english: 'The average of ten, twenty, and thirty is twenty.',
        japanese: '10、20、30のへいきんは20です。',
        situation: 'へいきんの計算',
      },
      {
        english: 'If you add all the numbers and divide by three, you get the average.',
        japanese: 'すべての数を足して3でわると、へいきんが出ます。',
        situation: 'へいきんの求め方',
      },
      {
        english: 'The area of a rectangle is length times width.',
        japanese: '長方形の面積はたてかける横です。',
        situation: '面積の公式',
      },
      {
        english:
          'If a rectangle is five meters by three meters, its area is fifteen square meters.',
        japanese: '長方形が5メートルかける3メートルなら、面積は15平方メートルです。',
        situation: '面積の計算',
      },
      {
        english: 'The perimeter is the distance around the shape.',
        japanese: '周囲の長さは図形の周りのきょりです。',
        situation: '周囲の長さの考え方',
      },
      {
        english: 'A square with sides of four meters has a perimeter of sixteen meters.',
        japanese: '1辺が4メートルの正方形の周囲は16メートルです。',
        situation: '周囲の長さの計算',
      },
      {
        english: 'Twenty times twenty equals four hundred.',
        japanese: '20かける20は400です。',
        situation: '大きい数のかけ算',
      },
      {
        english: 'One hundred fifty divided by three equals fifty.',
        japanese: '150わる3は50です。',
        situation: '大きい数のわり算',
      },
      {
        english: 'The ratio of boys to girls is three to two.',
        japanese: '男子と女子のひは3対2です。',
        situation: 'ひの表し方',
      },
      {
        english: 'If the ratio is two to one, there are twice as many.',
        japanese: 'ひが2対1なら、2倍の数があります。',
        situation: 'ひのりかい',
      },
      {
        english: 'Five is ten percent of fifty.',
        japanese: '5は50の10パーセントです。',
        situation: 'パーセントの計算',
      },
      {
        english: 'Fifty percent off means half price.',
        japanese: '50パーセントオフは半分のねだんという意味です。',
        situation: 'わりびきの計算',
      },
      {
        english:
          'If something costs one hundred dollars and is twenty percent off, you save twenty dollars.',
        japanese: '100ドルの物が20パーセントオフなら、20ドル節約できます。',
        situation: 'わりびきの文章問題',
      },
      {
        english: 'Three-eighths is smaller than one-half.',
        japanese: '8分の3は2分の1より小さいです。',
        situation: '分数のくらべ方',
      },
      {
        english: 'Seven times nine equals sixty-three.',
        japanese: '7かける9は63です。',
        situation: 'かけ算',
      },
      {
        english: 'One hundred eight divided by nine equals twelve.',
        japanese: '108わる9は12です。',
        situation: 'わり算',
      },
      {
        english:
          'If you have forty-eight candies and share them equally among six friends, each gets eight.',
        japanese: 'キャンディーが48こあって6人で等しく分けたら、1人8こずつです。',
        situation: 'わり算の文章問題',
      },
      {
        english: 'Five hundred is five times one hundred.',
        japanese: '500は100の5倍です。',
        situation: '倍数の考え方',
      },
      {
        english: 'The train is faster than the bus.',
        japanese: '電車はバスより速いです。',
        situation: '速さのくらべ方',
      },
      {
        english: 'This package is lighter than that one.',
        japanese: 'この荷物はあちらより軽いです。',
        situation: '重さのくらべ方',
      },
      {
        english: 'Mount Fuji is higher than most mountains in Japan.',
        japanese: '富士山は日本のほとんどの山より高いです。',
        situation: '高さのくらべ方',
      },
      {
        english: 'Summer days are longer than winter days.',
        japanese: '夏の日は冬の日より長いです。',
        situation: '時間のくらべ方',
      },
      {
        english: 'This problem is more difficult than the previous one.',
        japanese: 'この問題は前の問題よりむずかしいです。',
        situation: 'むずかしさのくらべ方',
      },
      {
        english: 'Walking is slower than cycling.',
        japanese: '歩くことは自転車に乗ることよりおそいです。',
        situation: '速さのくらべ方',
      },
      {
        english: 'This method is more efficient than the old way.',
        japanese: 'この方法は古いやり方よりこうりつがいいです。',
        situation: 'こうりつのくらべ方',
      },
    ],
  },
};

Object.entries(PHRASE_DATA).forEach(([category, ageMap]) => {
  Object.entries(ageMap).forEach(([ageGroup, phrases]) => {
    ageMap[ageGroup] = phrases.map((phrase) => enrichPhrase(phrase, { category, ageGroup }));
  });
});
