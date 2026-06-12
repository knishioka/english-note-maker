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
} catch (_e) {
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
    return modules;
  }

  let manifest;
  try {
    const manifestUrl = new URL(`${COLLECTIONS_DIR}/_manifest.json`, import.meta.url);
    const res = await fetch(manifestUrl);
    if (!res.ok) {
      return modules;
    }
    manifest = await res.json();
  } catch (_e) {
    return modules;
  }

  const files = Array.isArray(manifest && manifest.files) ? manifest.files : [];

  await Promise.all(
    files.map(async (entry) => {
      const name = entry && entry.name;
      if (!name) {
        return;
      }
      const relPath = `${COLLECTIONS_DIR}/${name}.json`;
      try {
        const res = await fetch(new URL(relPath, import.meta.url));
        if (!res.ok) {
          return;
        }
        modules[relPath] = { default: await res.json() };
      } catch (_e) {
        // 個別ファイルの失敗は握りつぶし、読めたものだけマージする。
      }
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
 * english を正規化（小文字・前後空白除去）したキーで重複排除し、
 * 既存（phrase-data.js）のエントリを優先順序で先頭に残す。
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

  // 既存 english を重複チェック用に登録
  const seenByBucket = new Map();
  for (const category of Object.keys(merged)) {
    for (const ageGroup of Object.keys(merged[category])) {
      const set = new Set(merged[category][ageGroup].map((p) => normalize(p?.english)));
      seenByBucket.set(bucketKey(category, ageGroup), set);
    }
  }

  for (const path of Object.keys(modules || {})) {
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
      }
      const set = seenByBucket.get(bk);
      const norm = normalize(english);
      if (set.has(norm)) {
        continue;
      }
      set.add(norm);
      merged[category][ageGroup].push(item);
    }
  }

  return merged;
}
