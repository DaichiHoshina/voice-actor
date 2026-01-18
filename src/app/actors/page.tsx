import { getActors, getAgencies, getCurrentAgency } from '@/lib/data';
import { ActorsPageClient } from '@/components/actors/ActorsPageClient';

export const metadata = {
  title: '声優一覧 | 声優事務所変遷図',
  description: '登録されている声優の一覧。検索・フィルタリングで目的の声優を探せます。',
};

export default async function ActorsPage() {
  const [actors, agencies] = await Promise.all([getActors(), getAgencies()]);

  // 各声優の現在の所属事務所を取得
  const currentAgenciesArray = await Promise.all(
    actors.map(async (actor) => {
      const agency = await getCurrentAgency(actor.id);
      return [actor.id, agency] as const;
    })
  );

  const currentAgencies = new Map(currentAgenciesArray);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        声優一覧
      </h1>
      <ActorsPageClient
        actors={actors}
        agencies={agencies}
        currentAgencies={currentAgencies}
      />
    </div>
  );
}
