export const SIGHT_WORD_COUNTS = [4, 6, 8];
export const DEFAULT_SIGHT_WORD_COUNT = 6;

export function sanitizeSightWordCount(value) {
  const parsed = Number.parseInt(String(value), 10);
  return SIGHT_WORD_COUNTS.includes(parsed) ? parsed : DEFAULT_SIGHT_WORD_COUNT;
}

export function buildSightWordSequence(source, perPage, pageCount, random = Math.random) {
  if (!Array.isArray(source) || source.length === 0 || perPage <= 0 || pageCount <= 0) return [];

  const unique = [...new Map(source.filter(Boolean).map((item) => [item.word, item])).values()];
  const shuffled = [...unique];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, Math.min(perPage * pageCount, unique.length));
}
