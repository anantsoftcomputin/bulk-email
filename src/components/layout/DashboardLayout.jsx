import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useUIStore } from '../../store/uiStore';

const DashboardLayout = () => {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-[70px]' : 'lg:ml-64'
        }`}
      >
        <Header />
        <main className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
