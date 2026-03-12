import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UsersRound,
  FileText, 
  Send, 
  BarChart3, 
  Settings,
  Mail,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Zap,
  LogOut,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/dashboard/contacts', icon: Users, label: 'Contacts' },
    { path: '/dashboard/groups', icon: UsersRound, label: 'Audiences' },
    { path: '/dashboard/templates', icon: FileText, label: 'Templates' },
    { path: '/dashboard/campaigns', icon: Send, label: 'Campaigns' },
    { path: '/dashboard/email-queue', icon: ListOrdered, label: 'Email Queue' },
    { path: '/dashboard/analytics', icon: BarChart3, label: 'Reports' },
    { path: '/dashboard/smtp-settings', icon: Mail, label: 'SMTP Config' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm animate-fade-in"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40
          flex flex-col
          bg-white border-r border-surface-200
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-[70px]' : 'translate-x-0 w-64'}
        `}
        style={{ boxShadow: '4px 0 20px rgba(99,102,241,0.06)' }}
      >
        {/* Logo */}
        <div className={`flex items-center border-b border-surface-200 h-16 flex-shrink-0 ${sidebarCollapsed ? 'justify-between px-4' : 'justify-between px-5'}`}>
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-4.5 h-4.5 text-white" size={18} strokeWidth={2.5} />
              </div>
              <span className="text-gray-900 font-semibold text-base tracking-tight">MailFlow</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mx-auto">
              <Zap size={18} className="text-white" strokeWidth={2.5} />
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className={`hidden lg:flex items-center justify-center w-7 h-7 rounded-md hover:bg-surface-100 transition-colors text-gray-400 hover:text-gray-700 flex-shrink-0 ${sidebarCollapsed ? 'absolute -right-3.5 top-4 bg-white border border-surface-200 rounded-full w-7 h-7 shadow-sm' : ''}`}
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
          {!sidebarCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Navigation</p>
          )}
          <ul className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/dashboard'}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `group flex items-center rounded-xl transition-all duration-150 relative
                      ${sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5 gap-3'}
                      ${isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-500 hover:bg-surface-100 hover:text-gray-800'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary-600 rounded-r-full" />
                        )}
                        <Icon
                          className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-150 ${isActive ? 'text-primary-600' : 'group-hover:scale-105'}`}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                        {!sidebarCollapsed && (
                          <span className={`text-sm font-medium tracking-tight ${isActive ? 'text-primary-700' : ''}`}>
                            {item.label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Footer */}
        <div className={`flex-shrink-0 border-t border-surface-200 p-3 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-100 transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary-400">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user?.displayName || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center cursor-pointer hover:bg-primary-600/30 transition-colors" title={user?.displayName || 'User'}>
              <span className="text-xs font-bold text-primary-400">{initials}</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
