import { GlobalSearch } from "@/components/search";
import { Button } from "@/components/ui";
import { Actor, Agency } from "@/types";

export interface HeroSectionProps {
  actors: Actor[];
  agencies: Agency[];
}

export function HeroSection({ actors, agencies }: HeroSectionProps) {
  return (
    <section className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
      <h1 className="text-6xl lg:text-7xl font-bold mb-6 text-gray-900 dark:text-white">
        声優事務所変遷図
      </h1>
      <p className="text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
        声優業界における事務所の統廃合の歴史と個々の声優の所属変遷を可視化
      </p>

      {/* グローバル検索 */}
      <div className="mb-8">
        <GlobalSearch actors={actors} agencies={agencies} />
      </div>

      <div className="flex gap-4 justify-center">
        <Button variant="primary" size="lg" href="/actors">
          声優一覧を見る
        </Button>
        <Button variant="secondary" size="lg" href="/timeline">
          タイムライン表示
        </Button>
      </div>
    </section>
  );
}
