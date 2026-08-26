import React from 'react';
import { User } from '../types';
import { Building2, ShieldCheck, UserCheck, LogOut, ArrowRightLeft } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onQuickSwitchUser: (username: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onQuickSwitchUser }) => {
  if (!user) return null;

  const getRoleBadge = () => {
    switch (user.role) {
      case 'SUDIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            SUDIN / SUPER ADMIN
          </span>
        );
      case 'KECAMATAN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            KECAMATAN ({user.district})
          </span>
        );
      case 'KELURAHAN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            KELURAHAN ({user.village})
          </span>
        );
    }
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md ring-2 ring-blue-400/30">
              <span className="text-sm tracking-wider font-mono font-extrabold">DIP</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-white">
                  DIP — Dashboard Informasi Pelayanan
                </h1>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Sudin Kependudukan dan Pencatatan Sipil Kota Administrasi Jakarta Selatan
              </p>
            </div>
          </div>

          {/* User info & quick switch */}
          <div className="flex items-center space-x-3">
            {/* Quick Demo Switcher for Preview Testing */}
            <div className="hidden lg:flex items-center bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-400 mr-2 flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3 text-blue-400" /> Cepat Ganti Akun:
              </span>
              <button
                onClick={() => onQuickSwitchUser('kel_cilandak_barat')}
                className={`px-2 py-0.5 rounded text-xs transition ${
                  user.username === 'kel_cilandak_barat'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title="Login sebagai Kelurahan Cilandak Barat"
              >
                Kelurahan
              </button>
              <button
                onClick={() => onQuickSwitchUser('kec_cilandak')}
                className={`px-2 py-0.5 rounded text-xs transition mx-1 ${
                  user.username === 'kec_cilandak'
                    ? 'bg-blue-500 text-white font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title="Login sebagai Kecamatan Cilandak"
              >
                Kecamatan
              </button>
              <button
                onClick={() => onQuickSwitchUser('sudin')}
                className={`px-2 py-0.5 rounded text-xs transition ${
                  user.username === 'sudin'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title="Login sebagai Sudin / Super Admin"
              >
                Sudin
              </button>
            </div>

            {/* Active User Card */}
            <div className="flex items-center space-x-3 bg-slate-800/60 border border-slate-700/80 rounded-lg px-3 py-1.5">
              <div className="text-right">
                <div className="text-xs font-semibold text-white leading-tight">
                  {user.name}
                </div>
                <div className="text-[11px] text-slate-300">
                  {user.role === 'SUDIN' ? 'Seluruh Jakarta Selatan' : user.role === 'KECAMATAN' ? `Kec. ${user.district}` : `Kec. ${user.district} → Kel. ${user.village}`}
                </div>
              </div>
              <div className="hidden sm:block">
                {getRoleBadge()}
              </div>
            </div>

            {/* Logout button (Direct session clear) */}
            <button
              onClick={onLogout}
              id="header-logout-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold transition shadow-sm"
              title="Keluar dari sesi saat ini"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
