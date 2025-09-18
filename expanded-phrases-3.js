// 拡張フレーズデータ その3 - 友達作り、教室英語、その他
const EXPANDED_PHRASE_DATA_3 = {
  friend_making: {
    '4-6': [
      // 遊びの誘い
      { english: 'Do you want to play?', japanese: '一緒に遊ぶ？', situation: '遊びに誘う' },
      { english: "Let's play together!", japanese: '一緒に遊ぼう！', situation: '共同遊び提案' },
      { english: 'Can I play too?', japanese: '私も遊んでいい？', situation: '参加希望' },
      { english: "Let's be friends!", japanese: '友達になろう！', situation: '友達になる' },
      { english: 'Want to play tag?', japanese: '鬼ごっこする？', situation: '特定の遊び提案' },
      {
        english: "Let's play hide and seek!",
        japanese: 'かくれんぼしよう！',
        situation: 'かくれんぼ提案',
      },
      { english: 'Can I join?', japanese: '入ってもいい？', situation: 'グループ参加' },
      // 共有と協力
      { english: 'Want to share my snack?', japanese: 'おやつを分ける？', situation: '分け合い' },
      {
        english: "Let's share toys!",
        japanese: 'おもちゃを共有しよう！',
        situation: 'おもちゃ共有',
      },
      { english: 'Can I sit with you?', japanese: '一緒に座ってもいい？', situation: '席を共有' },
      { english: "Let's help each other!", japanese: '助け合おう！', situation: '相互援助' },
      { english: 'We can take turns.', japanese: '順番にできるよ。', situation: '順番制提案' },
      // 興味と好み
      { english: "What's your favorite color?", japanese: '好きな色は何？', situation: '好み質問' },
      { english: 'Do you like animals?', japanese: '動物は好き？', situation: '興味確認' },
      {
        english: 'What games do you like?',
        japanese: 'どんなゲームが好き？',
        situation: '遊び好み',
      },
      { english: 'Do you have pets?', japanese: 'ペット飼ってる？', situation: 'ペットの話' },
      // 褒め言葉
      { english: "You're nice!", japanese: 'あなたは優しいね！', situation: '優しさを褒める' },
      { english: "You're funny!", japanese: '面白いね！', situation: 'ユーモアを褒める' },
      {
        english: 'I like your drawing!',
        japanese: 'あなたの絵が好き！',
        situation: '作品を褒める',
      },
      { english: "You're good at this!", japanese: 'これが上手だね！', situation: '能力を褒める' },
      {
        english: 'Your toy is cool!',
        japanese: 'おもちゃがかっこいい！',
        situation: '持ち物を褒める',
      },
      // 約束と継続
      {
        english: "Let's play again tomorrow!",
        japanese: '明日また遊ぼう！',
        situation: '次の約束',
      },
      { english: 'See you at recess!', japanese: '休み時間に会おう！', situation: '休憩時の約束' },
      {
        english: 'Can I come to your house?',
        japanese: 'あなたの家に行ってもいい？',
        situation: '家訪問希望',
      },
      {
        english: 'Come to my birthday party!',
        japanese: '誕生日パーティーに来て！',
        situation: 'パーティー招待',
      },
      // 仲良しアピール
      { english: "You're my best friend!", japanese: 'あなたは親友だよ！', situation: '親友宣言' },
      {
        english: "I'm happy we're friends!",
        japanese: '友達になれて嬉しい！',
        situation: '友情の喜び',
      },
      {
        english: "Let's always be friends!",
        japanese: 'ずっと友達でいよう！',
        situation: '永遠の友情',
      },
      {
        english: 'I like playing with you!',
        japanese: 'あなたと遊ぶのが好き！',
        situation: '一緒の時間を楽しむ',
      },
      {
        english: 'You make me laugh!',
        japanese: 'あなたは私を笑わせる！',
        situation: '楽しさの共有',
      },
      {
        english: "We're a good team!",
        japanese: '私たちは良いチームだ！',
        situation: 'チームワーク称賛',
      },
    ],
    '7-9': [
      // グループ活動
      {
        english: 'Would you like to join our group?',
        japanese: '私たちのグループに入る？',
        situation: 'グループに誘う',
      },
      { english: "Let's make a team!", japanese: 'チームを作ろう！', situation: 'チーム結成' },
      {
        english: 'Want to be partners?',
        japanese: 'パートナーになる？',
        situation: 'パートナー提案',
      },
      { english: "Let's work together!", japanese: '一緒に作業しよう！', situation: '協働提案' },
      {
        english: 'We need one more player.',
        japanese: 'もう一人必要だよ。',
        situation: 'メンバー募集',
      },
      // 共通の興味
      { english: 'Do you like this book?', japanese: 'この本好き？', situation: '読書の話' },
      {
        english: "What's your favorite subject?",
        japanese: '好きな教科は何？',
        situation: '教科の好み',
      },
      {
        english: 'Do you play any sports?',
        japanese: '何かスポーツしてる？',
        situation: 'スポーツの話題',
      },
      {
        english: 'What music do you like?',
        japanese: 'どんな音楽が好き？',
        situation: '音楽の好み',
      },
      { english: 'Do you watch this show?', japanese: 'この番組見てる？', situation: 'TV番組の話' },
      { english: "What's your hobby?", japanese: '趣味は何？', situation: '趣味を聞く' },
      // 学校での交流
      {
        english: 'Want to eat lunch together?',
        japanese: '一緒にランチ食べない？',
        situation: '昼食の誘い',
      },
      {
        english: "Let's sit together in class.",
        japanese: 'クラスで一緒に座ろう。',
        situation: '席の相談',
      },
      { english: 'Want to study together?', japanese: '一緒に勉強しない？', situation: '勉強仲間' },
      {
        english: "Let's do homework together.",
        japanese: '一緒に宿題しよう。',
        situation: '宿題協力',
      },
      {
        english: 'Can I borrow your notes?',
        japanese: 'ノート借りてもいい？',
        situation: 'ノート貸借',
      },
      // 放課後の活動
      {
        english: 'Want to hang out after school?',
        japanese: '放課後遊ばない？',
        situation: '放課後の誘い',
      },
      { english: "Let's go to the park!", japanese: '公園に行こう！', situation: '公園への誘い' },
      {
        english: 'Want to come to my house?',
        japanese: '私の家に来ない？',
        situation: '家への招待',
      },
      {
        english: "Let's ride bikes together!",
        japanese: '一緒に自転車に乗ろう！',
        situation: '自転車遊び',
      },
      {
        english: 'Want to play video games?',
        japanese: 'ビデオゲームする？',
        situation: 'ゲームの誘い',
      },
      // 励ましと支援
      { english: 'You can do it!', japanese: 'きっとできるよ！', situation: '励まし' },
      {
        english: "Don't worry, I'll help you.",
        japanese: '心配しないで、手伝うよ。',
        situation: '支援申し出',
      },
      { english: 'That was amazing!', japanese: 'すごかった！', situation: '成果を褒める' },
      {
        english: "You're really good at this!",
        japanese: '本当に上手だね！',
        situation: '能力を認める',
      },
      {
        english: "I'm glad you're my friend.",
        japanese: '友達でよかった。',
        situation: '友情への感謝',
      },
      // 共感と理解
      { english: 'I know how you feel.', japanese: '気持ちわかるよ。', situation: '共感を示す' },
      {
        english: 'That happened to me too.',
        japanese: '私にも同じことがあった。',
        situation: '経験共有',
      },
      {
        english: 'We have a lot in common!',
        japanese: '共通点がたくさんあるね！',
        situation: '共通点発見',
      },
      {
        english: 'I like the same things!',
        japanese: '同じものが好きだ！',
        situation: '好みの一致',
      },
      { english: "Let's keep in touch!", japanese: '連絡を取り合おう！', situation: '連絡継続' },
    ],
    '10-12': [
      // 深い友情
      {
        english: 'I value our friendship.',
        japanese: '私たちの友情を大切にしています。',
        situation: '友情の価値',
      },
      {
        english: "You're a true friend.",
        japanese: 'あなたは本当の友達です。',
        situation: '真の友情',
      },
      {
        english: 'I appreciate you.',
        japanese: 'あなたに感謝しています。',
        situation: '存在への感謝',
      },
      {
        english: 'Thanks for being there.',
        japanese: 'そばにいてくれてありがとう。',
        situation: '支えへの感謝',
      },
      {
        english: 'You inspire me.',
        japanese: 'あなたは私を刺激します。',
        situation: '刺激を受ける',
      },
      // 相互理解
      {
        english: 'I respect your opinion.',
        japanese: 'あなたの意見を尊重します。',
        situation: '意見尊重',
      },
      {
        english: 'Tell me what you think.',
        japanese: 'あなたの考えを聞かせて。',
        situation: '意見を求める',
      },
      {
        english: 'I understand your point.',
        japanese: 'あなたの要点を理解します。',
        situation: '理解表明',
      },
      { english: "Let's talk about it.", japanese: 'それについて話そう。', situation: '対話提案' },
      {
        english: "I'm here if you need me.",
        japanese: '必要な時はここにいるよ。',
        situation: '支援の申し出',
      },
      // 活動計画
      {
        english: "Let's plan something fun.",
        japanese: '楽しいことを計画しよう。',
        situation: '計画立案',
      },
      {
        english: 'Want to start a project?',
        japanese: 'プロジェクトを始めない？',
        situation: '共同プロジェクト',
      },
      {
        english: "Let's join the club together.",
        japanese: '一緒にクラブに入ろう。',
        situation: 'クラブ活動',
      },
      {
        english: 'We should study for the test.',
        japanese: 'テストのために勉強すべきだね。',
        situation: '試験準備',
      },
      {
        english: "Let's form a study group.",
        japanese: '勉強グループを作ろう。',
        situation: 'グループ学習',
      },
      // 信頼と支援
      { english: 'I trust you.', japanese: 'あなたを信頼しています。', situation: '信頼表明' },
      {
        english: 'You can count on me.',
        japanese: '私を頼ってもいいよ。',
        situation: '頼れる存在',
      },
      {
        english: "Let's support each other.",
        japanese: 'お互いを支え合おう。',
        situation: '相互支援',
      },
      { english: "I've got your back.", japanese: 'あなたを支えるよ。', situation: '後ろ盾' },
      { english: "We're in this together.", japanese: '一緒にいるよ。', situation: '団結' },
      // 成長と発展
      {
        english: "You've helped me grow.",
        japanese: 'あなたは私を成長させてくれた。',
        situation: '成長への感謝',
      },
      {
        english: "Let's achieve our goals together.",
        japanese: '一緒に目標を達成しよう。',
        situation: '共同目標',
      },
      {
        english: 'We make a great team.',
        japanese: '私たちは素晴らしいチームだ。',
        situation: 'チーム賛美',
      },
      {
        english: 'Our friendship is special.',
        japanese: '私たちの友情は特別だ。',
        situation: '特別な関係',
      },
      {
        english: 'Thanks for understanding me.',
        japanese: '理解してくれてありがとう。',
        situation: '理解への感謝',
      },
      // 長期的な関係
      {
        english: "Let's stay friends forever.",
        japanese: '永遠に友達でいよう。',
        situation: '永続的友情',
      },
      {
        english: "Distance won't change our friendship.",
        japanese: '距離は友情を変えない。',
        situation: '距離を超えた友情',
      },
      {
        english: "I'll always remember this.",
        japanese: 'これをずっと覚えているよ。',
        situation: '思い出作り',
      },
      {
        english: 'You mean a lot to me.',
        japanese: 'あなたは私にとって大切です。',
        situation: '大切さの表現',
      },
      {
        english: 'Thanks for the memories.',
        japanese: '思い出をありがとう。',
        situation: '思い出への感謝',
      },
    ],
  },
  classroom_english: {
    '4-6': [
      // 基本的な質問
      { english: 'Can you help me?', japanese: '手伝ってくれる？', situation: '助けを求める' },
      { english: "I don't understand.", japanese: 'わかりません。', situation: '理解できない' },
      {
        english: 'What does this mean?',
        japanese: 'これはどういう意味？',
        situation: '意味を聞く',
      },
      { english: 'Can you say it again?', japanese: 'もう一度言って？', situation: '聞き返す' },
      { english: 'Is this right?', japanese: 'これで合ってる？', situation: '確認' },
      // 作業関連
      { english: "I'm finished!", japanese: '終わった！', situation: '完了報告' },
      { english: 'I need more time.', japanese: 'もっと時間が必要。', situation: '時間延長' },
      { english: 'Can I start?', japanese: '始めてもいい？', situation: '開始許可' },
      { english: 'What should I do?', japanese: '何をすればいい？', situation: '指示を求める' },
      { english: 'I made a mistake.', japanese: '間違えちゃった。', situation: '誤り報告' },
      // 教材・道具
      { english: 'I need paper.', japanese: '紙が必要です。', situation: '紙の要求' },
      {
        english: 'Can I use crayons?',
        japanese: 'クレヨン使ってもいい？',
        situation: '道具使用許可',
      },
      { english: "Where's my book?", japanese: '私の本はどこ？', situation: '教材探し' },
      { english: 'I lost my pencil.', japanese: '鉛筆をなくした。', situation: '紛失報告' },
      {
        english: 'Can I sharpen my pencil?',
        japanese: '鉛筆を削ってもいい？',
        situation: '鉛筆削り',
      },
      // 教室内の移動
      {
        english: 'Can I go to the bathroom?',
        japanese: 'トイレに行ってもいい？',
        situation: 'トイレ許可',
      },
      { english: 'Can I get water?', japanese: '水を飲んでもいい？', situation: '水飲み許可' },
      { english: 'Can I sit here?', japanese: 'ここに座ってもいい？', situation: '着席許可' },
      { english: 'Can I move my desk?', japanese: '机を動かしてもいい？', situation: '机移動' },
      // 視聴覚の問題
      { english: "I can't see.", japanese: '見えません。', situation: '視界問題' },
      { english: "I can't hear.", japanese: '聞こえません。', situation: '聴覚問題' },
      { english: "It's too loud.", japanese: 'うるさすぎます。', situation: '音量問題' },
      { english: 'Can you write it?', japanese: '書いてくれる？', situation: '板書依頼' },
      // 発表・参加
      { english: 'Can I try?', japanese: 'やってみてもいい？', situation: '挑戦希望' },
      { english: 'I know!', japanese: 'わかった！', situation: '理解表明' },
      { english: 'Pick me!', japanese: '私を選んで！', situation: '指名希望' },
      { english: "It's my turn!", japanese: '私の番！', situation: '順番主張' },
      { english: 'Can I show you?', japanese: '見せてもいい？', situation: '披露希望' },
      // 協力とマナー
      { english: "Let's clean up!", japanese: '片付けよう！', situation: '片付け提案' },
      { english: 'Be quiet please.', japanese: '静かにしてください。', situation: '静粛要請' },
      { english: "Let's line up!", japanese: '並ぼう！', situation: '整列提案' },
    ],
    '7-9': [
      // 理解確認
      {
        english: 'Could you explain that?',
        japanese: '説明してもらえますか？',
        situation: '説明要求',
      },
      { english: 'What page are we on?', japanese: '何ページですか？', situation: 'ページ確認' },
      { english: 'How do you spell that?', japanese: 'どう綴りますか？', situation: 'スペル確認' },
      {
        english: 'Can you give an example?',
        japanese: '例を挙げてもらえますか？',
        situation: '例示要求',
      },
      { english: 'Is this for homework?', japanese: 'これは宿題ですか？', situation: '宿題確認' },
      // 学習サポート
      {
        english: 'Can I use a dictionary?',
        japanese: '辞書を使ってもいいですか？',
        situation: '辞書使用',
      },
      {
        english: 'May I work with a partner?',
        japanese: 'パートナーと作業してもいい？',
        situation: '協働許可',
      },
      {
        english: 'Can we work in groups?',
        japanese: 'グループで作業できますか？',
        situation: 'グループ作業',
      },
      {
        english: 'I need help with this.',
        japanese: 'これで助けが必要です。',
        situation: '支援要請',
      },
      {
        english: 'Can you check my work?',
        japanese: '私の作業を確認してくれる？',
        situation: '確認依頼',
      },
      // 時間管理
      {
        english: 'How much time do we have?',
        japanese: 'どのくらい時間がありますか？',
        situation: '時間確認',
      },
      { english: 'When is this due?', japanese: 'いつまでですか？', situation: '期限確認' },
      {
        english: 'Can I have more time?',
        japanese: 'もっと時間をもらえますか？',
        situation: '延長要請',
      },
      { english: 'I finished early.', japanese: '早く終わりました。', situation: '早期完了' },
      { english: 'What do I do next?', japanese: '次は何をしますか？', situation: '次の指示' },
      // 発言と議論
      {
        english: 'May I say something?',
        japanese: '何か言ってもいいですか？',
        situation: '発言許可',
      },
      { english: 'I have a question.', japanese: '質問があります。', situation: '質問提起' },
      { english: 'I have an idea.', japanese: 'アイデアがあります。', situation: 'アイデア提示' },
      {
        english: 'Can I share my answer?',
        japanese: '答えを共有してもいい？',
        situation: '回答共有',
      },
      { english: 'I agree with that.', japanese: 'それに賛成です。', situation: '同意表明' },
      { english: 'I think differently.', japanese: '違う考えです。', situation: '異見表明' },
      // 教材・リソース
      {
        english: 'Which book should I use?',
        japanese: 'どの本を使えばいいですか？',
        situation: '教材選択',
      },
      {
        english: 'Can I borrow this?',
        japanese: 'これを借りてもいいですか？',
        situation: '貸借依頼',
      },
      { english: 'Where can I find...?', japanese: '...はどこにありますか？', situation: '探し物' },
      { english: 'Can I print this?', japanese: 'これを印刷してもいい？', situation: '印刷許可' },
      // フィードバック
      { english: 'Did I do it right?', japanese: '正しくできましたか？', situation: '正誤確認' },
      { english: 'How can I improve?', japanese: 'どう改善できますか？', situation: '改善方法' },
      { english: 'What did I miss?', japanese: '何を見逃しましたか？', situation: '欠落確認' },
      {
        english: 'Can you show me how?',
        japanese: 'やり方を見せてくれる？',
        situation: '実演依頼',
      },
      { english: 'I understand now!', japanese: '今わかりました！', situation: '理解達成' },
    ],
    '10-12': [
      // 高度な理解
      {
        english: 'Could you elaborate on that?',
        japanese: '詳しく説明してもらえますか？',
        situation: '詳細説明',
      },
      {
        english: "What's the main concept?",
        japanese: '主要な概念は何ですか？',
        situation: '概念確認',
      },
      {
        english: 'How does this relate to...?',
        japanese: 'これは...とどう関係しますか？',
        situation: '関連性',
      },
      {
        english: 'Can you clarify the objective?',
        japanese: '目的を明確にしてもらえますか？',
        situation: '目的確認',
      },
      { english: "What's the criteria?", japanese: '基準は何ですか？', situation: '基準確認' },
      // 批判的思考
      {
        english: 'I respectfully disagree.',
        japanese: '失礼ながら反対です。',
        situation: '丁寧な反対',
      },
      {
        english: 'May I offer another perspective?',
        japanese: '別の視点を提供してもいいですか？',
        situation: '視点提供',
      },
      { english: 'Could we consider...?', japanese: '...を検討できますか？', situation: '提案' },
      {
        english: 'What evidence supports this?',
        japanese: '何がこれを裏付けますか？',
        situation: '根拠要求',
      },
      { english: 'Are there exceptions?', japanese: '例外はありますか？', situation: '例外確認' },
      // プレゼンテーション
      {
        english: 'May I present my findings?',
        japanese: '発見を発表してもいいですか？',
        situation: '発表申し出',
      },
      {
        english: 'Could I use the board?',
        japanese: '黒板を使ってもいいですか？',
        situation: '黒板使用',
      },
      { english: "I'd like to demonstrate.", japanese: '実演したいです。', situation: '実演希望' },
      { english: 'May I continue?', japanese: '続けてもいいですか？', situation: '継続確認' },
      {
        english: 'Are there any questions?',
        japanese: '質問はありますか？',
        situation: '質問募集',
      },
      // 学術的議論
      {
        english: 'Based on my research...',
        japanese: '私の調査によると...',
        situation: '調査引用',
      },
      { english: 'The data suggests...', japanese: 'データが示すのは...', situation: 'データ解釈' },
      { english: 'In conclusion...', japanese: '結論として...', situation: '結論提示' },
      { english: 'To summarize...', japanese: '要約すると...', situation: '要約' },
      { english: 'The hypothesis is...', japanese: '仮説は...', situation: '仮説提示' },
      // 協働学習
      {
        english: "Let's divide the tasks.",
        japanese: 'タスクを分けましょう。',
        situation: '作業分担',
      },
      {
        english: 'Can we peer review?',
        japanese: '相互レビューできますか？',
        situation: '相互評価',
      },
      {
        english: "Let's brainstorm together.",
        japanese: '一緒にブレインストーミングしましょう。',
        situation: 'アイデア出し',
      },
      {
        english: 'Could we collaborate on this?',
        japanese: 'これで協力できますか？',
        situation: '協力提案',
      },
      { english: "I'll take notes.", japanese: 'メモを取ります。', situation: '記録係' },
      // 評価とフィードバック
      {
        english: 'How will this be assessed?',
        japanese: 'これはどう評価されますか？',
        situation: '評価方法',
      },
      {
        english: "What's the rubric?",
        japanese: '評価基準は何ですか？',
        situation: 'ルーブリック',
      },
      {
        english: 'Can I revise my work?',
        japanese: '作業を修正してもいいですか？',
        situation: '修正機会',
      },
      {
        english: 'I appreciate the feedback.',
        japanese: 'フィードバックに感謝します。',
        situation: 'FB感謝',
      },
      {
        english: 'How can I excel?',
        japanese: 'どうすれば優れた成果を出せますか？',
        situation: '卓越追求',
      },
    ],
  },
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EXPANDED_PHRASE_DATA_3;
}
