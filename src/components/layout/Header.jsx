import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Settings, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import Dropdown from '../common/Dropdown';

const Header = () => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userMenuItems = [
    {
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => navigate('/dashboard/settings'),
    },
    {
      label: 'Logout',
      icon: <LogOut className="w-4 h-4" />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm backdrop-blur-lg bg-opacity-95">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-gray-100 lg:hidden transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <Link to="/dashboard" className="flex items-center space-x-3 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
              Bulk Email Sender
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-all group">
            <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* User Menu */}
          <Dropdown
            align="right"
            trigger={
              <div className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100 cursor-pointer transition-all group">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <span className="hidden md:block text-sm font-semibold text-gray-700">
                  {user?.name || 'User'}
                </span>
              </div>
            }
            items={userMenuItems}
            onSelect={(item) => item.onClick && item.onClick()}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
