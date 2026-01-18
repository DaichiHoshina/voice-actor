"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import type { Agency } from "@/types";
import { buildLineageTree, getLineageColor, type LineageNode } from "@/lib/lineage-utils";

export interface AgencyLineageTreeProps {
  agencies: Agency[];
}

export function AgencyLineageTree({ agencies }: AgencyLineageTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 800 });
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // リサイズ監視
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      setDimensions({ width: entries[0].contentRect.width, height: 800 });
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // ズームリセット関数
  const handleReset = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(750).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    // lineage-utils.tsからツリーデータ構築
    const rootNodes = buildLineageTree(agencies);
    if (rootNodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 40, right: 120, bottom: 40, left: 120 };

    // SVGグループ
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // ズーム機能
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        g.attr(
          "transform",
          `translate(${event.transform.x + margin.left},${event.transform.y + margin.top}) scale(${event.transform.k})`
        );
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // ツリーレイアウト（横向き: x軸=垂直, y軸=水平）
    const treeLayout = d3.tree<LineageNode>().nodeSize([80, 200]);

    // 各ルートノードを描画（複数の森）
    let offsetY = 0;

    rootNodes.forEach((rootData) => {
      // D3階層データに変換
      const root = d3.hierarchy(rootData);

      // 初期状態: ルート以外は折りたたむ
      if (root.children) {
        root.children.forEach(collapse);
      }

      // レイアウト適用
      treeLayout(root);

      // グループ作成（各ルートノード用）
      const treeGroup = g.append("g").attr("transform", `translate(0,${offsetY})`);

      // ノードとリンクを描画
      update(root, treeGroup);

      // 次のツリーの開始位置を計算
      const descendants = root.descendants();
      const minY = d3.min(descendants, (d) => d.x) ?? 0;
      const maxY = d3.max(descendants, (d) => d.x) ?? 0;
      offsetY += maxY - minY + 100;
    });

    // コラプシブル機能: 子ノードを折りたたむ
    function collapse(d: d3.HierarchyNode<LineageNode>) {
      if (d.children) {
        // @ts-expect-error - _childrenはD3のコラプシブルパターン
        d._children = d.children;
        // @ts-expect-error - _childrenはD3のコラプシブルパターン
        d._children.forEach(collapse);
        d.children = undefined;
      }
    }

    // ノードクリックで展開/折りたたみ
    function toggle(
      event: MouseEvent | KeyboardEvent,
      d: d3.HierarchyNode<LineageNode>
    ) {
      if (d.children) {
        // @ts-expect-error - _childrenはD3のコラプシブルパターン
        d._children = d.children;
        d.children = undefined;
      } else {
        // @ts-expect-error - _childrenはD3のコラプシブルパターン
        d.children = d._children;
        // @ts-expect-error - _childrenはD3のコラプシブルパターン
        d._children = undefined;
      }
      update(d, d3.select((event.currentTarget as Element).parentNode?.parentNode as SVGGElement));
    }

    // ツリー更新（アニメーション付き）
    function update(
      source: d3.HierarchyNode<LineageNode>,
      treeGroup: d3.Selection<SVGGElement, unknown, null, undefined>
    ) {
      const duration = 300;

      // レイアウト再計算
      treeLayout(source.ancestors()[source.ancestors().length - 1]);

      const nodes = source.descendants();
      const links = source.links();

      // リンク描画（カーブ）
      const link = treeGroup
        .selectAll<SVGPathElement, d3.HierarchyLink<LineageNode>>("path.link")
        .data(links, (d) => (d.target as d3.HierarchyNode<LineageNode> & { data: LineageNode }).data.id);

      // 新規リンク
      const linkEnter = link
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#94a3b8")
        .attr("stroke-width", 2)
        .attr("d", () => {
          const o = { x: source.x ?? 0, y: source.y ?? 0 };
          return diagonal(o, o);
        });

      // 更新
      link
        .merge(linkEnter)
        .transition()
        .duration(duration)
        .attr("d", (d) => diagonal(
          { x: d.source.x ?? 0, y: d.source.y ?? 0 },
          { x: d.target.x ?? 0, y: d.target.y ?? 0 }
        ));

      // 削除
      link
        .exit()
        .transition()
        .duration(duration)
        .attr("d", () => {
          const o = { x: source.x ?? 0, y: source.y ?? 0 };
          return diagonal(o, o);
        })
        .remove();

      // ノード描画
      const node = treeGroup
        .selectAll<SVGGElement, d3.HierarchyNode<LineageNode>>("g.node")
        .data(nodes, (d) => d.data.id);

      // 新規ノード
      const nodeEnter = node
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", () => `translate(${source.y ?? 0},${source.x ?? 0})`)
        .attr("tabindex", 0)
        .attr("role", "button")
        .attr("aria-label", (d) => `${d.data.name}の詳細を表示`)
        .style("cursor", "pointer")
        .on("click", toggle)
        .on("keydown", function (event, d) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggle(event, d);
          }
        });

      // ノードの背景矩形
      nodeEnter
        .append("rect")
        .attr("x", (d) => -(d.data.name.length * 7 + 10))
        .attr("y", -15)
        .attr("width", (d) => d.data.name.length * 14 + 20)
        .attr("height", 30)
        .attr("rx", 5)
        .attr("fill", (d) => {
          const color = getLineageColor(d.data.lineageType);
          return d.data.status === "dissolved" ? "#fee2e2" : color.fill;
        })
        .attr("stroke", (d) => {
          const color = getLineageColor(d.data.lineageType);
          return d.data.status === "dissolved" ? "#ef4444" : color.stroke;
        })
        .attr("stroke-width", 2);

      // ノードのテキスト
      nodeEnter
        .append("text")
        .attr("dy", 4)
        .attr("text-anchor", "middle")
        .text((d) => d.data.name)
        .attr("class", "text-sm font-medium")
        .attr("fill", (d) => (d.data.status === "dissolved" ? "#dc2626" : "#1e40af"))
        .style("pointer-events", "none");

      // 折りたたみインジケーター（子がいる場合）
      nodeEnter
        .append("circle")
        .attr("r", 6)
        .attr("cx", (d) => d.data.name.length * 7 + 20)
        .attr("cy", 0)
        .attr("fill", "#3b82f6")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        // @ts-expect-error - _childrenはD3のコラプシブルパターン
        .style("display", (d) => (d._children ? "block" : "none"));

      // ツールチップイベント
      nodeEnter
        .on("mouseenter", function (event, d) {
          d3.select(this).select("rect").attr("stroke-width", 3);

          const agencyMap = new Map(agencies.map((a) => [a.id, a]));
          const content = `
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm">
              <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">${d.data.name}</h4>
              <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div><strong>設立:</strong> ${d.data.founded || "不明"}</div>
                ${d.data.dissolved ? `<div><strong>廃業:</strong> ${d.data.dissolved}</div>` : ""}
                ${d.data.parentAgency ? `<div><strong>母体:</strong> ${agencyMap.get(d.data.parentAgency)?.name || "不明"}</div>` : ""}
                <div><strong>状態:</strong> ${d.data.status === "active" ? "運営中" : "廃業"}</div>
                <div class="mt-2">${d.data.description}</div>
              </div>
            </div>
          `;

          setTooltip({
            visible: true,
            x: event.pageX + 10,
            y: event.pageY + 10,
            content,
          });
        })
        .on("mouseleave", function () {
          d3.select(this).select("rect").attr("stroke-width", 2);
          setTooltip({ visible: false, x: 0, y: 0, content: "" });
        });

      // 更新
      node
        .merge(nodeEnter)
        .transition()
        .duration(duration)
        .attr("transform", (d) => `translate(${d.y ?? 0},${d.x ?? 0})`);

      // 削除
      node
        .exit()
        .transition()
        .duration(duration)
        .attr("transform", () => `translate(${source.y ?? 0},${source.x ?? 0})`)
        .remove();

      // インジケーターの更新
      treeGroup
        .selectAll<SVGCircleElement, d3.HierarchyNode<LineageNode>>("g.node circle")
        .transition()
        .duration(duration)
        // @ts-expect-error - _childrenはD3のコラプシブルパターン
        .style("display", (d) => (d._children ? "block" : "none"));
    }

    // 斜めリンク描画関数
    function diagonal(s: { x: number; y: number }, d: { x: number; y: number }) {
      return `M ${s.y} ${s.x}
              C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`;
    }
  }, [agencies, dimensions.width, dimensions.height]);

  return (
    <div ref={containerRef} className="w-full relative">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
            rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition"
          aria-label="ズームをリセット"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 inline mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          リセット
        </button>
      </div>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
        aria-label="声優事務所の系譜図"
        role="img"
      />
      {tooltip.visible && (
        <div
          className="fixed pointer-events-none z-50"
          style={{ left: tooltip.x, top: tooltip.y }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
}