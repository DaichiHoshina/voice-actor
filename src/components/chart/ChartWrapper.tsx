'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

export interface ChartWrapperProps {
  /**
   * チャート描画関数
   * svgRef: SVG要素への参照
   * width: コンテナの幅
   * height: コンテナの高さ
   */
  draw: (svgRef: SVGSVGElement, width: number, height: number) => void | (() => void);
  
  /**
   * チャートの高さ（px）
   */
  height?: number;
  
  /**
   * 追加のクラス名
   */
  className?: string;
  
  /**
   * 再描画のトリガーとなる依存配列
   */
  dependencies?: unknown[];
}

/**
 * D3.js チャートのラッパーコンポーネント
 * リサイズ対応、クリーンアップ処理を自動化
 */
export function ChartWrapper({
  draw,
  height = 400,
  className = '',
  dependencies = [],
}: ChartWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });

  // リサイズ監視
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [height]);

  // チャート描画
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    // 既存のSVG内容をクリア
    d3.select(svgRef.current).selectAll('*').remove();

    // チャート描画
    const cleanup = draw(svgRef.current, dimensions.width, dimensions.height);

    // クリーンアップ関数が返された場合は実行
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
    // NOTE: dependenciesのスプレッド演算子は意図的 - 外部から動的に依存配列を追加可能にするため
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw, dimensions.width, dimensions.height, ...dependencies]);

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="overflow-visible"
      />
    </div>
  );
}
