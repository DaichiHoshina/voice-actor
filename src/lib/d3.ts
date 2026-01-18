import * as d3 from 'd3';

/**
 * D3.jsのSSR対応ユーティリティ
 * Server Componentsでは使用不可、Client Componentsでのみ使用
 */

/**
 * 日付フォーマッター（YYYY-MM形式）
 */
export const formatDate = d3.timeFormat('%Y-%m');

/**
 * 日付パーサー（YYYY-MM形式）
 */
export const parseDate = d3.timeParse('%Y-%m');

/**
 * 年のみパーサー（YYYY形式）
 */
export const parseYear = d3.timeParse('%Y');

/**
 * 時間スケールを作成
 */
export function createTimeScale(
  domain: [Date, Date],
  range: [number, number]
): d3.ScaleTime<number, number> {
  return d3.scaleTime().domain(domain).range(range);
}

/**
 * バンドスケールを作成（カテゴリカルデータ用）
 */
export function createBandScale(
  domain: string[],
  range: [number, number],
  padding = 0.1
): d3.ScaleBand<string> {
  return d3.scaleBand().domain(domain).range(range).padding(padding);
}

/**
 * カラースケールを作成（モノトーン基調）
 */
export function createColorScale(categories: string[]): d3.ScaleOrdinal<string, string> {
  // モノトーン＋アクセントカラー
  const colors = [
    '#374151', // gray-700
    '#6B7280', // gray-500
    '#9CA3AF', // gray-400
    '#3B82F6', // blue-500 (アクセント)
    '#10B981', // green-500 (アクセント)
  ];
  
  return d3.scaleOrdinal<string, string>().domain(categories).range(colors);
}

/**
 * SVG軸を作成（横軸 - 時間軸）
 */
export function createTimeAxis(
  scale: d3.ScaleTime<number, number>,
  orientation: 'top' | 'bottom' = 'bottom'
): d3.Axis<Date | d3.NumberValue> {
  const axis = orientation === 'top' ? d3.axisTop(scale) : d3.axisBottom(scale);
  return axis.ticks(d3.timeYear.every(5)).tickFormat(d3.timeFormat('%Y') as (domainValue: Date | d3.NumberValue, index: number) => string);
}

/**
 * SVG軸を作成（縦軸 - カテゴリ軸）
 */
export function createCategoryAxis(
  scale: d3.ScaleBand<string>,
  orientation: 'left' | 'right' = 'left'
): d3.Axis<string> {
  return orientation === 'left' ? d3.axisLeft(scale) : d3.axisRight(scale);
}

/**
 * ツールチップ用のHTMLを生成
 */
export function createTooltipHtml(data: {
  title: string;
  items: { label: string; value: string }[];
}): string {
  const itemsHtml = data.items
    .map((item) => `<div><strong>${item.label}:</strong> ${item.value}</div>`)
    .join('');
  
  return `
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
      <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">${data.title}</h4>
      <div class="text-sm text-gray-600 dark:text-gray-400">${itemsHtml}</div>
    </div>
  `;
}

// D3をグローバルにエクスポート（必要に応じて使用）
export { d3 };
