import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Toast from './Toast';
import { useAuthStore } from '../store/useAuthStore';
import { useShopStore } from '../store/useShopStore';

export default function Layout() {
  const { user, loading } = useAuthStore();
  const { fetchProfile } = useShopStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) fetchProfile(user.uid);
  }, [user, fetchProfile]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden print:bg-white">
      <div className="print:hidden h-full flex">
         <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="print:hidden"><Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} /></div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 print:p-0 print:overflow-visible">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
}