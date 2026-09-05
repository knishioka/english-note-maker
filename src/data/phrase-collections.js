/**
 * フレーズコレクション統合モジュール
 *
 * src/data/collections/phrases/*.json（全カテゴリー）を取り込み、phrase-data.js 由来の
 * PHRASE_DATA とマージする。
 *
 * 取り込み経路は 2 系統：
 *   1. Vite(dev / build) 経由なら import.meta.glob で静的展開（同期・ネットワーク不要）。
 *   2. Vite を介さない素の静的配信（本番 GitHub Pages の生ソース配信 / live-server /
 *      Playwright の webServer 等）では import.meta.glob が未変換のままブラウザに渡るため
 *      関数として存在せず、呼び出しが TypeError になる。この場合は _manifest.json を起点に
 *      各 JSON を fetch() で読み込むフォールバックへ切り替える。
 *
 * NOTE: import.meta は ES モジュール専用のため、CommonJS として構文チェックされる
 * script.js には置けない（CI の `node -c script.js` が失敗する）。そのため import.meta を
 * 使う処理はこのモジュールに分離し、script.js からは動的 import で読み込む。
 */

// _manifest.json も含めて取り込まれるが、items を持たないためマージ時に無視される。
let COLLECTION_PHRASE_MODULES = {};
try {
  COLLECTION_PHRASE_MODULES = import.meta.glob('./collections/phrases/*.json', {
    eager: true,
  });
} catch {
  COLLECTION_PHRASE_MODULES = {};
}

const COLLECTIONS_DIR = './collections/phrases';

/**
 * _manifest.json を起点に各コレクション JSON を fetch して、
 * import.meta.glob と同じ形（{ [path]: { default: data } }）のモジュールマップを返す。
 * Vite を介さない素の静的配信時のフォールバック専用。
 * import.meta.url を基準に URL を解決するため、GitHub Pages のサブパス配信でも正しく辿れる。
 *
 * @returns {Promise<Record<string, { default: any }>>}
 */
async function fetchPhraseModules() {
  const modules = {};

  if (typeof fetch !== 'function' || typeof import.meta?.url !== 'string') {
    throw new Error('教材を読み込む機能が利用できません。');
  }

  const manifestUrl = new URL(`${COLLECTIONS_DIR}/_manifest.json`, import.meta.url);
  const response = await fetch(manifestUrl);
  if (!response.ok) throw new Error('教材の一覧を読み込めませんでした。');
  const manifest = await response.json();
  const files = Array.isArray(manifest?.files) ? manifest.files : [];
  if (!files.length) throw new Error('教材の一覧が空です。');

  await Promise.all(
    files.map(async (entry) => {
      const name = entry && entry.name;
      if (typeof name !== 'string' || !/^[a-z_]+$/.test(name))
        throw new Error('教材名が不正です。');
      const relPath = `${COLLECTIONS_DIR}/${name}.json`;
      const res = await fetch(new URL(relPath, import.meta.url));
      if (!res.ok) throw new Error('教材を読み込めませんでした：' + name);
      const data = await res.json();
      if (!Array.isArray(data.items) || !data.items.length)
        throw new Error('教材が空です：' + name);
      modules[relPath] = { default: data };
    })
  );

  return modules;
}

/**
 * base（phrase-data.js）にコレクション JSON をマージした PHRASE_DATA を返す。
 * import.meta.glob が機能していればそれを使い、空（= 素の静的配信）なら fetch で補完する。
 *
 * @param {Record<string, Record<string, Array>>} base
 * @returns {Promise<Record<string, Record<string, Array>>>}
 */
export async function loadMergedPhraseData(base) {
  // fetch フォールバックの結果はモジュールスコープにキャッシュし、
  // 複数回呼ばれてもマニフェスト/各JSONへの再フェッチが起きないようにする。
  if (!COLLECTION_PHRASE_MODULES || Object.keys(COLLECTION_PHRASE_MODULES).length === 0) {
    COLLECTION_PHRASE_MODULES = await fetchPhraseModules();
  }
  return mergePhraseCollections(base, COLLECTION_PHRASE_MODULES);
}

/**
 * コレクション JSON を PHRASE_DATA[カテゴリー][年齢] 形へマージする。
 * JSON を正本とし、同じカテゴリー・年齢の旧データを置き換える。
 * 読み込まれないカテゴリーに限り、互換データを残す。
 *
 * @param {Record<string, Record<string, Array<{english:string}>>>} base
 * @returns {Record<string, Record<string, Array>>}
 */
export function mergePhraseCollections(base, modules = COLLECTION_PHRASE_MODULES) {
  const normalize = (s) => (s || '').toString().trim().toLowerCase();
  const bucketKey = (category, ageGroup) => `${category}|${ageGroup}`;

  // 既存データを浅くコピー（元データを破壊しない）
  const merged = {};
  for (const category of Object.keys(base || {})) {
    merged[category] = {};
    for (const ageGroup of Object.keys(base[category] || {})) {
      const arr = base[category][ageGroup];
      merged[category][ageGroup] = Array.isArray(arr) ? [...arr] : [];
    }
  }

  // JSON内の同一カテゴリー・年齢で英文の重複を除く。
  const seenByBucket = new Map();

  for (const path of Object.keys(modules || {}).sort()) {
    if (path.includes('_manifest')) {
      continue;
    }
    const mod = modules[path];
    const data = mod && (mod.default || mod);
    const items = data && Array.isArray(data.items) ? data.items : [];
    for (const item of items) {
      const category = item && item.category;
      const ageGroup = item && item.ageGroup;
      const english = item && item.english;
      if (!category || !ageGroup || !english) {
        continue;
      }
      if (!merged[category]) {
        merged[category] = {};
      }
      if (!merged[category][ageGroup]) {
        merged[category][ageGroup] = [];
      }
      const bk = bucketKey(category, ageGroup);
      if (!seenByBucket.has(bk)) {
        seenByBucket.set(bk, new Set());
        merged[category][ageGroup] = [];
      }
      const set = seenByBucket.get(bk);
      const norm = normalize(english);
      if (set.has(norm)) {
        continue;
      }
      set.add(norm);
      merged[category][ageGroup].push({ ...item, revision: item.revision || 1 });
    }
  }

  return merged;
}
