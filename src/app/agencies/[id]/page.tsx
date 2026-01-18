import { getAgencies, getAgencyById, getTransitionsByAgency, getActorById } from '@/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export async function generateStaticParams() {
  const agencies = await getAgencies();
  return agencies.map((agency) => ({
    id: agency.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agency = await getAgencyById(id);
  
  if (!agency) {
    return {
      title: '事務所が見つかりません',
    };
  }

  return {
    title: `${agency.name} | 声優事務所変遷図`,
    description: `${agency.name}の情報と所属声優を表示`,
  };
}

export default async function AgencyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agency = await getAgencyById(id);

  if (!agency) {
    notFound();
  }

  const transitions = await getTransitionsByAgency(id);
  
  // 現在所属している声優
  const currentTransitions = transitions.filter((t) => !t.endDate);
  const currentActors = await Promise.all(
    currentTransitions.map((t) => getActorById(t.actorId))
  );
  const validCurrentActors = currentActors.filter((a) => a !== null);

  // 過去所属していた声優
  const pastTransitions = transitions.filter((t) => t.endDate);
  const pastActors = await Promise.all(
    pastTransitions.map((t) => getActorById(t.actorId))
  );
  const validPastActors = pastActors.filter((a) => a !== null);

  const statusLabels = {
    active: '現存',
    dissolved: '解散',
    merged: '合併',
  };

  const statusColors = {
    active: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    dissolved: 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
    merged: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* パンくずリスト */}
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
          ホーム
        </Link>
        {' > '}
        <Link href="/agencies" className="text-blue-600 dark:text-blue-400 hover:underline">
          事務所一覧
        </Link>
        {' > '}
        <span className="text-gray-600 dark:text-gray-400">{agency.name}</span>
      </nav>

      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {agency.name}
          </h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[agency.status]}`}>
            {statusLabels[agency.status]}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
          {agency.founded && (
            <div>
              <div className="text-gray-500 dark:text-gray-400">設立年月</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {agency.founded}
              </div>
            </div>
          )}
          {agency.dissolved && (
            <div>
              <div className="text-gray-500 dark:text-gray-400">解散年月</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {agency.dissolved}
              </div>
            </div>
          )}
          <div>
            <div className="text-gray-500 dark:text-gray-400">現在所属声優</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {validCurrentActors.length}名
            </div>
          </div>
        </div>

        {agency.description && (
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {agency.description}
          </p>
        )}

        {agency.website && (
          <a
            href={agency.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            公式サイト →
          </a>
        )}
      </div>

      {/* 現在所属声優 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          現在所属声優 ({validCurrentActors.length}名)
        </h2>
        {validCurrentActors.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">該当する声優がいません</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {validCurrentActors.map((actor) => (
              <Link
                key={actor.id}
                href={`/actors/${actor.id}`}
                className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 hover:shadow-lg transition"
              >
                <div className="font-semibold text-gray-900 dark:text-white">
                  {actor.name}
                </div>
                {actor.debutYear && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {actor.debutYear}年デビュー
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 過去所属声優 */}
      {validPastActors.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            過去所属声優 ({validPastActors.length}名)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {validPastActors.map((actor) => (
              <Link
                key={actor.id}
                href={`/actors/${actor.id}`}
                className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 hover:shadow-lg transition opacity-60"
              >
                <div className="font-semibold text-gray-900 dark:text-white">
                  {actor.name}
                </div>
                {actor.debutYear && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {actor.debutYear}年デビュー
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 戻るリンク */}
      <div className="text-center">
        <Link
          href="/agencies"
          className="inline-block px-6 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition"
        >
          ← 事務所一覧に戻る
        </Link>
      </div>
    </div>
  );
}
