import type { Actor } from '@/types';

export interface ActorCardProps {
  actor: Actor;
  currentAgency?: { id: string; name: string } | null;
}

export function ActorCard({ actor, currentAgency }: ActorCardProps) {
  const statusLabels = {
    active: '現役',
    retired: '引退',
    deceased: '故人',
  };

  const statusColors = {
    active: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    retired: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
    deceased: 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  };

  return (
    <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {actor.name}
        </h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[actor.status]
          }`}
        >
          {statusLabels[actor.status]}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        {actor.debutYear && (
          <div>
            <strong className="text-gray-700 dark:text-gray-300">デビュー年:</strong>{' '}
            {actor.debutYear}年
          </div>
        )}

        {actor.gender && (
          <div>
            <strong className="text-gray-700 dark:text-gray-300">性別:</strong>{' '}
            {actor.gender === 'male' ? '男性' : actor.gender === 'female' ? '女性' : 'その他'}
          </div>
        )}

        {currentAgency && (
          <div>
            <strong className="text-gray-700 dark:text-gray-300">現所属:</strong>{' '}
            {currentAgency.name}
          </div>
        )}

        {!currentAgency && actor.status === 'active' && (
          <div>
            <strong className="text-gray-700 dark:text-gray-300">現所属:</strong>{' '}
            <span className="text-gray-500 dark:text-gray-500">フリー</span>
          </div>
        )}
      </div>
    </div>
  );
}
