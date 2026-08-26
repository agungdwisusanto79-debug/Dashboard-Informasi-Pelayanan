import React from 'react';
import { TabType } from './Navigation';
import { User } from '../types';
import {
  LayoutDashboard,
  FileEdit,
  FileSpreadsheet,
  MapPin,
  LogOut,
  Building2,
  ShieldCheck,
  UserCheck,
  ArrowRightLeft,
  X,
  Users,
  KeyRound
} from 'lucide-react';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onLogout: () => void;
  user: User;
  onQuickSwitchUser: (username: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenChangePassword?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onLogout,
  user,
  onQuickSwitchUser,
  isOpenMobile,
  onCloseMobile,
  onOpenChangePassword
}) => {
  const menuItems: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'input', label: 'Input Laporan', icon: FileEdit },
    { id: 'data', label: 'Data Laporan', icon: FileSpreadsheet },
    { id: 'master', label: 'Master Wilayah', icon: MapPin }
  ];

  if (user.role === 'SUDIN') {
    menuItems.push({ id: 'petugas', label: 'Manajemen Petugas', icon: Users });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 flex flex-col flex-shrink-0 min-h-screen transition-transform duration-300 ease-in-out select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white font-bold text-xl tracking-tight">D</span>
            </div>
            <div className="leading-tight">
              <h1 className="text-white font-bold text-lg tracking-tight">DIP</h1>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">
                Sudin Dukcapil Jaksel
              </p>
            </div>
          </div>

          {/* Close button for Mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium text-left cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-400'
                  }`}
                />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}

          {/* Demo Account Switcher in Sidebar */}
          <div className="pt-6 mt-6 border-t border-slate-800/80">
            <div className="px-3 mb-2.5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3 h-3 text-blue-400" /> Switch Role Demo
              </span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => onQuickSwitchUser('kel_cilandak_barat')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition ${
                  user.username === 'kel_cilandak_barat'
                    ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Kelurahan
                </span>
                <span className="text-[10px] text-slate-500">Cilandak Barat</span>
              </button>

              <button
                onClick={() => onQuickSwitchUser('kec_cilandak')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition ${
                  user.username === 'kec_cilandak'
                    ? 'bg-blue-500/15 text-blue-300 font-bold border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" /> Kecamatan
                </span>
                <span className="text-[10px] text-slate-500">Cilandak</span>
              </button>

              <button
                onClick={() => onQuickSwitchUser('sudin')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition ${
                  user.username === 'sudin'
                    ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Sudin Admin
                </span>
                <span className="text-[10px] text-slate-500">10 Kec / 65 Kel</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Ganti Password & Keluar Action */}
        <div className="p-4 border-t border-slate-800 space-y-1">
          {onOpenChangePassword && (
            <button
              onClick={() => {
                onOpenChangePassword();
                onCloseMobile();
              }}
              id="sidebar-change-pwd-btn"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer font-medium text-xs group"
            >
              <KeyRound className="w-4 h-4 text-blue-400 group-hover:rotate-45 transition-transform" />
              <span>Ganti Password</span>
            </button>
          )}

          <button
            onClick={onLogout}
            id="sidebar-logout-btn"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer font-medium text-xs group"
          >
            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};
