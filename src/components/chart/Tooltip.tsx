'use client';

import { useEffect, useRef } from 'react';

export interface TooltipProps {
  /**
   * ツールチップのコンテンツ（HTML）
   */
  content: string;
  
  /**
   * 表示位置（X座標）
   */
  x: number;
  
  /**
   * 表示位置（Y座標）
   */
  y: number;
  
  /**
   * 表示/非表示
   */
  visible: boolean;
}

/**
 * D3.js チャート用のツールチップコンポーネント
 */
export function Tooltip({ content, x, y, visible }: TooltipProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // ツールチップが画面外に出ないように調整
    const tooltip = ref.current;
    const rect = tooltip.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // 右端を超える場合は左側に表示
    if (x + rect.width > windowWidth) {
      adjustedX = x - rect.width - 10;
    }

    // 下端を超える場合は上側に表示
    if (y + rect.height > windowHeight) {
      adjustedY = y - rect.height - 10;
    }

    tooltip.style.left = `${adjustedX}px`;
    tooltip.style.top = `${adjustedY}px`;
  }, [x, y, visible]);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      className="fixed z-50 pointer-events-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
