import { getActors, getAgencies, getTransitions } from '@/lib/data';
import { NetworkGraph } from '@/components/network/NetworkGraph';

export const metadata = {
  title: 'ネットワーク図 | 声優事務所変遷図',
  description: '事務所と声優の関係性をネットワーク図で可視化',
};

export default async function NetworkPage() {
  const [actors, agencies, transitions] = await Promise.all([
    getActors(),
    getAgencies(),
    getTransitions(),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
        ネットワーク図
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        事務所と声優の関係性を可視化しています。ノードをドラッグして配置を変更できます。
      </p>
      <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">このページでできること</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• 事務所と声優の関係性を視覚的に把握</li>
          <li>• ノードのドラッグで配置変更</li>
          <li>• 関連する声優・事務所をたどれる</li>
        </ul>
      </div>
      <NetworkGraph
        actors={actors}
        agencies={agencies}
        transitions={transitions}
      />
    </div>
  );
}
