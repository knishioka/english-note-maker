/**
 * A4 に収まっているか / 下に大きな余白が残っていないかを確認するテスト。
 *
 * プレビューは A4 実寸（210mm 幅）で組み、表示だけを transform で縮小している。
 * 幅が変わると行の折り返し位置が変わって「プレビューでははみ出すのに印刷では余る」
 * という状態になるため、実寸で組まれていること自体もここで担保する。
 */

import { expect, test } from '@playwright/test';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PX_TO_MM = 0.2645833333;

// 余白が残るのは詰め込み不足とは限らない。1項目が大きくて「あと1つ」が入らない場合と、
// その年齢・カテゴリーの素材を使い切った場合（例: 色の単語は5語しかない）がある。
// ここでは「モード構造上あり得る最大の余白」を上限にし、それを超える回帰だけを捕まえる。
const MODES = [
  { mode: 'normal', maxFreeMm: 30 }, // 1行10mm前後なのでほぼ埋まる
  { mode: 'sentence', maxFreeMm: 65 }, // 例文1件が最大45mm＋間隔12mm
  { mode: 'word', maxFreeMm: 60 }, // 1語31〜41mm。カテゴリーの在庫（5語）で頭打ちになる
  { mode: 'phonics', maxFreeMm: 40 },
  { mode: 'phrase', maxFreeMm: 60 }, // 1問が50〜66mm
  { mode: 'cloze', maxFreeMm: 40 },
];

async function applySettings(page, { mode, ageGroup, lineHeight }) {
  // 年齢を使わないモードでは年齢セレクタが隠れるので、モード切り替え前に設定する
  await page.selectOption('#ageGroup', ageGroup);
  await page.selectOption('#practiceMode', mode);
  await page.selectOption('#lineHeight', String(lineHeight));
  // 自動調整は再描画を繰り返すので、落ち着くまで待つ
  await page.waitForTimeout(1200);
}

/** 各ページの高さと、1ページ目の下に残った余白（mm）を返す */
async function measurePages(page) {
  return page.evaluate(
    ({ pxToMm, bottomLimitMm }) => {
      const preview = document.getElementById('notePreview');
      const scale = Number(getComputedStyle(preview).getPropertyValue('--preview-scale')) || 1;
      const pages = [...document.querySelectorAll('.note-page')];
      const first = pages[0];
      const children = [...first.children];
      const lastBottom = children.length
        ? children[children.length - 1].getBoundingClientRect().bottom
        : first.getBoundingClientRect().top;
      const usedMm = ((lastBottom - first.getBoundingClientRect().top) / scale) * pxToMm;

      return {
        widthMm: first.offsetWidth * pxToMm,
        heightsMm: pages.map((element) => element.offsetHeight * pxToMm),
        freeMm: bottomLimitMm - usedMm,
      };
    },
    { pxToMm: PX_TO_MM, bottomLimitMm: A4_HEIGHT_MM - 10 }
  );
}

test.describe('A4レイアウト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.note-page');
  });

  test('プレビューはA4実寸（210mm幅）で組まれている', async ({ page }) => {
    const { widthMm } = await measurePages(page);
    expect(Math.round(widthMm)).toBe(A4_WIDTH_MM);
  });

  for (const { mode, maxFreeMm } of MODES) {
    for (const lineHeight of [8, 12]) {
      test(`${mode} / 行間${lineHeight}mm はA4に収まり、下が空きすぎない`, async ({ page }) => {
        await applySettings(page, { mode, ageGroup: '10-12', lineHeight });
        const { widthMm, heightsMm, freeMm } = await measurePages(page);

        expect(Math.round(widthMm)).toBe(A4_WIDTH_MM);
        for (const heightMm of heightsMm) {
          expect(heightMm).toBeLessThanOrEqual(A4_HEIGHT_MM + 1);
        }
        expect(freeMm).toBeLessThan(maxFreeMm);
      });
    }
  }
});

/**
 * @media print で文字サイズや余白を変えると、プレビューで見た分量と
 * 刷り上がりがずれる（自動調整は画面側の高さで判断しているため）。
 * 色や線幅の印刷向け調整は高さに影響しないので、ここでは高さだけを比べる。
 */
test.describe('プレビューと印刷でレイアウトが変わらない', () => {
  const usedHeightMm = (page) =>
    page.evaluate((pxToMm) => {
      const first = document.querySelector('.note-page');
      const children = [...first.children];
      const last = children[children.length - 1];
      // offsetTop/offsetHeight はプレビューの transform 縮小の影響を受けない
      return last ? +((last.offsetTop + last.offsetHeight) * pxToMm).toFixed(2) : 0;
    }, PX_TO_MM);

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.note-page');
  });

  for (const { mode } of MODES) {
    test(`${mode} は画面と印刷で1ページの分量が同じ`, async ({ page }) => {
      await applySettings(page, { mode, ageGroup: '10-12', lineHeight: 10 });

      await page.emulateMedia({ media: 'screen' });
      const screenMm = await usedHeightMm(page);

      await page.emulateMedia({ media: 'print' });
      const printMm = await usedHeightMm(page);

      await page.emulateMedia({ media: null });

      expect(
        Math.abs(printMm - screenMm),
        `画面 ${screenMm}mm / 印刷 ${printMm}mm`
      ).toBeLessThanOrEqual(1);
    });
  }
});
