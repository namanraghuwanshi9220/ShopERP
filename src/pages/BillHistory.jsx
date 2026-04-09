import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useBillStore } from '../store/useBillStore';
import { useShopStore } from '../store/useShopStore';
import { Search, Printer } from 'lucide-react';
import PrintBill from '../components/PrintBill';

export default function BillHistory() {
  const { user } = useAuthStore();
  const { bills, fetchBills, loading } = useBillStore();
  const { profile } = useShopStore();
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => { if (user) fetchBills(user.uid); }, [user, fetchBills]);

  const filteredBills = bills.filter(b => 
    b.billNo.toLowerCase().includes(search.toLowerCase()) || 
    (b.customerName || '').toLowerCase().includes(search.toLowerCase())
  );

  if (selectedBill) {
    return (
      <div className="flex flex-col h-full bg-white relative">
        <div className="print:hidden p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold">Bill #{selectedBill.billNo}</h2>
          <div className="space-x-4">
            <button onClick={() => setSelectedBill(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-100 font-medium">Back to History</button>
            <button onClick={() => window.print()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium">Print</button>
          </div>
        </div>
        <div className="flex-1 overflow-auto"><PrintBill bill={selectedBill} profile={profile} /></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Bill History</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search by Bill No or Customer..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:border-primary" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3">Bill No</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3 text-center">Items</th>
                <th className="px-6 py-3 text-center">Payment</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
             {loading && bills.length === 0 ? <tr><td colSpan="7" className="text-center py-8 text-gray-500 font-medium">Fetching Bills...</td></tr> : 
               filteredBills.map(bill => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-primary">{bill.billNo}</td>
                  <td className="px-6 py-4">{new Date(bill.createdAt).toLocaleDateString()} {new Date(bill.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                  <td className="px-6 py-4">{bill.customerName || <span className="text-gray-400 italic">Cash Customer</span>}</td>
                  <td className="px-6 py-4 text-center">{bill.items.length}</td>
                  <td className="px-6 py-4 text-center"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{bill.paymentMode}</span></td>
                  <td className="px-6 py-4 text-right font-medium">{profile?.currency}{bill.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => setSelectedBill(bill)} className="text-gray-500 hover:text-primary"><Printer size={20} /></button>
                  </td>
                </tr>
              ))}
              {!loading && filteredBills.length === 0 && <tr><td colSpan="7" className="text-center py-8 text-gray-500">No bills found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}