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
      { english: 'Hello!', japanese: 'こんにちは！', situation: '友達に会ったとき' },
      { english: 'Good morning!', japanese: 'おはよう！', situation: '朝のあいさつ' },
      { english: 'Good night!', japanese: 'おやすみ！', situation: '寝るとき' },
      { english: 'See you later!', japanese: 'また後で！', situation: '別れるとき' },
      { english: 'Thank you!', japanese: 'ありがとう！', situation: '感謝するとき' },
      { english: 'Hi!', japanese: 'やあ！', situation: 'カジュアルな挨拶' },
      { english: 'Bye!', japanese: 'バイバイ！', situation: '別れるとき' },
      { english: 'Good afternoon!', japanese: 'こんにちは！', situation: '午後の挨拶' },
      { english: 'Good evening!', japanese: 'こんばんは！', situation: '夕方の挨拶' },
      { english: 'See you tomorrow!', japanese: 'また明日！', situation: '学校で別れるとき' },
      { english: 'Welcome!', japanese: 'ようこそ！', situation: '人を迎えるとき' },
      { english: 'Come in!', japanese: '入って！', situation: '家に招くとき' },
      {
        english: "You're welcome!",
        japanese: 'どういたしまして！',
        situation: 'お礼を言われたとき',
      },
      { english: 'Please!', japanese: 'どうぞ！', situation: '何かを勧めるとき' },
      { english: 'Excuse me!', japanese: 'ごめんなさい！', situation: '謝るとき' },
    ],
    '7-9': [
      { english: 'How are you?', japanese: '元気ですか？', situation: '相手の様子を聞くとき' },
      {
        english: "I'm fine, thank you.",
        japanese: '元気です、ありがとう。',
        situation: '返事をするとき',
      },
      { english: 'Nice to meet you.', japanese: 'はじめまして。', situation: '初対面のとき' },
      { english: 'Have a good day!', japanese: '良い一日を！', situation: '別れ際の挨拶' },
      { english: 'Excuse me.', japanese: 'すみません。', situation: '人に声をかけるとき' },
      { english: 'How have you been?', japanese: '最近どう？', situation: '久しぶりに会ったとき' },
      { english: 'See you soon!', japanese: 'またすぐに！', situation: '近いうちに会う予定のとき' },
      { english: 'Take care!', japanese: '気をつけて！', situation: '別れ際に心配して' },
      { english: "I'm sorry.", japanese: 'ごめんなさい。', situation: '謝罪するとき' },
      { english: "That's okay.", japanese: '大丈夫だよ。', situation: '謝罪を受け入れるとき' },
      {
        english: 'Nice to see you again.',
        japanese: 'また会えて嬉しい。',
        situation: '再会したとき',
      },
      { english: 'Good luck!', japanese: '頑張って！', situation: '応援するとき' },
      { english: 'Congratulations!', japanese: 'おめでとう！', situation: 'お祝いするとき' },
      { english: 'Welcome back!', japanese: 'おかえり！', situation: '帰ってきた人を迎えるとき' },
      { english: "I'm home!", japanese: 'ただいま！', situation: '家に帰ったとき' },
    ],
    '10-12': [
      {
        english: 'How was your weekend?',
        japanese: '週末はどうでしたか？',
        situation: '月曜日の挨拶',
      },
      {
        english: 'I hope you have a great day.',
        japanese: '素晴らしい一日になることを願っています。',
        situation: '丁寧な別れの挨拶',
      },
      {
        english: "It's been a while.",
        japanese: 'お久しぶりです。',
        situation: '久しぶりに会ったとき',
      },
      {
        english: 'Take care of yourself.',
        japanese: 'お体に気をつけて。',
        situation: '心配して別れるとき',
      },
      {
        english: "I'm looking forward to seeing you again.",
        japanese: 'また会えるのを楽しみにしています。',
        situation: '再会を期待するとき',
      },
      {
        english: 'How do you do?',
        japanese: 'はじめまして。（フォーマル）',
        situation: 'フォーマルな初対面の挨拶',
      },
      {
        english: "It's a pleasure to meet you.",
        japanese: 'お会いできて光栄です。',
        situation: '丁寧な初対面の挨拶',
      },
      {
        english: 'Have a wonderful day!',
        japanese: '素敵な一日を！',
        situation: '別れ際の明るい挨拶',
      },
      {
        english: 'See you next time!',
        japanese: 'また次回！',
        situation: '次の機会を約束して別れるとき',
      },
      {
        english: 'Long time no see!',
        japanese: '久しぶり！',
        situation: 'カジュアルな久しぶりの挨拶',
      },
      {
        english: "What's up?",
        japanese: '調子はどう？',
        situation: 'カジュアルな挨拶',
      },
      {
        english: "I'm doing well, thanks.",
        japanese: '元気です、ありがとう。',
        situation: '体調を聞かれたときの返事',
      },
      {
        english: 'Best wishes!',
        japanese: '幸運を祈ります！',
        situation: '祝福するとき',
      },
      {
        english: 'Have a safe trip!',
        japanese: '気をつけて！（旅行）',
        situation: '旅行に行く人への挨拶',
      },
      {
        english: 'Welcome to our school!',
        japanese: '私たちの学校へようこそ！',
        situation: '新入生を迎えるとき',
      },
    ],
  },
  self_introduction: {
    '4-6': [
      {
        english: 'My name is Tom.',
        japanese: '私の名前はトムです。',
        situation: '自分の名前を言うとき',
      },
      { english: 'I am six years old.', japanese: '私は6歳です。', situation: '年齢を言うとき' },
      {
        english: 'I like apples.',
        japanese: '私はりんごが好きです。',
        situation: '好きなものを言うとき',
      },
      {
        english: 'This is my friend.',
        japanese: 'これは私の友達です。',
        situation: '友達を紹介するとき',
      },
      { english: 'I am a boy.', japanese: '私は男の子です。', situation: '性別を言うとき' },
      { english: 'I am a girl.', japanese: '私は女の子です。', situation: '性別を言うとき' },
      {
        english: 'I like dogs.',
        japanese: '私は犬が好きです。',
        situation: '好きな動物を言うとき',
      },
      {
        english: 'I like cats.',
        japanese: '私は猫が好きです。',
        situation: '好きな動物を言うとき',
      },
      {
        english: 'My favorite color is blue.',
        japanese: '私の好きな色は青です。',
        situation: '好きな色を言うとき',
      },
      {
        english: 'I have a sister.',
        japanese: '私には姉（妹）がいます。',
        situation: '家族について話すとき',
      },
      {
        english: 'I have a brother.',
        japanese: '私には兄（弟）がいます。',
        situation: '家族について話すとき',
      },
      {
        english: 'I live in Tokyo.',
        japanese: '私は東京に住んでいます。',
        situation: '住んでいる場所を言うとき',
      },
    ],
    '7-9': [
      { english: "I'm from Japan.", japanese: '私は日本出身です。', situation: '出身地を言うとき' },
      { english: "I'm in third grade.", japanese: '私は3年生です。', situation: '学年を言うとき' },
      {
        english: 'My hobby is reading.',
        japanese: '私の趣味は読書です。',
        situation: '趣味を紹介するとき',
      },
      {
        english: 'I have one brother.',
        japanese: '私には兄弟が一人います。',
        situation: '家族について話すとき',
      },
      {
        english: 'I like playing soccer.',
        japanese: '私はサッカーをするのが好きです。',
        situation: '好きなスポーツを言うとき',
      },
      {
        english: 'I like drawing pictures.',
        japanese: '私は絵を描くのが好きです。',
        situation: '好きな活動を言うとき',
      },
      {
        english: 'I live with my family.',
        japanese: '私は家族と住んでいます。',
        situation: '家族構成を言うとき',
      },
      {
        english: 'I have a pet dog.',
        japanese: '私はペットの犬を飼っています。',
        situation: 'ペットについて話すとき',
      },
      {
        english: 'I go to elementary school.',
        japanese: '私は小学校に通っています。',
        situation: '学校について話すとき',
      },
      {
        english: 'My birthday is in May.',
        japanese: '私の誕生日は5月です。',
        situation: '誕生日を言うとき',
      },
      { english: 'I can swim.', japanese: '私は泳げます。', situation: 'できることを言うとき' },
      {
        english: 'I want to be a teacher.',
        japanese: '私は先生になりたいです。',
        situation: '将来の夢を言うとき',
      },
    ],
    '10-12': [
      {
        english: "I'm interested in science.",
        japanese: '私は科学に興味があります。',
        situation: '興味を表現するとき',
      },
      {
        english: 'My dream is to become a teacher.',
        japanese: '私の夢は先生になることです。',
        situation: '将来の夢を語るとき',
      },
      {
        english: "I've been studying English for three years.",
        japanese: '私は3年間英語を勉強しています。',
        situation: '学習歴を説明するとき',
      },
      {
        english: "I'm good at playing the piano.",
        japanese: '私はピアノを弾くのが得意です。',
        situation: '特技を紹介するとき',
      },
      {
        english: 'I enjoy playing video games.',
        japanese: '私はビデオゲームをするのが楽しいです。',
        situation: '趣味を話すとき',
      },
      {
        english: 'I have two younger sisters.',
        japanese: '私には2人の妹がいます。',
        situation: '家族構成を詳しく説明するとき',
      },
      {
        english: 'I was born in Osaka.',
        japanese: '私は大阪で生まれました。',
        situation: '出生地を言うとき',
      },
      {
        english: "I'm a member of the tennis club.",
        japanese: '私はテニス部の一員です。',
        situation: '部活動を紹介するとき',
      },
      {
        english: 'I speak both Japanese and English.',
        japanese: '私は日本語と英語の両方を話します。',
        situation: '言語能力を紹介するとき',
      },
      {
        english: 'My favorite subject is math.',
        japanese: '私の好きな科目は数学です。',
        situation: '好きな科目を言うとき',
      },
      {
        english: "I'm passionate about environmental issues.",
        japanese: '私は環境問題に情熱を持っています。',
        situation: '関心事を表現するとき',
      },
      {
        english: 'I would like to study abroad in the future.',
        japanese: '私は将来留学したいです。',
        situation: '将来の目標を語るとき',
      },
    ],
  },
  school: {
    '4-6': [
      {
        english: 'I go to school.',
        japanese: '私は学校に行きます。',
        situation: '学校について話すとき',
      },
      {
        english: 'I like my teacher.',
        japanese: '私は先生が好きです。',
        situation: '先生について話すとき',
      },
      {
        english: "Let's play together.",
        japanese: '一緒に遊びましょう。',
        situation: '友達を誘うとき',
      },
      { english: 'Time for lunch!', japanese: 'お昼の時間です！', situation: '昼食時間のとき' },
      {
        english: 'I can write my name.',
        japanese: '私は自分の名前が書けます。',
        situation: '書く練習をするとき',
      },
      {
        english: 'Where is my pencil?',
        japanese: '私の鉛筆はどこ？',
        situation: '文房具を探すとき',
      },
      {
        english: 'Can I use the crayon?',
        japanese: 'クレヨンを使ってもいい？',
        situation: '道具を借りるとき',
      },
      {
        english: 'I like art class.',
        japanese: '私は図工が好きです。',
        situation: '好きな授業を言うとき',
      },
      {
        english: 'I like music class.',
        japanese: '私は音楽が好きです。',
        situation: '好きな授業を言うとき',
      },
      {
        english: 'I finished my work.',
        japanese: '私は作業を終えました。',
        situation: '課題が終わったとき',
      },
      {
        english: 'May I go to the bathroom?',
        japanese: 'トイレに行ってもいいですか？',
        situation: 'トイレに行きたいとき',
      },
      { english: 'School is fun!', japanese: '学校は楽しい！', situation: '学校の感想を言うとき' },
    ],
    '7-9': [
      {
        english: 'What subject do you like?',
        japanese: 'どの教科が好きですか？',
        situation: '好きな教科を聞くとき',
      },
      {
        english: 'I have math class next.',
        japanese: '次は算数の授業です。',
        situation: '次の授業について話すとき',
      },
      {
        english: 'Can you help me with my homework?',
        japanese: '宿題を手伝ってもらえますか？',
        situation: '宿題の手助けを求めるとき',
      },
      {
        english: 'The test was difficult.',
        japanese: 'テストは難しかったです。',
        situation: 'テストの感想を言うとき',
      },
      {
        english: 'I did well on the test.',
        japanese: '私はテストでよくできました。',
        situation: 'テストの結果を報告するとき',
      },
      {
        english: 'I forgot my textbook.',
        japanese: '教科書を忘れました。',
        situation: '忘れ物をしたとき',
      },
      {
        english: 'May I borrow your eraser?',
        japanese: '消しゴムを貸してもらえますか？',
        situation: '文房具を借りるとき',
      },
      {
        english: 'When is the homework due?',
        japanese: '宿題の締め切りはいつですか？',
        situation: '提出期限を聞くとき',
      },
      {
        english: 'I like science class.',
        japanese: '私は理科が好きです。',
        situation: '好きな科目を言うとき',
      },
      {
        english: 'We have gym class today.',
        japanese: '今日は体育があります。',
        situation: '授業予定を言うとき',
      },
      {
        english: 'I need to study more.',
        japanese: 'もっと勉強する必要があります。',
        situation: '勉強の必要性を感じたとき',
      },
      {
        english: 'Our teacher is kind.',
        japanese: '私たちの先生は優しいです。',
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
        japanese: '私はバスケットボール部に入りました。',
        situation: '部活動について話すとき',
      },
      {
        english: 'The presentation went well.',
        japanese: '発表はうまくいきました。',
        situation: '発表の結果を報告するとき',
      },
      {
        english: 'I have a lot of homework this week.',
        japanese: '今週は宿題がたくさんあります。',
        situation: '宿題の量について話すとき',
      },
      {
        english: 'We have a group project due next Friday.',
        japanese: '来週の金曜日までにグループプロジェクトの提出があります。',
        situation: 'プロジェクトの締め切りについて話すとき',
      },
      {
        english: 'I got an A on my report.',
        japanese: 'レポートでAをもらいました。',
        situation: '成績について報告するとき',
      },
      {
        english: 'I attend cram school twice a week.',
        japanese: '私は週2回塾に通っています。',
        situation: '塾について話すとき',
      },
      {
        english: 'Our class is preparing for the sports day.',
        japanese: '私たちのクラスは運動会の準備をしています。',
        situation: '学校行事の準備について話すとき',
      },
      {
        english: 'I was elected as class president.',
        japanese: '私はクラス委員長に選ばれました。',
        situation: '役職について報告するとき',
      },
      {
        english: 'We had a field trip to the museum.',
        japanese: '私たちは博物館に校外学習に行きました。',
        situation: '校外学習について話すとき',
      },
      {
        english: 'I want to improve my English skills.',
        japanese: '私は英語力を向上させたいです。',
        situation: '学習目標を言うとき',
      },
    ],
  },
  daily_life: {
    '4-6': [
      {
        english: 'I wake up at seven.',
        japanese: '私は7時に起きます。',
        situation: '起床時間を言うとき',
      },
      {
        english: 'I brush my teeth.',
        japanese: '私は歯を磨きます。',
        situation: '歯磨きについて話すとき',
      },
      { english: "It's time to eat.", japanese: '食事の時間です。', situation: '食事時間のとき' },
      {
        english: 'I help my mom.',
        japanese: '私はお母さんを手伝います。',
        situation: 'お手伝いについて話すとき',
      },
      {
        english: 'I wash my face.',
        japanese: '私は顔を洗います。',
        situation: '朝の習慣について話すとき',
      },
      { english: 'I get dressed.', japanese: '私は服を着ます。', situation: '着替えるとき' },
      {
        english: 'I eat breakfast.',
        japanese: '私は朝食を食べます。',
        situation: '朝食について話すとき',
      },
      {
        english: 'I go to bed at eight.',
        japanese: '私は8時に寝ます。',
        situation: '就寝時間を言うとき',
      },
      {
        english: 'I take a bath.',
        japanese: '私はお風呂に入ります。',
        situation: 'お風呂について話すとき',
      },
      {
        english: 'I play outside.',
        japanese: '私は外で遊びます。',
        situation: '遊びについて話すとき',
      },
      { english: 'I watch TV.', japanese: '私はテレビを見ます。', situation: 'テレビを見るとき' },
      {
        english: 'I clean my room.',
        japanese: '私は部屋を掃除します。',
        situation: '掃除について話すとき',
      },
    ],
    '7-9': [
      {
        english: 'What time do you go to bed?',
        japanese: '何時に寝ますか？',
        situation: '就寝時間を聞くとき',
      },
      {
        english: 'I usually watch TV after dinner.',
        japanese: '私は夕食後によくテレビを見ます。',
        situation: '夕食後の過ごし方を言うとき',
      },
      {
        english: 'Today is a beautiful day.',
        japanese: '今日はとても良い天気です。',
        situation: '天気について話すとき',
      },
      {
        english: "I'm going to the park.",
        japanese: '私は公園に行く予定です。',
        situation: '外出予定を言うとき',
      },
      {
        english: 'I do my homework after school.',
        japanese: '私は放課後に宿題をします。',
        situation: '放課後の過ごし方を言うとき',
      },
      {
        english: 'I take out the trash.',
        japanese: '私はゴミを出します。',
        situation: 'お手伝いについて話すとき',
      },
      {
        english: 'I set the table.',
        japanese: '私は食卓の準備をします。',
        situation: '食事の準備を手伝うとき',
      },
      {
        english: "It's raining today.",
        japanese: '今日は雨が降っています。',
        situation: '雨の日について話すとき',
      },
      {
        english: 'I practice piano every day.',
        japanese: '私は毎日ピアノを練習します。',
        situation: '習い事について話すとき',
      },
      {
        english: 'I walk my dog.',
        japanese: '私は犬の散歩をします。',
        situation: 'ペットの世話について話すとき',
      },
      {
        english: 'I read a book before bed.',
        japanese: '私は寝る前に本を読みます。',
        situation: '就寝前の習慣を言うとき',
      },
      {
        english: 'I help with cooking.',
        japanese: '私は料理を手伝います。',
        situation: '料理の手伝いについて話すとき',
      },
    ],
    '10-12': [
      {
        english: 'I have a busy schedule today.',
        japanese: '今日は忙しいスケジュールです。',
        situation: '忙しい日について話すとき',
      },
      {
        english: 'I prefer to exercise in the morning.',
        japanese: '私は朝に運動するのが好きです。',
        situation: '運動習慣について話すとき',
      },
      {
        english: "We're planning a family trip.",
        japanese: '私たちは家族旅行を計画しています。',
        situation: '旅行の計画について話すとき',
      },
      {
        english: "I'm trying to eat more vegetables.",
        japanese: '私はもっと野菜を食べるようにしています。',
        situation: '食生活の改善について話すとき',
      },
      {
        english: 'I usually wake up at six thirty.',
        japanese: '私は普段6時半に起きます。',
        situation: '起床時間について話すとき',
      },
      {
        english: 'I commute to school by bicycle.',
        japanese: '私は自転車で通学しています。',
        situation: '通学方法について話すとき',
      },
      {
        english: 'I spend about two hours on homework.',
        japanese: '私は宿題に約2時間かけます。',
        situation: '勉強時間について話すとき',
      },
      {
        english: 'I try to get eight hours of sleep.',
        japanese: '私は8時間睡眠を取るようにしています。',
        situation: '睡眠習慣について話すとき',
      },
      {
        english: 'I help with household chores on weekends.',
        japanese: '私は週末に家事を手伝います。',
        situation: '週末の手伝いについて話すとき',
      },
      {
        english: 'I manage my time using a schedule.',
        japanese: '私はスケジュールを使って時間を管理しています。',
        situation: '時間管理について話すとき',
      },
      {
        english: 'I enjoy listening to music while studying.',
        japanese: '私は勉強しながら音楽を聴くのが好きです。',
        situation: '勉強方法について話すとき',
      },
      {
        english: 'I make my own lunch on school days.',
        japanese: '私は学校がある日は自分でお弁当を作ります。',
        situation: 'お弁当作りについて話すとき',
      },
    ],
  },
  shopping: {
    '4-6': [
      {
        english: 'I want this.',
        japanese: 'これが欲しいです。',
        situation: '欲しいものを伝えるとき',
      },
      { english: 'How much?', japanese: 'いくら？', situation: '値段を聞くとき' },
      { english: 'Thank you.', japanese: 'ありがとう。', situation: '買い物を終えるとき' },
      { english: 'Can I have one?', japanese: '一つください。', situation: '商品を頼むとき' },
      {
        english: 'I like this one.',
        japanese: 'これが好きです。',
        situation: '好きな商品を選ぶとき',
      },
      {
        english: 'Can I see that?',
        japanese: 'あれを見せてもらえますか？',
        situation: '商品を見たいとき',
      },
      {
        english: 'This is too big.',
        japanese: 'これは大きすぎます。',
        situation: 'サイズが合わないとき',
      },
      {
        english: 'This is too small.',
        japanese: 'これは小さすぎます。',
        situation: 'サイズが合わないとき',
      },
      {
        english: 'I need help.',
        japanese: '手伝ってください。',
        situation: '店員さんに助けを求めるとき',
      },
      { english: "I'll buy this.", japanese: 'これを買います。', situation: '購入を決めたとき' },
      { english: 'Can I have a bag?', japanese: '袋をもらえますか？', situation: '袋が欲しいとき' },
      {
        english: 'Where is the candy?',
        japanese: 'お菓子はどこですか？',
        situation: 'お菓子売り場を探すとき',
      },
    ],
    '7-9': [
      {
        english: 'How much is this?',
        japanese: 'これはいくらですか？',
        situation: '値段を尋ねるとき',
      },
      {
        english: 'Can I buy this?',
        japanese: 'これを買ってもいいですか？',
        situation: '購入の許可を求めるとき',
      },
      { english: 'I need a bag.', japanese: '袋が必要です。', situation: '袋をもらうとき' },
      {
        english: 'Where is the toy section?',
        japanese: 'おもちゃ売り場はどこですか？',
        situation: '売り場を探すとき',
      },
      {
        english: 'Is this on sale?',
        japanese: 'これはセール中ですか？',
        situation: 'セールを確認するとき',
      },
      {
        english: 'Do you have any more?',
        japanese: 'もっとありますか？',
        situation: '在庫を確認するとき',
      },
      {
        english: 'Can I get a receipt?',
        japanese: 'レシートをもらえますか？',
        situation: 'レシートが欲しいとき',
      },
      {
        english: 'Where can I pay?',
        japanese: 'どこで払えますか？',
        situation: 'レジの場所を聞くとき',
      },
      {
        english: 'I have enough money.',
        japanese: '十分なお金があります。',
        situation: 'お金が足りることを確認するとき',
      },
      {
        english: 'This is my favorite store.',
        japanese: 'これは私のお気に入りの店です。',
        situation: 'お気に入りの店について話すとき',
      },
      {
        english: 'Can I return this?',
        japanese: 'これを返品できますか？',
        situation: '返品したいとき',
      },
      {
        english: 'Where is the bookstore?',
        japanese: '本屋はどこですか？',
        situation: '本屋を探すとき',
      },
    ],
    '10-12': [
      {
        english: 'Do you have this in another color?',
        japanese: '他の色はありますか？',
        situation: '色違いを探すとき',
      },
      {
        english: 'Can I try this on?',
        japanese: 'これを試着してもいいですか？',
        situation: '試着したいとき',
      },
      { english: "I'll take this one.", japanese: 'これにします。', situation: '購入を決めたとき' },
      {
        english: 'Can I pay by card?',
        japanese: 'カードで払えますか？',
        situation: '支払い方法を確認するとき',
      },
      {
        english: 'Do you have this in a larger size?',
        japanese: 'もっと大きいサイズはありますか？',
        situation: '大きいサイズを探すとき',
      },
      {
        english: "I'm looking for a birthday present.",
        japanese: '誕生日プレゼントを探しています。',
        situation: 'プレゼントを探すとき',
      },
      {
        english: 'Can I get a discount?',
        japanese: '割引してもらえますか？',
        situation: '割引を希望するとき',
      },
      {
        english: 'Is there a warranty?',
        japanese: '保証はありますか？',
        situation: '保証を確認するとき',
      },
      {
        english: 'Can you gift wrap this?',
        japanese: 'これをギフト包装してもらえますか？',
        situation: 'ギフト包装を依頼するとき',
      },
      {
        english: "I'm just looking, thank you.",
        japanese: '見ているだけです、ありがとう。',
        situation: '店員に声をかけられたとき',
      },
      {
        english: 'Where is the fitting room?',
        japanese: '試着室はどこですか？',
        situation: '試着室を探すとき',
      },
      {
        english: "Can I exchange this if it doesn't fit?",
        japanese: 'サイズが合わない場合、交換できますか？',
        situation: '交換について確認するとき',
      },
    ],
  },
  travel: {
    '4-6': [
      { english: 'Where are we going?', japanese: 'どこに行くの？', situation: '行き先を聞くとき' },
      { english: 'Are we there yet?', japanese: 'もう着いた？', situation: '到着を確認するとき' },
      { english: "I'm tired.", japanese: '疲れた。', situation: '疲れを伝えるとき' },
      { english: "Let's go!", japanese: '行こう！', situation: '出発するとき' },
      {
        english: 'Can I sit here?',
        japanese: 'ここに座ってもいい？',
        situation: '座席を確認するとき',
      },
      {
        english: 'I need to go to the bathroom.',
        japanese: 'トイレに行きたい。',
        situation: 'トイレに行きたいとき',
      },
      { english: "I'm hungry.", japanese: 'お腹が空いた。', situation: '空腹を伝えるとき' },
      { english: "I'm thirsty.", japanese: '喉が渇いた。', situation: '喉の渇きを伝えるとき' },
      { english: 'Can we stop here?', japanese: 'ここで止まれる？', situation: '休憩を求めるとき' },
      { english: 'I see a bus!', japanese: 'バスが見える！', situation: 'バスを見つけたとき' },
      { english: 'Wait for me!', japanese: '待って！', situation: '待ってほしいとき' },
      { english: 'This is fun!', japanese: '楽しい！', situation: '旅行を楽しんでいるとき' },
    ],
    '7-9': [
      { english: 'Where is the station?', japanese: '駅はどこですか？', situation: '駅を探すとき' },
      {
        english: 'What time does it leave?',
        japanese: '何時に出発しますか？',
        situation: '出発時刻を聞くとき',
      },
      {
        english: 'I need a ticket.',
        japanese: 'チケットが必要です。',
        situation: 'チケットを買うとき',
      },
      {
        english: 'Is this seat taken?',
        japanese: 'この席は空いていますか？',
        situation: '席を確認するとき',
      },
      {
        english: 'Which bus should I take?',
        japanese: 'どのバスに乗ればいいですか？',
        situation: 'バスを確認するとき',
      },
      {
        english: 'When does the next train arrive?',
        japanese: '次の電車はいつ来ますか？',
        situation: '次の電車を確認するとき',
      },
      {
        english: 'Can you tell me when to get off?',
        japanese: 'いつ降りればいいか教えてもらえますか？',
        situation: '降車駅を確認するとき',
      },
      {
        english: 'How much is the fare?',
        japanese: '運賃はいくらですか？',
        situation: '運賃を聞くとき',
      },
      {
        english: 'We got on the wrong train.',
        japanese: '間違った電車に乗ってしまいました。',
        situation: '乗り間違えたとき',
      },
      {
        english: 'Where can I buy a ticket?',
        japanese: 'どこでチケットを買えますか？',
        situation: 'チケット売り場を探すとき',
      },
      {
        english: 'Is this the right platform?',
        japanese: 'これは正しいホームですか？',
        situation: 'ホームを確認するとき',
      },
      {
        english: 'I lost my ticket.',
        japanese: 'チケットを失くしました。',
        situation: 'チケットを失くしたとき',
      },
    ],
    '10-12': [
      {
        english: 'Could you tell me how to get there?',
        japanese: 'そこへの行き方を教えていただけますか？',
        situation: '道を尋ねるとき',
      },
      {
        english: 'What platform does it leave from?',
        japanese: '何番ホームから出発しますか？',
        situation: 'ホームを確認するとき',
      },
      {
        english: 'Is there a direct train?',
        japanese: '直通電車はありますか？',
        situation: '乗り換えを確認するとき',
      },
      {
        english: 'How long does it take?',
        japanese: 'どのくらい時間がかかりますか？',
        situation: '所要時間を聞くとき',
      },
      {
        english: 'Do I need to transfer?',
        japanese: '乗り換える必要がありますか？',
        situation: '乗り換えの必要性を確認するとき',
      },
      {
        english: 'Where should I transfer?',
        japanese: 'どこで乗り換えればいいですか？',
        situation: '乗り換え駅を聞くとき',
      },
      {
        english: 'Is this train going to Tokyo?',
        japanese: 'この電車は東京に行きますか？',
        situation: '行き先を確認するとき',
      },
      {
        english: 'Can I reserve a seat?',
        japanese: '席を予約できますか？',
        situation: '座席予約について聞くとき',
      },
      {
        english: 'What is the platform number for the express train?',
        japanese: '急行電車のホーム番号は何番ですか？',
        situation: '急行電車のホームを聞くとき',
      },
      {
        english: 'I would like to buy a round-trip ticket.',
        japanese: '往復チケットを買いたいです。',
        situation: '往復券を買うとき',
      },
      {
        english: 'Does this bus stop at the museum?',
        japanese: 'このバスは博物館に止まりますか？',
        situation: 'バスの停車駅を確認するとき',
      },
      {
        english: 'Excuse me, I think this is my seat.',
        japanese: 'すみません、これは私の席だと思います。',
        situation: '席の間違いを指摘するとき',
      },
    ],
  },
  feelings: {
    '4-6': [
      { english: "I'm happy!", japanese: 'うれしい！', situation: '喜びを表現するとき' },
      { english: "I'm sad.", japanese: '悲しい。', situation: '悲しみを表現するとき' },
      { english: "I'm angry.", japanese: '怒ってる。', situation: '怒りを表現するとき' },
      { english: "I'm scared.", japanese: '怖い。', situation: '恐怖を表現するとき' },
      { english: 'I love you!', japanese: '大好き！', situation: '愛情を表現するとき' },
      { english: "I'm okay.", japanese: '大丈夫。', situation: '大丈夫なことを伝えるとき' },
      { english: "I'm sleepy.", japanese: '眠い。', situation: '眠気を表現するとき' },
      { english: "I'm excited!", japanese: 'ワクワクする！', situation: '興奮を表現するとき' },
      {
        english: "I don't like it.",
        japanese: '好きじゃない。',
        situation: '嫌いなことを表現するとき',
      },
      { english: "I'm surprised!", japanese: 'びっくりした！', situation: '驚きを表現するとき' },
      { english: 'That hurts!', japanese: '痛い！', situation: '痛みを表現するとき' },
      { english: "I'm sorry.", japanese: 'ごめんなさい。', situation: '謝るとき' },
    ],
    '7-9': [
      { english: "I'm excited!", japanese: 'ワクワクする！', situation: '興奮を表現するとき' },
      { english: "I'm worried.", japanese: '心配だ。', situation: '心配を表現するとき' },
      { english: "I'm bored.", japanese: '退屈だ。', situation: '退屈を表現するとき' },
      {
        english: "I'm proud of you.",
        japanese: 'あなたを誇りに思う。',
        situation: '誇りを表現するとき',
      },
      { english: "I'm nervous.", japanese: '緊張してる。', situation: '緊張を表現するとき' },
      { english: "I'm curious.", japanese: '気になる。', situation: '好奇心を表現するとき' },
      { english: "I'm jealous.", japanese: 'うらやましい。', situation: '嫉妬を表現するとき' },
      {
        english: "I'm embarrassed.",
        japanese: '恥ずかしい。',
        situation: '恥ずかしさを表現するとき',
      },
      { english: 'I feel lonely.', japanese: '寂しい。', situation: '孤独を表現するとき' },
      { english: "I'm relieved.", japanese: 'ホッとした。', situation: '安心を表現するとき' },
      { english: "I'm confused.", japanese: '混乱してる。', situation: '混乱を表現するとき' },
      {
        english: 'I feel great!',
        japanese: '最高の気分！',
        situation: '素晴らしい気分を表現するとき',
      },
    ],
    '10-12': [
      {
        english: "I'm frustrated.",
        japanese: 'イライラする。',
        situation: 'フラストレーションを表現するとき',
      },
      { english: 'I feel confident.', japanese: '自信がある。', situation: '自信を表現するとき' },
      { english: "I'm disappointed.", japanese: 'がっかりした。', situation: '失望を表現するとき' },
      {
        english: "I'm grateful for your help.",
        japanese: 'あなたの助けに感謝しています。',
        situation: '感謝を表現するとき',
      },
      {
        english: "I'm overwhelmed.",
        japanese: '圧倒されている。',
        situation: '圧倒されていることを表現するとき',
      },
      {
        english: 'I feel anxious about the test.',
        japanese: 'テストのことで不安です。',
        situation: '不安を表現するとき',
      },
      {
        english: "I'm inspired by your story.",
        japanese: 'あなたの話に感銘を受けました。',
        situation: '感銘を表現するとき',
      },
      {
        english: "I'm homesick.",
        japanese: 'ホームシックです。',
        situation: 'ホームシックを表現するとき',
      },
      {
        english: 'I feel proud of my achievement.',
        japanese: '自分の成果を誇りに思います。',
        situation: '達成感を表現するとき',
      },
      {
        english: "I'm sympathetic to your situation.",
        japanese: 'あなたの状況に同情します。',
        situation: '同情を表現するとき',
      },
      {
        english: 'I feel motivated to do better.',
        japanese: 'もっと良くしようという意欲が湧きます。',
        situation: '意欲を表現するとき',
      },
      {
        english: "I'm content with my life.",
        japanese: '自分の人生に満足しています。',
        situation: '満足を表現するとき',
      },
    ],
  },
  classroom_english: {
    '4-6': [
      { english: 'Listen carefully.', japanese: 'よく聞いて。', situation: '注意を促すとき' },
      {
        english: 'Repeat after me.',
        japanese: '私の後について言って。',
        situation: '復唱を求めるとき',
      },
      { english: 'Raise your hand.', japanese: '手を挙げて。', situation: '挙手を求めるとき' },
      { english: 'Good job!', japanese: 'よくできました！', situation: '褒めるとき' },
      { english: 'Sit down, please.', japanese: '座ってください。', situation: '着席を促すとき' },
      { english: 'Stand up, please.', japanese: '立ってください。', situation: '起立を促すとき' },
      { english: 'Be quiet.', japanese: '静かにして。', situation: '静かにするよう促すとき' },
      {
        english: 'Look at the board.',
        japanese: '黒板を見て。',
        situation: '黒板を見るよう促すとき',
      },
      { english: 'Open your book.', japanese: '本を開いて。', situation: '本を開くよう促すとき' },
      {
        english: 'Close your book.',
        japanese: '本を閉じて。',
        situation: '本を閉じるよう促すとき',
      },
      { english: "Let's start!", japanese: '始めましょう！', situation: '授業を始めるとき' },
      { english: 'Try again!', japanese: 'もう一度やってみて！', situation: '再挑戦を促すとき' },
    ],
    '7-9': [
      {
        english: 'May I go to the bathroom?',
        japanese: 'トイレに行ってもいいですか？',
        situation: 'トイレの許可を求めるとき',
      },
      { english: "I don't understand.", japanese: 'わかりません。', situation: '理解できないとき' },
      {
        english: 'Can you help me?',
        japanese: '手伝ってもらえますか？',
        situation: '助けを求めるとき',
      },
      {
        english: 'How do you spell it?',
        japanese: 'どう綴りますか？',
        situation: 'スペルを聞くとき',
      },
      {
        english: 'Can you say that again?',
        japanese: 'もう一度言ってもらえますか？',
        situation: '聞き返すとき',
      },
      { english: 'I have a question.', japanese: '質問があります。', situation: '質問があるとき' },
      {
        english: 'I finished my work.',
        japanese: '作業を終えました。',
        situation: '課題が終わったとき',
      },
      { english: "I'm ready.", japanese: '準備ができました。', situation: '準備完了を伝えるとき' },
      {
        english: 'Can you speak louder?',
        japanese: 'もっと大きな声で話してもらえますか？',
        situation: '声が小さいとき',
      },
      {
        english: 'What does this word mean?',
        japanese: 'この単語はどういう意味ですか？',
        situation: '単語の意味を聞くとき',
      },
      { english: 'May I answer?', japanese: '答えてもいいですか？', situation: '答えたいとき' },
      {
        english: 'Can I work with a partner?',
        japanese: 'パートナーと一緒に作業してもいいですか？',
        situation: 'ペアワークを希望するとき',
      },
    ],
    '10-12': [
      {
        english: 'Could you explain that again?',
        japanese: 'もう一度説明していただけますか？',
        situation: '再説明を求めるとき',
      },
      {
        english: 'What does this mean?',
        japanese: 'これはどういう意味ですか？',
        situation: '意味を尋ねるとき',
      },
      {
        english: 'May I ask a question?',
        japanese: '質問してもいいですか？',
        situation: '質問の許可を求めるとき',
      },
      {
        english: 'I have a different opinion.',
        japanese: '私は違う意見があります。',
        situation: '異なる意見を述べるとき',
      },
      {
        english: 'Could you speak more slowly?',
        japanese: 'もっとゆっくり話していただけますか？',
        situation: '話すペースを遅くしてほしいとき',
      },
      {
        english: 'I need more time to finish.',
        japanese: '終えるのにもっと時間が必要です。',
        situation: '時間延長を求めるとき',
      },
      {
        english: "I'm not sure I understand.",
        japanese: '理解できているか自信がありません。',
        situation: '理解が不確かなとき',
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
        japanese: 'その点を明確にしていただけますか？',
        situation: '明確化を求めるとき',
      },
      {
        english: 'I agree with your opinion.',
        japanese: 'あなたの意見に賛成です。',
        situation: '賛成を表明するとき',
      },
      {
        english: 'May I present my idea?',
        japanese: '自分の考えを発表してもいいですか？',
        situation: 'アイデア発表の許可を求めるとき',
      },
    ],
  },
  friend_making: {
    '4-6': [
      { english: "Let's play!", japanese: '遊ぼう！', situation: '遊びに誘うとき' },
      { english: 'Be my friend.', japanese: '友達になろう。', situation: '友達になりたいとき' },
      { english: 'Share with me.', japanese: '分けて。', situation: '共有を求めるとき' },
      { english: "That's cool!", japanese: 'かっこいい！', situation: '相手を褒めるとき' },
      {
        english: 'Can I play with you?',
        japanese: '一緒に遊んでもいい？',
        situation: '遊びに加わりたいとき',
      },
      { english: 'What is your name?', japanese: '名前は何ですか？', situation: '名前を聞くとき' },
      { english: 'I like you!', japanese: 'あなたが好き！', situation: '好意を表現するとき' },
      { english: 'You are nice.', japanese: 'あなたは優しいね。', situation: '優しさを褒めるとき' },
      { english: 'Do you want this?', japanese: 'これ欲しい？', situation: '何かを分けるとき' },
      {
        english: "Let's be friends!",
        japanese: '友達になろう！',
        situation: '友達になることを提案するとき',
      },
      {
        english: 'Can I sit here?',
        japanese: 'ここに座ってもいい？',
        situation: '隣に座りたいとき',
      },
      { english: 'You are funny!', japanese: '面白いね！', situation: '面白さを褒めるとき' },
    ],
    '7-9': [
      {
        english: 'Do you want to play with us?',
        japanese: '一緒に遊ばない？',
        situation: 'グループに誘うとき',
      },
      {
        english: 'What do you like to do?',
        japanese: '何をするのが好き？',
        situation: '趣味を聞くとき',
      },
      {
        english: "You're really good at this!",
        japanese: 'これ本当に上手だね！',
        situation: '能力を褒めるとき',
      },
      {
        english: "Let's hang out sometime.",
        japanese: 'いつか遊ぼうよ。',
        situation: '約束をするとき',
      },
      {
        english: 'Can I join you?',
        japanese: '仲間に入れてもらえる？',
        situation: 'グループに加わりたいとき',
      },
      {
        english: 'Where do you live?',
        japanese: 'どこに住んでるの？',
        situation: '住んでいる場所を聞くとき',
      },
      { english: 'What grade are you in?', japanese: '何年生？', situation: '学年を聞くとき' },
      { english: "That's awesome!", japanese: 'すごいね！', situation: '驚きや称賛を表現するとき' },
      {
        english: 'We should be friends.',
        japanese: '友達になろうよ。',
        situation: '友情を提案するとき',
      },
      {
        english: 'Do you have any hobbies?',
        japanese: '趣味はある？',
        situation: '趣味について聞くとき',
      },
      {
        english: 'Can I have your phone number?',
        japanese: '電話番号を教えてもらえる？',
        situation: '連絡先を交換するとき',
      },
      {
        english: 'You are a good friend.',
        japanese: 'あなたは良い友達だね。',
        situation: '友情を表現するとき',
      },
    ],
    '10-12': [
      {
        english: 'We have a lot in common.',
        japanese: '私たちには共通点が多いね。',
        situation: '共通点を見つけたとき',
      },
      {
        english: 'Would you like to join our group?',
        japanese: '私たちのグループに参加しない？',
        situation: 'グループに招待するとき',
      },
      {
        english: 'I really enjoy talking with you.',
        japanese: 'あなたと話すのが本当に楽しい。',
        situation: '会話を楽しんでいるとき',
      },
      {
        english: 'Thanks for being such a good friend.',
        japanese: 'こんなに良い友達でいてくれてありがとう。',
        situation: '友情に感謝するとき',
      },
      {
        english: 'I appreciate your friendship.',
        japanese: 'あなたの友情に感謝しています。',
        situation: '友情への感謝を表現するとき',
      },
      {
        english: 'You can always count on me.',
        japanese: 'いつでも頼ってね。',
        situation: '信頼を表現するとき',
      },
      {
        english: 'I admire your personality.',
        japanese: 'あなたの性格を尊敬します。',
        situation: '人格を褒めるとき',
      },
      {
        english: "Let's stay in touch.",
        japanese: '連絡を取り合おうね。',
        situation: '継続的な連絡を提案するとき',
      },
      {
        english: 'I value our friendship.',
        japanese: '私たちの友情を大切にしています。',
        situation: '友情の重要性を表現するとき',
      },
      {
        english: 'Would you like to exchange social media?',
        japanese: 'SNSを交換しない？',
        situation: 'SNSアカウントを交換するとき',
      },
      {
        english: "You're a great listener.",
        japanese: 'あなたは話を聞くのが上手だね。',
        situation: '聞き上手を褒めるとき',
      },
      {
        english: "I'm glad we became friends.",
        japanese: '友達になれて嬉しいです。',
        situation: '友情への喜びを表現するとき',
      },
    ],
  },
  cultural_exchange: {
    '4-6': [
      {
        english: 'This is from Japan.',
        japanese: 'これは日本のものです。',
        situation: '日本の物を紹介するとき',
      },
      {
        english: 'We eat with chopsticks.',
        japanese: '私たちは箸で食べます。',
        situation: '食文化を説明するとき',
      },
      {
        english: 'Do you have this?',
        japanese: 'これ持ってる？',
        situation: '相手の文化について聞くとき',
      },
      { english: "It's fun!", japanese: '楽しいよ！', situation: '文化体験の感想を言うとき' },
      {
        english: 'I like sushi.',
        japanese: '寿司が好きです。',
        situation: '日本食について話すとき',
      },
      {
        english: 'This is a kimono.',
        japanese: 'これは着物です。',
        situation: '日本の衣装を紹介するとき',
      },
      {
        english: 'What is this?',
        japanese: 'これは何ですか？',
        situation: '知らないものについて聞くとき',
      },
      { english: 'Can you show me?', japanese: '見せてもらえる？', situation: '見せてほしいとき' },
      { english: 'I want to try it!', japanese: 'やってみたい！', situation: '体験したいとき' },
      {
        english: 'This looks yummy!',
        japanese: 'おいしそう！',
        situation: '食べ物の感想を言うとき',
      },
      {
        english: 'We say "arigatou."',
        japanese: '私たちは「ありがとう」と言います。',
        situation: '日本語を教えるとき',
      },
      { english: "That's different!", japanese: 'それは違うね！', situation: '違いに気づいたとき' },
    ],
    '7-9': [
      {
        english: 'In Japan, we celebrate New Year like this.',
        japanese: '日本ではこのようにお正月を祝います。',
        situation: '日本の行事を説明するとき',
      },
      {
        english: "What's your traditional food?",
        japanese: 'あなたの国の伝統料理は何ですか？',
        situation: '相手の食文化を聞くとき',
      },
      {
        english: 'Can you teach me your language?',
        japanese: 'あなたの言語を教えてもらえる？',
        situation: '言語を学びたいとき',
      },
      {
        english: 'This is a Japanese game.',
        japanese: 'これは日本のゲームです。',
        situation: '日本の遊びを紹介するとき',
      },
      {
        english: 'How do you say this in your language?',
        japanese: 'あなたの言語でこれは何て言いますか？',
        situation: '翻訳を聞くとき',
      },
      {
        english: 'We have a similar custom.',
        japanese: '似た習慣があります。',
        situation: '共通点を指摘するとき',
      },
      {
        english: 'This is a Japanese festival.',
        japanese: 'これは日本のお祭りです。',
        situation: '日本の祭りを紹介するとき',
      },
      {
        english: "What's your country famous for?",
        japanese: 'あなたの国は何で有名ですか？',
        situation: '相手の国について聞くとき',
      },
      {
        english: 'I want to visit your country.',
        japanese: 'あなたの国を訪れたいです。',
        situation: '訪問したい気持ちを表現するとき',
      },
      {
        english: 'We bow when we greet.',
        japanese: '私たちは挨拶するときにお辞儀をします。',
        situation: '日本のマナーを説明するとき',
      },
      {
        english: 'Can you teach me how to use chopsticks?',
        japanese: '箸の使い方を教えてもらえますか？',
        situation: '使い方を教えてほしいとき',
      },
      {
        english: 'This is very interesting!',
        japanese: 'これはとても面白いです！',
        situation: '興味を表現するとき',
      },
    ],
    '10-12': [
      {
        english: 'Our culture values respect and harmony.',
        japanese: '私たちの文化は敬意と調和を大切にします。',
        situation: '文化の価値観を説明するとき',
      },
      {
        english: 'How do you celebrate this festival?',
        japanese: 'このお祭りはどのように祝いますか？',
        situation: '祭りの祝い方を聞くとき',
      },
      {
        english: "I'd like to learn more about your country.",
        japanese: 'あなたの国についてもっと知りたいです。',
        situation: '相手の国に興味を示すとき',
      },
      {
        english: 'Cultural differences are interesting.',
        japanese: '文化の違いは興味深いです。',
        situation: '文化の違いを認めるとき',
      },
      {
        english: 'What are the main traditions in your culture?',
        japanese: 'あなたの文化の主な伝統は何ですか？',
        situation: '伝統について聞くとき',
      },
      {
        english: 'I appreciate the opportunity to learn about your culture.',
        japanese: 'あなたの文化について学ぶ機会に感謝します。',
        situation: '感謝を表現するとき',
      },
      {
        english: 'Cultural exchange enriches both of us.',
        japanese: '文化交流は私たち両方を豊かにします。',
        situation: '文化交流の価値を表現するとき',
      },
      {
        english: 'What is the significance of this symbol?',
        japanese: 'このシンボルの意義は何ですか？',
        situation: 'シンボルの意味を聞くとき',
      },
      {
        english: 'I respect your cultural practices.',
        japanese: 'あなたの文化的慣習を尊重します。',
        situation: '尊重を表現するとき',
      },
      {
        english: 'Our countries have different customs.',
        japanese: '私たちの国には異なる習慣があります。',
        situation: '違いを指摘するとき',
      },
      {
        english: 'I would love to experience your culture firsthand.',
        japanese: 'あなたの文化を直接体験したいです。',
        situation: '体験したい意欲を表現するとき',
      },
      {
        english: 'Cultural diversity makes the world interesting.',
        japanese: '文化の多様性が世界を面白くします。',
        situation: '多様性の価値を表現するとき',
      },
    ],
  },
  emergency_situations: {
    '4-6': [
      { english: 'Help me!', japanese: '助けて！', situation: '助けが必要なとき' },
      { english: "I'm lost.", japanese: '迷子になった。', situation: '道に迷ったとき' },
      { english: 'It hurts.', japanese: '痛い。', situation: '痛みを伝えるとき' },
      {
        english: 'Call my mom.',
        japanese: 'ママに電話して。',
        situation: '親への連絡を求めるとき',
      },
      { english: "I'm scared.", japanese: '怖い。', situation: '恐怖を感じているとき' },
      { english: 'Where is my mom?', japanese: 'ママはどこ？', situation: '親を探しているとき' },
      {
        english: "I can't find my way.",
        japanese: '道がわからない。',
        situation: '道に迷ったとき',
      },
      {
        english: 'Please help!',
        japanese: '助けてください！',
        situation: '丁寧に助けを求めるとき',
      },
      {
        english: "I don't feel good.",
        japanese: '気分が悪い。',
        situation: '体調不良を伝えるとき',
      },
      {
        english: 'I need a grown-up.',
        japanese: '大人が必要です。',
        situation: '大人の助けが必要なとき',
      },
      { english: "It's an emergency!", japanese: '緊急です！', situation: '緊急事態を伝えるとき' },
      { english: 'Call 911!', japanese: '911に電話して！', situation: '緊急通報を求めるとき' },
    ],
    '7-9': [
      { english: 'I need help.', japanese: '助けが必要です。', situation: '援助を求めるとき' },
      {
        english: 'Where is the hospital?',
        japanese: '病院はどこですか？',
        situation: '病院を探すとき',
      },
      {
        english: "I don't feel well.",
        japanese: '気分が悪いです。',
        situation: '体調不良を伝えるとき',
      },
      {
        english: 'Can you call an ambulance?',
        japanese: '救急車を呼んでもらえますか？',
        situation: '救急車が必要なとき',
      },
      {
        english: 'Someone is hurt.',
        japanese: '誰かがケガをしています。',
        situation: '他の人のケガを報告するとき',
      },
      {
        english: 'I need to see a doctor.',
        japanese: '医者に診てもらう必要があります。',
        situation: '医療を求めるとき',
      },
      {
        english: "I can't find my parents.",
        japanese: '両親が見つかりません。',
        situation: '親と離れたとき',
      },
      {
        english: 'Where is the nearest police station?',
        japanese: '最寄りの警察署はどこですか？',
        situation: '警察署を探すとき',
      },
      {
        english: 'My friend is missing.',
        japanese: '友達がいなくなりました。',
        situation: '友達が行方不明のとき',
      },
      { english: 'I have a fever.', japanese: '熱があります。', situation: '発熱を伝えるとき' },
      {
        english: 'Can you help me find my way?',
        japanese: '道を見つけるのを手伝ってもらえますか？',
        situation: '道案内を求めるとき',
      },
      {
        english: 'I twisted my ankle.',
        japanese: '足首をひねりました。',
        situation: 'ケガを報告するとき',
      },
    ],
    '10-12': [
      {
        english: 'This is an emergency.',
        japanese: 'これは緊急事態です。',
        situation: '緊急性を伝えるとき',
      },
      {
        english: 'I need to contact my parents.',
        japanese: '両親に連絡する必要があります。',
        situation: '親への連絡が必要なとき',
      },
      {
        english: 'Is there a doctor nearby?',
        japanese: '近くに医者はいますか？',
        situation: '医者を探すとき',
      },
      {
        english: 'Please call the police.',
        japanese: '警察を呼んでください。',
        situation: '警察が必要なとき',
      },
      {
        english: 'I need immediate medical attention.',
        japanese: '緊急の医療処置が必要です。',
        situation: '緊急医療を求めるとき',
      },
      {
        english: 'Someone has been injured.',
        japanese: '誰かがケガをしました。',
        situation: 'ケガ人を報告するとき',
      },
      {
        english: 'Where is the emergency exit?',
        japanese: '非常口はどこですか？',
        situation: '非常口を探すとき',
      },
      {
        english: 'I witnessed an accident.',
        japanese: '事故を目撃しました。',
        situation: '事故を報告するとき',
      },
      {
        english: 'Can you direct me to the nearest hospital?',
        japanese: '最寄りの病院まで案内してもらえますか？',
        situation: '病院への道を聞くとき',
      },
      {
        english: 'I have important medical information.',
        japanese: '重要な医療情報があります。',
        situation: '医療情報を伝えるとき',
      },
      {
        english: 'Please remain calm.',
        japanese: '落ち着いてください。',
        situation: '相手を落ち着かせるとき',
      },
      {
        english: 'I need to report a missing person.',
        japanese: '行方不明者を報告する必要があります。',
        situation: '行方不明を報告するとき',
      },
    ],
  },
  numbers_math: {
    '4-6': [
      {
        english: 'One plus one equals two.',
        japanese: '1たす1は2です。',
        situation: '足し算の基本',
      },
      {
        english: 'I have two apples.',
        japanese: '私はリンゴを2つ持っています。',
        situation: '数を数えるとき',
      },
      {
        english: 'Three minus one equals two.',
        japanese: '3ひく1は2です。',
        situation: '引き算の基本',
      },
      {
        english: 'Five is bigger than three.',
        japanese: '5は3より大きいです。',
        situation: '数の比較',
      },
      { english: 'I can count to ten.', japanese: '10まで数えられます。', situation: '数え方' },
      {
        english: 'Two plus three equals five.',
        japanese: '2たす3は5です。',
        situation: '足し算の練習',
      },
      {
        english: 'Four is smaller than six.',
        japanese: '4は6より小さいです。',
        situation: '数の大小',
      },
      {
        english: 'I have one, two, three pencils.',
        japanese: '鉛筆が1、2、3本あります。',
        situation: '順番に数える',
      },
      {
        english: 'Four plus two equals six.',
        japanese: '4たす2は6です。',
        situation: '足し算の練習',
      },
      {
        english: 'Six minus two equals four.',
        japanese: '6ひく2は4です。',
        situation: '引き算の練習',
      },
      {
        english: 'I can count to twenty.',
        japanese: '20まで数えられます。',
        situation: '数の練習',
      },
      {
        english: 'Seven is bigger than five.',
        japanese: '7は5より大きいです。',
        situation: '数の比較',
      },
      {
        english: 'Three plus four equals seven.',
        japanese: '3たす4は7です。',
        situation: '足し算',
      },
      {
        english: 'Eight minus three equals five.',
        japanese: '8ひく3は5です。',
        situation: '引き算',
      },
      {
        english: 'I have five fingers.',
        japanese: '私は指が5本あります。',
        situation: '体を数える',
      },
      {
        english: 'Nine is bigger than seven.',
        japanese: '9は7より大きいです。',
        situation: '数の比較',
      },
      { english: 'Five plus five equals ten.', japanese: '5たす5は10です。', situation: '足し算' },
      { english: 'Ten minus four equals six.', japanese: '10ひく4は6です。', situation: '引き算' },
      {
        english: 'Count from one to ten.',
        japanese: '1から10まで数えて。',
        situation: '数える練習',
      },
      {
        english: 'I see three birds.',
        japanese: '鳥が3羽見えます。',
        situation: '動物を数えるとき',
      },
      { english: 'Six plus one equals seven.', japanese: '6たす1は7です。', situation: '足し算' },
      { english: 'Seven minus two equals five.', japanese: '7ひく2は5です。', situation: '引き算' },
      {
        english: 'Which number is bigger?',
        japanese: 'どちらの数字が大きいですか？',
        situation: '数の比較',
      },
      {
        english: 'I have four toys.',
        japanese: '私はおもちゃを4つ持っています。',
        situation: '持ち物を数える',
      },
    ],
    '7-9': [
      {
        english: 'Ten plus five equals fifteen.',
        japanese: '10たす5は15です。',
        situation: '2桁の足し算',
      },
      { english: 'Twenty is two tens.', japanese: '20は10が2つです。', situation: '位の概念' },
      {
        english: 'Fifteen is one ten and five ones.',
        japanese: '15は10が1つと1が5つです。',
        situation: '位の分解',
      },
      {
        english: 'Ten is one less than eleven.',
        japanese: '10は11より1小さいです。',
        situation: '数の比較',
      },
      {
        english: 'I have twelve pencils and you have eight.',
        japanese: '私は鉛筆を12本、あなたは8本持っています。',
        situation: '文章問題',
      },
      { english: 'Half of ten is five.', japanese: '10の半分は5です。', situation: '半分の概念' },
      {
        english: 'Thirteen is three more than ten.',
        japanese: '13は10より3大きいです。',
        situation: '差の計算',
      },
      {
        english: 'Twenty minus seven equals thirteen.',
        japanese: '20ひく7は13です。',
        situation: '2桁の引き算',
      },
      {
        english: 'Thirty is three tens.',
        japanese: '30は10が3つです。',
        situation: '位の概念',
      },
      {
        english: 'Eighteen plus twelve equals thirty.',
        japanese: '18たす12は30です。',
        situation: '2桁の足し算',
      },
      {
        english: 'Twenty-five is two tens and five ones.',
        japanese: '25は10が2つと1が5つです。',
        situation: '位の分解',
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
        situation: '半分の概念',
      },
      {
        english: 'One quarter of twenty is five.',
        japanese: '20の4分の1は5です。',
        situation: '分数の基本',
      },
      {
        english: 'Forty minus fifteen equals twenty-five.',
        japanese: '40ひく15は25です。',
        situation: '2桁の引き算',
      },
      {
        english: 'Fourteen is four more than ten.',
        japanese: '14は10より4大きいです。',
        situation: '差の計算',
      },
      {
        english: 'Thirty-two is thirty plus two.',
        japanese: '32は30たす2です。',
        situation: '位の理解',
      },
      {
        english: 'Count by tens: ten, twenty, thirty, forty.',
        japanese: '10ずつ数える：10、20、30、40。',
        situation: 'スキップカウント',
      },
      {
        english: 'I have fifty cents.',
        japanese: '私は50セント持っています。',
        situation: 'お金を数える',
      },
      {
        english: 'Twenty-three is twenty and three.',
        japanese: '23は20と3です。',
        situation: '位の分解',
      },
      {
        english: 'Twelve plus eighteen equals thirty.',
        japanese: '12たす18は30です。',
        situation: '2桁の足し算',
      },
      {
        english: 'Fifty is five tens.',
        japanese: '50は10が5つです。',
        situation: '位の概念',
      },
      {
        english: 'Thirty-six minus twenty-one equals fifteen.',
        japanese: '36ひく21は15です。',
        situation: '2桁の引き算',
      },
    ],
    '10-12': [
      {
        english: 'Thirty-five is three tens and five ones.',
        japanese: '35は10が3つと1が5つです。',
        situation: '位の概念の応用',
      },
      {
        english: 'If you have twenty apples and give away seven, you have thirteen left.',
        japanese: 'リンゴを20個持っていて7個あげたら、13個残ります。',
        situation: '文章問題',
      },
      {
        english: 'Ten times three equals thirty.',
        japanese: '10かける3は30です。',
        situation: '掛け算',
      },
      {
        english: 'Fifty divided by five equals ten.',
        japanese: '50わる5は10です。',
        situation: '割り算',
      },
      {
        english: 'The sum of fifteen and twenty-five is forty.',
        japanese: '15と25の合計は40です。',
        situation: '合計の計算',
      },
      {
        english: 'One hundred is ten tens or one hundred ones.',
        japanese: '100は10が10個、または1が100個です。',
        situation: '100の位',
      },
      {
        english: 'Forty-two is six less than forty-eight.',
        japanese: '42は48より6小さいです。',
        situation: '差の計算',
      },
      {
        english: 'If one book costs eight dollars, three books cost twenty-four dollars.',
        japanese: '本が1冊8ドルなら、3冊で24ドルです。',
        situation: '掛け算の文章問題',
      },
      {
        english: 'Twelve times five equals sixty.',
        japanese: '12かける5は60です。',
        situation: '掛け算',
      },
      {
        english: 'One hundred divided by ten equals ten.',
        japanese: '100わる10は10です。',
        situation: '割り算',
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
        situation: '2桁の足し算',
      },
      {
        english: 'Ninety minus thirty-five equals fifty-five.',
        japanese: '90ひく35は55です。',
        situation: '2桁の引き算',
      },
      {
        english: 'Fifteen times four equals sixty.',
        japanese: '15かける4は60です。',
        situation: '掛け算',
      },
      {
        english: 'Eighty divided by four equals twenty.',
        japanese: '80わる4は20です。',
        situation: '割り算',
      },
      {
        english: 'One thousand is ten hundreds.',
        japanese: '1000は100が10個です。',
        situation: '1000の位',
      },
      {
        english: 'If you buy three items at fifteen dollars each, the total is forty-five dollars.',
        japanese: '15ドルの商品を3つ買ったら、合計45ドルです。',
        situation: '掛け算の文章問題',
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
        situation: '割り算',
      },
      {
        english:
          'If a train travels sixty kilometers per hour for two hours, it goes one hundred twenty kilometers.',
        japanese: '電車が時速60キロで2時間走ると、120キロ進みます。',
        situation: '速度の文章問題',
      },
    ],
  },
};

Object.entries(PHRASE_DATA).forEach(([category, ageMap]) => {
  Object.entries(ageMap).forEach(([ageGroup, phrases]) => {
    ageMap[ageGroup] = phrases.map((phrase) => enrichPhrase(phrase, { category, ageGroup }));
  });
});
