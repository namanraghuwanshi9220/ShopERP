import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useBillStore } from '../store/useBillStore';
import { useShopStore } from '../store/useShopStore';
import { Search, Landmark, IndianRupee, Activity } from 'lucide-react';

export default function Finance() {
  const { user } = useAuthStore();
  const { bills, fetchBills, loading } = useBillStore();
  const { profile } = useShopStore();
  const [search, setSearch] = useState('');

  useEffect(() => { if (user) fetchBills(user.uid); }, [user, fetchBills]);

  // Filter ONLY Finance Bills
  const financeBills = bills.filter(b => b.paymentMode === 'Finance');

  // Search Filter
  const filteredBills = financeBills.filter(b => 
    b.billNo.toLowerCase().includes(search.toLowerCase()) || 
    (b.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.financeDetails?.provider || '').toLowerCase().includes(search.toLowerCase())
  );

  // Statistics Calculation
  const totalFinanceSales = financeBills.reduce((acc, curr) => acc + curr.total, 0);
  const totalDownPayment = financeBills.reduce((acc, curr) => acc + (Number(curr.financeDetails?.downPayment) || 0), 0);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-gray-800">Finance Records</h1>
      </div>

      {/* DASHBOARD STATS FOR FINANCE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Activity size={24} /></div>
          <div><p className="text-xs font-bold text-gray-400 uppercase">Total Finance Files</p><p className="text-xl font-black text-gray-800">{financeBills.length}</p></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Landmark size={24} /></div>
          <div><p className="text-xs font-bold text-gray-400 uppercase">Total Financed Amount</p><p className="text-xl font-black text-gray-800">{profile?.currency}{totalFinanceSales.toFixed(2)}</p></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-orange-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><IndianRupee size={24} /></div>
          <div><p className="text-xs font-bold text-gray-400 uppercase">DP Collected</p><p className="text-xl font-black text-gray-800">{profile?.currency}{totalDownPayment.toFixed(2)}</p></div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search Customer, Bill No, or Provider..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:border-primary outline-none font-medium" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* FINANCE TABLE */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm border-b">
              <tr>
                <th className="px-5 py-3 font-black text-xs uppercase tracking-wider">Date & Bill No</th>
                <th className="px-5 py-3 font-black text-xs uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 font-black text-xs uppercase tracking-wider">Provider</th>
                <th className="px-5 py-3 text-right font-black text-xs uppercase tracking-wider">DP Given</th>
                <th className="px-5 py-3 text-center font-black text-xs uppercase tracking-wider">EMI Plan</th>
                <th className="px-5 py-3 text-right font-black text-xs uppercase tracking-wider">Total Bill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && bills.length === 0 ? <tr><td colSpan="6" className="text-center py-8 text-gray-500 font-bold">Loading...</td></tr> : 
               filteredBills.map(bill => (
                <tr key={bill.id} className="hover:bg-blue-50 transition cursor-default">
                  <td className="px-5 py-3">
                    <div className="font-bold text-gray-900">{bill.billNo}</div>
                    <div className="text-xs text-gray-500 font-medium">{new Date(bill.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-bold text-gray-800">{bill.customerName}</div>
                    <div className="text-xs text-gray-500 font-medium">{bill.customerPhone}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-blue-100 text-blue-700 border border-blue-200 px-2 py-1 rounded text-xs font-bold uppercase">
                      {bill.financeDetails?.provider || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-black text-gray-800">
                    {profile?.currency}{Number(bill.financeDetails?.downPayment || 0).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="font-bold text-gray-800">{bill.financeDetails?.emiMonths} Months</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">@ {profile?.currency}{bill.financeDetails?.emiAmount}/mo</div>
                  </td>
                  <td className="px-5 py-3 text-right font-black text-primary text-base">
                    {profile?.currency}{bill.total.toFixed(2)}
                  </td>
                </tr>
              ))}
              {!loading && filteredBills.length === 0 && <tr><td colSpan="6" className="text-center py-10 text-gray-400 font-medium">No finance records found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}