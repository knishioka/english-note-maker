import {
  createLessonItem,
  fillAnswers,
  gradeAnswers,
  learningFocus,
  refreshItem,
  restoreItem,
  snapshotItem,
} from './exercises.js';
import {
  createSet,
  exportSet,
  importSet,
  MAX_IMPORT_BYTES,
  MAX_SETS,
  readLibrary,
  saveLibrary,
} from './lesson-library.js';
export { createLessonItem } from './exercises.js';
import {
  dueRecords,
  normalizeAnswer,
  readProgress,
  recordAttempt,
  saveProgress,
  migrateRecords,
} from './progress.js';

const $ = (id) => document.getElementById(id);

function node(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

export function initLearningStudio({
  getPhrasePool,
  categoryNames,
  onWorksheetOpen,
  onPrintLesson,
}) {
  let storage;
  try {
    storage = window.localStorage;
  } catch {
    /* Practice also works without storage. */
  }
  const saved = readProgress(storage);
  let records = migrateRecords(saved.records, getPhrasePool);
  if (saved.available && JSON.stringify(records) !== JSON.stringify(saved.records)) {
    saved.available = saveProgress(storage, records);
  }
  const library = readLibrary(storage);
  let sets = library.sets;
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
    $('reviewCount').textContent = reviewItems().length;
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
    $('saveLessonNotice').textContent = '';
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
        : '空欄に入る単語を入力しよう。文字数はお手本の目安です。';
    $('questionRevision').textContent = item.revised
      ? '教材を最新版に更新しました。学習の記録は引き継いでいます。'
      : '';
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
          '空欄 ' + (i + 1) + '（お手本は' + item.exercise.answers[i].length + '文字）'
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
    const answers = inputs.map((input) => input.value.trim());
    const correct = gradeAnswers(item, answers);
    inputs.forEach((input, i) => {
      input.readOnly = true;
      input.setAttribute(
        'aria-invalid',
        String(
          !correct && normalizeAnswer(input.value) !== normalizeAnswer(item.exercise.answers[i])
        )
      );
    });
    checked = true;
    outcomes.push({ item, correct, needsReview: !correct || hinted });
    records = recordAttempt(records, item, correct && !hinted);
    available = saved.available && saveProgress(storage, records);
    updateStats();
    const feedback = $('answerFeedback');
    feedback.className = 'answer-feedback ' + (correct ? 'is-correct' : 'needs-review');
    feedback.replaceChildren(
      node('strong', '', correct ? '正解！よくできました。' : 'お手本とくらべてみよう。'),
      node('p', 'answer-key', '答えの例：' + item.exercise.answers.join(' / ')),
      node('p', 'complete-sentence', item.english),
      node('p', 'feedback-note', learningFocus(item)),
      node(
        'p',
        'feedback-note',
        hinted
          ? 'ヒントを使った問題は、復習でもう一度挑戦できます。'
          : '文全体を声に出して読んでみよう。'
      )
    );
    if (correct && normalizeAnswer(fillAnswers(item, answers)) !== normalizeAnswer(item.english)) {
      feedback.append(
        node('p', 'feedback-note', 'あなたの答えも正しい言い方です：' + fillAnswers(item, answers))
      );
    } else if (!correct) {
      feedback.append(
        node(
          'p',
          'feedback-note',
          '登録された答えとは異なりますが、別の言い方が成り立つこともあります。先生やおうちの人とたしかめてみよう。'
        )
      );
    }
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
      const item = refreshItem(
        record.snapshot ? restoreItem(record.snapshot) : record,
        getPhrasePool
      );
      if (item) item.revised = Boolean(record.revised || item.revised);
      return item ? [item] : [];
    });
  }
  function renderReview() {
    const due = reviewItems();
    const unavailable = records.filter(
      (record) =>
        !refreshItem(record.snapshot ? restoreItem(record.snapshot) : record, getPhrasePool)
    ).length;
    $('reviewUnavailable').textContent = unavailable
      ? unavailable + '件は現在の教材にありません。記録を保持し、復習の件数には含めていません。'
      : '';
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
        const phrase = refreshItem(
          record.snapshot ? restoreItem(record.snapshot) : record,
          getPhrasePool
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
          node(
            'span',
            'due-label',
            !phrase ? '教材なし' : record.dueAt <= Date.now() ? '復習しよう' : nextDate + ' ごろ'
          )
        );
        list.append(row);
      });
  }
  $('startReview').addEventListener('click', () => start(reviewItems().slice(0, 5)));
  $('reviewShortcut').addEventListener('click', () => setView('review'));
  function printItems(items) {
    if (!items.length) return;
    setView('worksheet');
    onPrintLesson(items);
  }
  $('printLesson').addEventListener('click', () => printItems(session));

  function renderLibrary() {
    const selected = $('savedLessonSelect').value;
    $('savedLessonSelect').replaceChildren();
    for (const set of sets) {
      const option = node('option', '', set.title);
      option.value = set.id;
      $('savedLessonSelect').append(option);
    }
    if (sets.some((set) => set.id === selected)) $('savedLessonSelect').value = selected;
    for (const id of [
      'practiceSavedLesson',
      'printSavedLesson',
      'exportLesson',
      'removeLesson',
      'savedLessonSelect',
    ]) {
      $(id).disabled = !sets.length;
    }
  }
  function addSet(set) {
    if (!library.available)
      throw new Error('既存の保存データを読めないため、上書きせずに保存を止めました。');
    if (sets.length >= MAX_SETS)
      throw new Error('保存は20セットまでです。不要なセットを書き出してから削除してください。');
    const next = [...sets, set];
    if (!saveLibrary(storage, next))
      throw new Error('保存できませんでした。ブラウザの保存設定や空き容量を確認してください。');
    sets = next;
    renderLibrary();
    $('savedLessonSelect').value = set.id;
  }
  $('saveLesson').addEventListener('click', () => {
    try {
      const title =
        (categoryNames[session[0].category] || '復習') +
        ' · ' +
        session.length +
        '問 · ' +
        new Date().toLocaleString('ja-JP');
      addSet(createSet(session, title));
      $('saveLessonNotice').textContent =
        '問題セットを保存しました。下の一覧から何度でも使えます。';
    } catch (error) {
      $('saveLessonNotice').textContent = error.message;
    }
  });
  const selectedSet = () => sets.find((set) => set.id === $('savedLessonSelect').value);
  function selectedItems() {
    const set = selectedSet();
    if (!set) return [];
    const items = set.items.map(restoreItem).map((item) => refreshItem(item, getPhrasePool));
    if (items.some((item) => !item)) {
      $('libraryNotice').textContent =
        '現在の教材にない問題が含まれるため、このセットは開始できません。書き出したファイルや教材を確認してください。';
      return [];
    }
    const revised = items.some((item) => item.revised);
    $('libraryNotice').textContent = revised
      ? '改訂された教材を最新版に更新しました。英文が変わった問題の空欄は作り直しています。'
      : '';
    if (revised) {
      const next = sets.map((entry) =>
        entry.id === set.id ? { ...entry, items: items.map(snapshotItem) } : entry
      );
      if (saveLibrary(storage, next)) sets = next;
      else
        $('libraryNotice').textContent +=
          ' 更新版を保存できませんでした。次回は空欄を作り直します。';
    }
    return items;
  }
  $('practiceSavedLesson').addEventListener('click', () => {
    const items = selectedItems();
    if (items.length) start(items);
  });
  $('printSavedLesson').addEventListener('click', () => printItems(selectedItems()));
  $('exportLesson').addEventListener('click', () => {
    const set = selectedSet();
    if (!set) return;
    const url = URL.createObjectURL(new Blob([exportSet(set)], { type: 'application/json' }));
    const link = node('a', '');
    link.href = url;
    link.download = 'english-note-lesson.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('libraryNotice').textContent =
      '問題だけを書き出しました。学習記録や入力した答えは含みません。';
  });
  $('importLesson').addEventListener('change', async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > MAX_IMPORT_BYTES) throw new Error('ファイルは250KB以下にしてください。');
      addSet(importSet(await file.text()));
      $('libraryNotice').textContent = '問題セットを読み込みました。';
    } catch (error) {
      $('libraryNotice').textContent = error.message;
    } finally {
      event.target.value = '';
    }
  });
  $('removeLesson').addEventListener('click', () => {
    const set = selectedSet();
    if (!set || !window.confirm('「' + set.title + '」を削除しますか？学習記録は残ります。'))
      return;
    const next = sets.filter((entry) => entry.id !== set.id);
    if (!saveLibrary(storage, next)) {
      $('libraryNotice').textContent = '削除を保存できませんでした。';
      return;
    }
    sets = next;
    renderLibrary();
    $('libraryNotice').textContent =
      'セットを削除しました。書き出したファイルがあれば読み込み直せます。';
  });
  renderLibrary();
  $('importLesson').disabled = false;
  if (!library.available)
    $('libraryNotice').textContent =
      '保存した問題セットを読み込めませんでした。ブラウザの保存設定を確認してください。';
  updateStats();
  $('startLesson').disabled = false;
  const params = new URL(window.location.href).searchParams;
  setView(params.get('view') || (params.has('practiceMode') ? 'worksheet' : 'learn'));
}
