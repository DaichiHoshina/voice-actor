"use client";

import { useState, useMemo } from "react";
import type { Actor } from "@/types";
import type { FilterOptions } from "@/components/search/FilterPanel";

export function useSearch(actors: Actor[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({});

  const filteredActors = useMemo(() => {
    let result = actors;

    // 検索クエリでフィルタ
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (actor) =>
          actor.name.toLowerCase().includes(query) ||
          actor.realName?.toLowerCase().includes(query),
      );
    }

    // 年代でフィルタ
    if (filters.decades && filters.decades.length > 0) {
      result = result.filter((actor) => {
        if (!actor.debutYear) return false;
        const decade = Math.floor(actor.debutYear / 10) * 10;
        return filters.decades!.includes(decade);
      });
    }

    // 性別でフィルタ
    if (filters.genders && filters.genders.length > 0) {
      result = result.filter(
        (actor) => actor.gender && filters.genders!.includes(actor.gender),
      );
    }

    // ステータスでフィルタ
    if (filters.statuses && filters.statuses.length > 0) {
      result = result.filter((actor) =>
        filters.statuses!.includes(actor.status),
      );
    }

    return result;
  }, [actors, searchQuery, filters]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredActors,
  };
}
