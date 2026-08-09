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

// 1項目の高さが大きいモードは、1つ足すと必ずはみ出すため余白が残る。
// モードごとに「これ以上余っていたら詰め込み不足」と言える値を上限にする。
const MODES = [
  { mode: 'normal', maxFreeMm: 30 },
  { mode: 'sentence', maxFreeMm: 60 },
  { mode: 'word', maxFreeMm: 40 },
  { mode: 'phonics', maxFreeMm: 40 },
  { mode: 'phrase', maxFreeMm: 60 },
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
