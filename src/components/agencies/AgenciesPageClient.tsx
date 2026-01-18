"use client";

import { useState, useMemo } from "react";
import type { Agency } from "@/types";
import { AgencyList } from "./AgencyList";
import { SearchInput, FilterPanel } from "@/components/search";
import type { FilterOptions } from "@/components/search/FilterPanel";

export interface AgenciesPageClientProps {
  agencies: Agency[];
  actorCounts: Map<string, number>;
}

export function AgenciesPageClient({
  agencies,
  actorCounts,
}: AgenciesPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({});

  const filteredAgencies = useMemo(() => {
    let result = agencies;

    // 検索クエリでフィルタ
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((agency) => {
        const nameMatch = agency.name.toLowerCase().includes(query);
        const descMatch = agency.description?.toLowerCase().includes(query);
        const aliasMatch = agency.aliases?.some((alias) =>
          alias.toLowerCase().includes(query),
        );
        return nameMatch || descMatch || aliasMatch;
      });
    }

    // 設立年代でフィルタ
    if (filters.foundedDecades && filters.foundedDecades.length > 0) {
      result = result.filter((agency) => {
        if (!agency.founded) return false;
        const foundedYear = parseInt(agency.founded.split("-")[0], 10);
        const decade = Math.floor(foundedYear / 10) * 10;
        return filters.foundedDecades!.includes(decade);
      });
    }

    // ステータスでフィルタ
    if (filters.agencyStatuses && filters.agencyStatuses.length > 0) {
      result = result.filter((agency) =>
        filters.agencyStatuses!.includes(agency.status),
      );
    }

    return result;
  }, [agencies, searchQuery, filters]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* サイドバー（フィルタ） */}
      <aside className="lg:col-span-1">
        <div className="mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="事務所名で検索..."
          />
        </div>
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          mode="agency"
        />
      </aside>

      {/* メインコンテンツ */}
      <main className="lg:col-span-3">
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {filteredAgencies.length}件の事務所が見つかりました
        </div>
        <AgencyList agencies={filteredAgencies} actorCounts={actorCounts} />
      </main>
    </div>
  );
}
