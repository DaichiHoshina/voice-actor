import { getAgencies, getTransitions } from "@/lib/data";
import { AgenciesPageClient } from "@/components/agencies";

export const metadata = {
  title: "事務所一覧 | 声優事務所変遷図",
  description:
    "登録されている声優事務所の一覧。検索・フィルタリングで目的の事務所を探せます。",
};

export default async function AgenciesPage() {
  const [agencies, transitions] = await Promise.all([
    getAgencies(),
    getTransitions(),
  ]);

  // 各事務所の現在所属声優数を計算
  const actorCountsArray = agencies.map((agency) => {
    const currentTransitions = transitions.filter(
      (t) => t.agencyId === agency.id && !t.endDate,
    );
    // 同じ声優が複数回カウントされないようにSetで重複排除
    const uniqueActors = new Set(currentTransitions.map((t) => t.actorId));
    return [agency.id, uniqueActors.size] as const;
  });

  const actorCounts = new Map(actorCountsArray);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        事務所一覧
      </h1>
      <AgenciesPageClient agencies={agencies} actorCounts={actorCounts} />
    </div>
  );
}
