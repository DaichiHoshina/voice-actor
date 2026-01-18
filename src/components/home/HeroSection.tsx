import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="text-center py-12">
      <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
        声優事務所変遷図
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
        声優業界における事務所の統廃合の歴史と個々の声優の所属変遷を可視化
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/actors"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
        >
          声優一覧を見る
        </Link>
        <Link
          href="/timeline"
          className="px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition font-medium"
        >
          タイムライン表示
        </Link>
      </div>
    </section>
  );
}
