import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Settings, Zap, Search, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/dashboard/contacts': 'Contacts',
  '/dashboard/groups': 'Audiences',
  '/dashboard/templates': 'Templates',
  '/dashboard/campaigns': 'Campaigns',
  '/dashboard/analytics': 'Reports',
  '/dashboard/smtp-settings': 'SMTP Config',
  '/dashboard/email-queue': 'Email Queue',
  '/dashboard/settings': 'Settings',
};

const Header = () => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/');
  };

  const pageTitle = PAGE_TITLES[location.pathname] || 'MailFlow';

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <header className="bg-white/90 border-b border-surface-200 sticky top-0 z-40 backdrop-blur-md">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        {/* Left: hamburger + page title */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-surface-100 lg:hidden transition-colors text-gray-500"
          >
            <Menu className="w-5 h-5" />
          </button>
          {/* Mobile logo */}
          <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-semibold text-gray-900">MailFlow</span>
          </Link>
          {/* Desktop page title */}
          <h1 className="hidden lg:block text-base font-semibold text-gray-900">{pageTitle}</h1>
        </div>

        {/* Right: search + actions */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <button className="relative p-2 rounded-lg hover:bg-surface-100 transition-colors text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Settings shortcut */}
          <button
            onClick={() => navigate('/dashboard/settings')}
            className="p-2 rounded-lg hover:bg-surface-100 transition-colors text-gray-500 hover:text-gray-700"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(o => !o)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl hover:bg-surface-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center">
                <span className="text-xs font-bold text-primary-700">{initials}</span>
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {user?.displayName || user?.email || 'User'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl border border-surface-200 shadow-card-hover z-20 py-1 animate-scale-in">
                  <div className="px-4 py-2.5 border-b border-surface-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate('/dashboard/settings'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-surface-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
