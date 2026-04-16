import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Receipt, 
  Settings, 
  LogOut, 
  X,
  Wallet   // ✅ FIXED ICON
} from 'lucide-react';

import { logoutUser } from '../firebase/auth';
import { useAuthStore } from '../store/useAuthStore';

export default function Sidebar({ isOpen, toggle }) {
  const location = useLocation();
  const { user } = useAuthStore();
  
  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'New Bill', path: '/new-bill', icon: Receipt },

    // ✅ FIXED HERE
    { name: 'Finance', path: '/finance', icon: Wallet },

    { name: 'Bill History', path: '/history', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
      
      {/* HEADER */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <span className="text-2xl font-black tracking-tight text-primary">ShopERP</span>
        <button onClick={toggle} className="md:hidden text-gray-500">
          <X size={24} />
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const active = location.pathname === link.path;

          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => window.innerWidth < 768 && toggle()}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold transition-colors ${
                active
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={20} className={active ? 'text-primary' : 'text-gray-500'} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="mb-3 px-2 text-xs font-bold text-gray-500 truncate uppercase tracking-wider">
          {user?.email}
        </div>

        <button
          onClick={logoutUser}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-red-600 font-bold hover:bg-red-50 border border-transparent rounded-lg transition-colors shadow-sm bg-white"
        >
          <LogOut size={18} /> Logout Session
        </button>
      </div>
    </aside>
  );
}