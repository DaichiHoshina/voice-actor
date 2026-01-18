'use client';

import type { Actor, Agency } from '@/types';
import { SearchInput } from '@/components/search/SearchInput';
import { FilterPanel } from '@/components/search/FilterPanel';
import { ActorList } from './ActorList';
import { useSearch } from '@/hooks/useSearch';

export interface ActorsPageClientProps {
  actors: Actor[];
  agencies: Agency[];
  currentAgencies: Map<string, Agency | null>;
}

export function ActorsPageClient({
  actors,
  agencies,
  currentAgencies,
}: ActorsPageClientProps) {
  const { searchQuery, setSearchQuery, filters, setFilters, filteredActors } =
    useSearch(actors);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* サイドバー（フィルタ） */}
      <aside className="lg:col-span-1">
        <div className="mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="声優名で検索..."
          />
        </div>
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          availableAgencies={agencies.map((a) => ({ id: a.id, name: a.name }))}
        />
      </aside>

      {/* メインコンテンツ */}
      <main className="lg:col-span-3">
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {filteredActors.length}件の声優が見つかりました
        </div>
        <ActorList actors={filteredActors} currentAgencies={currentAgencies} />
      </main>
    </div>
  );
}
