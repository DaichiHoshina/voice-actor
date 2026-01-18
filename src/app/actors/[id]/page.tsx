import { getActors, getActorById, getTransitionsByActor, getAgencyById } from '@/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export async function generateStaticParams() {
  const actors = await getActors();
  return actors.map((actor) => ({
    id: actor.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getActorById(id);
  
  if (!actor) {
    return {
      title: '声優が見つかりません',
    };
  }

  return {
    title: `${actor.name} | 声優事務所変遷図`,
    description: `${actor.name}の所属変遷履歴を表示`,
  };
}

export default async function ActorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getActorById(id);

  if (!actor) {
    notFound();
  }

  const transitions = await getTransitionsByActor(id);
  
  // 各変遷に対応する事務所情報を取得
  const transitionsWithAgencies = await Promise.all(
    transitions.map(async (t) => ({
      ...t,
      agency: await getAgencyById(t.agencyId),
    }))
  );

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
    <div className="max-w-4xl mx-auto">
      {/* パンくずリスト */}
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
          ホーム
        </Link>
        {' > '}
        <Link href="/actors" className="text-blue-600 dark:text-blue-400 hover:underline">
          声優一覧
        </Link>
        {' > '}
        <span className="text-gray-600 dark:text-gray-400">{actor.name}</span>
      </nav>

      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {actor.name}
          </h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[actor.status]}`}>
            {statusLabels[actor.status]}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {actor.debutYear && (
            <div>
              <div className="text-gray-500 dark:text-gray-400">デビュー年</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {actor.debutYear}年
              </div>
            </div>
          )}
          {actor.gender && (
            <div>
              <div className="text-gray-500 dark:text-gray-400">性別</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {actor.gender === 'male' ? '男性' : actor.gender === 'female' ? '女性' : 'その他'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 所属変遷履歴 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          所属変遷履歴
        </h2>
        <div className="space-y-4">
          {transitionsWithAgencies.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">変遷データがありません</p>
          ) : (
            transitionsWithAgencies.map((transition) => (
              <div
                key={transition.id}
                className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900"
              >
                <div className="flex items-start justify-between mb-2">
                  <Link
                    href={`/agencies/${transition.agencyId}`}
                    className="text-xl font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {transition.agency?.name || '不明'}
                  </Link>
                  {!transition.endDate && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                      現在所属
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <strong>期間:</strong> {transition.startDate}
                    {transition.endDate ? ` 〜 ${transition.endDate}` : ' 〜 現在'}
                  </div>
                  {transition.note && (
                    <div className="mt-1">
                      <strong>備考:</strong> {transition.note}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 戻るリンク */}
      <div className="text-center">
        <Link
          href="/actors"
          className="inline-block px-6 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition"
        >
          ← 声優一覧に戻る
        </Link>
      </div>
    </div>
  );
}
