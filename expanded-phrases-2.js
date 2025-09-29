// 拡張フレーズデータ その2 - 日常生活・感情表現など
const EXPANDED_PHRASE_DATA_2 = {
  daily_life: {
    '4-6': [
      // 朝の習慣
      { english: 'Time to wake up!', japanese: '起きる時間だよ！', situation: '起床時' },
      {
        english: 'Good morning sunshine!',
        japanese: 'おはよう、お日様！',
        situation: '明るい朝の挨拶',
      },
      { english: 'Brush your teeth.', japanese: '歯を磨いて。', situation: '歯磨き' },
      { english: 'Get dressed, please.', japanese: '着替えてください。', situation: '着替え' },
      { english: 'Breakfast is ready!', japanese: '朝ごはんできたよ！', situation: '朝食準備完了' },
      { english: 'Pack your bag.', japanese: 'かばんを準備して。', situation: '登校準備' },
      {
        english: 'Don\'t forget your lunch.',
        japanese: 'お弁当忘れないで。',
        situation: '持ち物確認',
      },
      // 日中の活動
      { english: 'Let\'s eat!', japanese: '食べよう！', situation: '食事時' },
      { english: 'Wash your hands.', japanese: '手を洗って。', situation: '手洗い' },
      { english: 'Clean up your toys.', japanese: 'おもちゃを片付けて。', situation: '片付け' },
      { english: 'Time for a nap.', japanese: 'お昼寝の時間。', situation: '昼寝' },
      { english: 'Let\'s go outside!', japanese: '外に行こう！', situation: '外出' },
      { english: 'Put on your shoes.', japanese: '靴を履いて。', situation: '外出準備' },
      { english: 'Take off your shoes.', japanese: '靴を脱いで。', situation: '帰宅時' },
      // 夕方・夜の習慣
      { english: 'It\'s bath time!', japanese: 'お風呂の時間だよ！', situation: '入浴時' },
      { english: 'Dinner time!', japanese: '夕ご飯の時間！', situation: '夕食' },
      { english: 'Time for bed!', japanese: '寝る時間だよ！', situation: '就寝準備' },
      { english: 'Sweet dreams!', japanese: 'いい夢見てね！', situation: '就寝時の挨拶' },
      { english: 'Read me a story.', japanese: 'お話を読んで。', situation: '読み聞かせ希望' },
      { english: 'Turn off the light.', japanese: '電気を消して。', situation: '消灯' },
      // 基本的な習慣
      { english: 'Drink your milk.', japanese: 'ミルクを飲んで。', situation: '飲み物' },
      { english: 'Eat your vegetables.', japanese: '野菜を食べて。', situation: '食事指導' },
      { english: 'Be gentle.', japanese: '優しくして。', situation: '優しさを求める' },
      { english: 'Share with others.', japanese: 'みんなと分けて。', situation: '共有を促す' },
      { english: 'Say please.', japanese: '『お願い』と言って。', situation: '礼儀指導' },
      { english: 'Say thank you.', japanese: '『ありがとう』と言って。', situation: '感謝を促す' },
      { english: 'Wait your turn.', japanese: '順番を待って。', situation: '順番待ち' },
      { english: 'Be quiet, please.', japanese: '静かにしてください。', situation: '静粛要請' },
      { english: 'Listen carefully.', japanese: 'よく聞いて。', situation: '注意を促す' },
      { english: 'Look at me.', japanese: 'こっちを見て。', situation: '注目要請' },
    ],
    '7-9': [
      // 朝のルーティン
      { english: 'Did you sleep well?', japanese: 'よく眠れた？', situation: '睡眠確認' },
      { english: 'What\'s for breakfast?', japanese: '朝食は何？', situation: '朝食内容' },
      { english: 'I\'m getting ready.', japanese: '準備しています。', situation: '準備中' },
      {
        english: 'Where\'s my backpack?',
        japanese: '私のリュックはどこ？',
        situation: '持ち物探し',
      },
      { english: 'I\'m ready to go!', japanese: '行く準備できた！', situation: '準備完了' },
      // 家事・手伝い
      { english: 'Can I help you?', japanese: '手伝おうか？', situation: '手伝い申し出' },
      { english: 'I\'ll set the table.', japanese: 'テーブルを準備します。', situation: '食事準備' },
      { english: 'I\'ll do the dishes.', japanese: '皿洗いをします。', situation: '後片付け' },
      { english: 'I\'ll clean my room.', japanese: '部屋を掃除します。', situation: '部屋掃除' },
      {
        english: 'I\'ll feed the pet.',
        japanese: 'ペットに餌をあげます。',
        situation: 'ペット世話',
      },
      {
        english: 'I\'ll water the plants.',
        japanese: '植物に水をあげます。',
        situation: '植物の世話',
      },
      { english: 'I\'ll take out the trash.', japanese: 'ゴミを出します。', situation: 'ゴミ出し' },
      // 娯楽・余暇
      { english: 'Can I watch TV?', japanese: 'テレビを見てもいい？', situation: 'テレビ視聴許可' },
      { english: 'Can I play games?', japanese: 'ゲームをしてもいい？', situation: 'ゲーム許可' },
      {
        english: 'Can I use the tablet?',
        japanese: 'タブレットを使ってもいい？',
        situation: 'デバイス使用',
      },
      { english: 'Can I go to the park?', japanese: '公園に行ってもいい？', situation: '外出許可' },
      { english: 'Can friends come over?', japanese: '友達が来てもいい？', situation: '友達招待' },
      // 勉強・宿題
      {
        english: 'I need to do homework.',
        japanese: '宿題をしなければなりません。',
        situation: '宿題時間',
      },
      {
        english: 'I finished my homework.',
        japanese: '宿題が終わりました。',
        situation: '宿題完了',
      },
      {
        english: 'Can you check my work?',
        japanese: '私の作業を確認してくれる？',
        situation: '確認依頼',
      },
      {
        english: 'I need help with math.',
        japanese: '算数で助けが必要です。',
        situation: '教科別支援',
      },
      // 夕方・夜のルーティン
      { english: 'What\'s for dinner?', japanese: '夕食は何ですか？', situation: '夕食を聞く' },
      {
        english: 'Can I have a snack?',
        japanese: 'おやつを食べてもいい？',
        situation: 'おやつ希望',
      },
      { english: 'It\'s getting late.', japanese: '遅くなってきた。', situation: '時間確認' },
      {
        english: 'Time to get ready for bed.',
        japanese: '寝る準備の時間。',
        situation: '就寝準備開始',
      },
      {
        english: 'Can I stay up late?',
        japanese: '遅くまで起きていてもいい？',
        situation: '就寝延長希望',
      },
      { english: 'I\'m not tired yet.', japanese: 'まだ眠くない。', situation: '就寝拒否' },
      { english: 'Five more minutes!', japanese: 'あと5分！', situation: '時間延長要請' },
      { english: 'Good night everyone!', japanese: 'みんな、おやすみ！', situation: '就寝挨拶' },
    ],
    '10-12': [
      // 自立した生活習慣
      { english: 'I\'ll wake up at 7.', japanese: '7時に起きます。', situation: '起床時間設定' },
      {
        english: 'I\'ll make my own breakfast.',
        japanese: '自分で朝食を作ります。',
        situation: '自炊',
      },
      { english: 'I\'ll be back by 6.', japanese: '6時までに戻ります。', situation: '帰宅時間' },
      { english: 'I\'m going to study.', japanese: '勉強しに行きます。', situation: '勉強宣言' },
      {
        english: 'I\'ll do my chores first.',
        japanese: '先に家事をします。',
        situation: '家事優先',
      },
      // 責任と計画
      { english: 'I\'ll manage my time.', japanese: '時間管理をします。', situation: '時間管理' },
      { english: 'I need to focus.', japanese: '集中する必要があります。', situation: '集中宣言' },
      {
        english: 'I\'ll organize my schedule.',
        japanese: 'スケジュールを整理します。',
        situation: '予定管理',
      },
      {
        english: 'I\'ll prepare for tomorrow.',
        japanese: '明日の準備をします。',
        situation: '事前準備',
      },
      {
        english: 'I\'ll check my assignments.',
        japanese: '課題を確認します。',
        situation: '課題確認',
      },
      // 社交活動
      {
        english: 'Can I go out with friends?',
        japanese: '友達と出かけてもいいですか？',
        situation: '外出許可',
      },
      {
        english: 'I\'m going to the library.',
        japanese: '図書館に行きます。',
        situation: '図書館利用',
      },
      {
        english: 'I\'ll be at my friend\'s house.',
        japanese: '友達の家にいます。',
        situation: '居場所報告',
      },
      {
        english: 'Can I join the club activity?',
        japanese: 'クラブ活動に参加してもいい？',
        situation: '活動参加',
      },
      {
        english: 'I have practice after school.',
        japanese: '放課後に練習があります。',
        situation: '練習予定',
      },
      // デジタルライフ
      {
        english: 'Can I use the computer?',
        japanese: 'コンピューターを使ってもいい？',
        situation: 'PC使用許可',
      },
      {
        english: 'I need internet for homework.',
        japanese: '宿題でインターネットが必要です。',
        situation: 'ネット使用理由',
      },
      {
        english: 'I\'ll limit my screen time.',
        japanese: '画面を見る時間を制限します。',
        situation: '自己管理',
      },
      {
        english: 'Can I video call my friend?',
        japanese: '友達とビデオ通話してもいい？',
        situation: '通話許可',
      },
      // 健康管理
      {
        english: 'I\'ll exercise for 30 minutes.',
        japanese: '30分運動します。',
        situation: '運動計画',
      },
      {
        english: 'I need to eat healthier.',
        japanese: 'もっと健康的に食べる必要があります。',
        situation: '食生活改善',
      },
      { english: 'I\'ll go to bed early.', japanese: '早く寝ます。', situation: '早寝宣言' },
      {
        english: 'I\'ll drink more water.',
        japanese: 'もっと水を飲みます。',
        situation: '水分補給',
      },
      // 金銭管理
      {
        english: 'Can I have my allowance?',
        japanese: 'お小遣いをもらえる？',
        situation: 'お小遣い要求',
      },
      {
        english: 'I\'m saving for a game.',
        japanese: 'ゲームのために貯金しています。',
        situation: '貯金目的',
      },
      {
        english: 'How much does this cost?',
        japanese: 'これはいくらですか？',
        situation: '価格確認',
      },
      {
        english: 'I\'ll buy it with my money.',
        japanese: '自分のお金で買います。',
        situation: '自己購入',
      },
      // 家族との協調
      {
        english: 'I\'ll help with dinner.',
        japanese: '夕食の手伝いをします。',
        situation: '夕食準備協力',
      },
      {
        english: 'Can we eat together tonight?',
        japanese: '今夜一緒に食事できる？',
        situation: '家族団らん',
      },
      {
        english: 'I appreciate your support.',
        japanese: 'サポートに感謝します。',
        situation: '家族への感謝',
      },
      {
        english: 'Let\'s spend time together.',
        japanese: '一緒に時間を過ごそう。',
        situation: '家族時間提案',
      },
    ],
  },
  feelings: {
    '4-6': [
      // 基本的な感情
      { english: 'I\'m happy!', japanese: 'うれしい！', situation: '喜びを表現' },
      { english: 'I\'m sad.', japanese: 'かなしい。', situation: '悲しみを表現' },
      { english: 'I\'m angry.', japanese: 'おこってる。', situation: '怒りを表現' },
      { english: 'I\'m scared.', japanese: 'こわい。', situation: '恐怖を表現' },
      { english: 'I\'m tired.', japanese: 'つかれた。', situation: '疲労を表現' },
      { english: 'I\'m hungry.', japanese: 'お腹すいた。', situation: '空腹を表現' },
      { english: 'I\'m thirsty.', japanese: 'のどが渇いた。', situation: '渇きを表現' },
      { english: 'I\'m sleepy.', japanese: 'ねむい。', situation: '眠気を表現' },
      // ポジティブな感情
      { english: 'I love you!', japanese: '大好き！', situation: '愛情表現' },
      { english: 'I\'m excited!', japanese: 'ワクワクする！', situation: '興奮を表現' },
      { english: 'This is fun!', japanese: '楽しい！', situation: '楽しさを表現' },
      { english: 'I\'m proud!', japanese: '自慢だよ！', situation: '誇りを表現' },
      { english: 'I feel good!', japanese: '気持ちいい！', situation: '良い気分' },
      { english: 'I\'m lucky!', japanese: 'ラッキー！', situation: '幸運を感じる' },
      // ネガティブな感情（健全な表現）
      { english: 'I miss mommy.', japanese: 'ママに会いたい。', situation: '寂しさを表現' },
      { english: 'I\'m lonely.', japanese: 'さみしい。', situation: '孤独を表現' },
      { english: 'I\'m worried.', japanese: '心配。', situation: '心配を表現' },
      { english: 'I\'m confused.', japanese: 'わからない。', situation: '困惑を表現' },
      { english: 'I\'m bored.', japanese: 'つまらない。', situation: '退屈を表現' },
      { english: 'That\'s not fair!', japanese: 'ずるい！', situation: '不公平を訴える' },
      // 身体的な感覚
      { english: 'It hurts.', japanese: 'いたい。', situation: '痛みを表現' },
      { english: 'I feel sick.', japanese: '気分が悪い。', situation: '体調不良' },
      { english: 'I\'m hot.', japanese: 'あつい。', situation: '暑さを表現' },
      { english: 'I\'m cold.', japanese: 'さむい。', situation: '寒さを表現' },
      // 驚きと発見
      { english: 'Wow!', japanese: 'わあ！', situation: '驚嘆' },
      { english: 'I\'m surprised!', japanese: 'びっくりした！', situation: '驚きを表現' },
      { english: 'That\'s amazing!', japanese: 'すごい！', situation: '感動を表現' },
      {
        english: 'I can\'t believe it!',
        japanese: '信じられない！',
        situation: '信じられない気持ち',
      },
      // 安心と快適
      { english: 'I feel better.', japanese: 'よくなった。', situation: '回復を表現' },
      { english: 'I\'m okay now.', japanese: 'もう大丈夫。', situation: '安心を表現' },
    ],
    '7-9': [
      // 複雑な感情
      { english: 'I\'m nervous.', japanese: '緊張しています。', situation: '緊張を表現' },
      { english: 'I\'m disappointed.', japanese: 'がっかりしました。', situation: '失望を表現' },
      { english: 'I\'m embarrassed.', japanese: '恥ずかしいです。', situation: '恥ずかしさを表現' },
      { english: 'I\'m frustrated.', japanese: 'イライラする。', situation: '苛立ちを表現' },
      { english: 'I\'m jealous.', japanese: 'うらやましい。', situation: '羨望を表現' },
      { english: 'I\'m curious.', japanese: '気になる。', situation: '好奇心を表現' },
      // 達成感と自信
      { english: 'I\'m proud of myself.', japanese: '自分を誇りに思う。', situation: '自己肯定' },
      { english: 'I did my best!', japanese: 'ベストを尽くした！', situation: '努力の表明' },
      { english: 'I feel confident.', japanese: '自信がある。', situation: '自信を表現' },
      { english: 'I\'m improving!', japanese: '上達している！', situation: '成長実感' },
      { english: 'I feel accomplished.', japanese: '達成感を感じる。', situation: '達成感' },
      // 心配と不安
      { english: 'I\'m worried about the test.', japanese: 'テストが心配。', situation: '試験不安' },
      { english: 'I feel stressed.', japanese: 'ストレスを感じる。', situation: 'ストレス表現' },
      { english: 'I\'m anxious.', japanese: '不安です。', situation: '不安を表現' },
      { english: 'I\'m overwhelmed.', japanese: '圧倒されています。', situation: '圧倒感' },
      // 対人関係の感情
      { english: 'I feel left out.', japanese: '仲間外れな気がする。', situation: '疎外感' },
      { english: 'I feel accepted.', japanese: '受け入れられている。', situation: '受容感' },
      { english: 'I feel appreciated.', japanese: '感謝されている。', situation: '評価を感じる' },
      { english: 'I feel supported.', japanese: '支えられている。', situation: '支援を感じる' },
      // 安堵と解放
      { english: 'I feel relieved.', japanese: '安心しました。', situation: '安堵を表現' },
      { english: 'That\'s a relief!', japanese: 'ほっとした！', situation: '安心の瞬間' },
      { english: 'I feel free!', japanese: '自由を感じる！', situation: '解放感' },
      {
        english: 'The pressure is off.',
        japanese: 'プレッシャーがなくなった。',
        situation: '重圧解放',
      },
      // 動機と意欲
      { english: 'I\'m motivated!', japanese: 'やる気がある！', situation: '意欲表現' },
      { english: 'I\'m determined.', japanese: '決心しています。', situation: '決意表明' },
      {
        english: 'I feel inspired.',
        japanese: 'インスピレーションを感じる。',
        situation: '感化される',
      },
      {
        english: 'I\'m ready for the challenge!',
        japanese: 'チャレンジの準備ができた！',
        situation: '挑戦意欲',
      },
      // 共感と理解
      {
        english: 'I understand how you feel.',
        japanese: '気持ちがわかります。',
        situation: '共感表現',
      },
      { english: 'I feel the same way.', japanese: '同じように感じます。', situation: '同感表明' },
      {
        english: 'That must be hard.',
        japanese: 'それは大変でしょうね。',
        situation: '理解を示す',
      },
    ],
    '10-12': [
      // 成熟した感情表現
      { english: 'I feel conflicted.', japanese: '葛藤しています。', situation: '内的葛藤' },
      { english: 'I have mixed feelings.', japanese: '複雑な気持ちです。', situation: '混合感情' },
      { english: 'I\'m contemplating.', japanese: '熟考しています。', situation: '深い思考' },
      {
        english: 'I feel ambivalent.',
        japanese: 'どちらとも言えない気持ち。',
        situation: '両価性',
      },
      // 自己認識
      {
        english: 'I\'m being too hard on myself.',
        japanese: '自分に厳しすぎる。',
        situation: '自己批判認識',
      },
      { english: 'I need to be patient.', japanese: '忍耐が必要です。', situation: '忍耐の必要性' },
      {
        english: 'I\'m learning from this.',
        japanese: 'これから学んでいます。',
        situation: '学習姿勢',
      },
      {
        english: 'I\'m growing as a person.',
        japanese: '人として成長しています。',
        situation: '人格成長',
      },
      // 対人関係の成熟
      {
        english: 'I respect your feelings.',
        japanese: 'あなたの気持ちを尊重します。',
        situation: '感情尊重',
      },
      { english: 'I empathize with you.', japanese: '共感します。', situation: '深い共感' },
      {
        english: 'I appreciate your perspective.',
        japanese: 'あなたの視点に感謝します。',
        situation: '視点評価',
      },
      {
        english: 'I value our relationship.',
        japanese: '私たちの関係を大切にします。',
        situation: '関係重視',
      },
      // ストレス管理
      {
        english: 'I need to calm down.',
        japanese: '落ち着く必要があります。',
        situation: '自己鎮静',
      },
      {
        english: 'I\'m taking deep breaths.',
        japanese: '深呼吸しています。',
        situation: 'リラックス法',
      },
      { english: 'I need some space.', japanese: '少し距離が必要です。', situation: '空間要求' },
      {
        english: 'I\'m managing my stress.',
        japanese: 'ストレスを管理しています。',
        situation: 'ストレス管理',
      },
      // 目標と動機
      {
        english: 'I\'m passionate about this.',
        japanese: 'これに情熱を持っています。',
        situation: '情熱表現',
      },
      {
        english: 'I\'m committed to improving.',
        japanese: '改善に取り組んでいます。',
        situation: '改善意欲',
      },
      { english: 'I feel fulfilled.', japanese: '充実感を感じます。', situation: '充実感' },
      {
        english: 'I\'m optimistic about the future.',
        japanese: '将来に楽観的です。',
        situation: '楽観主義',
      },
      // 感謝と謙虚
      {
        english: 'I\'m grateful for this opportunity.',
        japanese: 'この機会に感謝します。',
        situation: '機会への感謝',
      },
      {
        english: 'I\'m humbled by your kindness.',
        japanese: 'あなたの優しさに恐縮です。',
        situation: '謙虚な感謝',
      },
      {
        english: 'I appreciate everything.',
        japanese: 'すべてに感謝します。',
        situation: '全般的感謝',
      },
      {
        english: 'I\'m thankful for your support.',
        japanese: 'サポートに感謝しています。',
        situation: '支援への感謝',
      },
      // 自己効力感
      { english: 'I believe in myself.', japanese: '自分を信じています。', situation: '自己信頼' },
      {
        english: 'I can overcome this.',
        japanese: 'これを乗り越えられます。',
        situation: '克服意志',
      },
      { english: 'I\'m capable of more.', japanese: 'もっとできます。', situation: '能力自覚' },
      {
        english: 'I trust my judgment.',
        japanese: '自分の判断を信頼します。',
        situation: '判断への自信',
      },
      // 内省と成長
      {
        english: 'I\'m reflecting on my actions.',
        japanese: '自分の行動を振り返っています。',
        situation: '自己反省',
      },
      {
        english: 'I see room for improvement.',
        japanese: '改善の余地があります。',
        situation: '改善認識',
      },
      { english: 'I\'m evolving.', japanese: '進化しています。', situation: '継続的成長' },
    ],
  },
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EXPANDED_PHRASE_DATA_2;
}
