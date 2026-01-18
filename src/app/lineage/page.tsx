import { getAgencies } from '@/lib/data';
import { AgencyLineageTree } from '@/components/lineage';

export default async function LineagePage() {
  const agencies = await getAgencies();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            声優事務所 系譜図
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            声優事務所の設立・独立・分裂の歴史を可視化
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            主要な系統
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">俳協系統</h3>
              <ul className="space-y-1 pl-4">
                <li>• 東京俳優生活協同組合 (1960)</li>
                <li className="pl-4">→ アーツビジョン (1984)</li>
                <li className="pl-4">→ 大沢事務所 (1984)</li>
                <li className="pl-4">→ シグマ・セブン (1988)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">青二系統</h3>
              <ul className="space-y-1 pl-4">
                <li>• 青二プロダクション (1969)</li>
                <li className="pl-4">→ ぷろだくしょんバオバブ (1979)</li>
                <li className="pl-8">→ 81プロデュース (1981)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">アーツビジョン系統</h3>
              <ul className="space-y-1 pl-4">
                <li>• アーツビジョン (1984)</li>
                <li className="pl-4">→ アイムエンタープライズ (1993)</li>
                <li className="pl-8">→ プロ・フィット (2003)</li>
                <li className="pl-12">→ ラクーンドッグ (2022)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          <p>💡 ヒント: マウスホイールでズーム、ドラッグで移動、ノードをクリックで詳細ページへ</p>
        </div>

        <AgencyLineageTree agencies={agencies} />

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📚 出典</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Wikipedia各事務所ページ</li>
            <li>• 公式ウェブサイト</li>
            <li>• 業界公開情報</li>
          </ul>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            ※ 本サイトは教育・研究目的のみで作成されており、非商用です。
          </p>
        </div>
      </div>
    </div>
  );
}
