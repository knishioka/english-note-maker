export const SIGHT_WORD_COUNTS = [4, 6, 8];
export const DEFAULT_SIGHT_WORD_COUNT = 6;

export function sanitizeSightWordCount(value) {
  const parsed = Number.parseInt(String(value), 10);
  return SIGHT_WORD_COUNTS.includes(parsed) ? parsed : DEFAULT_SIGHT_WORD_COUNT;
}

export function buildSightWordSequence(source, perPage, pageCount, random = Math.random) {
  if (!Array.isArray(source) || source.length === 0 || perPage <= 0 || pageCount <= 0) return [];

  const unique = [...new Map(source.filter(Boolean).map((item) => [item.word, item])).values()];
  const shuffle = () => {
    const shuffled = [...unique];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  };

  // 語彙は 61 語しかないので、8語 × 8ページを超えると単純な切り捨てでは
  // 後半のページが白紙で印刷される。プールを使い切ったら並べ替えて周回し、
  // 要求されたページ数を必ず埋める。
  const total = perPage * pageCount;
  const sequence = [];
  let pool = shuffle();

  while (sequence.length < total) {
    const page = [];
    while (page.length < perPage && sequence.length + page.length < total) {
      if (pool.length === 0) {
        // 同じページに同じ語が二度出ないよう、このページで使った語は
        // 次の周回の末尾に回す（プールがページ枚数より小さい場合のみ重複する）。
        const usedOnPage = new Set(page.map((item) => item.word));
        const next = shuffle();
        pool = [
          ...next.filter((item) => !usedOnPage.has(item.word)),
          ...next.filter((item) => usedOnPage.has(item.word)),
        ];
      }
      page.push(pool.shift());
    }
    sequence.push(...page);
  }

  return sequence;
}
