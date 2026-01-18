import type { Agency } from "@/types";
import { AgencyCard } from "./AgencyCard";

export interface AgencyListProps {
  agencies: Agency[];
  actorCounts: Map<string, number>;
}

export function AgencyList({ agencies, actorCounts }: AgencyListProps) {
  if (agencies.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        該当する事務所が見つかりませんでした
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agencies.map((agency) => (
        <AgencyCard
          key={agency.id}
          agency={agency}
          actorCount={actorCounts.get(agency.id) ?? 0}
        />
      ))}
    </div>
  );
}
