import { getActors, getAgencies, getTransitions } from "@/lib/data";
import { Timeline } from "@/components/timeline";

export const metadata = {
  title: "タイムライン | 声優事務所変遷図",
  description:
    "声優の事務所所属変遷をタイムラインで表示。過去から現在までの移籍履歴を視覚的に確認できます。",
};

export default async function TimelinePage() {
  const [actors, agencies, transitions] = await Promise.all([
    getActors(),
    getAgencies(),
    getTransitions(),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
        タイムライン
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        声優の事務所所属変遷を時系列で表示しています。バーにホバーすると詳細が確認できます。
      </p>
      <Timeline actors={actors} agencies={agencies} transitions={transitions} />
    </div>
  );
}
