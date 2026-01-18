'use client';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  const basePath = process.env.GITHUB_ACTIONS ? '/voice-actor' : '';

  return (
    <nav aria-label="パンくずリスト" className="text-sm">
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {!isLast && item.href ? (
                <a
                  href={`${basePath}${item.href}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-gray-600 dark:text-gray-400">
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className="text-gray-400 dark:text-gray-600" aria-hidden="true">
                  {'>'}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
