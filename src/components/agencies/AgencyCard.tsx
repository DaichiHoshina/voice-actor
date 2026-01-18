import type { Agency } from "@/types";

export interface AgencyCardProps {
  agency: Agency;
  actorCount: number;
}

export function AgencyCard({ agency, actorCount }: AgencyCardProps) {
  const statusLabels = {
    active: "現存",
    dissolved: "解散",
    merged: "合併",
  };

  const statusColors = {
    active: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    dissolved: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
    merged: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  };

  // YYYY-MM形式から年を抽出
  const foundedYear = agency.founded?.split("-")[0];

  return (
    <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {agency.name}
        </h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[agency.status]
          }`}
        >
          {statusLabels[agency.status]}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        {foundedYear && (
          <div>
            <strong className="text-gray-700 dark:text-gray-300">設立:</strong>{" "}
            {foundedYear}年
          </div>
        )}

        <div>
          <strong className="text-gray-700 dark:text-gray-300">
            登録声優数:
          </strong>{" "}
          {actorCount}人
        </div>

        {agency.description && (
          <p className="mt-3 text-gray-500 dark:text-gray-400 line-clamp-2">
            {agency.description}
          </p>
        )}

        {agency.website && (
          <div className="mt-3">
            <a
              href={agency.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              公式サイト
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
