import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useShopStore } from '../store/useShopStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useBillStore } from '../store/useBillStore';
import { IndianRupee, Receipt, PackageSearch, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { profile } = useShopStore();
  const { items, fetchItems } = useInventoryStore();
  const { bills, fetchBills } = useBillStore();
  
  useEffect(() => {
    if (user) {
      fetchItems(user.uid);
      fetchBills(user.uid);
    }
  }, [user, fetchItems, fetchBills]);

  const today = new Date().toISOString().split('T')[0];
  const todayBills = bills.filter(b => b.createdAt.startsWith(today));
  const todaySales = todayBills.reduce((acc, bill) => acc + bill.total, 0);
  
  const outOfStock = items.filter(i => i.stock <= 0).length;
  const lowStock = items.filter(i => i.stock > 0 && i.stock <= i.minStock).length;

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-4 rounded-full ${color}`}><Icon size={24} /></div>
      <div><p className="text-sm font-medium text-gray-500">{title}</p><p className="text-2xl font-bold text-gray-900">{value}</p></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Sales" value={`${profile?.currency || '₹'}${todaySales.toFixed(2)}`} icon={IndianRupee} color="bg-green-100 text-green-600" />
        <StatCard title="Bills Today" value={todayBills.length} icon={Receipt} color="bg-blue-100 text-blue-600" />
        <StatCard title="Total Items" value={items.length} icon={PackageSearch} color="bg-purple-100 text-purple-600" />
        <StatCard title="Low/Out of Stock" value={lowStock + outOfStock} icon={AlertTriangle} color="bg-red-100 text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-800">Recent Bills</h2></div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600"><tr><th className="px-6 py-3">Bill No</th><th className="px-6 py-3">Customer</th><th className="px-6 py-3 text-right">Amount</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {bills.slice(0,5).map(bill => (
                  <tr key={bill.id}>
                    <td className="px-6 py-4 font-medium">{bill.billNo}</td>
                    <td className="px-6 py-4">{bill.customerName || '-'}</td>
                    <td className="px-6 py-4 text-right">{profile?.currency}{bill.total.toFixed(2)}</td>
                  </tr>
                ))}
                {bills.length === 0 && <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No bills yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-800">Low Stock Alerts</h2></div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600"><tr><th className="px-6 py-3">Item</th><th className="px-6 py-3">Stock</th><th className="px-6 py-3">Status</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {items.filter(i => i.stock <= i.minStock).slice(0,5).map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4">{item.stock}</td>
                    <td className="px-6 py-4">
                      {item.stock <= 0 ? <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">Out of Stock</span> : <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-medium">Low Stock</span>}
                    </td>
                  </tr>
                ))}
                {items.filter(i => i.stock <= i.minStock).length === 0 && <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">All items are sufficiently stocked</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}