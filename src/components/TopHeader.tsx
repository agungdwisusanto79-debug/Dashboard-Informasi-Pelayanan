import React from 'react';
import { TabType } from './Navigation';
import { User } from '../types';
import { Menu, KeyRound } from 'lucide-react';

interface TopHeaderProps {
  user: User;
  activeTab: TabType;
  onOpenMobileMenu: () => void;
  onOpenChangePassword?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ user, activeTab, onOpenMobileMenu, onOpenChangePassword }) => {
  const getTabTitleInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Dashboard Informasi Pelayanan',
          subtitle: 'Monitoring pelayanan 10 kecamatan dan 65 kelurahan'
        };
      case 'input':
        return {
          title: 'Input Laporan Pelayanan',
          subtitle: 'Pencatatan volume 11 layanan kependudukan dan pencatatan sipil'
        };
      case 'data':
        return {
          title: 'Data Laporan Pelayanan',
          subtitle: 'Daftar rekapitulasi pelayanan dengan 9 parameter resmi'
        };
      case 'master':
        return {
          title: 'Master Wilayah Administrasi',
          subtitle: 'Hierarki 10 Kecamatan, 65 Kelurahan Jakarta Selatan & Master Nasional'
        };
      case 'petugas':
        return {
          title: 'Manajemen Petugas & Otorisasi',
          subtitle: 'Pengelolaan akun petugas 65 Kelurahan, 10 Kecamatan, dan Sudin'
        };
      default:
        return {
          title: 'Dashboard Informasi Pelayanan',
          subtitle: 'Monitoring pelayanan 10 kecamatan dan 65 kelurahan'
        };
    }
  };

  const { title, subtitle } = getTabTitleInfo();

  const getRegionSubtitle = () => {
    if (user.role === 'SUDIN') return 'Jakarta Selatan';
    if (user.role === 'KECAMATAN') return `Kec. ${user.district}`;
    return `Kel. ${user.village}`;
  };

  const getAvatarInitials = () => {
    if (user.role === 'SUDIN') return 'AS';
    if (user.role === 'KECAMATAN') return 'KC';
    return 'KB';
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile toggle button */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight leading-snug">
            {title}
          </h2>
          <p className="text-xs text-slate-500 font-normal hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Ganti Password button */}
        {onOpenChangePassword && (
          <button
            onClick={onOpenChangePassword}
            title="Ganti Password Akun"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Ganti Password</span>
          </button>
        )}

        <div className="text-right">
          <p className="text-sm font-bold text-slate-800 leading-tight">
            {user.name}
          </p>
          <p className="text-[10px] text-blue-600 uppercase font-bold tracking-wider mt-0.5">
            {getRegionSubtitle()}
          </p>
        </div>

        <div
          className="w-10 h-10 bg-slate-100 rounded-full border-2 border-slate-200 shadow-xs flex items-center justify-center text-slate-700 font-bold text-xs ring-2 ring-blue-500/10"
          title={`Role: ${user.role}`}
        >
          {getAvatarInitials()}
        </div>
      </div>
    </header>
  );
};
