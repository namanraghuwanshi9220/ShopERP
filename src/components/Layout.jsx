import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Toast from './Toast';
import { useAuthStore } from '../store/useAuthStore';
import { useShopStore } from '../store/useShopStore';
import GlobalCartUI from './GlobalCartUI'; // <-- YEHI OMNIPRESENT CART HAI

export default function Layout() {
  const { user, loading } = useAuthStore();
  const { fetchProfile } = useShopStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) fetchProfile(user.uid);
  }, [user, fetchProfile]);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-gray-500">Loading your space...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <>
      <div className="flex h-screen bg-gray-50 overflow-hidden print:bg-white relative">
        
        {/* Sidebar Fixed Component */}
        <div className="print:hidden h-full flex z-40">
           <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        </div>
        
        {/* Main Application Body */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <div className="print:hidden z-30">
            <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          </div>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 print:p-0 print:overflow-visible relative z-10">
            <Outlet />
          </main>
        </div>

        <Toast />
      </div>

      {/* SUPER IMPORTANT: PUT GLOBAL CART UI OUTSIDE EVERYTHING! */}
      {/* Iski wajah se ye kisi bhi overflow container ke andar block nahi hoga */}
      <GlobalCartUI />
      
    </>
  );
}