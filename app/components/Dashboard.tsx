'use client';

import { useEffect, useState } from 'react';
import { getUser, clearAuth } from '../../lib/api/auth';
import { useRouter } from 'next/navigation';
import DiscountCodesView from './Dashboard/DiscountCodesView';
import AdminView from './Dashboard/AdminView';
import UsersView from './Dashboard/UsersView';
import SettingsView from './Dashboard/SettingsView';
import LeadsView from './Dashboard/LeadsView';

type TabType = 'discount-codes' | 'admin' | 'users' | 'leads' | 'settings';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('discount-codes');
  const [user, setUser] = useState(getUser());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/');
    router.refresh();
  };

  const tabs = [
    { id: 'discount-codes' as TabType, name: 'Discount Codes', icon: '🎟️' },
    { id: 'admin' as TabType, name: 'Admin', icon: '👤' },
    { id: 'users' as TabType, name: 'Users', icon: '👥' },
    { id: 'leads' as TabType, name: 'Leads', icon: '📧' },
    { id: 'settings' as TabType, name: 'Settings', icon: '⚙️' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'discount-codes':
        return <DiscountCodesView />;
      case 'admin':
        return <AdminView />;
      case 'users':
        return <UsersView />;
      case 'leads':
        return <LeadsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DiscountCodesView />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 flex flex-col fixed h-screen z-20`}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Admin Panel</h1>
              {user && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 truncate">
                  {user.username}
                </p>
              )}
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg
              className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="text-xl shrink-0">{tab.icon}</span>
              {sidebarOpen && (
                <span className="font-medium text-sm">{tab.name}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Header */}
        <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {tabs.find((t) => t.id === activeTab)?.name || 'Dashboard'}
                </h2>
                {user && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    Welcome back, {user.username}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
