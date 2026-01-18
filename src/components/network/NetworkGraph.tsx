"use client";

import { useEffect, useRef, useState } from "react";
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

    // 円描画
    node
      .append("circle")
      .attr("r", (d) => (d.type === "agency" ? 20 : 10))
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
      .attr("y", (d) => (d.type === "agency" ? 30 : 20))
      .attr("text-anchor", "middle")
      .attr("class", "text-xs fill-gray-900 dark:fill-white")
      .style("pointer-events", "none");

    // ホバーイベント
    node
      .on("mouseenter", function (event, d) {
        d3.select(this).select("circle").attr("stroke-width", 4);

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

        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY + 10,
          content,
        });
      })
      .on("mouseleave", function () {
        d3.select(this).select("circle").attr("stroke-width", 2);
        setTooltip({ visible: false, x: 0, y: 0, content: "" });
      })
      .on("click", (event, d) => {
        const basePath = process.env.GITHUB_ACTIONS ? "/voice-actor" : "";
        const url =
          d.type === "agency"
            ? `${basePath}/agencies/${d.id}`
            : `${basePath}/actors/${d.id}`;
        window.location.href = url;
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
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950"
      />
      {tooltip.visible && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500" />
          <span>事務所</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span>声優（男性）</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-pink-500" />
          <span>声優（女性）</span>
        </div>
      </div>
    </div>
  );
}
