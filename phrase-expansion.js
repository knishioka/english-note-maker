// 既存フレーズカテゴリーの拡充（5個→8個）と新規カテゴリー追加

const PHRASE_LISTS_EXPANSION = {
    // 既存カテゴリーの拡充（各3個追加）
    greetings: {
        "4-6": [
            // 既存5個に追加
            { phrase: "See you later!", japanese: "またあとでね！", situation: "別れ際" },
            { phrase: "Have a nice day!", japanese: "よい一日を！", situation: "朝の挨拶" },
            { phrase: "Good luck!", japanese: "がんばって！", situation: "応援" }
        ],
        "7-9": [
            // 既存5個に追加
            { phrase: "How was your weekend?", japanese: "週末はどうだった？", situation: "月曜の会話" },
            { phrase: "Long time no see!", japanese: "ひさしぶり！", situation: "久々の再会" },
            { phrase: "Take care!", japanese: "気をつけてね！", situation: "心配の時" }
        ],
        "10-12": [
            // 既存5個に追加
            { phrase: "It's been a while", japanese: "しばらくぶりですね", situation: "丁寧な再会" },
            { phrase: "Hope to see you soon", japanese: "また近いうちに会えることを願っています", situation: "別れの挨拶" },
            { phrase: "Have a great weekend!", japanese: "素敵な週末を！", situation: "金曜の挨拶" }
        ]
    },
    self_introduction: {
        "4-6": [
            // 既存5個に追加
            { phrase: "I'm new here", japanese: "ここに来たばかりです", situation: "転校初日" },
            { phrase: "Nice to meet you!", japanese: "はじめまして！", situation: "初対面" },
            { phrase: "I like to play", japanese: "遊ぶのが好きです", situation: "趣味の話" }
        ],
        "7-9": [
            // 既存5個に追加
            { phrase: "I'm from Japan", japanese: "日本から来ました", situation: "出身地の説明" },
            { phrase: "I speak Japanese and English", japanese: "日本語と英語を話します", situation: "言語能力" },
            { phrase: "I've been here for a month", japanese: "ここに来て1ヶ月です", situation: "滞在期間" }
        ],
        "10-12": [
            // 既存5個に追加
            { phrase: "I'm interested in science", japanese: "科学に興味があります", situation: "学習興味" },
            { phrase: "My goal is to...", japanese: "私の目標は〜です", situation: "将来の話" },
            { phrase: "I'm passionate about...", japanese: "〜に情熱を持っています", situation: "熱意の表現" }
        ]
    },
    school: {
        "4-6": [
            // 既存5個に追加
            { phrase: "Where is the bathroom?", japanese: "トイレはどこですか？", situation: "場所を聞く" },
            { phrase: "I'm finished!", japanese: "できました！", situation: "課題完了" },
            { phrase: "Can I go to the nurse?", japanese: "保健室に行ってもいいですか？", situation: "体調不良" }
        ],
        "7-9": [
            // 既存5個に追加
            { phrase: "When is the homework due?", japanese: "宿題の期限はいつですか？", situation: "締切確認" },
            { phrase: "Can I borrow your notes?", japanese: "ノートを借りてもいい？", situation: "ノート貸借" },
            { phrase: "What page are we on?", japanese: "何ページですか？", situation: "授業中" }
        ],
        "10-12": [
            // 既存5個に追加
            { phrase: "Could you clarify that?", japanese: "それを明確にしていただけますか？", situation: "説明要求" },
            { phrase: "I'd like to add to that", japanese: "それに付け加えたいのですが", situation: "議論参加" },
            { phrase: "From my perspective...", japanese: "私の観点から見ると...", situation: "意見表明" }
        ]
    },
    shopping: {
        "4-6": [
            // 既存5個に追加
            { phrase: "I want this one", japanese: "これがほしいです", situation: "商品選択" },
            { phrase: "Is this mine?", japanese: "これは私のですか？", situation: "所有確認" },
            { phrase: "Thank you for helping", japanese: "助けてくれてありがとう", situation: "お礼" }
        ],
        "7-9": [
            // 既存5個に追加
            { phrase: "Do you have a smaller size?", japanese: "もっと小さいサイズはありますか？", situation: "サイズ確認" },
            { phrase: "Can I try this on?", japanese: "試着してもいいですか？", situation: "試着希望" },
            { phrase: "Where can I find...?", japanese: "〜はどこにありますか？", situation: "商品検索" }
        ],
        "10-12": [
            // 既存5個に追加
            { phrase: "Is there a discount?", japanese: "割引はありますか？", situation: "価格交渉" },
            { phrase: "Do you accept credit cards?", japanese: "クレジットカードは使えますか？", situation: "支払方法" },
            { phrase: "Can I get a receipt?", japanese: "レシートをもらえますか？", situation: "領収書要求" }
        ]
    },
    travel: {
        "4-6": [
            // 既存5個に追加
            { phrase: "Are we there yet?", japanese: "もう着いた？", situation: "移動中" },
            { phrase: "I need to go potty", japanese: "トイレに行きたい", situation: "生理的要求" },
            { phrase: "I'm tired", japanese: "つかれた", situation: "疲労表現" }
        ],
        "7-9": [
            // 既存5個に追加
            { phrase: "How long does it take?", japanese: "どのくらい時間がかかりますか？", situation: "所要時間" },
            { phrase: "Which way should we go?", japanese: "どっちに行けばいい？", situation: "道案内" },
            { phrase: "Is this the right bus?", japanese: "このバスで合ってる？", situation: "交通確認" }
        ],
        "10-12": [
            // 既存5個に追加
            { phrase: "What time does it depart?", japanese: "何時に出発しますか？", situation: "時刻確認" },
            { phrase: "Is there a connection?", japanese: "乗り換えはありますか？", situation: "乗換確認" },
            { phrase: "Where can I buy tickets?", japanese: "チケットはどこで買えますか？", situation: "切符購入" }
        ]
    },
    feelings: {
        "4-6": [
            // 既存5個に追加
            { phrase: "I'm scared", japanese: "こわい", situation: "恐怖" },
            { phrase: "That's not fair!", japanese: "ずるい！", situation: "不公平" },
            { phrase: "I miss my mom", japanese: "ママに会いたい", situation: "寂しさ" }
        ],
        "7-9": [
            // 既存5個に追加
            { phrase: "I'm frustrated", japanese: "イライラする", situation: "苛立ち" },
            { phrase: "I'm proud of myself", japanese: "自分を誇りに思う", situation: "達成感" },
            { phrase: "I feel left out", japanese: "仲間外れな気がする", situation: "疎外感" }
        ],
        "10-12": [
            // 既存5個に追加
            { phrase: "I'm overwhelmed", japanese: "圧倒されています", situation: "プレッシャー" },
            { phrase: "I appreciate your support", japanese: "サポートに感謝します", situation: "感謝" },
            { phrase: "I'm conflicted about...", japanese: "〜について葛藤しています", situation: "迷い" }
        ]
    },
    daily_life: {
        "4-6": [
            // 既存5個に追加
            { phrase: "Time to clean up", japanese: "片付けの時間", situation: "整理整頓" },
            { phrase: "Wash your hands", japanese: "手を洗って", situation: "衛生習慣" },
            { phrase: "It's bedtime", japanese: "寝る時間", situation: "就寝" }
        ],
        "7-9": [
            // 既存5個に追加
            { phrase: "Did you brush your teeth?", japanese: "歯を磨いた？", situation: "衛生確認" },
            { phrase: "Pack your bag", japanese: "かばんを準備して", situation: "登校準備" },
            { phrase: "Set your alarm", japanese: "目覚ましをセットして", situation: "時間管理" }
        ],
        "10-12": [
            // 既存5個に追加
            { phrase: "I need to focus", japanese: "集中する必要があります", situation: "勉強時" },
            { phrase: "Let me check my schedule", japanese: "スケジュールを確認させて", situation: "予定確認" },
            { phrase: "I'll manage my time better", japanese: "時間管理を改善します", situation: "反省" }
        ]
    },
    classroom_english: {
        "4-6": [
            // 既存5個に追加
            { phrase: "Can you say it again?", japanese: "もう一度言ってください", situation: "聞き返し" },
            { phrase: "I don't know", japanese: "わかりません", situation: "不明時" },
            { phrase: "Is this right?", japanese: "これで合ってますか？", situation: "確認" }
        ],
        "7-9": [
            // 既存5個に追加
            { phrase: "Could you speak slower?", japanese: "もっとゆっくり話してもらえますか？", situation: "速度調整" },
            { phrase: "What should I do next?", japanese: "次は何をすればいいですか？", situation: "指示確認" },
            { phrase: "I have a different answer", japanese: "違う答えがあります", situation: "意見相違" }
        ],
        "10-12": [
            // 既存5個に追加
            { phrase: "May I elaborate on that?", japanese: "それについて詳しく説明してもいいですか？", situation: "詳細説明" },
            { phrase: "I'd like to present my findings", japanese: "私の発見を発表したいです", situation: "発表希望" },
            { phrase: "Could we discuss this further?", japanese: "これについてもっと議論できますか？", situation: "議論提案" }
        ]
    },
    friend_making: {
        "4-6": [
            // 既存5個に追加
            { phrase: "Let's be friends!", japanese: "友達になろう！", situation: "友達作り" },
            { phrase: "Do you want to sit together?", japanese: "一緒に座る？", situation: "誘い" },
            { phrase: "That's so cool!", japanese: "すごくかっこいい！", situation: "賞賛" }
        ],
        "7-9": [
            // 既存5個に追加
            { phrase: "We have a lot in common", japanese: "共通点がたくさんあるね", situation: "共感" },
            { phrase: "Want to hang out after school?", japanese: "放課後遊ばない？", situation: "誘い" },
            { phrase: "You're really good at that", japanese: "それ本当に上手だね", situation: "褒め言葉" }
        ],
        "10-12": [
            // 既存5個に追加
            { phrase: "I value our friendship", japanese: "私たちの友情を大切にしています", situation: "友情表現" },
            { phrase: "Thanks for having my back", japanese: "支えてくれてありがとう", situation: "感謝" },
            { phrase: "Let's stay in touch", japanese: "連絡を取り合おう", situation: "関係維持" }
        ]
    },
    cultural_exchange: {
        "4-6": [
            // 既存5個に追加
            { phrase: "We do it differently", japanese: "私たちは違うやり方をします", situation: "文化の違い" },
            { phrase: "What's this called?", japanese: "これは何て言うの？", situation: "名称確認" },
            { phrase: "Can you teach me?", japanese: "教えてくれる？", situation: "学習意欲" }
        ],
        "7-9": [
            // 既存5個に追加
            { phrase: "What's it like in your country?", japanese: "あなたの国ではどんな感じ？", situation: "文化質問" },
            { phrase: "We celebrate differently", japanese: "私たちは違う祝い方をします", situation: "行事の違い" },
            { phrase: "That's new to me", japanese: "それは初めて知りました", situation: "新発見" }
        ],
        "10-12": [
            // 既存5個に追加
            { phrase: "I respect your traditions", japanese: "あなたの伝統を尊重します", situation: "文化尊重" },
            { phrase: "It's fascinating how different...", japanese: "〜の違いが興味深いです", situation: "文化比較" },
            { phrase: "Let me share my culture", japanese: "私の文化を紹介させてください", situation: "文化紹介" }
        ]
    },
    emergency_situations: {
        "4-6": [
            // 既存5個に追加
            { phrase: "I feel sick", japanese: "気分が悪い", situation: "体調不良" },
            { phrase: "I can't find my...", japanese: "〜が見つからない", situation: "紛失" },
            { phrase: "Help me please!", japanese: "助けてください！", situation: "緊急要請" }
        ],
        "7-9": [
            // 既存5個に追加
            { phrase: "I think I'm lost", japanese: "迷子になったみたい", situation: "道に迷う" },
            { phrase: "My stomach hurts", japanese: "お腹が痛い", situation: "腹痛" },
            { phrase: "I need to call my parents", japanese: "両親に電話したい", situation: "連絡希望" }
        ],
        "10-12": [
            // 既存5個に追加
            { phrase: "I need medical attention", japanese: "医療処置が必要です", situation: "医療要請" },
            { phrase: "This is an emergency", japanese: "これは緊急事態です", situation: "緊急宣言" },
            { phrase: "Please contact my guardian", japanese: "保護者に連絡してください", situation: "保護者連絡" }
        ]
    }
};

// 新規フレーズカテゴリー（インターナショナルスクール向け）
const NEW_PHRASE_CATEGORIES = {
    // 質問する時
    asking_questions: {
        "4-6": [
            { phrase: "What is this?", japanese: "これは何？", situation: "物の名前" },
            { phrase: "Why?", japanese: "どうして？", situation: "理由を聞く" },
            { phrase: "Can I try?", japanese: "やってみてもいい？", situation: "挑戦希望" },
            { phrase: "How do you do it?", japanese: "どうやるの？", situation: "方法質問" },
            { phrase: "When is snack time?", japanese: "おやつの時間はいつ？", situation: "時間確認" },
            { phrase: "Where do I put this?", japanese: "これどこに置く？", situation: "場所確認" },
            { phrase: "Who is that?", japanese: "あの人は誰？", situation: "人物確認" },
            { phrase: "Is it my turn?", japanese: "私の番？", situation: "順番確認" }
        ],
        "7-9": [
            { phrase: "Could you explain that again?", japanese: "もう一度説明してもらえますか？", situation: "再説明要求" },
            { phrase: "What does this word mean?", japanese: "この単語の意味は？", situation: "語彙確認" },
            { phrase: "How do you pronounce this?", japanese: "これはどう発音しますか？", situation: "発音確認" },
            { phrase: "Is this going to be on the test?", japanese: "これはテストに出ますか？", situation: "試験範囲" },
            { phrase: "Can you give me an example?", japanese: "例を教えてもらえますか？", situation: "例示要求" },
            { phrase: "What's the difference between...?", japanese: "〜の違いは何ですか？", situation: "比較質問" },
            { phrase: "How much time do we have?", japanese: "どのくらい時間がありますか？", situation: "時間確認" },
            { phrase: "May I ask a question?", japanese: "質問してもいいですか？", situation: "質問許可" }
        ],
        "10-12": [
            { phrase: "Could you elaborate on that point?", japanese: "その点について詳しく説明していただけますか？", situation: "詳細要求" },
            { phrase: "What's the rationale behind...?", japanese: "〜の根拠は何ですか？", situation: "理由追求" },
            { phrase: "How does this relate to...?", japanese: "これは〜とどう関係しますか？", situation: "関連質問" },
            { phrase: "What are the implications of...?", japanese: "〜の意味するところは？", situation: "含意確認" },
            { phrase: "Could you provide more context?", japanese: "もっと背景を教えていただけますか？", situation: "背景要求" },
            { phrase: "What's your perspective on...?", japanese: "〜についてのご意見は？", situation: "意見質問" },
            { phrase: "How can I improve my...?", japanese: "どうすれば〜を改善できますか？", situation: "改善相談" },
            { phrase: "What resources do you recommend?", japanese: "どんな資料がお勧めですか？", situation: "資料要求" }
        ]
    },
    // チームワーク
    teamwork_phrases: {
        "4-6": [
            { phrase: "Let's share", japanese: "分け合おう", situation: "共有提案" },
            { phrase: "Your turn!", japanese: "あなたの番！", situation: "順番交代" },
            { phrase: "Good job, team!", japanese: "チーム、よくやった！", situation: "チーム称賛" },
            { phrase: "We can do it!", japanese: "私たちならできる！", situation: "励まし" },
            { phrase: "Let's help each other", japanese: "助け合おう", situation: "協力提案" },
            { phrase: "I'll do this part", japanese: "この部分は私がやる", situation: "役割分担" },
            { phrase: "Can you help me?", japanese: "手伝ってくれる？", situation: "援助要請" },
            { phrase: "We did it together!", japanese: "一緒にやったね！", situation: "達成喜び" }
        ],
        "7-9": [
            { phrase: "What's your idea?", japanese: "あなたのアイデアは？", situation: "意見収集" },
            { phrase: "Let's vote on it", japanese: "投票で決めよう", situation: "民主的決定" },
            { phrase: "I agree with your point", japanese: "あなたの意見に賛成", situation: "同意表明" },
            { phrase: "Let me add to that", japanese: "それに付け加えさせて", situation: "補足" },
            { phrase: "How about we try...?", japanese: "〜を試してみるのはどう？", situation: "提案" },
            { phrase: "Let's divide the work", japanese: "仕事を分担しよう", situation: "作業分担" },
            { phrase: "Great teamwork, everyone!", japanese: "みんな、素晴らしいチームワーク！", situation: "全体称賛" },
            { phrase: "We should communicate better", japanese: "もっとコミュニケーションを取るべき", situation: "改善提案" }
        ],
        "10-12": [
            { phrase: "Let's brainstorm together", japanese: "一緒にブレインストーミングしよう", situation: "アイデア出し" },
            { phrase: "I value your contribution", japanese: "あなたの貢献を評価します", situation: "貢献認識" },
            { phrase: "Let's build on that idea", japanese: "そのアイデアを発展させよう", situation: "発展提案" },
            { phrase: "We need to coordinate better", japanese: "もっと調整が必要です", situation: "連携改善" },
            { phrase: "Let's leverage our strengths", japanese: "私たちの強みを活かそう", situation: "強み活用" },
            { phrase: "I'll take responsibility for...", japanese: "〜の責任は私が取ります", situation: "責任表明" },
            { phrase: "Let's establish clear roles", japanese: "明確な役割を決めよう", situation: "役割明確化" },
            { phrase: "Our collaboration paid off", japanese: "私たちの協力が実を結んだ", situation: "成功評価" }
        ]
    },
    // 問題解決
    problem_solving: {
        "4-6": [
            { phrase: "I can't do it", japanese: "できない", situation: "困難表明" },
            { phrase: "It's too hard", japanese: "難しすぎる", situation: "難易度" },
            { phrase: "Show me how", japanese: "やり方を見せて", situation: "実演要求" },
            { phrase: "I need help", japanese: "助けが必要", situation: "援助要請" },
            { phrase: "I'll try again", japanese: "もう一度やってみる", situation: "再挑戦" },
            { phrase: "This is broken", japanese: "これ壊れてる", situation: "故障報告" },
            { phrase: "I made a mistake", japanese: "間違えちゃった", situation: "誤り認識" },
            { phrase: "Can you fix it?", japanese: "直してくれる？", situation: "修理要請" }
        ],
        "7-9": [
            { phrase: "I'm stuck on this problem", japanese: "この問題で詰まっています", situation: "行き詰まり" },
            { phrase: "Can you give me a hint?", japanese: "ヒントをもらえますか？", situation: "ヒント要求" },
            { phrase: "I think there's a mistake", japanese: "間違いがあると思います", situation: "誤り指摘" },
            { phrase: "Let me try a different way", japanese: "別の方法を試させて", situation: "代替案" },
            { phrase: "I need more time", japanese: "もっと時間が必要です", situation: "時間要求" },
            { phrase: "Can we work on this together?", japanese: "一緒に取り組める？", situation: "協力要請" },
            { phrase: "I don't understand the instructions", japanese: "指示が理解できません", situation: "理解困難" },
            { phrase: "Is there another way to do this?", japanese: "他のやり方はありますか？", situation: "代替方法" }
        ],
        "10-12": [
            { phrase: "I'm having technical difficulties", japanese: "技術的な問題があります", situation: "技術問題" },
            { phrase: "Let's troubleshoot this together", japanese: "一緒に問題解決しましょう", situation: "共同解決" },
            { phrase: "I need clarification on...", japanese: "〜について明確化が必要です", situation: "明確化要求" },
            { phrase: "What alternatives do we have?", japanese: "どんな選択肢がありますか？", situation: "選択肢確認" },
            { phrase: "Let's analyze the root cause", japanese: "根本原因を分析しましょう", situation: "原因分析" },
            { phrase: "I propose a solution", japanese: "解決策を提案します", situation: "解決提案" },
            { phrase: "We need to prioritize", japanese: "優先順位をつける必要があります", situation: "優先度設定" },
            { phrase: "Let's create an action plan", japanese: "行動計画を作りましょう", situation: "計画立案" }
        ]
    },
    // 丁寧な表現
    polite_expressions: {
        "4-6": [
            { phrase: "Please", japanese: "お願いします", situation: "依頼" },
            { phrase: "Thank you so much", japanese: "本当にありがとう", situation: "深い感謝" },
            { phrase: "Excuse me", japanese: "すみません", situation: "注意喚起" },
            { phrase: "I'm sorry", japanese: "ごめんなさい", situation: "謝罪" },
            { phrase: "May I...?", japanese: "〜してもいいですか？", situation: "許可要求" },
            { phrase: "After you", japanese: "お先にどうぞ", situation: "譲る" },
            { phrase: "You're welcome", japanese: "どういたしまして", situation: "謝意への返答" },
            { phrase: "Pardon me", japanese: "失礼します", situation: "軽い謝罪" }
        ],
        "7-9": [
            { phrase: "Would you mind if...?", japanese: "〜してもよろしいですか？", situation: "丁寧な許可" },
            { phrase: "Could you please...?", japanese: "〜していただけますか？", situation: "丁寧な依頼" },
            { phrase: "I appreciate your help", japanese: "助けていただき感謝します", situation: "感謝表現" },
            { phrase: "Sorry to bother you", japanese: "お邪魔してすみません", situation: "邪魔の謝罪" },
            { phrase: "Thanks for your patience", japanese: "お待ちいただきありがとう", situation: "忍耐への感謝" },
            { phrase: "If you don't mind", japanese: "もしよろしければ", situation: "控えめな提案" },
            { phrase: "I apologize for...", japanese: "〜についてお詫びします", situation: "正式な謝罪" },
            { phrase: "With your permission", japanese: "お許しをいただければ", situation: "許可前置き" }
        ],
        "10-12": [
            { phrase: "I would be grateful if...", japanese: "〜していただければ幸いです", situation: "丁重な依頼" },
            { phrase: "I sincerely apologize", japanese: "心よりお詫び申し上げます", situation: "深い謝罪" },
            { phrase: "Thank you for your consideration", japanese: "ご配慮ありがとうございます", situation: "配慮への感謝" },
            { phrase: "If it's not too much trouble", japanese: "お手数でなければ", situation: "遠慮がちな依頼" },
            { phrase: "I hope I'm not imposing", japanese: "お邪魔でなければいいのですが", situation: "遠慮表現" },
            { phrase: "Your assistance is appreciated", japanese: "ご協力に感謝します", situation: "協力感謝" },
            { phrase: "Please accept my apologies", japanese: "お詫びを受け入れてください", situation: "謝罪要請" },
            { phrase: "I'm honored to...", japanese: "〜できることを光栄に思います", situation: "光栄表現" }
        ]
    },
    // 学習サポート
    study_support: {
        "4-6": [
            { phrase: "I'm learning", japanese: "勉強してる", situation: "学習中" },
            { phrase: "This is fun!", japanese: "これ楽しい！", situation: "楽しさ表現" },
            { phrase: "I remember now", japanese: "思い出した", situation: "記憶回復" },
            { phrase: "Let me practice", japanese: "練習させて", situation: "練習希望" },
            { phrase: "I can read this", japanese: "これ読める", situation: "読解可能" },
            { phrase: "Watch me do it", japanese: "やるところ見て", situation: "実演" },
            { phrase: "I learned something new", japanese: "新しいこと覚えた", situation: "新規学習" },
            { phrase: "This is easy now", japanese: "今は簡単", situation: "習熟表現" }
        ],
        "7-9": [
            { phrase: "I need to review this", japanese: "これを復習する必要がある", situation: "復習必要" },
            { phrase: "Can we study together?", japanese: "一緒に勉強できる？", situation: "共同学習" },
            { phrase: "I'm preparing for the test", japanese: "テストの準備をしています", situation: "試験準備" },
            { phrase: "This helps me understand", japanese: "これで理解できます", situation: "理解補助" },
            { phrase: "I need more practice", japanese: "もっと練習が必要", situation: "練習必要" },
            { phrase: "Let's quiz each other", japanese: "お互いにクイズしよう", situation: "相互テスト" },
            { phrase: "I'm getting better at this", japanese: "これが上達してきた", situation: "上達実感" },
            { phrase: "Can you check my work?", japanese: "私の作業を確認してもらえる？", situation: "確認依頼" }
        ],
        "10-12": [
            { phrase: "I need to improve my study habits", japanese: "勉強習慣を改善する必要があります", situation: "習慣改善" },
            { phrase: "Let's form a study group", japanese: "勉強グループを作ろう", situation: "グループ形成" },
            { phrase: "I'm focusing on my weak areas", japanese: "弱点に集中しています", situation: "弱点克服" },
            { phrase: "This strategy works for me", japanese: "この戦略は私に合っています", situation: "方法確立" },
            { phrase: "I need to manage my time better", japanese: "時間管理を改善する必要があります", situation: "時間管理" },
            { phrase: "Let's share study resources", japanese: "学習資料を共有しよう", situation: "資料共有" },
            { phrase: "I'm tracking my progress", japanese: "進捗を追跡しています", situation: "進捗管理" },
            { phrase: "This concept is challenging", japanese: "この概念は難しいです", situation: "難易度認識" }
        ]
    }
};

module.exports = { PHRASE_LISTS_EXPANSION, NEW_PHRASE_CATEGORIES };