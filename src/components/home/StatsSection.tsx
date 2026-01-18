import type { Actor, Agency, Transition } from '@/types';

export interface StatsSectionProps {
  actors: Actor[];
  agencies: Agency[];
  transitions: Transition[];
}

export function StatsSection({ actors, agencies, transitions }: StatsSectionProps) {
  const stats = [
    {
      label: '登録声優数',
      value: actors.length,
      icon: '🎤',
    },
    {
      label: '登録事務所数',
      value: agencies.length,
      icon: '🏢',
    },
    {
      label: '変遷データ数',
      value: transitions.length,
      icon: '📊',
    },
  ];

  return (
    <section className="py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-center"
          >
            <div className="text-4xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
