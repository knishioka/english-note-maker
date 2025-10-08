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
    ],
  },
  travel: {
    '4-6': [
      { english: 'Where are we going?', japanese: 'どこに行くの？', situation: '行き先を聞くとき' },
      { english: 'Are we there yet?', japanese: 'もう着いた？', situation: '到着を確認するとき' },
      { english: "I'm tired.", japanese: '疲れた。', situation: '疲れを伝えるとき' },
      { english: "Let's go!", japanese: '行こう！', situation: '出発するとき' },
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
    ],
  },
  feelings: {
    '4-6': [
      { english: "I'm happy!", japanese: 'うれしい！', situation: '喜びを表現するとき' },
      { english: "I'm sad.", japanese: '悲しい。', situation: '悲しみを表現するとき' },
      { english: "I'm angry.", japanese: '怒ってる。', situation: '怒りを表現するとき' },
      { english: "I'm scared.", japanese: '怖い。', situation: '恐怖を表現するとき' },
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
    ],
  },
  friend_making: {
    '4-6': [
      { english: "Let's play!", japanese: '遊ぼう！', situation: '遊びに誘うとき' },
      { english: 'Be my friend.', japanese: '友達になろう。', situation: '友達になりたいとき' },
      { english: 'Share with me.', japanese: '分けて。', situation: '共有を求めるとき' },
      { english: "That's cool!", japanese: 'かっこいい！', situation: '相手を褒めるとき' },
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
    ],
  },
};
