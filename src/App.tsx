import React, { useState, useEffect } from 'react';
import { User } from './types';
import { TabType } from './components/Navigation';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { InputLaporanView } from './components/InputLaporanView';
import { DataLaporanView } from './components/DataLaporanView';
import { MasterWilayahView } from './components/MasterWilayahView';
import { ManajemenPetugasView } from './components/ManajemenPetugasView';
import { GantiPasswordModal } from './components/GantiPasswordModal';
import { KeyRound, ShieldAlert } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('dip_auth_token') || null;
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dip_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Validate session on load or auto-renew if user is cached
  useEffect(() => {
    if (token && user) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) {
            handleLogout();
            return null;
          }
          return res.json();
        })
        .then(data => {
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem('dip_auth_user', JSON.stringify(data.user));
          }
        })
        .catch(() => {
          // ignore network hiccups
        });
    }
  }, []);

  const handleLoginSuccess = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('dip_auth_token', newToken);
    localStorage.setItem('dip_auth_user', JSON.stringify(newUser));
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('dip_auth_token');
    localStorage.removeItem('dip_auth_user');
    setActiveTab('dashboard');
    setIsMobileMenuOpen(false);
  };

  const handleQuickSwitchUser = async (username: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: '123456' })
      });
      const data = await res.json();
      if (res.ok) {
        handleLoginSuccess(data.token, data.user);
      }
    } catch (e) {
      console.error('Quick switch user error:', e);
    }
  };

  const handleSelectTab = (tab: TabType) => {
    if (tab === 'keluar') {
      handleLogout();
      return;
    }
    setActiveTab(tab);
  };

  // If not logged in, render Login View
  if (!token || !user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* 1. Sleek Interface Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onLogout={handleLogout}
        user={user}
        onQuickSwitchUser={handleQuickSwitchUser}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
      />

      {/* 2. Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-50">
        {/* Top Header */}
        <TopHeader
          user={user}
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        />

        {/* Require Password Change Banner if flag is set */}
        {user.requirePasswordChange && (
          <div className="bg-amber-500 text-white px-6 py-2.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-100" />
              <span>
                Akun Anda menggunakan password sementara dari Administrator. Silakan segera ubah password Anda demi keamanan.
              </span>
            </div>
            <button
              onClick={() => setIsChangePasswordOpen(true)}
              className="px-3 py-1 bg-white text-amber-900 hover:bg-amber-50 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Ganti Sekarang</span>
            </button>
          </div>
        )}

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView user={user} token={token} />
            )}

            {activeTab === 'input' && (
              <InputLaporanView
                user={user}
                token={token}
                onSuccessNavigate={() => setActiveTab('data')}
              />
            )}

            {activeTab === 'data' && (
              <DataLaporanView user={user} token={token} />
            )}

            {activeTab === 'master' && (
              <MasterWilayahView user={user} token={token} />
            )}

            {activeTab === 'petugas' && user.role === 'SUDIN' && (
              <ManajemenPetugasView user={user} token={token} />
            )}
          </div>
        </main>

        {/* Sleek Footer */}
        <footer className="bg-white border-t border-slate-200 py-3.5 px-6 sm:px-8 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <p>
              DIP — Dashboard Informasi Pelayanan Sudin Kependudukan dan Pencatatan Sipil Kota Administrasi Jakarta Selatan
            </p>
            <p className="font-mono text-[11px] text-slate-400">
              Provinsi DKI Jakarta • 10 Kecamatan • 65 Kelurahan
            </p>
          </div>
        </footer>
      </div>

      {/* Modal Ganti Password */}
      {isChangePasswordOpen && (
        <GantiPasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          user={user}
          token={token}
          isForced={!!user.requirePasswordChange}
          onPasswordChanged={() => {
            setUser({ ...user, requirePasswordChange: false });
            localStorage.setItem('dip_auth_user', JSON.stringify({ ...user, requirePasswordChange: false }));
          }}
        />
      )}
    </div>
  );
}

