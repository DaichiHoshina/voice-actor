export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            © {new Date().getFullYear()} 声優事務所変遷図
          </p>
          <p className="mb-4">
            本サイトは個人的な資料・研究目的で作成されています。販売・商業利用は行いません。
          </p>
          <p className="text-xs">
            掲載情報に関するお問い合わせは{' '}
            <a
              href="https://github.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Issue
            </a>{' '}
            までお願いします。
          </p>
        </div>
      </div>
    </footer>
  );
}
