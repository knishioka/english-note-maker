import { generateClozeText } from './cloze.js';
import {
  dueRecords,
  normalizeAnswer,
  readProgress,
  recordAttempt,
  saveProgress,
} from './progress.js';

const $ = (id) => document.getElementById(id);

function node(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

export function createLessonItem(phrase, settings) {
  return {
    ...phrase,
    ...settings,
    exercise: generateClozeText(phrase.english, settings.blankType, settings.difficulty),
  };
}

export function initLearningStudio({ getPhrasePool, categoryNames, onWorksheetOpen }) {
  let storage;
  try {
    storage = window.localStorage;
  } catch {
    /* Practice also works without storage. */
  }
  const saved = readProgress(storage);
  let records = saved.records;
  let session = null;
  let index = 0;
  let outcomes = [];
  let checked = false;
  let hinted = false;
  let available = saved.available;

  for (const [value, label] of Object.entries(categoryNames)) {
    const option = node('option', '', label);
    option.value = value;
    $('learnCategory').append(option);
  }
  $('learnCategory').value = 'greetings';

  function updateStats() {
    $('reviewCount').textContent = dueRecords(records).length;
    $('learnedCount').textContent = records.filter((item) => item.streak > 0).length;
    $('attemptCount').textContent = records.reduce((sum, item) => sum + item.attempts, 0);
    $('storageNotice').textContent = available
      ? '記録はこのブラウザに自動保存されます。端末間の同期はありません。'
      : '記録を保存・読み込みできません。この画面を開いている間は練習を続けられます。';
  }

  function setView(view) {
    const selected = ['learn', 'review', 'worksheet'].includes(view) ? view : 'learn';
    const previousView = document.body.dataset.view;
    document.body.dataset.view = selected;
    for (const name of ['learn', 'review', 'worksheet']) {
      $(name + 'Panel').hidden = name !== selected;
      document
        .querySelector('[data-view-link="' + name + '"]')
        .setAttribute('aria-current', name === selected ? 'page' : 'false');
    }
    const url = new URL(window.location.href);
    url.searchParams.set('view', selected);
    window.history.replaceState(null, '', url);
    if (selected === 'review') renderReview();
    if (selected === 'worksheet') {
      if (previousView && previousView !== 'worksheet') onWorksheetOpen();
      window.dispatchEvent(new Event('resize'));
    }
  }

  document.querySelectorAll('[data-view-link]').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.viewLink));
  });
  window.addEventListener('popstate', () => {
    setView(new URL(window.location.href).searchParams.get('view'));
  });

  function start(items) {
    session = items.filter((item) => item.exercise.answers.length);
    index = 0;
    outcomes = [];
    if (!session.length) {
      $('learnMessage').textContent = 'この条件の問題がありません。テーマを変えてみましょう。';
      setView('learn');
      return;
    }
    $('learnMessage').textContent = '';
    $('lessonSetup').hidden = true;
    $('lessonSession').hidden = false;
    $('lessonResult').hidden = true;
    setView('learn');
    renderQuestion();
  }

  $('lessonSetup').addEventListener('submit', (event) => {
    event.preventDefault();
    const settings = {
      category: $('learnCategory').value,
      age: $('learnAge').value,
      difficulty: $('learnDifficulty').value,
      blankType: $('learnBlankType').value,
    };
    const pool = [...getPhrasePool(settings.category, settings.age)];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    start(pool.slice(0, 5).map((phrase) => createLessonItem(phrase, settings)));
  });

  function renderQuestion() {
    checked = false;
    hinted = false;
    const item = session[index];
    $('questionProgress').textContent = 'QUESTION ' + (index + 1) + ' / ' + session.length;
    $('lessonProgress').max = session.length;
    $('lessonProgress').value = index;
    $('questionJapanese').textContent = item.japanese;
    $('questionSituation').textContent = item.situation || categoryNames[item.category];
    $('questionInstruction').textContent =
      item.blankType === 'char'
        ? '空欄に入る文字だけを入力しよう。'
        : '空欄に入る単語を入力しよう。';
    // The shared generator escapes content before producing worksheet markup.
    $('questionEnglish').innerHTML = item.exercise.display;
    $('questionEnglish')
      .querySelectorAll('.cloze-blank')
      .forEach((blank, i) => {
        const input = node('input', 'answer-input');
        input.type = 'text';
        input.autocomplete = 'off';
        input.spellcheck = false;
        input.required = true;
        input.setAttribute('autocapitalize', 'none');
        input.setAttribute(
          'aria-label',
          '空欄 ' + (i + 1) + '（' + item.exercise.answers[i].length + '文字）'
        );
        input.setAttribute('aria-describedby', 'answerFeedback');
        input.style.width = Math.min(15, Math.max(5, item.exercise.answers[i].length + 2)) + 'ch';
        blank.replaceWith(input);
      });
    $('answerFeedback').replaceChildren();
    $('checkAnswer').hidden = false;
    $('nextQuestion').hidden = true;
    $('hintButton').disabled = false;
    $('hintText').textContent = '';
    $('questionEnglish').querySelector('input')?.focus();
  }

  $('hintButton').addEventListener('click', () => {
    hinted = true;
    $('hintText').textContent = session[index].exercise.answers
      .map(
        (answer, i) => '空欄' + (i + 1) + '：' + answer[0] + ' から始まる ' + answer.length + '文字'
      )
      .join(' ／ ');
    $('hintButton').disabled = true;
  });

  $('answerForm').addEventListener('submit', (event) => {
    event.preventDefault();
    if (checked) return;
    const item = session[index];
    const inputs = [...$('questionEnglish').querySelectorAll('input')];
    if (inputs.some((input) => !input.value.trim())) {
      $('answerFeedback').textContent = '空欄に答えを入力してね。';
      return;
    }
    const correct = inputs.every(
      (input, i) => normalizeAnswer(input.value) === normalizeAnswer(item.exercise.answers[i])
    );
    inputs.forEach((input, i) => {
      input.readOnly = true;
      input.setAttribute(
        'aria-invalid',
        String(normalizeAnswer(input.value) !== normalizeAnswer(item.exercise.answers[i]))
      );
    });
    checked = true;
    outcomes.push({ item, correct, needsReview: !correct || hinted });
    records = recordAttempt(records, item, correct && !hinted);
    available = saveProgress(storage, records);
    updateStats();
    const feedback = $('answerFeedback');
    feedback.className = 'answer-feedback ' + (correct ? 'is-correct' : 'needs-review');
    feedback.replaceChildren(
      node('strong', '', correct ? '正解！よくできました。' : 'お手本を見て、もう一度覚えよう。'),
      node('p', 'answer-key', '答え：' + item.exercise.answers.join(' / ')),
      node('p', 'complete-sentence', item.english),
      node(
        'p',
        'feedback-note',
        hinted
          ? 'ヒントを使った問題は、復習でもう一度挑戦できます。'
          : '文全体を声に出して読んでみよう。'
      )
    );
    $('checkAnswer').hidden = true;
    $('hintButton').disabled = true;
    $('nextQuestion').hidden = false;
    $('nextQuestion').textContent = index + 1 === session.length ? '結果を見る →' : '次の問題へ →';
    $('nextQuestion').focus();
  });

  $('nextQuestion').addEventListener('click', () => {
    if (!checked) return;
    index++;
    if (index < session.length) return renderQuestion();
    $('lessonSession').hidden = true;
    $('lessonResult').hidden = false;
    const correct = outcomes.filter((result) => result.correct).length;
    $('resultScore').textContent = correct + ' / ' + session.length;
    $('resultMessage').textContent = 'おつかれさま！できた問題は日をあけて、迷った問題はもう一度。';
    const list = $('resultList');
    list.replaceChildren();
    outcomes.forEach(({ item, needsReview }) => {
      const row = node('li', 'result-row');
      row.append(
        node('span', 'result-status', needsReview ? 'もう一度' : 'できた'),
        node('span', '', item.english)
      );
      list.append(row);
    });
    $('retryMistakes').hidden = !outcomes.some((result) => result.needsReview);
    $('resultHeading').focus();
  });

  $('retryMistakes').addEventListener('click', () => {
    start(outcomes.filter((result) => result.needsReview).map((result) => result.item));
  });
  function returnToSetup() {
    $('lessonSetup').hidden = false;
    $('lessonSession').hidden = true;
    $('lessonResult').hidden = true;
    $('startLesson').focus();
  }
  $('newLesson').addEventListener('click', returnToSetup);
  $('endLesson').addEventListener('click', returnToSetup);

  function reviewItems() {
    return dueRecords(records).flatMap((record) => {
      const phrase = getPhrasePool(record.category, record.age).find(
        (p) => p.english === record.english
      );
      return phrase ? [createLessonItem(phrase, record)] : [];
    });
  }
  function renderReview() {
    const due = dueRecords(records);
    $('reviewHeading').textContent = due.length
      ? 'もう一度が、力になる。'
      : '今日の復習は、ひと休み。';
    $('reviewSummary').textContent = due.length
      ? due.length + '問の復習があります。最大5問ずつ、自分のペースで進めよう。'
      : '練習すると、ここに復習する問題が集まります。正解した問題も、1・3・7・14日後に振り返れます。';
    $('startReview').disabled = !reviewItems().length;
    const list = $('reviewList');
    list.replaceChildren();
    [...records]
      .sort((a, b) => a.dueAt - b.dueAt)
      .forEach((record) => {
        const phrase = getPhrasePool(record.category, record.age).find(
          (p) => p.english === record.english
        );
        const row = node('li', 'review-row');
        const text = node('div', '');
        text.append(
          node('strong', '', phrase?.japanese || categoryNames[record.category] || 'フレーズ'),
          node(
            'p',
            'muted',
            record.age + '歳 · ' + (record.blankType === 'char' ? '文字の穴埋め' : '単語の穴埋め')
          )
        );
        const nextDate = new Date(record.dueAt).toLocaleDateString('ja-JP', {
          month: 'short',
          day: 'numeric',
        });
        row.append(
          text,
          node('span', 'due-label', record.dueAt <= Date.now() ? '復習しよう' : nextDate + ' ごろ')
        );
        list.append(row);
      });
  }
  $('startReview').addEventListener('click', () => start(reviewItems().slice(0, 5)));
  $('reviewShortcut').addEventListener('click', () => setView('review'));
  $('printLesson').addEventListener('click', () => {
    const first = session[0];
    const values = {
      practiceMode: 'cloze',
      ageGroup: first.age,
      clozeCategory: first.category,
      clozeDifficulty: first.difficulty,
      clozeBlankType: first.blankType,
      pageCount: '1',
    };
    for (const [id, value] of Object.entries(values)) $(id).value = value;
    $('showClozeAnswers').checked = false;
    setView('worksheet');
    $('practiceMode').dispatchEvent(new Event('change'));
  });
  updateStats();
  $('startLesson').disabled = false;
  const params = new URL(window.location.href).searchParams;
  setView(params.get('view') || (params.has('practiceMode') ? 'worksheet' : 'learn'));
}
