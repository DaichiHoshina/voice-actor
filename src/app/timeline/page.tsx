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
      <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">このページでできること</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• 声優の事務所所属履歴を時系列で確認</li>
          <li>• バーにホバーで詳細表示</li>
          <li>• 複数声優の移籍パターンを比較</li>
        </ul>
      </div>
      <Timeline actors={actors} agencies={agencies} transitions={transitions} />
    </div>
  );
}
