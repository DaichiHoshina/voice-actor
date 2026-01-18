"use client";

import { useState, useMemo } from "react";
import type { Agency } from "@/types";
import { AgencyList } from "./AgencyList";
import { SearchInput } from "@/components/search";

export interface AgenciesPageClientProps {
  agencies: Agency[];
  actorCounts: Map<string, number>;
}

export function AgenciesPageClient({
  agencies,
  actorCounts,
}: AgenciesPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgencies = useMemo(() => {
    if (!searchQuery) return agencies;

    const query = searchQuery.toLowerCase();
    return agencies.filter((agency) => {
      const nameMatch = agency.name.toLowerCase().includes(query);
      const descMatch = agency.description?.toLowerCase().includes(query);
      const aliasMatch = agency.aliases?.some((alias) =>
        alias.toLowerCase().includes(query),
      );
      return nameMatch || descMatch || aliasMatch;
    });
  }, [agencies, searchQuery]);

  return (
    <div className="space-y-6">
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="事務所名で検索..."
      />
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {filteredAgencies.length}件の事務所
      </div>
      <AgencyList agencies={filteredAgencies} actorCounts={actorCounts} />
    </div>
  );
}
