import { getActors, getAgencies, getTransitions } from '@/lib/data';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsSection } from '@/components/home/StatsSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';

export default async function Home() {
  const [actors, agencies, transitions] = await Promise.all([
    getActors(),
    getAgencies(),
    getTransitions(),
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <HeroSection />
      <StatsSection actors={actors} agencies={agencies} transitions={transitions} />
      <FeaturesSection />

      {/* 免責事項 */}
      <section className="py-12 mt-12 border-t border-gray-200 dark:border-gray-800">
        <div className="prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            ご利用にあたって
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              本サイトは個人的な資料・研究目的で作成されています。掲載情報の正確性には最大限配慮していますが、誤りが含まれる可能性があります。
            </p>
            <p>
              データの修正・追加のご要望は、GitHubのIssueまでお寄せください。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
