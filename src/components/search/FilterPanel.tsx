"use client";

export interface FilterOptions {
  decades?: number[];
  agencies?: string[];
  genders?: ("male" | "female" | "other")[];
  statuses?: ("active" | "retired" | "deceased")[];
}

export interface FilterPanelProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  availableAgencies?: { id: string; name: string }[];
}

export function FilterPanel({
  filters,
  onChange,
  availableAgencies = [],
}: FilterPanelProps) {
  const decades = [1960, 1970, 1980, 1990, 2000, 2010, 2020];
  const genders: { value: "male" | "female" | "other"; label: string }[] = [
    { value: "male", label: "男性" },
    { value: "female", label: "女性" },
    { value: "other", label: "その他" },
  ];
  const statuses: {
    value: "active" | "retired" | "deceased";
    label: string;
  }[] = [
    { value: "active", label: "現役" },
    { value: "retired", label: "引退" },
    { value: "deceased", label: "故人" },
  ];

  const toggleDecade = (decade: number) => {
    const current = filters.decades || [];
    const updated = current.includes(decade)
      ? current.filter((d) => d !== decade)
      : [...current, decade];
    onChange({ ...filters, decades: updated });
  };

  const toggleAgency = (agencyId: string) => {
    const current = filters.agencies || [];
    const updated = current.includes(agencyId)
      ? current.filter((id) => id !== agencyId)
      : [...current, agencyId];
    onChange({ ...filters, agencies: updated });
  };

  const toggleGender = (gender: "male" | "female" | "other") => {
    const current = filters.genders || [];
    const updated = current.includes(gender)
      ? current.filter((g) => g !== gender)
      : [...current, gender];
    onChange({ ...filters, genders: updated });
  };

  const toggleStatus = (status: "active" | "retired" | "deceased") => {
    const current = filters.statuses || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onChange({ ...filters, statuses: updated });
  };

  const clearAll = () => {
    onChange({});
  };

  return (
    <div className="space-y-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          フィルタ
        </h3>
        <button
          onClick={clearAll}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          すべてクリア
        </button>
      </div>

      {/* 年代フィルタ */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          デビュー年代
        </h4>
        <div className="flex flex-wrap gap-2">
          {decades.map((decade) => (
            <button
              key={decade}
              onClick={() => toggleDecade(decade)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                (filters.decades || []).includes(decade)
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
              }`}
            >
              {decade}年代
            </button>
          ))}
        </div>
      </div>

      {/* 事務所フィルタ */}
      {availableAgencies.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            事務所
          </h4>
          <div className="space-y-2">
            {availableAgencies.map((agency) => (
              <label
                key={agency.id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={(filters.agencies || []).includes(agency.id)}
                  onChange={() => toggleAgency(agency.id)}
                  className="rounded border-gray-300 dark:border-gray-700 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {agency.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 性別フィルタ */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          性別
        </h4>
        <div className="space-y-2">
          {genders.map((gender) => (
            <label
              key={gender.value}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={(filters.genders || []).includes(gender.value)}
                onChange={() => toggleGender(gender.value)}
                className="rounded border-gray-300 dark:border-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {gender.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* ステータスフィルタ */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          ステータス
        </h4>
        <div className="space-y-2">
          {statuses.map((status) => (
            <label
              key={status.value}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={(filters.statuses || []).includes(status.value)}
                onChange={() => toggleStatus(status.value)}
                className="rounded border-gray-300 dark:border-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {status.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
