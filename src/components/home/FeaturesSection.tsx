export function FeaturesSection() {
  const features = [
    {
      title: 'タイムライン表示',
      description: '声優の所属変遷を時系列で可視化。どの事務所にいつ所属していたかを一目で確認できます。',
      icon: '📅',
    },
    {
      title: 'ネットワーク図',
      description: '事務所間の関係性（分裂、合併、移籍）をネットワーク図で可視化。業界の流れを俯瞰できます。',
      icon: '🕸️',
    },
    {
      title: '検索・フィルタ',
      description: '声優名や事務所名で検索、年代・性別・ステータスでフィルタリング。目的のデータにすぐアクセス。',
      icon: '🔍',
    },
  ];

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        主な機能
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
