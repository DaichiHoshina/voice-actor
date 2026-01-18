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
      <NetworkGraph
        actors={actors}
        agencies={agencies}
        transitions={transitions}
      />
    </div>
  );
}
