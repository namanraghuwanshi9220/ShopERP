import { Menu } from 'lucide-react';
export default function Topbar({ toggleSidebar }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="text-gray-600 focus:outline-none"><Menu size={24} /></button>
        <span className="text-xl font-bold text-primary">ShopERP</span>
      </div>
    </header>
  );
}