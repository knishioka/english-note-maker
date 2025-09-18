// 既存カテゴリーの拡充データ（各カテゴリー5個→10個へ）

const WORD_LISTS_EXPANSION = {
  animals: {
    '4-6': [
      // 既存5個に追加
      { english: 'mouse', japanese: 'ねずみ', syllables: 'mouse' },
      { english: 'cow', japanese: 'うし', syllables: 'cow' },
      { english: 'pig', japanese: 'ぶた', syllables: 'pig' },
      { english: 'sheep', japanese: 'ひつじ', syllables: 'sheep' },
      { english: 'duck', japanese: 'あひる', syllables: 'duck' },
    ],
    '7-9': [
      // 既存5個に追加
      { english: 'kangaroo', japanese: 'カンガルー', syllables: 'kan-ga-roo' },
      { english: 'zebra', japanese: 'シマウマ', syllables: 'ze-bra' },
      { english: 'koala', japanese: 'コアラ', syllables: 'ko-a-la' },
      { english: 'panda', japanese: 'パンダ', syllables: 'pan-da' },
      { english: 'octopus', japanese: 'タコ', syllables: 'oc-to-pus' },
    ],
    '10-12': [
      // 既存5個に追加
      { english: 'platypus', japanese: 'カモノハシ', syllables: 'plat-y-pus' },
      { english: 'orangutan', japanese: 'オランウータン', syllables: 'o-rang-u-tan' },
      { english: 'peacock', japanese: 'クジャク', syllables: 'pea-cock' },
      { english: 'flamingo', japanese: 'フラミンゴ', syllables: 'fla-min-go' },
      { english: 'hamster', japanese: 'ハムスター', syllables: 'ham-ster' },
    ],
  },
  food: {
    '4-6': [
      // 既存5個に追加
      { english: 'bread', japanese: 'パン', syllables: 'bread' },
      { english: 'cheese', japanese: 'チーズ', syllables: 'cheese' },
      { english: 'juice', japanese: 'ジュース', syllables: 'juice' },
      { english: 'cookie', japanese: 'クッキー', syllables: 'cook-ie' },
      { english: 'candy', japanese: 'あめ', syllables: 'can-dy' },
    ],
    '7-9': [
      // 既存5個に追加
      { english: 'salad', japanese: 'サラダ', syllables: 'sal-ad' },
      { english: 'yogurt', japanese: 'ヨーグルト', syllables: 'yo-gurt' },
      { english: 'cereal', japanese: 'シリアル', syllables: 'ce-re-al' },
      { english: 'pancake', japanese: 'パンケーキ', syllables: 'pan-cake' },
      { english: 'noodles', japanese: 'めん', syllables: 'noo-dles' },
    ],
    '10-12': [
      // 既存5個に追加
      { english: 'beverage', japanese: '飲み物', syllables: 'bev-er-age' },
      { english: 'protein', japanese: 'タンパク質', syllables: 'pro-tein' },
      { english: 'nutrition', japanese: '栄養', syllables: 'nu-tri-tion' },
      { english: 'ingredient', japanese: '材料', syllables: 'in-gre-di-ent' },
      { english: 'cuisine', japanese: '料理', syllables: 'cui-sine' },
    ],
  },
  colors: {
    '4-6': [
      // 既存5個に追加
      { english: 'pink', japanese: 'ピンク', syllables: 'pink' },
      { english: 'orange', japanese: 'オレンジ', syllables: 'or-ange' },
      { english: 'brown', japanese: 'ちゃいろ', syllables: 'brown' },
      { english: 'gray', japanese: 'はいいろ', syllables: 'gray' },
      { english: 'gold', japanese: 'きんいろ', syllables: 'gold' },
    ],
    '7-9': [
      // 既存5個に追加
      { english: 'silver', japanese: 'ぎんいろ', syllables: 'sil-ver' },
      { english: 'navy', japanese: 'ネイビー', syllables: 'na-vy' },
      { english: 'turquoise', japanese: 'ターコイズ', syllables: 'tur-quoise' },
      { english: 'violet', japanese: 'むらさき', syllables: 'vi-o-let' },
      { english: 'maroon', japanese: 'えびちゃ', syllables: 'ma-roon' },
    ],
    '10-12': [
      // 既存5個に追加
      { english: 'crimson', japanese: '深紅', syllables: 'crim-son' },
      { english: 'indigo', japanese: '藍色', syllables: 'in-di-go' },
      { english: 'coral', japanese: '珊瑚色', syllables: 'cor-al' },
      { english: 'azure', japanese: '空色', syllables: 'az-ure' },
      { english: 'amber', japanese: '琥珀色', syllables: 'am-ber' },
    ],
  },
  numbers: {
    '4-6': [
      // 既存5個に追加
      { english: 'six', japanese: 'ろく', syllables: 'six' },
      { english: 'seven', japanese: 'なな', syllables: 'sev-en' },
      { english: 'eight', japanese: 'はち', syllables: 'eight' },
      { english: 'nine', japanese: 'きゅう', syllables: 'nine' },
      { english: 'ten', japanese: 'じゅう', syllables: 'ten' },
    ],
    '7-9': [
      // 既存5個に追加
      { english: 'twenty', japanese: 'にじゅう', syllables: 'twen-ty' },
      { english: 'thirty', japanese: 'さんじゅう', syllables: 'thir-ty' },
      { english: 'forty', japanese: 'よんじゅう', syllables: 'for-ty' },
      { english: 'fifty', japanese: 'ごじゅう', syllables: 'fif-ty' },
      { english: 'sixty', japanese: 'ろくじゅう', syllables: 'six-ty' },
    ],
    '10-12': [
      // 既存5個に追加
      { english: 'decimal', japanese: '小数', syllables: 'dec-i-mal' },
      { english: 'fraction', japanese: '分数', syllables: 'frac-tion' },
      { english: 'percentage', japanese: 'パーセント', syllables: 'per-cent-age' },
      { english: 'equation', japanese: '方程式', syllables: 'e-qua-tion' },
      { english: 'calculate', japanese: '計算する', syllables: 'cal-cu-late' },
    ],
  },
  calendar: {
    '4-6': [
      // 既存5個に追加
      { english: 'today', japanese: 'きょう', syllables: 'to-day' },
      { english: 'tomorrow', japanese: 'あした', syllables: 'to-mor-row' },
      { english: 'yesterday', japanese: 'きのう', syllables: 'yes-ter-day' },
      { english: 'morning', japanese: 'あさ', syllables: 'morn-ing' },
      { english: 'night', japanese: 'よる', syllables: 'night' },
    ],
    '7-9': [
      // 既存5個に追加
      { english: 'January', japanese: 'いちがつ', syllables: 'Jan-u-ar-y' },
      { english: 'February', japanese: 'にがつ', syllables: 'Feb-ru-ar-y' },
      { english: 'March', japanese: 'さんがつ', syllables: 'March' },
      { english: 'April', japanese: 'しがつ', syllables: 'A-pril' },
      { english: 'May', japanese: 'ごがつ', syllables: 'May' },
    ],
    '10-12': [
      // 既存5個に追加
      { english: 'calendar', japanese: 'カレンダー', syllables: 'cal-en-dar' },
      { english: 'schedule', japanese: 'スケジュール', syllables: 'sched-ule' },
      { english: 'appointment', japanese: '約束', syllables: 'ap-point-ment' },
      { english: 'deadline', japanese: '締切', syllables: 'dead-line' },
      { english: 'holiday', japanese: '休日', syllables: 'hol-i-day' },
    ],
  },
  school_items: {
    '4-6': [
      // 既存5個に追加
      { english: 'crayon', japanese: 'クレヨン', syllables: 'cray-on' },
      { english: 'glue', japanese: 'のり', syllables: 'glue' },
      { english: 'paper', japanese: 'かみ', syllables: 'pa-per' },
      { english: 'chair', japanese: 'いす', syllables: 'chair' },
      { english: 'desk', japanese: 'つくえ', syllables: 'desk' },
    ],
    '7-9': [
      // 既存5個に追加
      { english: 'marker', japanese: 'マーカー', syllables: 'mark-er' },
      { english: 'folder', japanese: 'フォルダー', syllables: 'fold-er' },
      { english: 'binder', japanese: 'バインダー', syllables: 'bind-er' },
      { english: 'stapler', japanese: 'ホッチキス', syllables: 'sta-pler' },
      { english: 'clipboard', japanese: 'クリップボード', syllables: 'clip-board' },
    ],
    '10-12': [
      // 既存5個に追加
      { english: 'projector', japanese: 'プロジェクター', syllables: 'pro-jec-tor' },
      { english: 'whiteboard', japanese: 'ホワイトボード', syllables: 'white-board' },
      { english: 'laptop', japanese: 'ノートパソコン', syllables: 'lap-top' },
      { english: 'printer', japanese: 'プリンター', syllables: 'print-er' },
      { english: 'scanner', japanese: 'スキャナー', syllables: 'scan-ner' },
    ],
  },
  body_parts: {
    '4-6': [
      // 既存5個に追加
      { english: 'face', japanese: 'かお', syllables: 'face' },
      { english: 'mouth', japanese: 'くち', syllables: 'mouth' },
      { english: 'teeth', japanese: 'は', syllables: 'teeth' },
      { english: 'hair', japanese: 'かみ', syllables: 'hair' },
      { english: 'tummy', japanese: 'おなか', syllables: 'tum-my' },
    ],
    '7-9': [
      // 既存5個に追加
      { english: 'elbow', japanese: 'ひじ', syllables: 'el-bow' },
      { english: 'wrist', japanese: 'てくび', syllables: 'wrist' },
      { english: 'ankle', japanese: 'あしくび', syllables: 'an-kle' },
      { english: 'chest', japanese: 'むね', syllables: 'chest' },
      { english: 'thumb', japanese: 'おやゆび', syllables: 'thumb' },
    ],
    '10-12': [
      // 既存5個に追加
      { english: 'skeleton', japanese: '骨格', syllables: 'skel-e-ton' },
      { english: 'muscle', japanese: '筋肉', syllables: 'mus-cle' },
      { english: 'organ', japanese: '臓器', syllables: 'or-gan' },
      { english: 'tissue', japanese: '組織', syllables: 'tis-sue' },
      { english: 'nerve', japanese: '神経', syllables: 'nerve' },
    ],
  },
  weather: {
    '4-6': [
      // 既存5個に追加
      { english: 'hot', japanese: 'あつい', syllables: 'hot' },
      { english: 'cold', japanese: 'さむい', syllables: 'cold' },
      { english: 'warm', japanese: 'あたたかい', syllables: 'warm' },
      { english: 'cool', japanese: 'すずしい', syllables: 'cool' },
      { english: 'wet', japanese: 'ぬれた', syllables: 'wet' },
    ],
    '7-9': [
      // 既存5個に追加
      { english: 'storm', japanese: 'あらし', syllables: 'storm' },
      { english: 'thunder', japanese: 'かみなり', syllables: 'thun-der' },
      { english: 'lightning', japanese: 'いなずま', syllables: 'light-ning' },
      { english: 'rainbow', japanese: 'にじ', syllables: 'rain-bow' },
      { english: 'fog', japanese: 'きり', syllables: 'fog' },
    ],
    '10-12': [
      // 既存5個に追加
      { english: 'climate', japanese: '気候', syllables: 'cli-mate' },
      { english: 'atmosphere', japanese: '大気', syllables: 'at-mos-phere' },
      { english: 'humidity', japanese: '湿度', syllables: 'hu-mid-i-ty' },
      { english: 'pressure', japanese: '気圧', syllables: 'pres-sure' },
      { english: 'forecast', japanese: '予報', syllables: 'fore-cast' },
    ],
  },
};

// 新規カテゴリーの追加（インターナショナルスクール向け）
const NEW_WORD_CATEGORIES = {
  // 学校施設
  school_facilities: {
    '4-6': [
      { english: 'library', japanese: 'としょかん', syllables: 'li-brar-y' },
      { english: 'cafeteria', japanese: 'しょくどう', syllables: 'caf-e-te-ri-a' },
      { english: 'playground', japanese: 'こうてい', syllables: 'play-ground' },
      { english: 'bathroom', japanese: 'トイレ', syllables: 'bath-room' },
      { english: 'office', japanese: 'じむしつ', syllables: 'of-fice' },
      { english: 'hallway', japanese: 'ろうか', syllables: 'hall-way' },
      { english: 'stairs', japanese: 'かいだん', syllables: 'stairs' },
      { english: 'elevator', japanese: 'エレベーター', syllables: 'el-e-va-tor' },
      { english: 'entrance', japanese: 'いりぐち', syllables: 'en-trance' },
      { english: 'exit', japanese: 'でぐち', syllables: 'ex-it' },
    ],
    '7-9': [
      { english: 'gymnasium', japanese: 'たいいくかん', syllables: 'gym-na-si-um' },
      { english: 'auditorium', japanese: 'こうどう', syllables: 'au-di-to-ri-um' },
      { english: 'computer lab', japanese: 'コンピューターしつ', syllables: 'com-pu-ter lab' },
      { english: 'science lab', japanese: 'りかしつ', syllables: 'sci-ence lab' },
      { english: 'art room', japanese: 'びじゅつしつ', syllables: 'art room' },
      { english: 'music room', japanese: 'おんがくしつ', syllables: 'mu-sic room' },
      { english: "nurse's office", japanese: 'ほけんしつ', syllables: "nurse's of-fice" },
      { english: 'locker room', japanese: 'ロッカールーム', syllables: 'lock-er room' },
      {
        english: "counselor's office",
        japanese: 'そうだんしつ',
        syllables: "coun-sel-or's of-fice",
      },
      { english: 'reception', japanese: 'じゅつけ', syllables: 're-cep-tion' },
    ],
    '10-12': [
      { english: 'laboratory', japanese: '実験室', syllables: 'lab-o-ra-to-ry' },
      { english: 'conference room', japanese: '会議室', syllables: 'con-fer-ence room' },
      { english: 'faculty room', japanese: '職員室', syllables: 'fac-ul-ty room' },
      {
        english: 'multimedia room',
        japanese: 'マルチメディア室',
        syllables: 'mul-ti-me-di-a room',
      },
      { english: 'theater', japanese: '劇場', syllables: 'the-a-ter' },
      { english: 'observatory', japanese: '天文台', syllables: 'ob-serv-a-to-ry' },
      { english: 'archive', japanese: '資料室', syllables: 'ar-chive' },
      { english: 'workshop', japanese: '作業場', syllables: 'work-shop' },
      { english: 'studio', japanese: 'スタジオ', syllables: 'stu-di-o' },
      { english: 'amphitheater', japanese: '円形劇場', syllables: 'am-phi-the-a-ter' },
    ],
  },
  // 授業活動
  classroom_activities: {
    '4-6': [
      { english: 'listen', japanese: 'きく', syllables: 'lis-ten' },
      { english: 'speak', japanese: 'はなす', syllables: 'speak' },
      { english: 'raise hand', japanese: 'てをあげる', syllables: 'raise hand' },
      { english: 'sit down', japanese: 'すわる', syllables: 'sit down' },
      { english: 'stand up', japanese: 'たつ', syllables: 'stand up' },
      { english: 'line up', japanese: 'ならぶ', syllables: 'line up' },
      { english: 'share', japanese: 'わける', syllables: 'share' },
      { english: 'help', japanese: 'たすける', syllables: 'help' },
      { english: 'wait', japanese: 'まつ', syllables: 'wait' },
      { english: 'try', japanese: 'やってみる', syllables: 'try' },
    ],
    '7-9': [
      { english: 'presentation', japanese: 'はっぴょう', syllables: 'pres-en-ta-tion' },
      { english: 'discussion', japanese: 'はなしあい', syllables: 'dis-cus-sion' },
      { english: 'group work', japanese: 'グループワーク', syllables: 'group work' },
      { english: 'experiment', japanese: 'じっけん', syllables: 'ex-per-i-ment' },
      { english: 'research', japanese: 'ちょうさ', syllables: 're-search' },
      { english: 'project', japanese: 'プロジェクト', syllables: 'proj-ect' },
      { english: 'homework', japanese: 'しゅくだい', syllables: 'home-work' },
      { english: 'review', japanese: 'ふくしゅう', syllables: 're-view' },
      { english: 'practice', japanese: 'れんしゅう', syllables: 'prac-tice' },
      { english: 'report', japanese: 'レポート', syllables: 're-port' },
    ],
    '10-12': [
      { english: 'analyze', japanese: '分析する', syllables: 'an-a-lyze' },
      { english: 'evaluate', japanese: '評価する', syllables: 'e-val-u-ate' },
      { english: 'collaborate', japanese: '協力する', syllables: 'col-lab-o-rate' },
      { english: 'synthesize', japanese: '統合する', syllables: 'syn-the-size' },
      { english: 'hypothesis', japanese: '仮説', syllables: 'hy-poth-e-sis' },
      { english: 'conclusion', japanese: '結論', syllables: 'con-clu-sion' },
      { english: 'methodology', japanese: '方法論', syllables: 'meth-od-ol-o-gy' },
      { english: 'bibliography', japanese: '参考文献', syllables: 'bib-li-og-ra-phy' },
      { english: 'peer review', japanese: '相互評価', syllables: 'peer re-view' },
      { english: 'thesis', japanese: '論文', syllables: 'the-sis' },
    ],
  },
  // 国籍
  nationalities: {
    '4-6': [
      { english: 'Japanese', japanese: 'にほんじん', syllables: 'Jap-a-nese' },
      { english: 'American', japanese: 'アメリカじん', syllables: 'A-mer-i-can' },
      { english: 'Chinese', japanese: 'ちゅうごくじん', syllables: 'Chi-nese' },
      { english: 'Korean', japanese: 'かんこくじん', syllables: 'Ko-re-an' },
      { english: 'English', japanese: 'イギリスじん', syllables: 'Eng-lish' },
      { english: 'Canadian', japanese: 'カナダじん', syllables: 'Ca-na-di-an' },
      { english: 'Australian', japanese: 'オーストラリアじん', syllables: 'Aus-tra-li-an' },
      { english: 'Indian', japanese: 'インドじん', syllables: 'In-di-an' },
      { english: 'French', japanese: 'フランスじん', syllables: 'French' },
      { english: 'German', japanese: 'ドイツじん', syllables: 'Ger-man' },
    ],
    '7-9': [
      { english: 'Brazilian', japanese: 'ブラジルじん', syllables: 'Bra-zil-ian' },
      { english: 'Mexican', japanese: 'メキシコじん', syllables: 'Mex-i-can' },
      { english: 'Italian', japanese: 'イタリアじん', syllables: 'I-tal-ian' },
      { english: 'Spanish', japanese: 'スペインじん', syllables: 'Span-ish' },
      { english: 'Russian', japanese: 'ロシアじん', syllables: 'Rus-sian' },
      { english: 'Thai', japanese: 'タイじん', syllables: 'Thai' },
      { english: 'Vietnamese', japanese: 'ベトナムじん', syllables: 'Vi-et-nam-ese' },
      { english: 'Filipino', japanese: 'フィリピンじん', syllables: 'Fil-i-pi-no' },
      { english: 'Indonesian', japanese: 'インドネシアじん', syllables: 'In-do-ne-sian' },
      { english: 'Malaysian', japanese: 'マレーシアじん', syllables: 'Ma-lay-sian' },
    ],
    '10-12': [
      { english: 'European', japanese: 'ヨーロッパ人', syllables: 'Eu-ro-pe-an' },
      { english: 'Asian', japanese: 'アジア人', syllables: 'A-sian' },
      { english: 'African', japanese: 'アフリカ人', syllables: 'Af-ri-can' },
      { english: 'multicultural', japanese: '多文化の', syllables: 'mul-ti-cul-tur-al' },
      { english: 'international', japanese: '国際的な', syllables: 'in-ter-na-tion-al' },
      { english: 'global citizen', japanese: '地球市民', syllables: 'glob-al cit-i-zen' },
      { english: 'expatriate', japanese: '駐在員', syllables: 'ex-pa-tri-ate' },
      { english: 'immigrant', japanese: '移民', syllables: 'im-mi-grant' },
      { english: 'bilingual', japanese: 'バイリンガル', syllables: 'bi-lin-gual' },
      { english: 'multilingual', japanese: '多言語話者', syllables: 'mul-ti-lin-gual' },
    ],
  },
  // 国際料理
  international_foods: {
    '4-6': [
      { english: 'pizza', japanese: 'ピザ', syllables: 'piz-za' },
      { english: 'sushi', japanese: 'すし', syllables: 'su-shi' },
      { english: 'taco', japanese: 'タコス', syllables: 'ta-co' },
      { english: 'curry', japanese: 'カレー', syllables: 'cur-ry' },
      { english: 'dumpling', japanese: 'ギョーザ', syllables: 'dump-ling' },
      { english: 'noodle soup', japanese: 'ラーメン', syllables: 'noo-dle soup' },
      { english: 'fried rice', japanese: 'チャーハン', syllables: 'fried rice' },
      { english: 'pasta', japanese: 'パスタ', syllables: 'pas-ta' },
      { english: 'sandwich', japanese: 'サンドイッチ', syllables: 'sand-wich' },
      { english: 'salad', japanese: 'サラダ', syllables: 'sal-ad' },
    ],
    '7-9': [
      { english: 'dim sum', japanese: 'テンシン', syllables: 'dim sum' },
      { english: 'kebab', japanese: 'ケバブ', syllables: 'ke-bab' },
      { english: 'paella', japanese: 'パエリア', syllables: 'pa-el-la' },
      { english: 'pho', japanese: 'フォー', syllables: 'pho' },
      { english: 'bibimbap', japanese: 'ビビンバ', syllables: 'bi-bim-bap' },
      { english: 'falafel', japanese: 'ファラフェル', syllables: 'fa-la-fel' },
      { english: 'baguette', japanese: 'バゲット', syllables: 'ba-guette' },
      { english: 'croissant', japanese: 'クロワッサン', syllables: 'crois-sant' },
      { english: 'burrito', japanese: 'ブリート', syllables: 'bur-ri-to' },
      { english: 'lasagna', japanese: 'ラザニア', syllables: 'la-sa-gna' },
    ],
    '10-12': [
      { english: 'cuisine', japanese: '料理', syllables: 'cui-sine' },
      { english: 'gourmet', japanese: 'グルメ', syllables: 'gour-met' },
      { english: 'delicacy', japanese: '珍味', syllables: 'del-i-ca-cy' },
      { english: 'appetizer', japanese: '前菜', syllables: 'ap-pe-tiz-er' },
      { english: 'entree', japanese: '主菜', syllables: 'en-tree' },
      { english: 'dessert', japanese: 'デザート', syllables: 'des-sert' },
      { english: 'seasoning', japanese: '調味料', syllables: 'sea-son-ing' },
      { english: 'authentic', japanese: '本格的な', syllables: 'au-then-tic' },
      { english: 'fusion', japanese: 'フュージョン', syllables: 'fu-sion' },
      { english: 'culinary', japanese: '料理の', syllables: 'cu-li-nar-y' },
    ],
  },
  // 時間表現
  time_expressions: {
    '4-6': [
      { english: 'now', japanese: 'いま', syllables: 'now' },
      { english: 'later', japanese: 'あとで', syllables: 'la-ter' },
      { english: 'soon', japanese: 'すぐに', syllables: 'soon' },
      { english: 'early', japanese: 'はやい', syllables: 'ear-ly' },
      { english: 'late', japanese: 'おそい', syllables: 'late' },
      { english: 'before', japanese: 'まえに', syllables: 'be-fore' },
      { english: 'after', japanese: 'あとに', syllables: 'af-ter' },
      { english: 'always', japanese: 'いつも', syllables: 'al-ways' },
      { english: 'never', japanese: 'ぜったいない', syllables: 'nev-er' },
      { english: 'sometimes', japanese: 'ときどき', syllables: 'some-times' },
    ],
    '7-9': [
      { english: 'usually', japanese: 'たいてい', syllables: 'u-su-al-ly' },
      { english: 'often', japanese: 'よく', syllables: 'of-ten' },
      { english: 'rarely', japanese: 'めったに', syllables: 'rare-ly' },
      { english: 'recently', japanese: 'さいきん', syllables: 're-cent-ly' },
      { english: 'already', japanese: 'もう', syllables: 'al-read-y' },
      { english: 'still', japanese: 'まだ', syllables: 'still' },
      { english: 'yet', japanese: 'まだ', syllables: 'yet' },
      { english: 'eventually', japanese: 'けっきょく', syllables: 'e-ven-tu-al-ly' },
      { english: 'meanwhile', japanese: 'そのあいだ', syllables: 'mean-while' },
      { english: 'immediately', japanese: 'すぐに', syllables: 'im-me-di-ate-ly' },
    ],
    '10-12': [
      { english: 'frequently', japanese: '頻繁に', syllables: 'fre-quent-ly' },
      { english: 'occasionally', japanese: '時折', syllables: 'oc-ca-sion-al-ly' },
      { english: 'continuously', japanese: '継続的に', syllables: 'con-tin-u-ous-ly' },
      { english: 'simultaneously', japanese: '同時に', syllables: 'si-mul-ta-ne-ous-ly' },
      { english: 'temporarily', japanese: '一時的に', syllables: 'tem-po-rar-i-ly' },
      { english: 'permanently', japanese: '永続的に', syllables: 'per-ma-nent-ly' },
      { english: 'periodically', japanese: '定期的に', syllables: 'pe-ri-od-i-cal-ly' },
      { english: 'chronologically', japanese: '年代順に', syllables: 'chron-o-log-i-cal-ly' },
      { english: 'instantaneous', japanese: '瞬間的な', syllables: 'in-stan-ta-ne-ous' },
      { english: 'duration', japanese: '期間', syllables: 'du-ra-tion' },
    ],
  },
};

module.exports = { WORD_LISTS_EXPANSION, NEW_WORD_CATEGORIES };
