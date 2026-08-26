import React from 'react';
import { LayoutDashboard, FilePlus2, FileSpreadsheet, MapPin, LogOut } from 'lucide-react';

export type TabType = 'dashboard' | 'input' | 'data' | 'master' | 'petugas' | 'keluar';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onLogout: () => void;
  role?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab, onLogout, role }) => {
  const menuItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'input', label: '2. Input Laporan', icon: FilePlus2 },
    { id: 'data', label: '3. Data Laporan', icon: FileSpreadsheet },
    { id: 'master', label: '4. Master Wilayah', icon: MapPin },
  ];

  if (role === 'SUDIN') {
    menuItems.push({ id: 'petugas', label: '5. Manajemen Petugas', icon: LayoutDashboard });
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-18 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto py-2">
          {/* Main 4 Baseline Items */}
          <div className="flex space-x-1 sm:space-x-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* 5th Baseline Item: Keluar */}
          <div className="pl-4">
            <button
              id="nav-item-keluar"
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition whitespace-nowrap"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>5. Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
