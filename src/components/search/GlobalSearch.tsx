"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Actor, Agency } from "@/types";

export interface GlobalSearchProps {
  actors: Actor[];
  agencies: Agency[];
}

interface SearchResult {
  type: "actor" | "agency";
  id: string;
  name: string;
  subtext?: string;
}

export function GlobalSearch({ actors, agencies }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // デバウンス処理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // 外部クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 検索結果をフィルタリング
  const searchResults: SearchResult[] = (() => {
    if (!debouncedQuery.trim()) return [];

    const lowerQuery = debouncedQuery.toLowerCase();
    const results: SearchResult[] = [];

    // 声優を検索
    actors.forEach((actor) => {
      const matchName = actor.name.toLowerCase().includes(lowerQuery);
      const matchRealName = actor.realName?.toLowerCase().includes(lowerQuery);

      if (matchName || matchRealName) {
        results.push({
          type: "actor",
          id: actor.id,
          name: actor.name,
          subtext: actor.realName ? `本名: ${actor.realName}` : undefined,
        });
      }
    });

    // 事務所を検索
    agencies.forEach((agency) => {
      const matchName = agency.name.toLowerCase().includes(lowerQuery);
      const matchAliases = agency.aliases?.some((alias) =>
        alias.toLowerCase().includes(lowerQuery),
      );

      if (matchName || matchAliases) {
        results.push({
          type: "agency",
          id: agency.id,
          name: agency.name,
          subtext: agency.status === "dissolved" ? "解散" : undefined,
        });
      }
    });

    return results;
  })();

  const actorResults = searchResults.filter((r) => r.type === "actor");
  const agencyResults = searchResults.filter((r) => r.type === "agency");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery("");
    setDebouncedQuery("");
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* 検索入力 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="声優名・事務所名で検索..."
          className="block w-full pl-12 pr-12 py-4 text-lg border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="クリア"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* 検索結果ドロップダウン */}
      {isOpen && debouncedQuery && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-96 overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              該当する結果がありません
            </div>
          ) : (
            <div className="py-2">
              {/* 声優セクション */}
              {actorResults.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    声優 ({actorResults.length})
                  </div>
                  {actorResults.map((result) => (
                    <Link
                      key={result.id}
                      href={`/actors/${result.id}`}
                      onClick={handleResultClick}
                      className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {result.name}
                      </div>
                      {result.subtext && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {result.subtext}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              {/* 事務所セクション */}
              {agencyResults.length > 0 && (
                <div>
                  {actorResults.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                  )}
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    事務所 ({agencyResults.length})
                  </div>
                  {agencyResults.map((result) => (
                    <Link
                      key={result.id}
                      href={`/agencies/${result.id}`}
                      onClick={handleResultClick}
                      className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {result.name}
                      </div>
                      {result.subtext && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {result.subtext}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
