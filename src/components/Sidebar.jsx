import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, Receipt, Settings, LogOut, X } from 'lucide-react';
import { logoutUser } from '../firebase/auth';
import { useAuthStore } from '../store/useAuthStore';

export default function Sidebar({ isOpen, toggle }) {
  const location = useLocation();
  const { user } = useAuthStore();
  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'New Bill', path: '/new-bill', icon: Receipt },
    { name: 'Bill History', path: '/history', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <span className="text-2xl font-bold text-primary">ShopERP</span>
        <button onClick={toggle} className="md:hidden text-gray-500"><X size={24} /></button>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const active = location.pathname === link.path;
          return (
            <Link key={link.path} to={link.path} onClick={() => window.innerWidth < 768 && toggle()} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${active ? 'bg-green-50 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Icon size={20} /> {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="mb-4 px-2 text-sm text-gray-500 truncate">{user?.email}</div>
        <button onClick={logoutUser} className="flex items-center gap-3 w-full px-3 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
}