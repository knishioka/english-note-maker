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
            japanese: "わたしは りんごが すきです。"
        },
        {
            english: "The cat is cute.",
            japanese: "ねこは かわいいです。"
        },
        {
            english: "Good morning!",
            japanese: "おはよう！"
        },
        {
            english: "Thank you very much.",
            japanese: "ありがとう ございます。"
        },
        {
            english: "My name is Tom.",
            japanese: "わたしの なまえは トムです。"
        },
        {
            english: "I can jump high.",
            japanese: "わたしは たかく ジャンプできます。"
        },
        {
            english: "Let's play together.",
            japanese: "いっしょに あそびましょう。"
        },
        {
            english: "I love my mom.",
            japanese: "わたしは ママが だいすきです。"
        },
        {
            english: "The sun is bright.",
            japanese: "たいようは あかるいです。"
        },
        {
            english: "Happy birthday!",
            japanese: "おたんじょうび おめでとう！"
        }
    ],
    "7-9": [
        {
            english: "I go to school every day.",
            japanese: "わたしは 毎日 学校に 行きます。"
        },
        {
            english: "My favorite color is blue.",
            japanese: "わたしの 好きな 色は 青です。"
        },
        {
            english: "Can you help me, please?",
            japanese: "手伝って もらえますか？"
        },
        {
            english: "I have two brothers.",
            japanese: "わたしには 兄弟が 二人 います。"
        },
        {
            english: "Let's study English together.",
            japanese: "いっしょに 英語を 勉強しましょう。"
        },
        {
            english: "The weather is nice today.",
            japanese: "今日は いい 天気です。"
        },
        {
            english: "I want to be a teacher.",
            japanese: "わたしは 先生に なりたいです。"
        },
        {
            english: "My hobby is reading books.",
            japanese: "わたしの しゅみは 読書です。"
        },
        {
            english: "Summer vacation is fun.",
            japanese: "夏休みは 楽しいです。"
        },
        {
            english: "I can ride a bicycle.",
            japanese: "わたしは 自転車に 乗れます。"
        }
    ],
    "10-12": [
        {
            english: "Practice makes perfect.",
            japanese: "練習は完璧を作る。"
        },
        {
            english: "I enjoy playing basketball with my friends.",
            japanese: "友達とバスケットボールをするのが楽しいです。"
        },
        {
            english: "Science is my favorite subject.",
            japanese: "理科は私の好きな教科です。"
        },
        {
            english: "We should protect our environment.",
            japanese: "私たちは環境を守るべきです。"
        },
        {
            english: "Reading helps improve vocabulary.",
            japanese: "読書は語彙力の向上に役立ちます。"
        },
        {
            english: "Time flies when you're having fun.",
            japanese: "楽しい時間はあっという間に過ぎる。"
        },
        {
            english: "I want to travel around the world.",
            japanese: "世界中を旅行したいです。"
        },
        {
            english: "Technology makes our lives easier.",
            japanese: "技術は私たちの生活を便利にします。"
        },
        {
            english: "Teamwork is important for success.",
            japanese: "チームワークは成功のために重要です。"
        },
        {
            english: "Never give up on your dreams.",
            japanese: "夢をあきらめてはいけません。"
        }
    ]
};

// 現在の例文を保持
let currentExamples = [];

// DOM要素
const elements = {
    showExamples: document.getElementById('showExamples'),
    showTranslation: document.getElementById('showTranslation'),
    practiceMode: document.getElementById('practiceMode'),
    ageGroup: document.getElementById('ageGroup'),
    printBtn: document.getElementById('printBtn'),
    notePreview: document.getElementById('notePreview'),
    refreshExamplesBtn: document.getElementById('refreshExamplesBtn')
};

// イベントリスナー
elements.showExamples.addEventListener('change', () => {
    updateTranslationVisibility();
    generateNote();
});
elements.showTranslation.addEventListener('change', toggleTranslation);
elements.practiceMode.addEventListener('change', () => {
    updateOptionsVisibility();
    resetExamples();
    generateNote();
});
elements.printBtn.addEventListener('click', printNote);
elements.refreshExamplesBtn.addEventListener('click', () => {
    resetExamples();
    generateNote();
});
elements.ageGroup.addEventListener('change', () => {
    resetExamples();
    generateNote();
});

// 初期化
updateOptionsVisibility();
generateNote(); // 初回自動生成

// 日本語訳表示の可視性を更新
function updateTranslationVisibility() {
    elements.showTranslation.disabled = !elements.showExamples.checked;
    if (!elements.showExamples.checked) {
        elements.showTranslation.checked = false;
    }
}

// 練習モードに応じてオプションの表示/非表示を切り替え
function updateOptionsVisibility() {
    const practiceMode = elements.practiceMode.value;
    const exampleOptions = document.getElementById('exampleOptions');
    const translationOptions = document.getElementById('translationOptions');
    const ageOptions = document.getElementById('ageOptions');
    
    if (practiceMode === 'sentence') {
        // 文章練習モードの場合は表示
        ageOptions.style.display = 'block';
        exampleOptions.style.display = 'block';
        translationOptions.style.display = 'block';
        // 文章練習では例文を自動的にチェック
        elements.showExamples.checked = true;
        // 例文更新ボタンも表示
        if (elements.refreshExamplesBtn) {
            elements.refreshExamplesBtn.style.display = 'block';
        }
    } else {
        // その他のモードでは非表示
        ageOptions.style.display = 'none';
        exampleOptions.style.display = 'none';
        translationOptions.style.display = 'none';
        // 他のモードでは例文を非表示に
        elements.showExamples.checked = false;
        elements.showTranslation.checked = false;
    }
    
    updateTranslationVisibility();
}

// 例文をリセット
function resetExamples() {
    currentExamples = [];
}

// 日本語訳の表示/非表示を切り替え（例文は変更しない）
function toggleTranslation() {
    const japaneseElements = document.querySelectorAll('.example-japanese');
    const showTranslation = elements.showTranslation.checked;
    
    japaneseElements.forEach(element => {
        element.style.display = showTranslation ? 'block' : 'none';
    });
}

// ノート生成メイン関数
function generateNote() {
    // 練習モードごとに固定の行数を設定
    const lineCountByMode = {
        normal: 16,
        sentence: 15
    };
    
    const options = {
        lineCount: lineCountByMode[elements.practiceMode.value] || 16,
        showExamples: elements.showExamples.checked,
        showTranslation: elements.showTranslation.checked,
        practiceMode: elements.practiceMode.value
    };

    const noteHTML = generateNoteHTML(options);
    elements.notePreview.innerHTML = noteHTML;
}

// ノートHTML生成
function generateNoteHTML(options) {
    let html = '';
    
    // ページヘッダーを削除し、直接コンテンツ生成
    // 練習モード別にコンテンツ生成
    switch (options.practiceMode) {
        case 'sentence':
            html += generateSentencePractice(options);
            break;
        default:
            html += generateNormalPractice(options);
            break;
    }
    
    return `<div class="note-page">${html}</div>`;
}

// ページヘッダー生成
function generatePageHeader(options) {
    const date = new Date().toLocaleDateString('ja-JP');
    const modeText = {
        normal: '通常練習',
        sentence: '文章練習'
    };
    
    return `
        <div class="note-page__header">
            <div class="note-page__title">English Writing Practice</div>
            <div class="note-page__subtitle">${modeText[options.practiceMode]} - ${date}</div>
        </div>
    `;
}

// 通常練習モード
function generateNormalPractice(options) {
    let html = '';
    // 行の高さを増やしたため行数を調整
    const maxLines = options.showExamples ? 15 : 17;
    const actualLineCount = Math.min(options.lineCount, maxLines);
    
    // 例文が必要な場合、既存の例文を使用するか新規生成
    if (options.showExamples) {
        const neededExamples = Math.floor(actualLineCount / 4);
        if (currentExamples.length !== neededExamples) {
            currentExamples = getRandomExamples(neededExamples);
        }
    }
    const examples = options.showExamples ? currentExamples : [];
    
    for (let i = 0; i < actualLineCount; i++) {
        // 例文を適切な間隔で配置
        const exampleIndex = Math.floor(i / 4);
        const shouldShowExample = examples[exampleIndex] && i % 4 === 0;
        
        if (shouldShowExample) {
            html += generateExampleSentence(examples[exampleIndex], options.showTranslation);
        }
        
        html += generateBaselineGroup();
        
        // 各行の後に区切りを入れる（最後の行以外）
        if (i !== actualLineCount - 1) {
            html += '<div class="line-separator-small"></div>';
        }
    }
    
    return html;
}


// 文章練習モード
function generateSentencePractice(options) {
    let html = '';
    
    // 日本語訳表示時は行数を調整
    const maxExamples = options.showTranslation ? 5 : 6;
    const neededExamples = Math.min(Math.floor(options.lineCount / 3), maxExamples);
    
    if (currentExamples.length !== neededExamples) {
        currentExamples = getRandomExamples(neededExamples);
    }
    const examples = currentExamples;
    
    for (let i = 0; i < examples.length; i++) {
        html += generateSentencePracticeGroup(examples[i], options.showTranslation);
    }
    
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


// 文章練習グループ生成
function generateSentencePracticeGroup(sentence, showTranslation) {
    return `
        <div class="sentence-practice-group">
            ${generateExampleSentence(sentence, showTranslation)}
            <div class="practice-lines">
                ${generateBaselineGroup()}
                <div class="line-separator"></div>
                ${generateBaselineGroup()}
            </div>
        </div>
    `;
}

// 例文表示生成
function generateExampleSentence(sentence, showTranslation) {
    return `
        <div class="example-sentence">
            <div class="example-english">${sentence.english}</div>
            <div class="example-japanese" style="${showTranslation ? '' : 'display: none;'}">${sentence.japanese}</div>
        </div>
    `;
}

// ランダムな例文を取得
function getRandomExamples(count) {
    const ageGroup = elements.ageGroup.value;
    const sentences = EXAMPLE_SENTENCES_BY_AGE[ageGroup] || EXAMPLE_SENTENCES_BY_AGE["7-9"];
    const shuffled = [...sentences].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// 印刷機能
function printNote() {
    // 印刷用のスタイルを追加
    const printStyles = `
        <style id="print-styles">
            @media print {
                body * {
                    visibility: hidden;
                }
                
                .note-preview,
                .note-preview * {
                    visibility: visible !important;
                }
                
                .note-preview {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100% !important;
                    height: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
            }
        </style>
    `;
    
    // 一時的にスタイルを追加
    document.head.insertAdjacentHTML('beforeend', printStyles);
    
    // 元のタイトルを保存
    const originalTitle = document.title;
    document.title = 'English Writing Practice - ' + new Date().toLocaleDateString('ja-JP');
    
    // 印刷ダイアログを開く
    window.print();
    
    // 印刷後のクリーンアップ
    window.addEventListener('afterprint', function cleanup() {
        const printStylesEl = document.getElementById('print-styles');
        if (printStylesEl) {
            printStylesEl.remove();
        }
        document.title = originalTitle;
        window.removeEventListener('afterprint', cleanup);
    });
}

// デバッグ機能（開発時のみ）
function toggleDebugMode() {
    document.body.classList.toggle('debug-mode');
}

// 開発時のキーボードショートカット
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        toggleDebugMode();
        console.log('Debug mode toggled');
    }
});

// 初期ロード時の処理
document.addEventListener('DOMContentLoaded', () => {
    console.log('英語罫線ノート作成ツール - 初期化完了');
    
    // 開発時のヒント表示
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('💡 開発時のヒント:');
        console.log('- Ctrl+Shift+D でデバッグモードを切り替え');
        console.log('- 印刷プレビューで実際のレイアウトを確認');
    }
});