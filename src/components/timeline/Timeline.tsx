'use client';

import { useState } from 'react';
import * as d3 from 'd3';
import type { Actor, Agency, Transition } from '@/types';
import { ChartWrapper } from '@/components/chart';
import {
  parseDate,
  createTimeScale,
  createBandScale,
  createTimeAxis,
  createCategoryAxis,
} from '@/lib/d3';

export interface TimelineProps {
  actors: Actor[];
  agencies: Agency[];
  transitions: Transition[];
}

export function Timeline({ actors, agencies, transitions }: TimelineProps) {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: '',
  });

  const draw = (svg: SVGSVGElement, width: number, height: number) => {
    const margin = { top: 40, right: 30, bottom: 60, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = d3
      .select(svg)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // データ準備
    const actorNames = actors.map((a) => a.name);
    const agencyMap = new Map(agencies.map((a) => [a.id, a]));

    // 時間範囲を取得
    const allDates = transitions.flatMap((t) => {
      const dates = [parseDate(t.startDate)];
      if (t.endDate) dates.push(parseDate(t.endDate));
      return dates.filter((d): d is Date => d !== null);
    });

    const minDate = d3.min(allDates) || new Date(1960, 0, 1);
    const maxDate = d3.max(allDates) || new Date();

    // スケール作成
    const xScale = createTimeScale([minDate, maxDate], [0, innerWidth]);
    const yScale = createBandScale(actorNames, [0, innerHeight], 0.2);

    // 軸描画
    const xAxis = createTimeAxis(xScale, 'bottom');
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('class', 'text-gray-600 dark:text-gray-400');

    const yAxis = createCategoryAxis(yScale, 'left');
    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('class', 'text-gray-900 dark:text-white');

    // グリッド線
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3.axisBottom(xScale).tickSize(innerHeight).tickFormat(() => '')
      );

    // タイムラインバー描画
    const barHeight = yScale.bandwidth() * 0.8;

    transitions.forEach((transition) => {
      const actor = actors.find((a) => a.id === transition.actorId);
      if (!actor) return;

      const agency = agencyMap.get(transition.agencyId);
      if (!agency) return;

      const startDate = parseDate(transition.startDate);
      const endDate = transition.endDate
        ? parseDate(transition.endDate)
        : new Date();

      if (!startDate) return;

      const y = yScale(actor.name);
      if (y === undefined) return;

      const x = xScale(startDate);
      const width = xScale(endDate || new Date()) - x;

      // バー描画
      const bar = g
        .append('rect')
        .attr('x', x)
        .attr('y', y + (yScale.bandwidth() - barHeight) / 2)
        .attr('width', width)
        .attr('height', barHeight)
        .attr('rx', 4)
        .attr('fill', transition.endDate ? '#6B7280' : '#3B82F6')
        .attr('opacity', 0.8)
        .style('cursor', 'pointer');

      // ホバーイベント
      bar.on('mouseenter', function (event) {
        d3.select(this).attr('opacity', 1);
        
        const tooltipContent = `
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
            <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">${actor.name}</h4>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <div><strong>事務所:</strong> ${agency.name}</div>
              <div><strong>期間:</strong> ${transition.startDate}${
          transition.endDate ? ' 〜 ' + transition.endDate : ' 〜 現在'
        }</div>
              ${transition.note ? `<div><strong>備考:</strong> ${transition.note}</div>` : ''}
            </div>
          </div>
        `;

        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY + 10,
          content: tooltipContent,
        });
      });

      bar.on('mouseleave', function () {
        d3.select(this).attr('opacity', 0.8);
        setTooltip({ visible: false, x: 0, y: 0, content: '' });
      });
    });

    // 凡例
    const legend = g
      .append('g')
      .attr('transform', `translate(0, ${-margin.top + 10})`);

    legend
      .append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', '#3B82F6')
      .attr('rx', 2);

    legend
      .append('text')
      .attr('x', 30)
      .attr('y', 15)
      .text('現在所属')
      .attr('class', 'text-sm text-gray-900 dark:text-white');

    legend
      .append('rect')
      .attr('x', 120)
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', '#6B7280')
      .attr('rx', 2);

    legend
      .append('text')
      .attr('x', 150)
      .attr('y', 15)
      .text('過去の所属')
      .attr('class', 'text-sm text-gray-900 dark:text-white');
  };

  return (
    <div className="relative">
      <ChartWrapper draw={draw} height={500} dependencies={[actors, agencies, transitions]} />
      {tooltip.visible && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
}
