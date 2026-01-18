'use client';

import { useState } from 'react';

export function Header() {
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

  const basePath = process.env.GITHUB_ACTIONS ? '/voice-actor' : '';

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            声優事務所変遷図
          </h1>
          <button
            onClick={toggleDarkMode}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="ダークモード切替"
          >
            {darkMode ? '☀️ ライト' : '🌙 ダーク'}
          </button>
        </div>
        <nav className="flex gap-4 text-sm">
          <a href={`${basePath}/`} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
            ホーム
          </a>
          <a href={`${basePath}/lineage`} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
            系譜図
          </a>
          <a href={`${basePath}/timeline`} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
            タイムライン
          </a>
          <a href={`${basePath}/network`} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
            ネットワーク
          </a>
          <a href={`${basePath}/actors`} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
            声優一覧
          </a>
          <a href={`${basePath}/agencies`} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
            事務所一覧
          </a>
        </nav>
      </div>
    </header>
  );
}
