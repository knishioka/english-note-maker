// === 英語罫線ノート作成スクリプト ===

// 設定値
const CONFIG = {
    lineHeight: 10, // mm
    lineSpacing: 2, // mm
    pageMargin: {
        top: 10,    // mm
        bottom: 10, // mm
        left: 10,   // mm
        right: 10   // mm
    }
};

// コンテンツ統計管理システム
const CONTENT_STATS = {
    lastUpdated: "2025-01-18",
    words: {
        total: 0,
        byCategory: {},
        byAge: { "4-6": 0, "7-9": 0, "10-12": 0 }
    },
    phrases: {
        total: 0,
        byCategory: {},
        byAge: { "4-6": 0, "7-9": 0, "10-12": 0 }
    },
    examples: {
        total: 0,
        byAge: { "4-6": 0, "7-9": 0, "10-12": 0 }
    }
};

// 年齢別例文データ
const EXAMPLE_SENTENCES_BY_AGE = {
    "4-6": [
        {
            english: "I like apples.",
            japanese: "わたしは りんごが すきです。",
            category: "daily",
            difficulty: 1
        },
        {
            english: "The cat is cute.",
            japanese: "ねこは かわいいです。",
            category: "animals",
            difficulty: 1
        },
        {
            english: "Good morning!",
            japanese: "おはよう！",
            category: "daily",
            difficulty: 1
        },
        {
            english: "Thank you very much.",
            japanese: "ありがとう ございます。",
            category: "daily",
            difficulty: 1
        },
        {
            english: "My name is Tom.",
            japanese: "わたしの なまえは トムです。",
            category: "school",
            difficulty: 1
        },
        {
            english: "I can jump high.",
            japanese: "わたしは たかく ジャンプできます。",
            category: "hobby",
            difficulty: 1
        },
        {
            english: "Let's play together.",
            japanese: "いっしょに あそびましょう。",
            category: "hobby",
            difficulty: 1
        },
        {
            english: "I love my mom.",
            japanese: "わたしは ママが だいすきです。",
            category: "family",
            difficulty: 1
        },
        {
            english: "The sun is bright.",
            japanese: "たいようは あかるいです。",
            category: "daily",
            difficulty: 1
        },
        {
            english: "Happy birthday!",
            japanese: "おたんじょうび おめでとう！",
            category: "daily",
            difficulty: 1
        }
    ],
    "7-9": [
        {
            english: "I go to school every day.",
            japanese: "わたしは 毎日 学校に 行きます。",
            category: "school",
            difficulty: 2
        },
        {
            english: "My favorite color is blue.",
            japanese: "わたしの 好きな 色は 青です。",
            category: "daily",
            difficulty: 2
        },
        {
            english: "Can you help me, please?",
            japanese: "手伝って もらえますか？",
            category: "daily",
            difficulty: 2
        },
        {
            english: "I have two brothers.",
            japanese: "わたしには 兄弟が 二人 います。",
            category: "family",
            difficulty: 2
        },
        {
            english: "Let's study English together.",
            japanese: "いっしょに 英語を 勉強しましょう。",
            category: "school",
            difficulty: 2
        },
        {
            english: "The weather is nice today.",
            japanese: "今日は いい 天気です。",
            category: "daily",
            difficulty: 2
        },
        {
            english: "I want to be a teacher.",
            japanese: "わたしは 先生に なりたいです。",
            category: "school",
            difficulty: 2
        },
        {
            english: "My hobby is reading books.",
            japanese: "わたしの しゅみは 読書です。",
            category: "hobby",
            difficulty: 2
        },
        {
            english: "Summer vacation is fun.",
            japanese: "夏休みは 楽しいです。",
            category: "school",
            difficulty: 2
        },
        {
            english: "I can ride a bicycle.",
            japanese: "わたしは 自転車に 乗れます。",
            category: "hobby",
            difficulty: 2
        }
    ],
    "10-12": [
        {
            english: "Practice makes perfect.",
            japanese: "練習は完璧を作る。",
            category: "daily",
            difficulty: 3
        },
        {
            english: "I enjoy playing basketball with my friends.",
            japanese: "友達とバスケットボールをするのが楽しいです。",
            category: "hobby",
            difficulty: 3
        },
        {
            english: "Science is my favorite subject.",
            japanese: "理科は私の好きな教科です。",
            category: "school",
            difficulty: 3
        },
        {
            english: "We should protect our environment.",
            japanese: "私たちは環境を守るべきです。",
            category: "daily",
            difficulty: 3
        },
        {
            english: "Reading helps improve vocabulary.",
            japanese: "読書は語彙力の向上に役立ちます。",
            category: "school",
            difficulty: 3
        },
        {
            english: "Time flies when you're having fun.",
            japanese: "楽しい時間はあっという間に過ぎる。",
            category: "daily",
            difficulty: 3
        },
        {
            english: "I want to travel around the world.",
            japanese: "世界中を旅行したいです。",
            category: "hobby",
            difficulty: 3
        },
        {
            english: "Technology makes our lives easier.",
            japanese: "技術は私たちの生活を便利にします。",
            category: "daily",
            difficulty: 3
        },
        {
            english: "Teamwork is important for success.",
            japanese: "チームワークは成功のために重要です。",
            category: "school",
            difficulty: 3
        },
        {
            english: "Never give up on your dreams.",
            japanese: "夢をあきらめてはいけません。",
            category: "daily",
            difficulty: 3
        }
    ]
};

// Phase 2: 単語練習用データ
const WORD_LISTS = {
    animals: {
        "4-6": [
            { english: "cat", japanese: "ねこ", syllables: "cat" },
            { english: "dog", japanese: "いぬ", syllables: "dog" },
            { english: "bird", japanese: "とり", syllables: "bird" },
            { english: "fish", japanese: "さかな", syllables: "fish" },
            { english: "rabbit", japanese: "うさぎ", syllables: "rab-bit" }
        ],
        "7-9": [
            { english: "elephant", japanese: "ぞう", syllables: "el-e-phant" },
            { english: "monkey", japanese: "さる", syllables: "mon-key" },
            { english: "giraffe", japanese: "きりん", syllables: "gi-raffe" },
            { english: "penguin", japanese: "ペンギン", syllables: "pen-guin" },
            { english: "dolphin", japanese: "イルカ", syllables: "dol-phin" }
        ],
        "10-12": [
            { english: "chimpanzee", japanese: "チンパンジー", syllables: "chim-pan-zee" },
            { english: "rhinoceros", japanese: "サイ", syllables: "rhi-noc-er-os" },
            { english: "hippopotamus", japanese: "カバ", syllables: "hip-po-pot-a-mus" },
            { english: "chameleon", japanese: "カメレオン", syllables: "cha-me-le-on" },
            { english: "crocodile", japanese: "ワニ", syllables: "croc-o-dile" }
        ]
    },
    food: {
        "4-6": [
            { english: "apple", japanese: "りんご", syllables: "ap-ple" },
            { english: "banana", japanese: "バナナ", syllables: "ba-na-na" },
            { english: "rice", japanese: "ごはん", syllables: "rice" },
            { english: "milk", japanese: "ミルク", syllables: "milk" },
            { english: "egg", japanese: "たまご", syllables: "egg" }
        ],
        "7-9": [
            { english: "sandwich", japanese: "サンドイッチ", syllables: "sand-wich" },
            { english: "pizza", japanese: "ピザ", syllables: "piz-za" },
            { english: "hamburger", japanese: "ハンバーガー", syllables: "ham-bur-ger" },
            { english: "spaghetti", japanese: "スパゲッティ", syllables: "spa-ghet-ti" },
            { english: "chocolate", japanese: "チョコレート", syllables: "choc-o-late" }
        ],
        "10-12": [
            { english: "vegetable", japanese: "野菜", syllables: "veg-e-ta-ble" },
            { english: "strawberry", japanese: "いちご", syllables: "straw-ber-ry" },
            { english: "watermelon", japanese: "すいか", syllables: "wa-ter-mel-on" },
            { english: "restaurant", japanese: "レストラン", syllables: "res-tau-rant" },
            { english: "breakfast", japanese: "朝食", syllables: "break-fast" }
        ]
    },
    colors: {
        "4-6": [
            { english: "red", japanese: "あか", syllables: "red" },
            { english: "blue", japanese: "あお", syllables: "blue" },
            { english: "yellow", japanese: "きいろ", syllables: "yel-low" },
            { english: "green", japanese: "みどり", syllables: "green" },
            { english: "white", japanese: "しろ", syllables: "white" }
        ],
        "7-9": [
            { english: "black", japanese: "くろ", syllables: "black" },
            { english: "orange", japanese: "オレンジ", syllables: "or-ange" },
            { english: "purple", japanese: "むらさき", syllables: "pur-ple" },
            { english: "pink", japanese: "ピンク", syllables: "pink" },
            { english: "brown", japanese: "ちゃいろ", syllables: "brown" }
        ],
        "10-12": [
            { english: "gray", japanese: "はいいろ", syllables: "gray" },
            { english: "silver", japanese: "ぎんいろ", syllables: "sil-ver" },
            { english: "golden", japanese: "きんいろ", syllables: "gold-en" },
            { english: "rainbow", japanese: "にじ", syllables: "rain-bow" },
            { english: "colorful", japanese: "カラフル", syllables: "col-or-ful" }
        ]
    },
    numbers: {
        "4-6": [
            { english: "one", japanese: "いち", syllables: "one" },
            { english: "two", japanese: "に", syllables: "two" },
            { english: "three", japanese: "さん", syllables: "three" },
            { english: "four", japanese: "よん", syllables: "four" },
            { english: "five", japanese: "ご", syllables: "five" }
        ],
        "7-9": [
            { english: "six", japanese: "ろく", syllables: "six" },
            { english: "seven", japanese: "なな", syllables: "sev-en" },
            { english: "eight", japanese: "はち", syllables: "eight" },
            { english: "nine", japanese: "きゅう", syllables: "nine" },
            { english: "ten", japanese: "じゅう", syllables: "ten" }
        ],
        "10-12": [
            { english: "eleven", japanese: "じゅういち", syllables: "e-lev-en" },
            { english: "twelve", japanese: "じゅうに", syllables: "twelve" },
            { english: "twenty", japanese: "にじゅう", syllables: "twen-ty" },
            { english: "hundred", japanese: "ひゃく", syllables: "hun-dred" },
            { english: "thousand", japanese: "せん", syllables: "thou-sand" }
        ]
    },
    calendar: {
        "4-6": [
            { english: "Monday", japanese: "げつようび", syllables: "Mon-day" },
            { english: "Sunday", japanese: "にちようび", syllables: "Sun-day" },
            { english: "today", japanese: "きょう", syllables: "to-day" },
            { english: "tomorrow", japanese: "あした", syllables: "to-mor-row" },
            { english: "birthday", japanese: "たんじょうび", syllables: "birth-day" }
        ],
        "7-9": [
            { english: "Tuesday", japanese: "かようび", syllables: "Tues-day" },
            { english: "Wednesday", japanese: "すいようび", syllables: "Wednes-day" },
            { english: "Thursday", japanese: "もくようび", syllables: "Thurs-day" },
            { english: "Friday", japanese: "きんようび", syllables: "Fri-day" },
            { english: "Saturday", japanese: "どようび", syllables: "Sat-ur-day" }
        ],
        "10-12": [
            { english: "January", japanese: "いちがつ", syllables: "Jan-u-ar-y" },
            { english: "February", japanese: "にがつ", syllables: "Feb-ru-ar-y" },
            { english: "March", japanese: "さんがつ", syllables: "March" },
            { english: "April", japanese: "しがつ", syllables: "A-pril" },
            { english: "December", japanese: "じゅうにがつ", syllables: "De-cem-ber" }
        ]
    },
    school_items: {
        "4-6": [
            { english: "pen", japanese: "ペン", syllables: "pen" },
            { english: "book", japanese: "ほん", syllables: "book" },
            { english: "bag", japanese: "かばん", syllables: "bag" },
            { english: "desk", japanese: "つくえ", syllables: "desk" },
            { english: "chair", japanese: "いす", syllables: "chair" }
        ],
        "7-9": [
            { english: "pencil", japanese: "えんぴつ", syllables: "pen-cil" },
            { english: "eraser", japanese: "けしゴム", syllables: "e-ras-er" },
            { english: "notebook", japanese: "ノート", syllables: "note-book" },
            { english: "ruler", japanese: "じょうぎ", syllables: "rul-er" },
            { english: "scissors", japanese: "はさみ", syllables: "scis-sors" }
        ],
        "10-12": [
            { english: "dictionary", japanese: "じしょ", syllables: "dic-tion-ar-y" },
            { english: "computer", japanese: "コンピューター", syllables: "com-pu-ter" },
            { english: "blackboard", japanese: "こくばん", syllables: "black-board" },
            { english: "homework", japanese: "しゅくだい", syllables: "home-work" },
            { english: "classroom", japanese: "きょうしつ", syllables: "class-room" }
        ]
    },
    body_parts: {
        "4-6": [
            { english: "head", japanese: "あたま", syllables: "head" },
            { english: "eye", japanese: "め", syllables: "eye" },
            { english: "nose", japanese: "はな", syllables: "nose" },
            { english: "mouth", japanese: "くち", syllables: "mouth" },
            { english: "hand", japanese: "て", syllables: "hand" }
        ],
        "7-9": [
            { english: "ear", japanese: "みみ", syllables: "ear" },
            { english: "face", japanese: "かお", syllables: "face" },
            { english: "foot", japanese: "あし", syllables: "foot" },
            { english: "finger", japanese: "ゆび", syllables: "fin-ger" },
            { english: "hair", japanese: "かみ", syllables: "hair" }
        ],
        "10-12": [
            { english: "shoulder", japanese: "かた", syllables: "shoul-der" },
            { english: "elbow", japanese: "ひじ", syllables: "el-bow" },
            { english: "knee", japanese: "ひざ", syllables: "knee" },
            { english: "stomach", japanese: "おなか", syllables: "stom-ach" },
            { english: "tooth", japanese: "は", syllables: "tooth" }
        ]
    },
    weather: {
        "4-6": [
            { english: "sunny", japanese: "はれ", syllables: "sun-ny" },
            { english: "rainy", japanese: "あめ", syllables: "rain-y" },
            { english: "hot", japanese: "あつい", syllables: "hot" },
            { english: "cold", japanese: "さむい", syllables: "cold" },
            { english: "cloud", japanese: "くも", syllables: "cloud" }
        ],
        "7-9": [
            { english: "cloudy", japanese: "くもり", syllables: "cloud-y" },
            { english: "windy", japanese: "かぜ", syllables: "wind-y" },
            { english: "snowy", japanese: "ゆき", syllables: "snow-y" },
            { english: "warm", japanese: "あたたかい", syllables: "warm" },
            { english: "cool", japanese: "すずしい", syllables: "cool" }
        ],
        "10-12": [
            { english: "temperature", japanese: "おんど", syllables: "tem-per-a-ture" },
            { english: "thunder", japanese: "かみなり", syllables: "thun-der" },
            { english: "lightning", japanese: "いなずま", syllables: "light-ning" },
            { english: "foggy", japanese: "きり", syllables: "fog-gy" },
            { english: "rainbow", japanese: "にじ", syllables: "rain-bow" }
        ]
    },
    classroom_objects: {
        "4-6": [
            { english: "whiteboard", japanese: "ホワイトボード", syllables: "white-board" },
            { english: "marker", japanese: "マーカー", syllables: "mar-ker" },
            { english: "textbook", japanese: "教科書", syllables: "text-book" },
            { english: "folder", japanese: "フォルダー", syllables: "fol-der" },
            { english: "glue stick", japanese: "のり", syllables: "glue stick" }
        ],
        "7-9": [
            { english: "projector", japanese: "プロジェクター", syllables: "pro-jec-tor" },
            { english: "calculator", japanese: "電卓", syllables: "cal-cu-la-tor" },
            { english: "highlighter", japanese: "蛍光ペン", syllables: "high-light-er" },
            { english: "clipboard", japanese: "クリップボード", syllables: "clip-board" },
            { english: "binder", japanese: "バインダー", syllables: "bin-der" }
        ],
        "10-12": [
            { english: "protractor", japanese: "分度器", syllables: "pro-trac-tor" },
            { english: "compass", japanese: "コンパス", syllables: "com-pass" },
            { english: "microscope", japanese: "顕微鏡", syllables: "mi-cro-scope" },
            { english: "laptop", japanese: "ノートパソコン", syllables: "lap-top" },
            { english: "headphones", japanese: "ヘッドフォン", syllables: "head-phones" }
        ]
    },
    subjects: {
        "4-6": [
            { english: "Math", japanese: "算数", syllables: "Math" },
            { english: "English", japanese: "英語", syllables: "Eng-lish" },
            { english: "Art", japanese: "美術", syllables: "Art" },
            { english: "Music", japanese: "音楽", syllables: "Mu-sic" },
            { english: "P.E.", japanese: "体育", syllables: "P-E" }
        ],
        "7-9": [
            { english: "Science", japanese: "理科", syllables: "Sci-ence" },
            { english: "History", japanese: "歴史", syllables: "His-to-ry" },
            { english: "Geography", japanese: "地理", syllables: "Ge-og-ra-phy" },
            { english: "Drama", japanese: "演劇", syllables: "Dra-ma" },
            { english: "Library", japanese: "図書", syllables: "Li-brar-y" }
        ],
        "10-12": [
            { english: "Biology", japanese: "生物", syllables: "Bi-ol-o-gy" },
            { english: "Chemistry", japanese: "化学", syllables: "Chem-is-try" },
            { english: "Physics", japanese: "物理", syllables: "Phys-ics" },
            { english: "Economics", japanese: "経済", syllables: "E-co-nom-ics" },
            { english: "Psychology", japanese: "心理学", syllables: "Psy-chol-o-gy" }
        ]
    },
    sports_activities: {
        "4-6": [
            { english: "soccer", japanese: "サッカー", syllables: "soc-cer" },
            { english: "running", japanese: "ランニング", syllables: "run-ning" },
            { english: "jumping", japanese: "ジャンプ", syllables: "jump-ing" },
            { english: "catching", japanese: "キャッチ", syllables: "catch-ing" },
            { english: "throwing", japanese: "投げる", syllables: "throw-ing" }
        ],
        "7-9": [
            { english: "basketball", japanese: "バスケットボール", syllables: "bas-ket-ball" },
            { english: "volleyball", japanese: "バレーボール", syllables: "vol-ley-ball" },
            { english: "swimming", japanese: "水泳", syllables: "swim-ming" },
            { english: "tennis", japanese: "テニス", syllables: "ten-nis" },
            { english: "badminton", japanese: "バドミントン", syllables: "bad-min-ton" }
        ],
        "10-12": [
            { english: "athletics", japanese: "陸上競技", syllables: "ath-let-ics" },
            { english: "gymnastics", japanese: "体操", syllables: "gym-nas-tics" },
            { english: "wrestling", japanese: "レスリング", syllables: "wres-tling" },
            { english: "fencing", japanese: "フェンシング", syllables: "fenc-ing" },
            { english: "archery", japanese: "アーチェリー", syllables: "ar-cher-y" }
        ]
    },
    emotions_advanced: {
        "4-6": [
            { english: "lonely", japanese: "さみしい", syllables: "lone-ly" },
            { english: "shy", japanese: "はずかしがり", syllables: "shy" },
            { english: "brave", japanese: "ゆうかん", syllables: "brave" },
            { english: "silly", japanese: "ばかげた", syllables: "sil-ly" },
            { english: "curious", japanese: "こうきしん", syllables: "cu-ri-ous" }
        ],
        "7-9": [
            { english: "embarrassed", japanese: "恥ずかしい", syllables: "em-bar-rassed" },
            { english: "jealous", japanese: "うらやましい", syllables: "jeal-ous" },
            { english: "anxious", japanese: "心配", syllables: "anx-ious" },
            { english: "relieved", japanese: "安心", syllables: "re-lieved" },
            { english: "hopeful", japanese: "希望的", syllables: "hope-ful" }
        ],
        "10-12": [
            { english: "overwhelmed", japanese: "圧倒された", syllables: "o-ver-whelmed" },
            { english: "motivated", japanese: "やる気", syllables: "mo-ti-vat-ed" },
            { english: "frustrated", japanese: "イライラ", syllables: "frus-trat-ed" },
            { english: "determined", japanese: "決意", syllables: "de-ter-mined" },
            { english: "accomplished", japanese: "達成感", syllables: "ac-com-plished" }
        ]
    },
    academic_words: {
        "4-6": [
            { english: "question", japanese: "しつもん", syllables: "ques-tion" },
            { english: "answer", japanese: "こたえ", syllables: "an-swer" },
            { english: "example", japanese: "れい", syllables: "ex-am-ple" },
            { english: "practice", japanese: "れんしゅう", syllables: "prac-tice" },
            { english: "homework", japanese: "しゅくだい", syllables: "home-work" }
        ],
        "7-9": [
            { english: "research", japanese: "研究", syllables: "re-search" },
            { english: "project", japanese: "プロジェクト", syllables: "proj-ect" },
            { english: "presentation", japanese: "発表", syllables: "pres-en-ta-tion" },
            { english: "summary", japanese: "要約", syllables: "sum-ma-ry" },
            { english: "experiment", japanese: "実験", syllables: "ex-per-i-ment" }
        ],
        "10-12": [
            { english: "hypothesis", japanese: "仮説", syllables: "hy-poth-e-sis" },
            { english: "analysis", japanese: "分析", syllables: "a-nal-y-sis" },
            { english: "conclusion", japanese: "結論", syllables: "con-clu-sion" },
            { english: "evidence", japanese: "証拠", syllables: "ev-i-dence" },
            { english: "theory", japanese: "理論", syllables: "the-o-ry" }
        ]
    }
};

// アルファベット練習データ
const ALPHABET_DATA = {
    uppercase: [
        { letter: "A", example: "Apple", japanese: "りんご" },
        { letter: "B", example: "Ball", japanese: "ボール" },
        { letter: "C", example: "Cat", japanese: "ねこ" },
        { letter: "D", example: "Dog", japanese: "いぬ" },
        { letter: "E", example: "Egg", japanese: "たまご" },
        { letter: "F", example: "Fish", japanese: "さかな" },
        { letter: "G", example: "Girl", japanese: "女の子" },
        { letter: "H", example: "House", japanese: "いえ" },
        { letter: "I", example: "Ice", japanese: "こおり" },
        { letter: "J", example: "Jump", japanese: "ジャンプ" },
        { letter: "K", example: "King", japanese: "おうさま" },
        { letter: "L", example: "Lion", japanese: "ライオン" },
        { letter: "M", example: "Moon", japanese: "つき" },
        { letter: "N", example: "Nice", japanese: "すてき" },
        { letter: "O", example: "Orange", japanese: "オレンジ" },
        { letter: "P", example: "Pen", japanese: "ペン" },
        { letter: "Q", example: "Queen", japanese: "じょおう" },
        { letter: "R", example: "Rain", japanese: "あめ" },
        { letter: "S", example: "Sun", japanese: "たいよう" },
        { letter: "T", example: "Tree", japanese: "き" },
        { letter: "U", example: "Umbrella", japanese: "かさ" },
        { letter: "V", example: "Van", japanese: "バン" },
        { letter: "W", example: "Water", japanese: "みず" },
        { letter: "X", example: "Box", japanese: "はこ" },
        { letter: "Y", example: "Yellow", japanese: "きいろ" },
        { letter: "Z", example: "Zoo", japanese: "どうぶつえん" }
    ],
    lowercase: [
        { letter: "a", example: "apple", japanese: "りんご" },
        { letter: "b", example: "ball", japanese: "ボール" },
        { letter: "c", example: "cat", japanese: "ねこ" },
        { letter: "d", example: "dog", japanese: "いぬ" },
        { letter: "e", example: "egg", japanese: "たまご" },
        { letter: "f", example: "fish", japanese: "さかな" },
        { letter: "g", example: "girl", japanese: "女の子" },
        { letter: "h", example: "house", japanese: "いえ" },
        { letter: "i", example: "ice", japanese: "こおり" },
        { letter: "j", example: "jump", japanese: "ジャンプ" },
        { letter: "k", example: "king", japanese: "おうさま" },
        { letter: "l", example: "lion", japanese: "ライオン" },
        { letter: "m", example: "moon", japanese: "つき" },
        { letter: "n", example: "nice", japanese: "すてき" },
        { letter: "o", example: "orange", japanese: "オレンジ" },
        { letter: "p", example: "pen", japanese: "ペン" },
        { letter: "q", example: "queen", japanese: "じょおう" },
        { letter: "r", example: "rain", japanese: "あめ" },
        { letter: "s", example: "sun", japanese: "たいよう" },
        { letter: "t", example: "tree", japanese: "き" },
        { letter: "u", example: "umbrella", japanese: "かさ" },
        { letter: "v", example: "van", japanese: "バン" },
        { letter: "w", example: "water", japanese: "みず" },
        { letter: "x", example: "box", japanese: "はこ" },
        { letter: "y", example: "yellow", japanese: "きいろ" },
        { letter: "z", example: "zoo", japanese: "どうぶつえん" }
    ]
};

// フレーズ練習データ
const PHRASE_DATA = {
    greetings: {
        "4-6": [
            { english: "Hello!", japanese: "こんにちは！", situation: "友達に会ったとき" },
            { english: "Good morning!", japanese: "おはよう！", situation: "朝のあいさつ" },
            { english: "Thank you!", japanese: "ありがとう！", situation: "お礼を言うとき" },
            { english: "Bye bye!", japanese: "バイバイ！", situation: "さよならのあいさつ" },
            { english: "Please!", japanese: "おねがい！", situation: "お願いするとき" },
            { english: "Good night!", japanese: "おやすみ！", situation: "寝る前のあいさつ" },
            { english: "Sorry!", japanese: "ごめんなさい！", situation: "謝るとき" },
            { english: "Hi there!", japanese: "やあ！", situation: "カジュアルなあいさつ" },
            { english: "Welcome!", japanese: "ようこそ！", situation: "お迎えするとき" },
            { english: "Good afternoon!", japanese: "こんにちは！", situation: "午後のあいさつ" },
            { english: "See you!", japanese: "またね！", situation: "カジュアルな別れ" },
            { english: "How are you?", japanese: "げんき？", situation: "調子を聞く" },
            { english: "I'm fine!", japanese: "げんきだよ！", situation: "元気な返事" },
            { english: "Good job!", japanese: "よくできたね！", situation: "褒めるとき" },
            { english: "Have fun!", japanese: "楽しんでね！", situation: "遊びに行く時" },
            { english: "Be careful!", japanese: "気をつけて！", situation: "注意する時" }
        ],
        "7-9": [
            { english: "How are you?", japanese: "元気ですか？", situation: "相手の様子を聞く" },
            { english: "Nice to meet you.", japanese: "はじめまして。", situation: "初対面のあいさつ" },
            { english: "See you later!", japanese: "またね！", situation: "別れのあいさつ" },
            { english: "Excuse me.", japanese: "すみません。", situation: "声をかけるとき" },
            { english: "You're welcome.", japanese: "どういたしまして。", situation: "お礼への返事" },
            { english: "Good to see you!", japanese: "会えて嬉しいです！", situation: "再会のあいさつ" },
            { english: "How's it going?", japanese: "調子はどう？", situation: "カジュアルな様子聞き" },
            { english: "Have a good day!", japanese: "良い一日を！", situation: "別れ際の励まし" },
            { english: "See you tomorrow!", japanese: "また明日！", situation: "翌日会う約束" },
            { english: "Take care!", japanese: "気をつけて！", situation: "心配の気持ち" },
            { english: "What's up?", japanese: "どうしたの？", situation: "様子を聞く" },
            { english: "Long time no see!", japanese: "ひさしぶり！", situation: "久々の再会" },
            { english: "How was your weekend?", japanese: "週末はどうだった？", situation: "月曜の会話" },
            { english: "That's great!", japanese: "それはすごい！", situation: "相手を褒める" },
            { english: "Good luck!", japanese: "がんばって！", situation: "応援する時" },
            { english: "Congratulations!", japanese: "おめでとう！", situation: "お祝い" }
        ],
        "10-12": [
            { english: "How have you been?", japanese: "お元気でしたか？", situation: "久しぶりに会ったとき" },
            { english: "Long time no see.", japanese: "お久しぶりです。", situation: "久しぶりの再会" },
            { english: "Have a nice day!", japanese: "良い一日を！", situation: "別れ際の言葉" },
            { english: "Take care.", japanese: "お気をつけて。", situation: "心配するとき" },
            { english: "Best wishes.", japanese: "幸運を祈ります。", situation: "応援するとき" },
            { english: "It's been a while.", japanese: "しばらくぶりです。", situation: "久々の再会" },
            { english: "Good luck with that!", japanese: "頑張ってください！", situation: "応援の言葉" },
            { english: "I appreciate it.", japanese: "感謝します。", situation: "感謝を伝える" },
            { english: "My pleasure.", japanese: "どういたしまして。", situation: "丁寧なお礼の返事" },
            { english: "Have a great weekend!", japanese: "良い週末を！", situation: "週末前のあいさつ" },
            { english: "Welcome back!", japanese: "おかえりなさい！", situation: "帰ってきた時" },
            { english: "Hope to see you soon.", japanese: "また近いうちに会えることを願っています。", situation: "別れの挨拶" },
            { english: "Have a safe trip!", japanese: "気をつけて旅行してください！", situation: "旅立ちの挨拶" },
            { english: "It's a pleasure to meet you.", japanese: "お会いできて嬉しいです。", situation: "初対面" },
            { english: "How's everything?", japanese: "調子はどうですか？", situation: "近況を聞く" },
            { english: "Keep in touch!", japanese: "連絡を取り合いましょう！", situation: "関係継続" }
        ]
    },
    self_introduction: {
        "4-6": [
            { english: "My name is Emma.", japanese: "わたしの名前はエマです。", situation: "名前を言う" },
            { english: "I am 6 years old.", japanese: "わたしは6歳です。", situation: "年齢を言う" },
            { english: "I like dogs.", japanese: "わたしは犬が好きです。", situation: "好きなものを言う" },
            { english: "I can swim.", japanese: "わたしは泳ぐことができます。", situation: "できることを言う" },
            { english: "I have a cat.", japanese: "わたしは猫を飼っています。", situation: "ペットについて" },
            { english: "I live in Tokyo.", japanese: "わたしは東京に住んでいます。", situation: "住んでいる場所" },
            { english: "My birthday is in May.", japanese: "わたしの誕生日は5月です。", situation: "誕生日について" },
            { english: "I like ice cream.", japanese: "わたしはアイスクリームが好きです。", situation: "好きな食べ物" },
            { english: "I have one sister.", japanese: "わたしには妹が一人います。", situation: "兄弟姉妹について" },
            { english: "I can ride a bike.", japanese: "わたしは自転車に乗れます。", situation: "できること" }
        ],
        "7-9": [
            { english: "I'm from Japan.", japanese: "日本から来ました。", situation: "出身地を言う" },
            { english: "My hobby is reading.", japanese: "趣味は読書です。", situation: "趣味を言う" },
            { english: "I go to Lincoln Elementary school.", japanese: "リンカーン小学校に通っています。", situation: "学校について" },
            { english: "My favorite color is blue.", japanese: "好きな色は青です。", situation: "好きな色" },
            { english: "I want to be a teacher.", japanese: "先生になりたいです。", situation: "将来の夢" },
            { english: "I'm in grade 3.", japanese: "3年生です。", situation: "学年を言う" },
            { english: "I play soccer on weekends.", japanese: "週末にサッカーをします。", situation: "スポーツについて" },
            { english: "My favorite subject is math.", japanese: "好きな科目は算数です。", situation: "好きな教科" },
            { english: "I have been here for 2 years.", japanese: "ここに2年間います。", situation: "滞在期間" },
            { english: "I enjoy drawing pictures.", japanese: "絵を描くのが楽しいです。", situation: "趣味を詳しく" }
        ],
        "10-12": [
            { english: "I'm interested in science.", japanese: "科学に興味があります。", situation: "興味のあること" },
            { english: "I've been studying English for 3 years.", japanese: "3年間英語を勉強しています。", situation: "学習期間" },
            { english: "My goal is to speak three languages.", japanese: "目標は3つの言語を話すことです。", situation: "目標を語る" },
            { english: "I enjoy playing chess in my free time.", japanese: "暇な時はチェスを楽しみます。", situation: "余暇の過ごし方" },
            { english: "I hope to travel around the world.", japanese: "世界中を旅行したいです。", situation: "希望を語る" },
            { english: "I'm passionate about environmental issues.", japanese: "環境問題に情熱を持っています。", situation: "関心事について" },
            { english: "I participate in the debate club.", japanese: "ディベート部に参加しています。", situation: "クラブ活動" },
            { english: "My dream is to become a scientist.", japanese: "私の夢は科学者になることです。", situation: "将来の夢を詳しく" },
            { english: "I speak Japanese and English fluently.", japanese: "日本語と英語を流暢に話せます。", situation: "言語能力" },
            { english: "I volunteer at the library on Saturdays.", japanese: "土曜日に図書館でボランティアをしています。", situation: "ボランティア活動" }
        ]
    },
    school: {
        "4-6": [
            { english: "May I go to the bathroom?", japanese: "トイレに行ってもいいですか？", situation: "トイレに行きたいとき" },
            { english: "I don't understand.", japanese: "わかりません。", situation: "理解できないとき" },
            { english: "Can you help me?", japanese: "手伝ってもらえますか？", situation: "助けが必要なとき" },
            { english: "I finished!", japanese: "できました！", situation: "課題が終わったとき" },
            { english: "Let's play together!", japanese: "一緒に遊ぼう！", situation: "友達を誘うとき" },
            { english: "May I drink water?", japanese: "水を飲んでもいいですか？", situation: "水を飲みたいとき" },
            { english: "I need a pencil.", japanese: "鉛筆が必要です。", situation: "文房具が必要なとき" },
            { english: "Can I sit here?", japanese: "ここに座ってもいい？", situation: "席について聞く" },
            { english: "I like this book!", japanese: "この本が好き！", situation: "本の感想" },
            { english: "It's my turn!", japanese: "私の番だよ！", situation: "順番を主張" }
        ],
        "7-9": [
            { english: "May I borrow your pencil?", japanese: "鉛筆を借りてもいいですか？", situation: "物を借りるとき" },
            { english: "What page are we on?", japanese: "何ページですか？", situation: "ページを確認するとき" },
            { english: "I forgot my homework.", japanese: "宿題を忘れました。", situation: "忘れ物をしたとき" },
            { english: "Can you repeat that?", japanese: "もう一度言ってください。", situation: "聞き返すとき" },
            { english: "That's a good idea!", japanese: "それはいいアイデアです！", situation: "賛成するとき" },
            { english: "When is the test?", japanese: "テストはいつですか？", situation: "テスト日程確認" },
            { english: "I need help with this problem.", japanese: "この問題で助けが必要です。", situation: "問題解決を求める" },
            { english: "Can I join your group?", japanese: "あなたのグループに入ってもいい？", situation: "グループ参加希望" },
            { english: "I'll share my notes.", japanese: "私のノートを共有します。", situation: "協力を申し出る" },
            { english: "What's for homework?", japanese: "宿題は何ですか？", situation: "宿題内容確認" }
        ],
        "10-12": [
            { english: "Could you explain it again?", japanese: "もう一度説明してもらえますか？", situation: "再説明を求めるとき" },
            { english: "I have a question.", japanese: "質問があります。", situation: "質問したいとき" },
            { english: "May I work with a partner?", japanese: "パートナーと一緒に作業してもいいですか？", situation: "協力したいとき" },
            { english: "I need more time.", japanese: "もっと時間が必要です。", situation: "時間が足りないとき" },
            { english: "I disagree because...", japanese: "私は反対です。なぜなら...", situation: "意見を述べるとき" },
            { english: "Could we discuss this further?", japanese: "これについてもっと議論できますか？", situation: "深い議論を求める" },
            { english: "I'd like to present my findings.", japanese: "私の発見を発表したいです。", situation: "発表希望" },
            { english: "What's the deadline for this?", japanese: "これの締切はいつですか？", situation: "締切確認" },
            { english: "Can I use the computer?", japanese: "コンピューターを使ってもいいですか？", situation: "機器使用許可" },
            { english: "I think there's another solution.", japanese: "別の解決策があると思います。", situation: "代替案提示" }
        ]
    },
    shopping: {
        "4-6": [
            { english: "How much is this?", japanese: "これはいくらですか？", situation: "値段を聞くとき" },
            { english: "I want this one.", japanese: "これがほしいです。", situation: "商品を選ぶとき" },
            { english: "It's too expensive.", japanese: "高すぎます。", situation: "値段が高いとき" },
            { english: "Do you have pencils?", japanese: "鉛筆はありますか？", situation: "商品を探すとき" },
            { english: "Thank you for your help.", japanese: "お手伝いありがとう。", situation: "店員にお礼" },
            { english: "Can I see that?", japanese: "それを見せてもらえる？", situation: "商品を見たいとき" },
            { english: "I like this color.", japanese: "この色が好きです。", situation: "色の好み" },
            { english: "Is this new?", japanese: "これは新しいですか？", situation: "新商品か確認" },
            { english: "I need a bag.", japanese: "袋が必要です。", situation: "袋をもらう" },
            { english: "Where are the toys?", japanese: "おもちゃはどこですか？", situation: "売り場を探す" }
        ],
        "7-9": [
            { english: "Where can I find notebooks?", japanese: "ノートはどこにありますか？", situation: "場所を聞くとき" },
            { english: "Do you have a smaller size?", japanese: "もっと小さいサイズはありますか？", situation: "サイズを聞くとき" },
            { english: "Can I try this on?", japanese: "試着してもいいですか？", situation: "試着したいとき" },
            { english: "I'll take two of these.", japanese: "これを2つください。", situation: "複数買うとき" },
            { english: "Do you accept credit cards?", japanese: "クレジットカードは使えますか？", situation: "支払い方法" },
            { english: "What colors do you have?", japanese: "どんな色がありますか？", situation: "色の選択肢" },
            { english: "Can I exchange this?", japanese: "これを交換できますか？", situation: "交換希望" },
            { english: "Is there a discount?", japanese: "割引はありますか？", situation: "割引確認" },
            { english: "I'm looking for a gift.", japanese: "プレゼントを探しています。", situation: "ギフト探し" },
            { english: "How long is the warranty?", japanese: "保証期間はどのくらいですか？", situation: "保証確認" }
        ],
        "10-12": [
            { english: "Is this on sale?", japanese: "これはセール品ですか？", situation: "割引を確認" },
            { english: "What's the return policy?", japanese: "返品規定はどうなっていますか？", situation: "返品について" },
            { english: "Could you gift-wrap this?", japanese: "プレゼント包装してもらえますか？", situation: "包装を頼む" },
            { english: "I'm just looking, thanks.", japanese: "見ているだけです、ありがとう。", situation: "断るとき" },
            { english: "Do you have this in stock?", japanese: "在庫はありますか？", situation: "在庫確認" },
            { english: "Can you order this for me?", japanese: "これを注文してもらえますか？", situation: "注文依頼" },
            { english: "What's the difference between these?", japanese: "これらの違いは何ですか？", situation: "比較質問" },
            { english: "Do you offer student discount?", japanese: "学生割引はありますか？", situation: "学割確認" },
            { english: "Can I pay in installments?", japanese: "分割払いはできますか？", situation: "支払い方法相談" },
            { english: "When will new stock arrive?", japanese: "新しい在庫はいつ入りますか？", situation: "入荷予定確認" }
        ]
    },
    travel: {
        "4-6": [
            { english: "Are we there yet?", japanese: "もう着いた？", situation: "到着を確認" },
            { english: "I'm hungry.", japanese: "お腹がすいた。", situation: "空腹を伝える" },
            { english: "Where is the toilet?", japanese: "トイレはどこ？", situation: "トイレを探す" },
            { english: "I want to go home.", japanese: "家に帰りたい。", situation: "帰りたいとき" },
            { english: "This is fun!", japanese: "楽しい！", situation: "楽しいとき" },
            { english: "I'm tired.", japanese: "疲れた。", situation: "疲労を伝える" },
            { english: "Can we stop?", japanese: "止まってもらえる？", situation: "休憩希望" },
            { english: "I see a plane!", japanese: "飛行機が見える！", situation: "何かを発見" },
            { english: "Are we lost?", japanese: "迷子になった？", situation: "道に迷った心配" },
            { english: "I want ice cream!", japanese: "アイスクリームが欲しい！", situation: "おやつの要求" }
        ],
        "7-9": [
            { english: "How long does it take?", japanese: "どのくらいかかりますか？", situation: "時間を聞く" },
            { english: "Can we stop here?", japanese: "ここで止まってもらえますか？", situation: "停車を頼む" },
            { english: "I feel sick.", japanese: "気分が悪いです。", situation: "体調不良" },
            { english: "What time do we leave?", japanese: "何時に出発しますか？", situation: "出発時間" },
            { english: "Can I take a picture?", japanese: "写真を撮ってもいいですか？", situation: "撮影許可" },
            { english: "Where are we going?", japanese: "どこに行くの？", situation: "目的地確認" },
            { english: "Is it far from here?", japanese: "ここから遠いですか？", situation: "距離を聞く" },
            { english: "Can I buy a souvenir?", japanese: "お土産を買ってもいい？", situation: "お土産購入希望" },
            { english: "I need to use the restroom.", japanese: "トイレに行きたいです。", situation: "トイレ希望" },
            { english: "This place is beautiful!", japanese: "ここはきれいです！", situation: "景色の感想" }
        ],
        "10-12": [
            { english: "Could you recommend a good restaurant?", japanese: "おすすめのレストランを教えてください。", situation: "推薦を求める" },
            { english: "How do I get to Tokyo Station?", japanese: "東京駅への行き方を教えてください。", situation: "道を聞く" },
            { english: "Is it within walking distance?", japanese: "歩いて行ける距離ですか？", situation: "距離を確認" },
            { english: "What's the local specialty?", japanese: "地元の名物は何ですか？", situation: "名物を聞く" },
            { english: "Do you have a map?", japanese: "地図はありますか？", situation: "地図を求める" },
            { english: "What time does it close?", japanese: "何時に閉まりますか？", situation: "営業時間確認" },
            { english: "Is there an admission fee?", japanese: "入場料はありますか？", situation: "料金確認" },
            { english: "Can I book a ticket online?", japanese: "オンラインでチケットを予約できますか？", situation: "オンライン予約" },
            { english: "Are there any guided tours?", japanese: "ガイドツアーはありますか？", situation: "ツアー確認" },
            { english: "What's the best way to get there?", japanese: "そこへの最良の行き方は何ですか？", situation: "最適ルート確認" }
        ]
    },
    feelings: {
        "4-6": [
            { english: "I'm happy!", japanese: "うれしい！", situation: "喜びを表現" },
            { english: "I'm sad.", japanese: "かなしい。", situation: "悲しみを表現" },
            { english: "I'm scared.", japanese: "こわい。", situation: "恐怖を表現" },
            { english: "I'm angry.", japanese: "おこってる。", situation: "怒りを表現" },
            { english: "I love you.", japanese: "大好き。", situation: "愛情を表現" },
            { english: "I'm sleepy.", japanese: "ねむい。", situation: "眠気を表現" },
            { english: "I'm excited!", japanese: "ワクワクする！", situation: "興奮を表現" },
            { english: "I miss you.", japanese: "会いたい。", situation: "寂しさを表現" },
            { english: "I'm bored.", japanese: "つまらない。", situation: "退屈を表現" },
            { english: "I'm surprised!", japanese: "びっくりした！", situation: "驚きを表現" }
        ],
        "7-9": [
            { english: "I'm excited!", japanese: "ワクワクする！", situation: "興奮を表現" },
            { english: "I'm nervous.", japanese: "緊張しています。", situation: "緊張を表現" },
            { english: "I'm proud of you.", japanese: "あなたを誇りに思います。", situation: "誇りを表現" },
            { english: "I'm disappointed.", japanese: "がっかりしました。", situation: "失望を表現" },
            { english: "I'm confused.", japanese: "混乱しています。", situation: "困惑を表現" },
            { english: "I feel lonely.", japanese: "寂しいです。", situation: "孤独を表現" },
            { english: "I'm embarrassed.", japanese: "恥ずかしいです。", situation: "恥ずかしさを表現" },
            { english: "I'm jealous.", japanese: "うらやましいです。", situation: "羨望を表現" },
            { english: "I feel relieved.", japanese: "安心しました。", situation: "安堵を表現" },
            { english: "I'm curious about it.", japanese: "それが気になります。", situation: "好奇心を表現" }
        ],
        "10-12": [
            { english: "I'm grateful for your help.", japanese: "助けてくれて感謝しています。", situation: "感謝を表現" },
            { english: "I'm frustrated with this.", japanese: "これにイライラしています。", situation: "苛立ちを表現" },
            { english: "I feel confident.", japanese: "自信があります。", situation: "自信を表現" },
            { english: "I'm worried about the test.", japanese: "テストが心配です。", situation: "心配を表現" },
            { english: "I'm impressed by your work.", japanese: "あなたの仕事に感銘を受けました。", situation: "感銘を表現" },
            { english: "I feel overwhelmed.", japanese: "圧倒されています。", situation: "圧倒感を表現" },
            { english: "I'm motivated to succeed.", japanese: "成功への意欲があります。", situation: "やる気を表現" },
            { english: "I feel accomplished.", japanese: "達成感を感じます。", situation: "達成感を表現" },
            { english: "I'm anxious about the future.", japanese: "将来が不安です。", situation: "不安を表現" },
            { english: "I feel inspired.", japanese: "インスピレーションを感じます。", situation: "感化を表現" }
        ]
    },
    daily_life: {
        "4-6": [
            { english: "Time to wake up!", japanese: "起きる時間だよ！", situation: "起床時" },
            { english: "Brush your teeth.", japanese: "歯を磨いて。", situation: "歯磨き" },
            { english: "Let's eat!", japanese: "食べよう！", situation: "食事時" },
            { english: "Good night.", japanese: "おやすみ。", situation: "就寝時" },
            { english: "Wash your hands.", japanese: "手を洗って。", situation: "手洗い" },
            { english: "Clean up your toys.", japanese: "おもちゃを片付けて。", situation: "片付け" },
            { english: "It's bath time!", japanese: "お風呂の時間だよ！", situation: "入浴時" },
            { english: "Put on your shoes.", japanese: "靴を履いて。", situation: "外出準備" },
            { english: "Time for bed!", japanese: "寝る時間だよ！", situation: "就寝準備" },
            { english: "Drink your milk.", japanese: "ミルクを飲んで。", situation: "飲み物" }
        ],
        "7-9": [
            { english: "What's for dinner?", japanese: "夕食は何ですか？", situation: "夕食を聞く" },
            { english: "I'll do it later.", japanese: "後でやります。", situation: "後回しにする" },
            { english: "Can I watch TV?", japanese: "テレビを見てもいい？", situation: "許可を求める" },
            { english: "It's bedtime.", japanese: "寝る時間です。", situation: "就寝時間" },
            { english: "I'm done with my chores.", japanese: "お手伝いが終わりました。", situation: "家事完了" },
            { english: "May I use the computer?", japanese: "コンピューターを使ってもいい？", situation: "機器使用許可" },
            { english: "I need to do homework.", japanese: "宿題をしなければなりません。", situation: "宿題時間" },
            { english: "Can I have a snack?", japanese: "おやつを食べてもいい？", situation: "おやつ希望" },
            { english: "I'll set the table.", japanese: "テーブルを準備します。", situation: "食事準備" },
            { english: "Time to get dressed.", japanese: "着替える時間です。", situation: "着替え" }
        ],
        "10-12": [
            { english: "I'll be back by 6.", japanese: "6時までに戻ります。", situation: "帰宅時間" },
            { english: "Can I go out with friends?", japanese: "友達と出かけてもいいですか？", situation: "外出許可" },
            { english: "I need to study.", japanese: "勉強しなければなりません。", situation: "勉強時" },
            { english: "What should I wear?", japanese: "何を着ればいいですか？", situation: "服装相談" },
            { english: "I'll help with cooking.", japanese: "料理を手伝います。", situation: "手伝いを申し出る" },
            { english: "I'm going to the library.", japanese: "図書館に行きます。", situation: "外出報告" },
            { english: "Can I stay up late?", japanese: "遅くまで起きていてもいい？", situation: "就寝時間延長" },
            { english: "I need pocket money.", japanese: "お小遣いが必要です。", situation: "お金の相談" },
            { english: "I'll do the dishes.", japanese: "皿洗いをします。", situation: "家事協力" },
            { english: "May I invite friends over?", japanese: "友達を招待してもいい？", situation: "友達招待" }
        ]
    },
    classroom_english: {
        "4-6": [
            { english: "I need help, please.", japanese: "助けてください。", situation: "助けが必要なとき" },
            { english: "Can you show me?", japanese: "見せてもらえますか？", situation: "手本を求める" },
            { english: "I don't know this word.", japanese: "この単語がわかりません。", situation: "単語がわからない" },
            { english: "Is this correct?", japanese: "これで合っていますか？", situation: "確認したいとき" },
            { english: "I'm finished with my work.", japanese: "課題が終わりました。", situation: "完了報告" },
            { english: "Can I sharpen my pencil?", japanese: "鉛筆を削ってもいいですか？", situation: "鉛筆削り許可" },
            { english: "I can't see the board.", japanese: "黒板が見えません。", situation: "視界の問題" },
            { english: "May I move my seat?", japanese: "席を移動してもいいですか？", situation: "席替え希望" },
            { english: "I dropped my eraser.", japanese: "消しゴムを落としました。", situation: "物を落とした" },
            { english: "Can you say it again?", japanese: "もう一度言ってもらえる？", situation: "聞き返し" }
        ],
        "7-9": [
            { english: "Could you speak more slowly?", japanese: "もっとゆっくり話してもらえますか？", situation: "聞き取れないとき" },
            { english: "What does this mean?", japanese: "これはどういう意味ですか？", situation: "意味を聞く" },
            { english: "May I use the dictionary?", japanese: "辞書を使ってもいいですか？", situation: "辞書使用許可" },
            { english: "I need more time to finish.", japanese: "終わらせるのにもっと時間が必要です。", situation: "時間延長依頼" },
            { english: "Can we work in pairs?", japanese: "ペアで作業してもいいですか？", situation: "協力作業の提案" },
            { english: "How do you spell that?", japanese: "それはどう綴りますか？", situation: "スペル確認" },
            { english: "Which book should I use?", japanese: "どの本を使えばいいですか？", situation: "教材確認" },
            { english: "I finished early.", japanese: "早く終わりました。", situation: "早期完了報告" },
            { english: "Can I help others?", japanese: "他の人を手伝ってもいいですか？", situation: "協力申し出" },
            { english: "Is this for homework?", japanese: "これは宿題ですか？", situation: "宿題確認" }
        ],
        "10-12": [
            { english: "I'd like to share my opinion.", japanese: "私の意見を述べたいです。", situation: "発言したいとき" },
            { english: "Could you clarify that point?", japanese: "その点を明確にしてもらえますか？", situation: "詳細説明を求める" },
            { english: "I respectfully disagree.", japanese: "失礼ですが、私は違う意見です。", situation: "丁寧に反対する" },
            { english: "May I add something?", japanese: "何か付け加えてもいいですか？", situation: "追加発言" },
            { english: "I see your point, but...", japanese: "おっしゃることはわかりますが...", situation: "部分的同意" },
            { english: "Could you provide an example?", japanese: "例を示してもらえますか？", situation: "例示要求" },
            { english: "I'd like to build on that idea.", japanese: "そのアイデアを発展させたいです。", situation: "意見発展" },
            { english: "What's the main objective?", japanese: "主な目的は何ですか？", situation: "目的確認" },
            { english: "Can we review this together?", japanese: "一緒に復習できますか？", situation: "共同復習提案" },
            { english: "I need clarification on the instructions.", japanese: "指示の説明が必要です。", situation: "指示確認" }
        ]
    },
    friend_making: {
        "4-6": [
            { english: "Do you want to play?", japanese: "一緒に遊ぶ？", situation: "遊びに誘う" },
            { english: "Can I sit with you?", japanese: "一緒に座ってもいい？", situation: "席を共有" },
            { english: "What's your favorite game?", japanese: "好きなゲームは何？", situation: "興味を聞く" },
            { english: "Let's be friends!", japanese: "友達になろう！", situation: "友達になる" },
            { english: "Want to share my snack?", japanese: "おやつを分ける？", situation: "分け合い" },
            { english: "Do you like this toy?", japanese: "このおもちゃ好き？", situation: "共通の興味" },
            { english: "Can I play too?", japanese: "私も遊んでいい？", situation: "参加希望" },
            { english: "You're nice!", japanese: "あなたは優しいね！", situation: "褒める" },
            { english: "Let's play again tomorrow!", japanese: "明日また遊ぼう！", situation: "次の約束" },
            { english: "I like your drawing!", japanese: "あなたの絵が好き！", situation: "作品を褒める" }
        ],
        "7-9": [
            { english: "Would you like to join our group?", japanese: "私たちのグループに入る？", situation: "グループに誘う" },
            { english: "Do you want to be study partners?", japanese: "勉強パートナーになる？", situation: "勉強仲間" },
            { english: "What clubs are you in?", japanese: "どんなクラブに入ってる？", situation: "活動を聞く" },
            { english: "Can I have your contact?", japanese: "連絡先を教えてもらえる？", situation: "連絡先交換" },
            { english: "Want to hang out after school?", japanese: "放課後遊ばない？", situation: "放課後の誘い" },
            { english: "Do you play any sports?", japanese: "何かスポーツをしてる？", situation: "スポーツの話題" },
            { english: "We have similar interests!", japanese: "私たち興味が似てるね！", situation: "共通点発見" },
            { english: "Want to work on this project together?", japanese: "このプロジェクトを一緒にやらない？", situation: "協力提案" },
            { english: "You're really good at this!", japanese: "あなたはこれが本当に上手だね！", situation: "能力を褒める" },
            { english: "Let's eat lunch together!", japanese: "一緒にランチを食べよう！", situation: "昼食の誘い" }
        ],
        "10-12": [
            { english: "We have a lot in common.", japanese: "私たち共通点が多いね。", situation: "共通点を見つける" },
            { english: "I really enjoy talking with you.", japanese: "あなたと話すのが楽しいです。", situation: "会話を楽しむ" },
            { english: "Would you like to study together?", japanese: "一緒に勉強しませんか？", situation: "勉強の誘い" },
            { english: "I appreciate your friendship.", japanese: "あなたの友情に感謝します。", situation: "友情への感謝" },
            { english: "Let's keep in touch.", japanese: "連絡を取り合いましょう。", situation: "関係継続" },
            { english: "I value your opinion.", japanese: "あなたの意見を大切にしています。", situation: "意見尊重" },
            { english: "You inspire me to do better.", japanese: "あなたは私をより良くする刺激を与えてくれます。", situation: "刺激を受ける" },
            { english: "Thanks for being a great friend.", japanese: "素晴らしい友達でいてくれてありがとう。", situation: "友情感謝" },
            { english: "Let's support each other.", japanese: "お互いを支え合いましょう。", situation: "相互支援" },
            { english: "I'm glad we became friends.", japanese: "友達になれて嬉しいです。", situation: "友情の喜び" }
        ]
    },
    cultural_exchange: {
        "4-6": [
            { english: "In Japan, we bow.", japanese: "日本ではお辞儀をします。", situation: "文化紹介" },
            { english: "What's this called in English?", japanese: "これは英語で何と言いますか？", situation: "英語名を聞く" },
            { english: "We eat with chopsticks.", japanese: "私たちは箸で食べます。", situation: "食文化" },
            { english: "How do you say hello?", japanese: "こんにちはは何と言いますか？", situation: "挨拶を学ぶ" },
            { english: "That's different from Japan.", japanese: "それは日本と違います。", situation: "違いに気づく" },
            { english: "We take off shoes inside.", japanese: "家の中では靴を脱ぎます。", situation: "生活習慣" },
            { english: "What's your favorite food?", japanese: "好きな食べ物は何？", situation: "食の好み" },
            { english: "In my country, we...", japanese: "私の国では...", situation: "文化説明" },
            { english: "That's interesting!", japanese: "それは面白い！", situation: "興味を示す" },
            { english: "Can you teach me?", japanese: "教えてくれる？", situation: "学習希望" }
        ],
        "7-9": [
            { english: "In my country, we celebrate...", japanese: "私の国では...を祝います。", situation: "祝日紹介" },
            { english: "Can you teach me your language?", japanese: "あなたの言語を教えてくれる？", situation: "言語学習" },
            { english: "What's your traditional food?", japanese: "伝統的な食べ物は何？", situation: "食文化質問" },
            { english: "How do you celebrate birthdays?", japanese: "誕生日はどう祝うの？", situation: "祝い方を聞く" },
            { english: "That's similar to Japanese culture.", japanese: "それは日本文化に似ています。", situation: "類似点発見" },
            { english: "What sports are popular there?", japanese: "そこでは何のスポーツが人気？", situation: "スポーツ文化" },
            { english: "Tell me about your school.", japanese: "あなたの学校について教えて。", situation: "学校生活" },
            { english: "What's the weather like?", japanese: "天気はどんな感じ？", situation: "気候について" },
            { english: "Do you have school uniforms?", japanese: "学校の制服はある？", situation: "学校文化" },
            { english: "What languages do you speak?", japanese: "何語を話せる？", situation: "言語能力" }
        ],
        "10-12": [
            { english: "I'd love to learn about your culture.", japanese: "あなたの文化について学びたいです。", situation: "文化学習意欲" },
            { english: "Cultural diversity is fascinating.", japanese: "文化の多様性は魅力的です。", situation: "多様性評価" },
            { english: "Let me explain our customs.", japanese: "私たちの習慣を説明させてください。", situation: "習慣説明" },
            { english: "I respect your traditions.", japanese: "あなたの伝統を尊重します。", situation: "文化尊重" },
            { english: "We can learn from each other.", japanese: "お互いから学べます。", situation: "相互学習" },
            { english: "What are your cultural values?", japanese: "あなたの文化的価値観は何ですか？", situation: "価値観について" },
            { english: "How has globalization affected your country?", japanese: "グローバル化はあなたの国にどう影響しましたか？", situation: "社会変化" },
            { english: "I'm interested in your history.", japanese: "あなたの国の歴史に興味があります。", situation: "歴史への関心" },
            { english: "Let's share our experiences.", japanese: "経験を共有しましょう。", situation: "経験共有" },
            { english: "Cultural exchange enriches us.", japanese: "文化交流は私たちを豊かにします。", situation: "交流の価値" }
        ]
    },
    emergency_situations: {
        "4-6": [
            { english: "I feel sick.", japanese: "気分が悪いです。", situation: "体調不良" },
            { english: "I lost my lunch box.", japanese: "お弁当箱をなくしました。", situation: "紛失" },
            { english: "Someone is being mean.", japanese: "誰かが意地悪をしています。", situation: "いじめ報告" },
            { english: "I need to call home.", japanese: "家に電話したいです。", situation: "連絡希望" },
            { english: "I'm scared.", japanese: "怖いです。", situation: "恐怖表現" },
            { english: "I hurt my knee.", japanese: "膝を怪我しました。", situation: "怪我の報告" },
            { english: "I can't find my bag.", japanese: "かばんが見つかりません。", situation: "物の紛失" },
            { english: "My stomach hurts.", japanese: "お腹が痛いです。", situation: "腹痛" },
            { english: "I need my medicine.", japanese: "薬が必要です。", situation: "薬の必要性" },
            { english: "Help me, please!", japanese: "助けてください！", situation: "緊急の助け" }
        ],
        "7-9": [
            { english: "I need to go to the nurse.", japanese: "保健室に行きたいです。", situation: "保健室希望" },
            { english: "I'm being bullied.", japanese: "いじめられています。", situation: "いじめ相談" },
            { english: "I forgot my homework at home.", japanese: "宿題を家に忘れました。", situation: "忘れ物報告" },
            { english: "Can I call my parents?", japanese: "両親に電話してもいいですか？", situation: "親への連絡" },
            { english: "I don't feel safe.", japanese: "安全だと感じません。", situation: "不安表現" },
            { english: "I have a headache.", japanese: "頭痛がします。", situation: "頭痛の報告" },
            { english: "Someone took my things.", japanese: "誰かが私の物を取りました。", situation: "盗難報告" },
            { english: "I feel dizzy.", japanese: "めまいがします。", situation: "めまい" },
            { english: "There's been an accident.", japanese: "事故がありました。", situation: "事故報告" },
            { english: "I need to go home early.", japanese: "早退したいです。", situation: "早退希望" }
        ],
        "10-12": [
            { english: "I need immediate assistance.", japanese: "すぐに助けが必要です。", situation: "緊急援助" },
            { english: "This is a serious problem.", japanese: "これは深刻な問題です。", situation: "問題の深刻さ" },
            { english: "I'd like to speak privately.", japanese: "個人的に話したいです。", situation: "個別相談" },
            { english: "I'm experiencing anxiety.", japanese: "不安を感じています。", situation: "精神的不調" },
            { english: "I need professional help.", japanese: "専門的な助けが必要です。", situation: "専門家希望" },
            { english: "I'm having a panic attack.", japanese: "パニック発作を起こしています。", situation: "パニック発作" },
            { english: "I need to report an incident.", japanese: "事件を報告する必要があります。", situation: "事件報告" },
            { english: "This requires urgent attention.", japanese: "これは緊急の対応が必要です。", situation: "緊急対応" },
            { english: "I'm concerned about a friend.", japanese: "友達のことが心配です。", situation: "友人の心配" },
            { english: "I need counseling support.", japanese: "カウンセリングのサポートが必要です。", situation: "カウンセリング希望" }
        ]
    }
};

// カスタム例文を保存
let customExamples = [];

// 現在の例文を保持
let currentExamples = [];
let currentExampleIndices = {};

// 初期化関数
function init() {
    setupEventListeners();
    updateOptionsVisibility();
    updatePreview();
}

// イベントリスナーのセットアップ
function setupEventListeners() {
    // 既存のイベントリスナー
    const practiceMode = document.getElementById('practiceMode');
    const showExamplesCheckbox = document.getElementById('showExamples');
    const showTranslationCheckbox = document.getElementById('showTranslation');
    const refreshExamplesBtn = document.getElementById('refreshExamplesBtn');
    const ageGroupSelect = document.getElementById('ageGroup');
    const printBtn = document.getElementById('printBtn');

    // Phase 1: カスタマイズ機能のイベントリスナー
    const lineHeightSelect = document.getElementById('lineHeight');
    const lineColorSelect = document.getElementById('lineColor');
    const showHeaderCheckbox = document.getElementById('showHeader');
    const pageCountInput = document.getElementById('pageCount');
    
    // Phase 2: 追加機能のイベントリスナー
    const exampleCategorySelect = document.getElementById('exampleCategory');
    const wordCategorySelect = document.getElementById('wordCategory');
    const addCustomExampleBtn = document.getElementById('addCustomExampleBtn');
    const alphabetTypeSelect = document.getElementById('alphabetType');
    const showAlphabetExampleCheckbox = document.getElementById('showAlphabetExample');
    const phraseCategorySelect = document.getElementById('phraseCategory');
    const showSituationCheckbox = document.getElementById('showSituation');
    const shufflePhrasesBtn = document.getElementById('shufflePhrases');
    const previewBtn = document.getElementById('previewBtn');

    // 更新イベントリスナー
    // practiceMode.addEventListener('change', updatePreview); // 削除（571行目で設定済み）
    showExamplesCheckbox.addEventListener('change', updatePreview);
    showTranslationCheckbox.addEventListener('change', updatePreview);
    refreshExamplesBtn.addEventListener('click', () => {
        shuffleCurrentExamples();
        updatePreview();
    });
    ageGroupSelect.addEventListener('change', () => {
        currentExampleIndices = {};
        currentExamples = []; // 年齢変更時に例文をリセット
        updatePreview();
    });
    
    // Phase 1カスタマイズ機能のイベントリスナー
    lineHeightSelect.addEventListener('change', updatePreview);
    lineColorSelect.addEventListener('change', updatePreview);
    showHeaderCheckbox.addEventListener('change', updatePreview);
    pageCountInput.addEventListener('change', updatePreview);
    
    // Phase 2追加機能のイベントリスナー
    exampleCategorySelect.addEventListener('change', () => {
        currentExamples = [];
        updatePreview();
    });
    wordCategorySelect.addEventListener('change', updatePreview);
    addCustomExampleBtn.addEventListener('click', handleAddCustomExample);
    
    // 新しい練習モード用のイベントリスナー
    if (alphabetTypeSelect) {
        alphabetTypeSelect.addEventListener('change', updatePreview);
    }
    if (showAlphabetExampleCheckbox) {
        showAlphabetExampleCheckbox.addEventListener('change', updatePreview);
    }
    if (phraseCategorySelect) {
        phraseCategorySelect.addEventListener('change', updatePreview);
    }
    if (showSituationCheckbox) {
        showSituationCheckbox.addEventListener('change', updatePreview);
    }
    
    // フレーズシャッフルボタン
    if (shufflePhrasesBtn) {
        shufflePhrasesBtn.addEventListener('click', () => {
            updatePreview();
        });
    }
    
    // ボタンイベント
    printBtn.addEventListener('click', printNote);
    
    // プレビューボタンのイベント
    if (previewBtn) {
        previewBtn.addEventListener('click', showPrintPreview);
        if (window.Debug) Debug.log('INIT', '印刷プレビューボタンのイベントリスナーを設定しました');
    } else {
        if (window.Debug) Debug.error('INIT', '印刷プレビューボタンが見つかりません', { element: 'previewBtn' });
    }
    
    // 練習モード変更時の処理
    practiceMode.addEventListener('change', () => {
        updateOptionsVisibility();
        updatePreview();
    });
}

// オプションの表示/非表示を更新
function updateOptionsVisibility() {
    const practiceMode = document.getElementById('practiceMode').value;
    const exampleOptions = document.getElementById('exampleOptions');
    const translationOptions = document.getElementById('translationOptions');
    const ageOptions = document.getElementById('ageOptions');
    const wordOptions = document.getElementById('wordOptions');
    const customExampleOptions = document.getElementById('customExampleOptions');
    const alphabetOptions = document.getElementById('alphabetOptions');
    const phraseOptions = document.getElementById('phraseOptions');
    
    // すべて非表示にリセット
    ageOptions.style.display = 'none';
    exampleOptions.style.display = 'none';
    translationOptions.style.display = 'none';
    wordOptions.style.display = 'none';
    customExampleOptions.style.display = 'none';
    alphabetOptions.style.display = 'none';
    phraseOptions.style.display = 'none';
    
    if (practiceMode === 'sentence') {
        ageOptions.style.display = 'block';
        exampleOptions.style.display = 'block';
        translationOptions.style.display = 'block';
        customExampleOptions.style.display = 'block';
        document.getElementById('showExamples').checked = true;
    } else if (practiceMode === 'word') {
        ageOptions.style.display = 'block';
        wordOptions.style.display = 'block';
        document.getElementById('showExamples').checked = false;
        document.getElementById('showTranslation').checked = false;
    } else if (practiceMode === 'alphabet') {
        alphabetOptions.style.display = 'block';
        document.getElementById('showExamples').checked = false;
        document.getElementById('showTranslation').checked = false;
    } else if (practiceMode === 'phrase') {
        ageOptions.style.display = 'block';
        phraseOptions.style.display = 'block';
        translationOptions.style.display = 'block';
        document.getElementById('showExamples').checked = false;
        document.getElementById('showTranslation').checked = true;
    } else {
        document.getElementById('showExamples').checked = false;
        document.getElementById('showTranslation').checked = false;
    }
}

// プレビュー更新
function updatePreview() {
    const practiceMode = document.getElementById('practiceMode').value;
    const pageCount = parseInt(document.getElementById('pageCount').value) || 1;
    const notePreview = document.getElementById('notePreview');
    
    let html = '';
    
    for (let page = 0; page < pageCount; page++) {
        if (page > 0) {
            // プレビュー用のページ区切り（画面表示用）
            html += `
                <div class="page-separator">
                    <div class="page-separator-line"></div>
                    <div class="page-separator-text">ページ ${page + 1}</div>
                    <div class="page-separator-line"></div>
                </div>
            `;
            // 印刷用のページ区切り
            html += '<div style="page-break-before: always;"></div>';
        }
        html += generateNotePage(page + 1, pageCount);
    }
    
    notePreview.innerHTML = html;
}

// ノートページ生成
function generateNotePage(pageNumber, totalPages) {
    const practiceMode = document.getElementById('practiceMode').value;
    const lineHeight = parseInt(document.getElementById('lineHeight').value);
    const lineColor = document.getElementById('lineColor').value;
    const showHeader = document.getElementById('showHeader').checked;
    const showExamples = document.getElementById('showExamples').checked;
    const showTranslation = document.getElementById('showTranslation').checked;
    const ageGroup = document.getElementById('ageGroup').value;
    
    // 行高さに応じたスペーシングを計算
    const lineSpacing = Math.max(1, Math.floor(lineHeight * 0.2)); // 行高の20%
    const lineSeparatorHeight = Math.max(2, Math.floor(lineHeight * 0.4)); // 行高の40%
    const lineSeparatorSmallHeight = Math.max(2, Math.floor(lineHeight * 0.4));
    const lineGroupSeparatorHeight = Math.max(2, Math.floor(lineHeight * 0.3));
    const sentenceGroupMargin = Math.max(8, lineHeight);
    
    // CSS変数を設定
    const styleVars = `style="
        --line-height-mm: ${lineHeight}mm;
        --line-spacing-mm: ${lineSpacing}mm;
        --line-separator-height: ${lineSeparatorHeight}mm;
        --line-separator-small-height: ${lineSeparatorSmallHeight}mm;
        --line-group-separator-height: ${lineGroupSeparatorHeight}mm;
        --sentence-group-margin: ${sentenceGroupMargin}mm;
    "`;
    const colorClass = lineColor !== 'gray' ? `line-color-${lineColor}` : '';
    
    let html = `<div class="note-page ${colorClass}" ${styleVars}>`;
    
    // ヘッダー
    if (showHeader) {
        html += `
            <div class="note-header">
                <div class="note-header__item">
                    <span class="note-header__label">名前:</span>
                    <input class="note-header__input" type="text">
                </div>
                <div class="note-header__item">
                    <span class="note-header__label">日付:</span>
                    <input class="note-header__input" type="text">
                </div>
            </div>
        `;
    }
    
    // コンテンツ
    if (practiceMode === 'sentence') {
        html += generateSentencePractice(showExamples, showTranslation, ageGroup);
    } else if (practiceMode === 'word') {
        html += generateWordPractice(ageGroup);
    } else if (practiceMode === 'alphabet') {
        html += generateAlphabetPractice(pageNumber);
    } else if (practiceMode === 'phrase') {
        html += generatePhrasePractice(showTranslation, ageGroup);
    } else {
        html += generateNormalPractice(showExamples, showTranslation, ageGroup);
    }
    
    // ページ番号（複数ページの場合のみ表示）
    if (totalPages > 1) {
        html += `
            <div class="page-number">
                <span class="page-number-current">${pageNumber}</span>
                <span class="page-number-separator">/</span>
                <span class="page-number-total">${totalPages}</span>
            </div>
        `;
    }
    
    html += '</div>';
    
    return html;
}

// 通常練習モード生成
function generateNormalPractice(showExamples, showTranslation, ageGroup) {
    let html = '';
    // 行高さに応じて最大行数を調整
    const lineHeight = parseInt(document.getElementById('lineHeight').value);
    const baseMaxLines = showExamples ? 12 : 14;
    const maxLines = lineHeight === 12 ? Math.floor(baseMaxLines * 0.8) : 
                     lineHeight === 8 ? Math.floor(baseMaxLines * 1.2) : 
                     baseMaxLines;
    
    if (showExamples) {
        const neededExamples = Math.floor(maxLines / 4);
        ensureExamples(neededExamples, ageGroup);
    }
    
    for (let i = 0; i < maxLines; i++) {
        const exampleIndex = Math.floor(i / 4);
        const shouldShowExample = showExamples && currentExamples[exampleIndex] && i % 4 === 0;
        
        if (shouldShowExample) {
            html += generateExampleSentence(currentExamples[exampleIndex], showTranslation);
        }
        
        html += generateBaselineGroup();
        
        if (i !== maxLines - 1) {
            html += '<div class="line-separator-small"></div>';
        }
    }
    
    return html;
}

// 文章練習モード生成
function generateSentencePractice(showExamples, showTranslation, ageGroup) {
    let html = '';
    // 行高さに応じて例文数を調整
    const lineHeight = parseInt(document.getElementById('lineHeight').value);
    const baseMaxExamples = showTranslation ? 4 : 5;
    const maxExamples = lineHeight === 12 ? Math.floor(baseMaxExamples * 0.8) : 
                        lineHeight === 8 ? Math.floor(baseMaxExamples * 1.2) : 
                        baseMaxExamples;
    
    ensureExamples(maxExamples, ageGroup);
    
    for (let i = 0; i < currentExamples.length; i++) {
        html += `
            <div class="sentence-practice-group">
                ${generateExampleSentence(currentExamples[i], showTranslation)}
                <div class="practice-lines">
                    ${generateBaselineGroup()}
                    <div class="line-separator"></div>
                    ${generateBaselineGroup()}
                </div>
            </div>
        `;
    }
    
    return html;
}

// Phase 2: 単語練習モード生成
function generateWordPractice(ageGroup) {
    let html = '<div class="word-practice">';
    
    // 単語カテゴリーを選択
    const category = document.getElementById('wordCategory').value || 'animals';
    const words = WORD_LISTS[category] && WORD_LISTS[category][ageGroup] ? 
                  WORD_LISTS[category][ageGroup] : 
                  WORD_LISTS['animals'][ageGroup] || WORD_LISTS['animals']['7-9'];
    
    const categoryNames = {
        animals: '動物',
        food: '食べ物',
        colors: '色',
        numbers: '数字',
        calendar: '曜日・月',
        school_items: '学用品',
        body_parts: '身体',
        weather: '天気',
        classroom_objects: '教室の物',
        subjects: '教科',
        sports_activities: 'スポーツ・活動',
        emotions_advanced: '感情（上級）',
        academic_words: '学習用語'
    };
    
    html += `<h3 style="text-align: center; margin-bottom: 10mm;">Word Practice - ${categoryNames[category] || category}</h3>`;
    
    // 行高さに応じて単語数を調整
    const lineHeight = parseInt(document.getElementById('lineHeight').value);
    const maxWords = lineHeight === 12 ? 3 : lineHeight === 8 ? 5 : 4;
    const displayWords = words.slice(0, maxWords);
    
    for (let word of displayWords) {
        html += `
            <div class="word-practice-item" style="margin-bottom: ${lineHeight === 12 ? '18mm' : lineHeight === 8 ? '10mm' : '12mm'};">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2mm;">
                    <span style="font-size: 16pt; font-weight: bold;">${word.english}</span>
                    <span style="font-size: 12pt; color: #666;">${word.syllables}</span>
                    <span style="font-size: 12pt; color: #666;">${word.japanese}</span>
                </div>
                ${generateBaselineGroup()}
                <div class="line-separator-small"></div>
                ${generateBaselineGroup()}
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

// ベースライングループ生成
function generateBaselineGroup() {
    return `
        <div class="baseline-group">
            <div class="baseline baseline--top"></div>
            <div class="baseline baseline--upper"></div>
            <div class="baseline baseline--lower"></div>
            <div class="baseline baseline--bottom"></div>
        </div>
    `;
}

// 例文表示生成
function generateExampleSentence(sentence, showTranslation) {
    const difficulty = '★'.repeat(sentence.difficulty || 1);
    return `
        <div class="example-sentence">
            <div class="example-english">
                ${sentence.english}
                <span style="font-size: 10pt; color: #999; margin-left: 5mm;">${difficulty}</span>
            </div>
            ${showTranslation ? `<div class="example-japanese">${sentence.japanese}</div>` : ''}
        </div>
    `;
}

// 例文を確保
function ensureExamples(count, ageGroup) {
    if (currentExamples.length !== count) {
        currentExamples = getRandomExamples(count, ageGroup);
    }
}

// ランダムな例文を取得
function getRandomExamples(count, ageGroup) {
    const category = document.getElementById('exampleCategory').value || 'all';
    let sentences = EXAMPLE_SENTENCES_BY_AGE[ageGroup] || EXAMPLE_SENTENCES_BY_AGE["7-9"];
    
    // カテゴリーでフィルタリング
    if (category !== 'all') {
        sentences = sentences.filter(s => s.category === category);
    }
    
    const allSentences = [...sentences, ...customExamples.filter(e => e.ageGroup === ageGroup && (category === 'all' || e.category === category))];
    const shuffled = [...allSentences].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// 現在の例文をシャッフル
function shuffleCurrentExamples() {
    currentExamples = [];
}

// 印刷機能
function printNote() {
    // 印刷前にレイアウトチェックを実行
    if (window.LayoutValidator) {
        runLayoutTest();
    }
    window.print();
}

// 印刷プレビュー機能
function showPrintPreview() {
    if (window.Debug) {
        Debug.startTimer('print-preview');
        Debug.logEvent('click', { id: 'previewBtn' }, { action: 'showPrintPreview' });
    }

    const modal = document.getElementById('printPreviewModal');
    const previewPage = document.getElementById('a4Preview');
    const notePreview = document.getElementById('notePreview');

    // 要素の存在確認
    if (!modal || !previewPage || !notePreview) {
        console.error('印刷プレビューに必要な要素が見つかりません', {
            modal: !!modal,
            previewPage: !!previewPage,
            notePreview: !!notePreview
        });
        return;
    }

    if (window.Debug) Debug.debug('PRINT_PREVIEW', '必要な要素が見つかりました', { modal: !!modal, notePreview: !!notePreview, previewPage: !!previewPage });

    // 現在のプレビュー内容をコピーして印刷用にスタイル調整
    previewPage.innerHTML = notePreview.innerHTML;

    // プレビューページに印刷用の余白設定を適用（統一設定を使用）
    const previewNotePages = previewPage.querySelectorAll('.note-page');
    const standardMargin = getComputedStyle(document.documentElement).getPropertyValue('--margin-standard').trim();

    previewNotePages.forEach(page => {
        page.style.padding = standardMargin; // CSS変数から取得した標準余白
        page.style.boxShadow = 'none'; // 印刷では影なし
        page.style.maxWidth = 'none'; // 印刷では幅制限なし
    });

    if (window.Debug) Debug.debug('PRINT_PREVIEW', 'プレビュー内容をコピーし印刷用スタイルを適用しました', {
        contentLength: previewPage.innerHTML.length,
        pageCount: previewNotePages.length
    });

    // モーダルを表示（display属性とクラスの両方を使用）
    modal.style.display = 'flex';
    // 少し遅延を入れてからクラスを追加（アニメーション効果のため）
    setTimeout(() => {
        modal.classList.add('modal-visible');
        if (window.Debug) {
            Debug.log('PRINT_PREVIEW', 'モーダルを表示しました', {
                display: modal.style.display,
                classList: modal.classList.toString()
            });
            Debug.endTimer('print-preview');
        }
    }, 10);

    // ズーム機能の初期化
    initializePreviewZoom();

    // モーダルのイベントリスナーを設定
    setupPreviewModalEvents();
}

// プレビューのズーム機能
let currentZoom = 60;
const zoomLevels = [50, 60, 70, 80, 90, 100];

function initializePreviewZoom() {
    currentZoom = 60;
    updateZoomDisplay();
}

function updateZoomDisplay() {
    const previewPage = document.getElementById('a4Preview');
    const zoomLevel = document.getElementById('zoomLevel');
    
    // 既存のズームクラスを削除
    zoomLevels.forEach(level => {
        previewPage.classList.remove(`zoom-${level}`);
    });
    
    // 新しいズームクラスを追加
    previewPage.classList.add(`zoom-${currentZoom}`);
    zoomLevel.textContent = `${currentZoom}%`;
}

function zoomIn() {
    const currentIndex = zoomLevels.indexOf(currentZoom);
    if (currentIndex < zoomLevels.length - 1) {
        currentZoom = zoomLevels[currentIndex + 1];
        updateZoomDisplay();
    }
}

function zoomOut() {
    const currentIndex = zoomLevels.indexOf(currentZoom);
    if (currentIndex > 0) {
        currentZoom = zoomLevels[currentIndex - 1];
        updateZoomDisplay();
    }
}

function setupPreviewModalEvents() {
    const modal = document.getElementById('printPreviewModal');
    const closeBtn = document.getElementById('closePreviewBtn');
    const cancelBtn = document.getElementById('cancelPreviewBtn');
    const printBtn = document.getElementById('printFromPreviewBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');

    // 要素の存在確認
    if (!modal) {
        console.error('モーダル要素が見つかりません');
        return;
    }

    // 閉じるボタン
    const closePreview = () => {
        if (window.Debug) Debug.log('PRINT_PREVIEW', 'プレビューモーダルを閉じます');
        modal.style.display = 'none';
        modal.classList.remove('modal-visible');
    };

    if (closeBtn) closeBtn.onclick = closePreview;
    if (cancelBtn) cancelBtn.onclick = closePreview;
    
    // モーダル外クリックで閉じる
    modal.onclick = (e) => {
        if (e.target === modal) {
            closePreview();
        }
    };
    
    // ESCキーで閉じる
    const handleKeydown = (e) => {
        if (e.key === 'Escape') {
            closePreview();
            document.removeEventListener('keydown', handleKeydown);
        }
    };
    document.addEventListener('keydown', handleKeydown);
    
    // 印刷実行
    if (printBtn) {
        printBtn.onclick = () => {
            closePreview();
            setTimeout(() => {
                printNote();
            }, 100);
        };
    }

    // ズーム
    if (zoomInBtn) zoomInBtn.onclick = zoomIn;
    if (zoomOutBtn) zoomOutBtn.onclick = zoomOut;
}

// PDFレイアウトの自動テスト機能
function runLayoutTest() {
    if (window.Debug) Debug.log('TEST', 'PDFレイアウトテスト実行開始', { timestamp: new Date().toLocaleString() });
    
    const validator = new window.LayoutValidator();
    const report = validator.generateReport();
    
    // テスト結果のサマリー
    if (window.Debug) {
        Debug.log('TEST', 'テスト結果サマリー', {
            passed: report.summary.passed,
            failed: report.summary.failed,
            skipped: report.summary.skipped
        });
    }
    
    // エラーの詳細
    if (report.errors.length > 0) {
        console.group('\n❌ エラー詳細:');
        report.errors.forEach(error => {
            console.error(`- ${error.rule}: ${error.actualValue} (期待値: ${error.expectedRange})`);
        });
        // Group end removed - using structured logging instead
    }
    
    // 警告の詳細
    if (report.warnings.length > 0) {
        console.group('\n⚠️ 警告詳細:');
        report.warnings.forEach(warning => {
            console.warn(`- ${warning.rule}: ${warning.actualValue} (期待値: ${warning.expectedRange})`);
        });
        // Group end removed - using structured logging instead
    }
    
    // ページ高さのチェック結果を強調
    const pageHeightErrors = report.errors.filter(e => e.rule.startsWith('pageHeight'));
    if (pageHeightErrors.length > 0) {
        console.group('\n📏 ページ高さエラー:');
        pageHeightErrors.forEach(error => {
            console.error(error.message);
        });
        // Group end removed - using structured logging instead
    }
    
    // 最終判定
    const isPassed = report.errors.length === 0;
    if (isPassed) {
        if (window.Debug) Debug.log('TEST', 'すべてのレイアウトテストに合格しました！', { status: 'success' });
    } else {
        if (window.Debug) Debug.error('TEST', 'レイアウトに問題があります。印刷結果を確認してください。', { errors: report.errors });
    }
    
    // Group end removed - using structured logging instead
    
    return report;
}


// 初期化実行
document.addEventListener('DOMContentLoaded', init);

// デバッグ機能
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        document.body.classList.toggle('debug-mode');
        if (window.Debug) Debug.log('DEBUG', 'Debug mode toggled', { enabled: document.body.classList.contains('debug-mode') });
    }
    
    // Ctrl + Shift + T でレイアウトテスト実行
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        if (window.Debug) Debug.log('TEST', '手動レイアウトテストを実行します...');
        runLayoutTest();
    }
});

// グローバルに公開（開発者コンソールから実行可能）
window.testPDFLayout = function() {
    if (window.Debug) Debug.log('TEST', 'PDFレイアウトテストを開始します...');
    updatePreview(); // プレビューを最新状態に更新
    setTimeout(() => {
        const report = runLayoutTest();
        
        // 追加の診断情報
        if (window.Debug) {
            Debug.log('DIAGNOSTICS', '追加診断情報', {
                practiceMode: document.getElementById('practiceMode').value,
                pageCount: document.getElementById('pageCount').value,
                lineHeight: document.getElementById('lineHeight').value + 'mm'
            });
        }
        
        // ページごとの高さ情報
        const pages = document.querySelectorAll('.note-page');
        pages.forEach((page, index) => {
            const rect = page.getBoundingClientRect();
            const heightInMm = rect.height / 3.7795275591;
            if (window.Debug) Debug.debug('DIAGNOSTICS', `ページ${index + 1}の高さ`, { height: `${heightInMm.toFixed(2)}mm` });
        });
        // Group end removed - using structured logging instead
        
        return report;
    }, 100);
};

// カスタム例文を追加するハンドラ
function handleAddCustomExample() {
    const english = document.getElementById('customEnglish').value.trim();
    const japanese = document.getElementById('customJapanese').value.trim();
    const ageGroup = document.getElementById('ageGroup').value;
    const category = document.getElementById('exampleCategory').value || 'daily';
    
    if (!english || !japanese) {
        alert('英語と日本語の両方を入力してください。');
        return;
    }
    
    addCustomExample(english, japanese, category, ageGroup);
    
    // 入力フィールドをクリア
    document.getElementById('customEnglish').value = '';
    document.getElementById('customJapanese').value = '';
    
    alert('カスタム例文を追加しました！');
}

// アルファベット練習モード生成
function generateAlphabetPractice(pageNumber) {
    const alphabetType = document.getElementById('alphabetType').value;
    const showExample = document.getElementById('showAlphabetExample').checked;
    
    let letters = [];
    if (alphabetType === 'uppercase' || alphabetType === 'both') {
        letters = letters.concat(ALPHABET_DATA.uppercase);
    }
    if (alphabetType === 'lowercase' || alphabetType === 'both') {
        letters = letters.concat(ALPHABET_DATA.lowercase);
    }
    
    // 2列レイアウトで1ページに6文字（3行×2列）
    const lettersPerPage = 6;
    const startIndex = (pageNumber - 1) * lettersPerPage;
    const endIndex = startIndex + lettersPerPage;
    const currentPageLetters = letters.slice(startIndex, endIndex);
    
    // 空のページの場合は何も表示しない
    if (currentPageLetters.length === 0) {
        return '<div class="alphabet-practice"><p style="text-align: center; color: #999;">このページには表示する文字がありません</p></div>';
    }
    
    // 必要なページ数を自動計算して設定
    if (alphabetType === 'both' && pageNumber === 1) {
        const neededPages = Math.ceil(letters.length / lettersPerPage);
        const pageCountInput = document.getElementById('pageCount');
        if (pageCountInput && parseInt(pageCountInput.value) < neededPages) {
            console.info(`アルファベット練習（両方）: ${neededPages}ページ必要です`);
            // ユーザーに通知
            setTimeout(() => {
                if (confirm(`全${letters.length}文字を表示するには${neededPages}ページ必要です。ページ数を${neededPages}に変更しますか？`)) {
                    pageCountInput.value = neededPages;
                    updatePreview();
                }
            }, 100);
        }
    }
    
    let html = '<div class="alphabet-practice">';
    
    // タイトルにページ情報を追加
    const totalPages = Math.ceil(letters.length / lettersPerPage);
    html += `<h3 class="practice-title">Alphabet Practice ${totalPages > 1 ? `(${pageNumber}/${totalPages})` : ''}</h3>`;
    
    html += '<div class="alphabet-grid">';
    
    for (let i = 0; i < currentPageLetters.length; i++) {
        const item = currentPageLetters[i];
        html += `
            <div class="alphabet-grid-item">
                <div class="alphabet-header">
                    <span class="alphabet-letter">${item.letter}</span>
                    ${showExample ? `
                        <div class="alphabet-example">
                            <span class="example-word">${item.example}</span>
                            <span class="example-meaning">(${item.japanese})</span>
                        </div>
                    ` : ''}
                </div>
                <div class="alphabet-lines">
                    ${generateBaselineGroup()}
                </div>
            </div>
        `;
    }
    
    html += '</div>'; // alphabet-grid
    html += '</div>'; // alphabet-practice
    return html;
}

// フレーズ練習モード生成
function generatePhrasePractice(showTranslation, ageGroup) {
    let html = '<div class="phrase-practice">';
    const phraseCategory = document.getElementById('phraseCategory').value;
    const showSituation = document.getElementById('showSituation').checked;
    
    const allPhrases = PHRASE_DATA[phraseCategory] && PHRASE_DATA[phraseCategory][ageGroup] ? 
                      PHRASE_DATA[phraseCategory][ageGroup] : 
                      PHRASE_DATA['greetings'][ageGroup] || PHRASE_DATA['greetings']['7-9'];
    
    // A4に収めるため4つのフレーズに制限（練習行3行ずつ）
    // ランダムに4つ選択して、全てのフレーズが練習できるようにする
    const shuffled = [...allPhrases].sort(() => 0.5 - Math.random());
    const phrases = shuffled.slice(0, 4);
    
    const categoryNames = {
        greetings: 'あいさつ',
        self_introduction: '自己紹介',
        school: '学校生活',
        shopping: '買い物',
        travel: '旅行・移動',
        feelings: '感情表現',
        daily_life: '日常生活',
        classroom_english: '教室での英語',
        friend_making: '友達作り',
        cultural_exchange: '文化交流',
        emergency_situations: '緊急時の表現'
    };
    
    html += `<h3 style="text-align: center; margin-bottom: 1mm; margin-top: 0mm;">Phrase Practice - ${categoryNames[phraseCategory] || phraseCategory}</h3>`;
    
    for (let phrase of phrases) {
        html += `
            <div class="phrase-item">
                <div class="phrase-header">
                    <div class="phrase-main">
                        <div class="phrase-english">${phrase.english}</div>
                        ${showTranslation ? `<div class="phrase-japanese">${phrase.japanese}</div>` : ''}
                    </div>
                    ${showSituation ? `<div class="phrase-situation">【${phrase.situation}】</div>` : ''}
                </div>
                <div class="phrase-lines">
                    ${generateBaselineGroup()}
                    <div class="line-separator-small"></div>
                    ${generateBaselineGroup()}
                    <div class="line-separator-small"></div>
                    ${generateBaselineGroup()}
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

// Phase 2: カスタム例文機能
function addCustomExample(english, japanese, category, ageGroup) {
    customExamples.push({
        english,
        japanese,
        category: category === 'all' ? 'daily' : category,
        ageGroup,
        difficulty: 2,
        custom: true
    });
    currentExamples = [];
    updatePreview();
}

// Phase 2: 例文カテゴリーフィルター（将来実装用）
function filterExamplesByCategory(category) {
    const ageGroup = document.getElementById('ageGroup').value;
    const sentences = EXAMPLE_SENTENCES_BY_AGE[ageGroup] || EXAMPLE_SENTENCES_BY_AGE["7-9"];
    return sentences.filter(s => s.category === category);
}
// コンテンツ統計を自動計算する関数
function updateContentStats() {
    // 単語の統計を計算
    CONTENT_STATS.words.total = 0;
    CONTENT_STATS.words.byCategory = {};
    CONTENT_STATS.words.byAge = { "4-6": 0, "7-9": 0, "10-12": 0 };
    
    Object.entries(WORD_LISTS).forEach(([category, ageData]) => {
        CONTENT_STATS.words.byCategory[category] = 0;
        Object.entries(ageData).forEach(([age, words]) => {
            const count = words.length;
            CONTENT_STATS.words.byCategory[category] += count;
            CONTENT_STATS.words.byAge[age] += count;
            CONTENT_STATS.words.total += count;
        });
    });
    
    // フレーズの統計を計算
    CONTENT_STATS.phrases.total = 0;
    CONTENT_STATS.phrases.byCategory = {};
    CONTENT_STATS.phrases.byAge = { "4-6": 0, "7-9": 0, "10-12": 0 };
    
    Object.entries(PHRASE_DATA).forEach(([category, ageData]) => {
        CONTENT_STATS.phrases.byCategory[category] = 0;
        Object.entries(ageData).forEach(([age, phrases]) => {
            const count = phrases.length;
            CONTENT_STATS.phrases.byCategory[category] += count;
            CONTENT_STATS.phrases.byAge[age] += count;
            CONTENT_STATS.phrases.total += count;
        });
    });
    
    // 例文の統計を計算
    CONTENT_STATS.examples.total = 0;
    CONTENT_STATS.examples.byAge = { "4-6": 0, "7-9": 0, "10-12": 0 };
    
    Object.entries(EXAMPLE_SENTENCES_BY_AGE).forEach(([age, examples]) => {
        const count = examples.length;
        CONTENT_STATS.examples.byAge[age] = count;
        CONTENT_STATS.examples.total += count;
    });
    
    return CONTENT_STATS;
}

// コンテンツ統計を表示する関数
function displayContentStats() {
    updateContentStats();
    
    if (window.Debug) {
        Debug.log('CONTENT_STATS', '英語ノートメーカー コンテンツ統計', {
            lastUpdated: CONTENT_STATS.lastUpdated
        });

        Debug.log('CONTENT_STATS', '単語コンテンツ', {
            total: CONTENT_STATS.words.total,
            byCategory: CONTENT_STATS.words.byCategory,
            byAge: CONTENT_STATS.words.byAge
        });

        Debug.log('CONTENT_STATS', 'フレーズコンテンツ', {
            total: CONTENT_STATS.phrases.total,
            byCategory: CONTENT_STATS.phrases.byCategory,
            byAge: CONTENT_STATS.phrases.byAge
        });

        Debug.log('CONTENT_STATS', '例文コンテンツ', {
            total: CONTENT_STATS.examples.total,
            byAge: CONTENT_STATS.examples.byAge
        });

        Debug.log('CONTENT_STATS', 'アルファベット', {
            total: 52,
            detail: '大文字26 + 小文字26'
        });
    } else {
        // Fallback to console for non-debug environments
        console.log('コンテンツ統計: Debug utilities not loaded');
    }
}

// レイアウト整合性チェック関数
window.checkLayoutConsistency = function() {
    if (window.Debug) Debug.log('LAYOUT_CHECK', 'レイアウト整合性チェックを開始します...');

    const results = {
        timestamp: new Date().toLocaleString(),
        checks: [],
        warnings: [],
        errors: []
    };

    // プレビューと印刷の余白設定をチェック
    const printMediaQuery = Array.from(document.styleSheets)
        .flatMap(sheet => {
            try {
                return Array.from(sheet.cssRules || []);
            } catch (e) {
                return [];
            }
        })
        .find(rule => rule.media && rule.media.mediaText === 'print');

    if (printMediaQuery) {
        const htmlRule = Array.from(printMediaQuery.cssRules)
            .find(rule => rule.selectorText === 'html');

        if (htmlRule && htmlRule.style.margin) {
            results.checks.push({
                item: '印刷用HTML余白',
                value: htmlRule.style.margin,
                status: 'OK'
            });
        }
    }

    // プレビューページのスタイルをチェック
    const previewModal = document.getElementById('printPreviewModal');
    if (previewModal) {
        const previewPages = previewModal.querySelectorAll('.a4-preview-page');
        previewPages.forEach((page, index) => {
            const computedStyle = window.getComputedStyle(page);
            results.checks.push({
                item: `プレビューページ${index + 1} padding`,
                value: computedStyle.padding,
                status: 'OK'
            });
        });
    }

    // ベースライン設定の一貫性チェック
    const baselineElements = document.querySelectorAll('.baseline');
    const lineHeightSettings = new Set();

    baselineElements.forEach(baseline => {
        const parent = baseline.closest('.baseline-group, .line-group');
        if (parent) {
            const height = window.getComputedStyle(parent).height;
            lineHeightSettings.add(height);
        }
    });

    if (lineHeightSettings.size > 1) {
        results.warnings.push('異なる行間設定が検出されました: ' + Array.from(lineHeightSettings).join(', '));
    } else if (lineHeightSettings.size === 1) {
        results.checks.push({
            item: 'ベースライン行間',
            value: Array.from(lineHeightSettings)[0],
            status: 'Consistent'
        });
    }

    // CSS変数の設定確認
    const rootStyles = window.getComputedStyle(document.documentElement);
    const cssVars = ['--line-height', '--baseline-color', '--text-color'];
    cssVars.forEach(varName => {
        const value = rootStyles.getPropertyValue(varName);
        if (value) {
            results.checks.push({
                item: `CSS変数 ${varName}`,
                value: value.trim(),
                status: 'Set'
            });
        } else {
            results.warnings.push(`CSS変数 ${varName} が設定されていません`);
        }
    });

    // 結果をコンソールに出力
    if (window.Debug) {
        Debug.log('LAYOUT_CHECK', 'レイアウト整合性チェック完了', results);

        if (results.errors.length > 0) {
            Debug.error('LAYOUT_CHECK', 'エラーが発見されました', { errors: results.errors });
        }

        if (results.warnings.length > 0) {
            Debug.warn('LAYOUT_CHECK', '警告が発見されました', { warnings: results.warnings });
        }

        if (results.errors.length === 0 && results.warnings.length === 0) {
            Debug.log('LAYOUT_CHECK', 'レイアウト整合性に問題は見つかりませんでした ✅');
        }
    }

    return results;
};

// 統一設定システムの検証機能
window.validateConfiguration = function() {
    if (window.Debug) Debug.log('CONFIG_CHECK', '統一設定システムの検証を開始します...');

    const results = {
        timestamp: new Date().toLocaleString(),
        validations: [],
        warnings: [],
        errors: [],
        settings: {}
    };

    // CSS変数の存在確認
    const rootStyle = getComputedStyle(document.documentElement);
    const requiredVars = [
        'margin-standard', 'margin-debug', 'margin-minimum',
        'line-height-standard', 'line-height-small', 'line-height-large',
        'baseline-color-screen', 'baseline-color-print'
    ];

    requiredVars.forEach(varName => {
        const value = rootStyle.getPropertyValue(`--${varName}`).trim();
        if (value) {
            results.settings[varName] = value;
            results.validations.push({
                item: `CSS変数 --${varName}`,
                value: value,
                status: '設定済み'
            });
        } else {
            results.errors.push(`必須CSS変数 --${varName} が設定されていません`);
        }
    });

    // 余白設定の妥当性チェック
    const marginStandard = rootStyle.getPropertyValue('--margin-standard').trim();
    if (marginStandard) {
        const match = marginStandard.match(/(\d+)mm\s+(\d+)mm/);
        if (match) {
            const [, vertical, horizontal] = match;
            const v = parseInt(vertical);
            const h = parseInt(horizontal);

            if (v < 3) results.warnings.push(`標準余白の縦方向が小さすぎます: ${v}mm (推奨: 3mm以上)`);
            if (h < 8) results.warnings.push(`標準余白の横方向が小さすぎます: ${h}mm (推奨: 8mm以上)`);
            if (v > 20) results.warnings.push(`標準余白の縦方向が大きすぎます: ${v}mm (推奨: 20mm以下)`);
            if (h > 20) results.warnings.push(`標準余白の横方向が大きすぎます: ${h}mm (推奨: 20mm以下)`);

            results.validations.push({
                item: '標準余白設定',
                value: `${v}mm x ${h}mm`,
                status: (v >= 3 && h >= 8 && v <= 20 && h <= 20) ? '適切' : '要確認'
            });
        } else {
            results.errors.push('標準余白の形式が正しくありません（例: 5mm 10mm）');
        }
    }

    // 行高設定の一貫性チェック
    const lineHeights = ['small', 'standard', 'large'].map(size => {
        const value = rootStyle.getPropertyValue(`--line-height-${size}`).trim();
        const match = value.match(/(\d+)mm/);
        return match ? { size, value: parseInt(match[1]) } : null;
    }).filter(Boolean);

    if (lineHeights.length === 3) {
        const [small, standard, large] = lineHeights.map(h => h.value);
        if (small >= standard) results.warnings.push('小行高が標準行高以上になっています');
        if (standard >= large) results.warnings.push('標準行高が大行高以上になっています');

        results.validations.push({
            item: '行高の段階設定',
            value: `${small}mm → ${standard}mm → ${large}mm`,
            status: (small < standard && standard < large) ? '正常' : '要確認'
        });
    }

    // 設定の統計情報
    const configStats = {
        totalVariables: Object.keys(results.settings).length,
        validCount: results.validations.length,
        warningCount: results.warnings.length,
        errorCount: results.errors.length
    };

    // 結果出力
    if (window.Debug) {
        Debug.log('CONFIG_CHECK', '設定検証完了', { stats: configStats });

        if (results.errors.length > 0) {
            Debug.error('CONFIG_CHECK', '設定エラーが発見されました', { errors: results.errors });
        }

        if (results.warnings.length > 0) {
            Debug.warn('CONFIG_CHECK', '設定警告が発見されました', { warnings: results.warnings });
        }

        if (results.errors.length === 0 && results.warnings.length === 0) {
            Debug.log('CONFIG_CHECK', '統一設定システムは正常です ✅', { validations: results.validations.length });
        }

        // 設定値一覧
        Debug.log('CONFIG_CHECK', '現在の設定値', results.settings);
    }

    return { ...results, stats: configStats };
};

