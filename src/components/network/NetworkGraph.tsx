"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import type { Actor, Agency, Transition } from "@/types";

export interface NetworkGraphProps {
  actors: Actor[];
  agencies: Agency[];
  transitions: Transition[];
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: "actor" | "agency";
  data: Actor | Agency;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  current: boolean;
}

export function NetworkGraph({
  actors,
  agencies,
  transitions,
}: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 600 });
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
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: 600 });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // ズームリセット関数
  const handleReset = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(750).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.width;
    const height = dimensions.height;

    // ノード作成
    const nodes: Node[] = [
      ...agencies.map((agency) => ({
        id: agency.id,
        name: agency.name,
        type: "agency" as const,
        data: agency,
      })),
      ...actors.map((actor) => ({
        id: actor.id,
        name: actor.name,
        type: "actor" as const,
        data: actor,
      })),
    ];

    // リンク作成（現在所属のみ）
    const links: Link[] = transitions
      .filter((t) => !t.endDate) // 現在所属のみ
      .map((t) => ({
        source: t.actorId,
        target: t.agencyId,
        current: !t.endDate,
      }));

    // Force simulation
    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(links)
          .id((d) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    // SVGグループ
    const g = svg.append("g");

    // ズーム機能
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // リンク描画
    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // ノード描画
    const node = g
      .append("g")
      .selectAll<SVGGElement, Node>("g")
      .data(nodes)
      .join("g")
      .attr("tabindex", 0)
      .attr("role", "button")
      .attr("aria-label", (d) => `${d.name}の詳細を表示`)
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, Node>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      ) as unknown as d3.Selection<SVGGElement, Node, SVGGElement, unknown>;

    // 円描画（最小サイズ22px = タッチターゲット44x44px）
    node
      .append("circle")
      .attr("r", (d) => (d.type === "agency" ? 22 : 22))
      .attr("fill", (d) => {
        if (d.type === "agency") return "#3B82F6"; // 青
        const actor = d.data as Actor;
        if (actor.gender === "male") return "#10B981"; // 緑
        if (actor.gender === "female") return "#EC4899"; // ピンク
        return "#6B7280"; // グレー
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // ラベル描画
    node
      .append("text")
      .text((d) => d.name)
      .attr("x", 0)
      .attr("y", 32)
      .attr("text-anchor", "middle")
      .attr("class", "text-xs fill-gray-900 dark:fill-white")
      .style("pointer-events", "none");

    const showTooltip = (event: MouseEvent | FocusEvent, d: Node) => {
      d3.select((event.currentTarget as SVGGElement))
        .select("circle")
        .attr("stroke-width", 4);

      const content =
        d.type === "agency"
          ? `<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
               <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">${d.name}</h4>
               <div class="text-sm text-gray-600 dark:text-gray-400">
                 <div>事務所</div>
                 <div>設立: ${(d.data as Agency).founded || "不明"}</div>
               </div>
             </div>`
          : `<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
               <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">${d.name}</h4>
               <div class="text-sm text-gray-600 dark:text-gray-400">
                 <div>声優</div>
                 <div>デビュー: ${(d.data as Actor).debutYear || "不明"}年</div>
               </div>
             </div>`;

      const pageX = 'pageX' in event ? event.pageX : 0;
      const pageY = 'pageY' in event ? event.pageY : 0;

      setTooltip({
        visible: true,
        x: pageX + 10,
        y: pageY + 10,
        content,
      });
    };

    const hideTooltip = (event: MouseEvent | FocusEvent) => {
      d3.select((event.currentTarget as SVGGElement))
        .select("circle")
        .attr("stroke-width", 2);
      setTooltip({ visible: false, x: 0, y: 0, content: "" });
    };

    const navigateToDetail = (d: Node) => {
      const basePath = process.env.GITHUB_ACTIONS ? "/voice-actor" : "";
      const url =
        d.type === "agency"
          ? `${basePath}/agencies/${d.id}`
          : `${basePath}/actors/${d.id}`;
      window.location.href = url;
    };

    // イベントハンドラ
    node
      .on("mouseenter", showTooltip)
      .on("mouseleave", hideTooltip)
      .on("focus", showTooltip)
      .on("blur", hideTooltip)
      .on("click", (event, d) => navigateToDetail(d))
      .on("keydown", function (event, d) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigateToDetail(d);
        }
      });

    // シミュレーション更新
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as Node).x ?? 0)
        .attr("y1", (d) => (d.source as Node).y ?? 0)
        .attr("x2", (d) => (d.target as Node).x ?? 0)
        .attr("y2", (d) => (d.target as Node).y ?? 0);

      node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [actors, agencies, transitions, dimensions.width, dimensions.height]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 凡例を上部に配置 */}
      <div className="mb-4 flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800" />
          <span className="font-medium text-gray-900 dark:text-white">事務所</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white dark:border-gray-800" />
          <span className="font-medium text-gray-900 dark:text-white">声優（男性）</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-white dark:border-gray-800" />
          <span className="font-medium text-gray-900 dark:text-white">声優（女性）</span>
        </div>
        <div className="ml-auto">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
              rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-600 
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
      </div>

      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950"
        aria-label="声優と事務所の関係性を示すネットワーク図"
        role="img"
      />
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
