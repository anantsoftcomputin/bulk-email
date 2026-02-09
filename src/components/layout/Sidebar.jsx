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
  Sparkles
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/contacts', icon: Users, label: 'Contacts' },
    { path: '/groups', icon: UsersRound, label: 'Audiences' },
    { path: '/templates', icon: FileText, label: 'Templates' },
    { path: '/campaigns', icon: Send, label: 'Campaigns' },
    { path: '/email-queue', icon: ListOrdered, label: 'Email Queue' },
    { path: '/analytics', icon: BarChart3, label: 'Reports' },
    { path: '/smtp-settings', icon: Mail, label: 'SMTP Config' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden backdrop-blur-sm animate-fade-in"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 border-r border-slate-800 z-40
          transition-all duration-300 ease-in-out shadow-2xl
          ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-gray-800">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                </div>
                <div>
                  <span className="text-lg font-bold text-white tracking-tight">MailFlow</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    <span className="text-xs font-semibold text-blue-400">Professional</span>
                  </div>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto">
                <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide">
            <ul className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `group flex items-center px-3.5 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/40'
                            : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                            isActive ? 'scale-110' : 'group-hover:scale-110'
                          }`} strokeWidth={2.5} />
                          {!sidebarCollapsed && (
                            <span className="ml-3 font-semibold text-sm tracking-wide">{item.label}</span>
                          )}
                          {isActive && !sidebarCollapsed && (
                            <div className="ml-auto flex items-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
