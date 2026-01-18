'use client';

import type { Actor, Agency } from '@/types';
import { ActorCard } from './ActorCard';

export interface ActorListProps {
  actors: Actor[];
  currentAgencies: Map<string, Agency | null>;
}

export function ActorList({ actors, currentAgencies }: ActorListProps) {
  if (actors.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        該当する声優が見つかりませんでした
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {actors.map((actor) => (
        <ActorCard
          key={actor.id}
          actor={actor}
          currentAgency={currentAgencies.get(actor.id)}
        />
      ))}
    </div>
  );
}
