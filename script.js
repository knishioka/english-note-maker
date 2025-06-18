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
    const previewBtn = document.getElementById('previewBtn');

    // Phase 1: カスタマイズ機能のイベントリスナー
    const lineHeightSelect = document.getElementById('lineHeight');
    const lineColorSelect = document.getElementById('lineColor');
    const showHeaderCheckbox = document.getElementById('showHeader');
    const pageCountInput = document.getElementById('pageCount');
    
    // Phase 2: 追加機能のイベントリスナー
    const exampleCategorySelect = document.getElementById('exampleCategory');
    const wordCategorySelect = document.getElementById('wordCategory');
    const addCustomExampleBtn = document.getElementById('addCustomExampleBtn');

    // 更新イベントリスナー
    practiceMode.addEventListener('change', updatePreview);
    showExamplesCheckbox.addEventListener('change', updatePreview);
    showTranslationCheckbox.addEventListener('change', updatePreview);
    refreshExamplesBtn.addEventListener('click', () => {
        shuffleCurrentExamples();
        updatePreview();
    });
    ageGroupSelect.addEventListener('change', () => {
        currentExampleIndices = {};
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
    
    // ボタンイベント
    printBtn.addEventListener('click', printNote);
    previewBtn.addEventListener('click', showPreviewDialog);
    
    // 練習モード変更時の処理
    practiceMode.addEventListener('change', updateOptionsVisibility);
}

// オプションの表示/非表示を更新
function updateOptionsVisibility() {
    const practiceMode = document.getElementById('practiceMode').value;
    const exampleOptions = document.getElementById('exampleOptions');
    const translationOptions = document.getElementById('translationOptions');
    const ageOptions = document.getElementById('ageOptions');
    const wordOptions = document.getElementById('wordOptions');
    const customExampleOptions = document.getElementById('customExampleOptions');
    
    if (practiceMode === 'sentence') {
        ageOptions.style.display = 'block';
        exampleOptions.style.display = 'block';
        translationOptions.style.display = 'block';
        wordOptions.style.display = 'none';
        customExampleOptions.style.display = 'block';
        document.getElementById('showExamples').checked = true;
    } else if (practiceMode === 'word') {
        ageOptions.style.display = 'block';
        exampleOptions.style.display = 'none';
        translationOptions.style.display = 'none';
        wordOptions.style.display = 'block';
        customExampleOptions.style.display = 'none';
        document.getElementById('showExamples').checked = false;
        document.getElementById('showTranslation').checked = false;
    } else {
        ageOptions.style.display = 'none';
        exampleOptions.style.display = 'none';
        translationOptions.style.display = 'none';
        wordOptions.style.display = 'none';
        customExampleOptions.style.display = 'none';
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
            html += '<div style="page-break-before: always;"></div>';
        }
        html += generateNotePage(page + 1, pageCount);
    }
    
    notePreview.innerHTML = html;
}

// ノートページ生成
function generateNotePage(pageNumber, totalPages) {
    const practiceMode = document.getElementById('practiceMode').value;
    const lineHeight = document.getElementById('lineHeight').value;
    const lineColor = document.getElementById('lineColor').value;
    const showHeader = document.getElementById('showHeader').checked;
    const showExamples = document.getElementById('showExamples').checked;
    const showTranslation = document.getElementById('showTranslation').checked;
    const ageGroup = document.getElementById('ageGroup').value;
    
    // CSS変数を設定
    const styleVars = `style="--line-height-mm: ${lineHeight}mm;"`;
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
    } else {
        html += generateNormalPractice(showExamples, showTranslation, ageGroup);
    }
    
    // ページ番号
    if (totalPages > 1) {
        html += `<div style="position: absolute; bottom: 5mm; right: 10mm; font-size: 10pt; color: #999;">
            ${pageNumber} / ${totalPages}
        </div>`;
    }
    
    html += '</div>';
    
    return html;
}

// 通常練習モード生成
function generateNormalPractice(showExamples, showTranslation, ageGroup) {
    let html = '';
    const maxLines = showExamples ? 15 : 17;
    
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
    const maxExamples = showTranslation ? 5 : 6;
    
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
        numbers: '数字'
    };
    
    html += `<h3 style="text-align: center; margin-bottom: 10mm;">Word Practice - ${categoryNames[category] || category}</h3>`;
    
    for (let word of words) {
        html += `
            <div class="word-practice-item" style="margin-bottom: 15mm;">
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
    window.print();
}

// プレビューダイアログ表示
function showPreviewDialog() {
    // 品質検証を実行
    if (window.LayoutValidator) {
        const validator = new window.LayoutValidator();
        const report = validator.generateReport();
        
        if (report.errors.length > 0) {
            if (!confirm('レイアウトにエラーがあります。続行しますか？')) {
                return;
            }
        }
    }
    
    alert('プレビューが正常に表示されています。印刷ボタンを押してPDFを生成してください。');
}

// 初期化実行
document.addEventListener('DOMContentLoaded', init);

// デバッグ機能
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        document.body.classList.toggle('debug-mode');
        console.log('Debug mode toggled');
    }
});

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