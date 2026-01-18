'use client';

import { useState } from 'react';

export function Header() {
  // usePathnameをインポート
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const basePath = process.env.GITHUB_ACTIONS ? '/voice-actor' : '';
  
  // 初期化時にlocalStorageまたはシステム設定を確認
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    // localStorageから取得
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      const isDark = saved === 'true';
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
      return isDark;
    }
    
    // システム設定を確認
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
    return prefersDark;
  });

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  // ナビゲーションアイテムの定義
  const navItems = [
    { href: '/', label: 'ホーム' },
    { href: '/lineage', label: '系譜図' },
    { href: '/timeline', label: 'タイムライン' },
    { href: '/network', label: 'ネットワーク' },
    { href: '/actors', label: '声優一覧' },
    { href: '/agencies', label: '事務所一覧' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === basePath || pathname === `${basePath}/`;
    }
    return pathname === `${basePath}${href}` || pathname.startsWith(`${basePath}${href}/`);
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            声優事務所変遷図
          </h1>
          <button
            onClick={toggleDarkMode}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 
              hover:bg-gray-200 dark:hover:bg-gray-700 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              transition"
            aria-label="ダークモード切替"
          >
            {darkMode ? '☀️ ライト' : '🌙 ダーク'}
          </button>
        </div>
        <nav className="flex gap-4 text-sm" aria-label="メインナビゲーション">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.href}
                href={`${basePath}${item.href}`}
                className={`transition ${
                  active
                    ? 'font-bold text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
