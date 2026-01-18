"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { Agency } from "@/types";

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

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.width;
    const height = dimensions.height;
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };

    // ルートノードを探す（parentAgencyがないもの）
    const roots = agencies.filter((a) => !a.parentAgency);

    // 各ルートごとにツリーを構築
    const hierarchies = roots.map((root) => {
      const buildTree = (agency: Agency): Agency & { children?: Agency[] } => {
        const children = agencies
          .filter((a) => a.parentAgency === agency.id)
          .map((child) => buildTree(child));
        return children.length > 0 ? { ...agency, children } : agency;
      };
      return d3.hierarchy(buildTree(root));
    });

    // SVGグループ
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // ズーム機能
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", `translate(${event.transform.x + margin.left},${event.transform.y + margin.top}) scale(${event.transform.k})`);
      });

    svg.call(zoom);

    // 各系統を横に並べる
    const treeWidth = (width - margin.left - margin.right) / hierarchies.length;
    const treeHeight = height - margin.top - margin.bottom;

    hierarchies.forEach((hierarchy, index) => {
      // ツリーレイアウト
      const treeLayout = d3.tree<Agency>().size([treeHeight, treeWidth - 100]);
      const tree = treeLayout(hierarchy) as d3.HierarchyPointNode<Agency>;

      const offsetX = index * treeWidth;

      // リンク描画
      const links = tree.links();
      g.selectAll(`.link-${index}`)
        .data(links)
        .join("path")
        .attr("class", `link-${index}`)
        .attr("d", (d) => {
          return `M${offsetX + d.source.y},${d.source.x}
                  C${offsetX + d.source.y + 50},${d.source.x}
                   ${offsetX + d.target.y - 50},${d.target.x}
                   ${offsetX + d.target.y},${d.target.x}`;
        })
        .attr("fill", "none")
        .attr("stroke", "#94a3b8")
        .attr("stroke-width", 2);

      // ノード描画
      const nodes = tree.descendants();
      const nodeGroup = g
        .selectAll<SVGGElement, d3.HierarchyPointNode<Agency>>(`.node-${index}`)
        .data(nodes)
        .join("g")
        .attr("class", `node-${index}`)
        .attr("transform", (d) => `translate(${offsetX + d.y},${d.x})`)
        .style("cursor", "pointer");

      // 円描画
      nodeGroup
        .append("circle")
        .attr("r", 8)
        .attr("fill", (d) => {
          if (d.data.status === "dissolved") return "#ef4444";
          return "#3B82F6";
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);

      // ラベル描画
      nodeGroup
        .append("text")
        .text((d) => d.data.name)
        .attr("x", (d) => (d.children ? -12 : 12))
        .attr("y", 4)
        .attr("text-anchor", (d) => (d.children ? "end" : "start"))
        .attr("class", "text-sm fill-gray-900 dark:fill-white")
        .style("pointer-events", "none");

      // ホバーイベント
      nodeGroup
        .on("mouseenter", function (event, d) {
          d3.select(this).select("circle").attr("r", 12).attr("stroke-width", 3);

          const content = `
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm">
              <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">${d.data.name}</h4>
              <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div><strong>設立:</strong> ${d.data.founded || "不明"}</div>
                ${d.data.dissolved ? `<div><strong>廃業:</strong> ${d.data.dissolved}</div>` : ""}
                ${d.data.parentAgency ? `<div><strong>母体:</strong> ${agencies.find((a) => a.id === d.data.parentAgency)?.name || "不明"}</div>` : ""}
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
          d3.select(this).select("circle").attr("r", 8).attr("stroke-width", 2);
          setTooltip({ visible: false, x: 0, y: 0, content: "" });
        })
        .on("click", (event, d) => {
          const basePath = process.env.GITHUB_ACTIONS ? "/voice-actor" : "";
          window.location.href = `${basePath}/agencies/${d.data.id}`;
        });
    });

    // 凡例
    const legend = svg.append("g").attr("transform", `translate(20, ${height - 50})`);

    legend
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 6)
      .attr("fill", "#3B82F6");
    legend
      .append("text")
      .attr("x", 12)
      .attr("y", 4)
      .text("運営中")
      .attr("class", "text-sm fill-gray-900 dark:fill-white");

    legend
      .append("circle")
      .attr("cx", 80)
      .attr("cy", 0)
      .attr("r", 6)
      .attr("fill", "#ef4444");
    legend
      .append("text")
      .attr("x", 92)
      .attr("y", 4)
      .text("廃業")
      .attr("class", "text-sm fill-gray-900 dark:fill-white");
  }, [agencies, dimensions.width, dimensions.height]);

  return (
    <div ref={containerRef} className="w-full relative">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
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
