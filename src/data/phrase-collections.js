/**
 * フレーズコレクション統合モジュール
 *
 * src/data/collections/phrases/*.json（全カテゴリー）を Vite の import.meta.glob で
 * 取り込み、phrase-data.js 由来の PHRASE_DATA とマージする。
 *
 * NOTE: import.meta は ES モジュール専用のため、CommonJS として構文チェックされる
 * script.js には置けない（CI の `node -c script.js` が失敗する）。そのため
 * import.meta.glob を使う処理はこのモジュールに分離し、script.js からは動的 import で
 * 読み込む。実行は Vite（dev / build）前提。
 */

// _manifest.json も含めて取り込まれるが、items を持たないためマージ時に無視される。
//
// import.meta.glob は Vite 専用のビルド時マクロ。Vite(dev / build / 本番GitHub Pages)では
// 全コレクションJSONに静的展開される。一方、Vite を介さずに配信された場合
// (例: live-server / 素の静的サーバー / PlaywrightのwebServer) では import.meta.glob が
// 関数として存在せず呼び出しが TypeError になり、データ読み込みチェーン全体が落ちてしまう。
// その状況でもアプリがクラッシュしないよう try/catch でガードし、フォールバックとして
// phrase-data.js の base データのみで動作させる。
let COLLECTION_PHRASE_MODULES = {};
try {
  COLLECTION_PHRASE_MODULES = import.meta.glob('./collections/phrases/*.json', {
    eager: true,
  });
} catch (_e) {
  COLLECTION_PHRASE_MODULES = {};
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
