/**
 * フレーズ練習用データ
 * カテゴリー別・年齢別のフレーズリスト
 */

export const PHRASE_DATA = {
  greetings: {
    '4-6': [
      { english: 'Hello!', japanese: 'こんにちは！', situation: '友達に会ったとき' },
      { english: 'Good morning!', japanese: 'おはよう！', situation: '朝のあいさつ' },
      { english: 'Good night!', japanese: 'おやすみ！', situation: '寝るとき' },
      { english: 'See you later!', japanese: 'また後で！', situation: '別れるとき' },
      { english: 'Thank you!', japanese: 'ありがとう！', situation: '感謝するとき' },
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
    ],
  },
};
