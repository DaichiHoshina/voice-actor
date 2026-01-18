"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import type { Agency } from "@/types";

export interface AgencyLineageTreeProps {
  agencies: Agency[];
}

export function AgencyLineageTree({ agencies }: AgencyLineageTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 1400 });
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
      setDimensions({ width: entries[0].contentRect.width, height: 1400 });
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

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const height = dimensions.height;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    // SVGグループ
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // ズーム機能
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        g.attr("transform", `translate(${event.transform.x + margin.left},${event.transform.y + margin.top}) scale(${event.transform.k})`);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // 手動レイアウト: 各系統を縦に配置
    const lineageGroups = [
      {
        title: "俳協系統",
        x: 50,
        items: [
          { id: "haikyo", y: 0 },
          { id: "arts-vision", y: 120 },
          { id: "im-enterprise", y: 240 },
          { id: "mio-creation", y: 360 },
          { id: "crazy-box", y: 360 },
          { id: "vims", y: 360 },
          { id: "arise-project", y: 360 },
          { id: "pro-fit", y: 480 },
          { id: "link-plan", y: 600 },
          { id: "raccoon-dog", y: 600 },
        ],
      },
      {
        title: "俳協系統（大沢）",
        x: 350,
        items: [
          { id: "haikyo", y: 0 },
          { id: "office-osawa", y: 120 },
        ],
      },
      {
        title: "俳協系統（シグマ）",
        x: 550,
        items: [
          { id: "haikyo", y: 0 },
          { id: "sigma-seven", y: 120 },
          { id: "sigma-seven-e", y: 240 },
        ],
      },
      {
        title: "青二系統",
        x: 750,
        items: [
          { id: "aoni-production", y: 0 },
          { id: "production-baobab", y: 120 },
          { id: "81-produce", y: 240 },
        ],
      },
      {
        title: "賢プロ系統",
        x: 950,
        items: [
          { id: "ken-production", y: 0 },
          { id: "air-agency", y: 120 },
        ],
      },
      {
        title: "独立系",
        x: 1150,
        items: [
          { id: "horipro", y: 0 },
          { id: "mausu-promotion", y: 120 },
          { id: "aksent", y: 240 },
          { id: "stay-luck", y: 360 },
          { id: "calicom", y: 480 },
          { id: "full-power-production", y: 600 },
          { id: "inari", y: 720 },
          { id: "anshery", y: 840 },
          { id: "pacage", y: 960 },
        ],
      },
    ];

    // タイトル描画
    lineageGroups.forEach((group) => {
      g.append("text")
        .attr("x", group.x)
        .attr("y", -10)
        .text(group.title)
        .attr("class", "text-sm font-semibold fill-gray-700 dark:fill-gray-300")
        .attr("text-anchor", "middle");
    });

    // リンク描画
    lineageGroups.forEach((group) => {
      group.items.forEach((item, index) => {
        if (index === 0) return;
        const agency = agencies.find((a) => a.id === item.id);
        const parentItem = group.items.find((i) => i.id === agency?.parentAgency);
        
        if (parentItem) {
          g.append("path")
            .attr("d", `M${group.x},${parentItem.y + 20} L${group.x},${item.y - 20}`)
            .attr("stroke", "#94a3b8")
            .attr("stroke-width", 2)
            .attr("fill", "none")
            .attr("marker-end", "url(#arrowhead)");
        }
      });
    });

    // 矢印マーカー定義
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("refX", 8)
      .attr("refY", 3)
      .attr("orient", "auto")
      .append("polygon")
      .attr("points", "0 0, 10 3, 0 6")
      .attr("fill", "#94a3b8");

    // ノード描画
    lineageGroups.forEach((group) => {
      group.items.forEach((item) => {
        const agency = agencies.find((a) => a.id === item.id);
        if (!agency) return;

        const nodeGroup = g
          .append("g")
          .attr("transform", `translate(${group.x},${item.y})`)
          .attr("tabindex", 0)
          .attr("role", "button")
          .attr("aria-label", `${agency.name}の詳細を表示`)
          .style("cursor", "pointer");

        // 背景矩形
        const textWidth = agency.name.length * 14 + 20;
        nodeGroup
          .append("rect")
          .attr("x", -textWidth / 2)
          .attr("y", -15)
          .attr("width", textWidth)
          .attr("height", 30)
          .attr("rx", 5)
          .attr("fill", agency.status === "dissolved" ? "#fee2e2" : "#dbeafe")
          .attr("stroke", agency.status === "dissolved" ? "#ef4444" : "#3B82F6")
          .attr("stroke-width", 2);

        // テキスト
        nodeGroup
          .append("text")
          .text(agency.name)
          .attr("x", 0)
          .attr("y", 4)
          .attr("text-anchor", "middle")
          .attr("class", "text-sm font-medium")
          .attr("fill", agency.status === "dissolved" ? "#dc2626" : "#1e40af")
          .style("pointer-events", "none");

        const showTooltip = (event: MouseEvent | FocusEvent) => {
          d3.select(nodeGroup.node() as Element)
            .select("rect")
            .attr("stroke-width", 3);

          const content = `
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm">
              <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">${agency.name}</h4>
              <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div><strong>設立:</strong> ${agency.founded || "不明"}</div>
                ${agency.dissolved ? `<div><strong>廃業:</strong> ${agency.dissolved}</div>` : ""}
                ${agency.parentAgency ? `<div><strong>母体:</strong> ${agencies.find((a) => a.id === agency.parentAgency)?.name || "不明"}</div>` : ""}
                <div><strong>状態:</strong> ${agency.status === "active" ? "運営中" : "廃業"}</div>
                <div class="mt-2">${agency.description}</div>
              </div>
            </div>
          `;

          const pageX = 'pageX' in event ? event.pageX : 0;
          const pageY = 'pageY' in event ? event.pageY : 0;

          setTooltip({
            visible: true,
            x: pageX + 10,
            y: pageY + 10,
            content,
          });
        };

        const hideTooltip = () => {
          d3.select(nodeGroup.node() as Element)
            .select("rect")
            .attr("stroke-width", 2);
          setTooltip({ visible: false, x: 0, y: 0, content: "" });
        };

        const navigateToDetail = () => {
          const basePath = process.env.GITHUB_ACTIONS ? "/voice-actor" : "";
          window.location.href = `${basePath}/agencies/${agency.id}`;
        };

        // イベントハンドラ
        nodeGroup
          .on("mouseenter", showTooltip)
          .on("mouseleave", hideTooltip)
          .on("focus", showTooltip)
          .on("blur", hideTooltip)
          .on("click", navigateToDetail)
          .on("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              navigateToDetail();
            }
          });
      });
    });

    // 凡例
    const legend = svg.append("g").attr("transform", `translate(20, ${height - 30})`);

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", -10)
      .attr("width", 60)
      .attr("height", 20)
      .attr("rx", 3)
      .attr("fill", "#dbeafe")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 2);
    legend
      .append("text")
      .attr("x", 70)
      .attr("y", 4)
      .text("運営中")
      .attr("class", "text-sm fill-gray-900 dark:fill-white");

    legend
      .append("rect")
      .attr("x", 130)
      .attr("y", -10)
      .attr("width", 60)
      .attr("height", 20)
      .attr("rx", 3)
      .attr("fill", "#fee2e2")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2);
    legend
      .append("text")
      .attr("x", 200)
      .attr("y", 4)
      .text("廃業")
      .attr("class", "text-sm fill-gray-900 dark:fill-white");
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
