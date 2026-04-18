import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useBillStore } from '../store/useBillStore';
import { useShopStore } from '../store/useShopStore';
import { Search, Printer, FileText, CheckCircle2, ChevronLeft } from 'lucide-react';
import PrintBill from '../components/PrintBill';

export default function BillHistory() {
  const { user } = useAuthStore();
  const { bills = [], estimates = [], fetchBills, fetchEstimates, loading } = useBillStore();
  const { profile } = useShopStore();
  
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pakka'); // 'pakka' or 'kaccha'
  const [selectedBill, setSelectedBill] = useState(null);

  // LOAD BOTH DATA STREAMS ON MOUNT
  useEffect(() => { 
    if (user) {
      fetchBills(user.uid); 
      fetchEstimates(user.uid);
    }
  }, [user, fetchBills, fetchEstimates]);

  // SWITCH BETWEEN PAKKA AND KACCHA LOGIC
  const currentList = activeTab === 'pakka' ? (bills || []) : (estimates || []);

  const filteredBills = currentList.filter(b => {
    const searchStr = `${b.billNo} ${b.customerName} ${b.customerPhone}`.toLowerCase();
    return searchStr.includes(search.toLowerCase());
  });

  // SMART PDF PRINT WITH AUTO-NAME
  const handlePrint = (billObj) => {
    setSelectedBill(billObj);
    setTimeout(() => { window.print(); }, 200);
  };

  // IF A BILL IS SELECTED TO PRINT/PREVIEW
  if (selectedBill) {
    return (
      <div className="flex flex-col h-full bg-white relative print:bg-white print:fixed print:inset-0 print:z-50">
        <div className="print:hidden p-5 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedBill(null)} className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm text-gray-600"><ChevronLeft size={20}/></button>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">
              Preview: <span className={selectedBill.isEstimate ? 'text-amber-600' : 'text-primary'}>{selectedBill.billNo}</span>
            </h2>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black font-black shadow-lg uppercase tracking-wider transition"><Printer size={18}/> Print File</button>
        </div>
        <div className="flex-1 overflow-auto bg-white p-4 print:p-0"><PrintBill bill={selectedBill} profile={profile} /></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-5">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <FileText className="text-primary" size={28}/> Bill Records
        </h1>
        
        <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200 shadow-inner">
          <button onClick={() => setActiveTab('pakka')} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black text-sm transition-all uppercase tracking-wider ${activeTab === 'pakka' ? 'bg-white text-green-700 shadow-sm border border-green-100' : 'text-gray-500 hover:text-gray-700'}`}>
            <CheckCircle2 size={16}/> Pakka Bills
          </button>
          <button onClick={() => setActiveTab('kaccha')} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black text-sm transition-all uppercase tracking-wider ${activeTab === 'kaccha' ? 'bg-white text-amber-600 shadow-sm border border-amber-100' : 'text-gray-500 hover:text-gray-700'}`}>
            <FileText size={16}/> Kaccha Bills
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex gap-4">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder={`Search by ${activeTab === 'pakka' ? 'Invoice' : 'Estimate'} No. or Customer...`} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none font-bold text-gray-800 placeholder-gray-400 bg-gray-50 focus:bg-white transition" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10 shadow-sm border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px]">Document No.</th>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px]">Date & Time</th>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px]">Customer</th>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px] text-center">Items</th>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px] text-center">Payment</th>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px] text-right">Total Amount</th>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && currentList.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-12 text-gray-400 font-bold uppercase tracking-widest">Loading records...</td></tr>
              ) : filteredBills.map(bill => (
                <tr key={bill.id} className="hover:bg-gray-50/80 transition group">
                  
                  {/* DOCUMENT NUMBER */}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded border font-black text-xs uppercase tracking-wider ${bill.isEstimate ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                      {bill.billNo}
                    </span>
                  </td>
                  
                  {/* DATE & TIME */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{new Date(bill.createdAt).toLocaleDateString('en-GB')}</div>
                    <div className="text-[10px] text-gray-500 font-bold mt-0.5 uppercase">{new Date(bill.createdAt).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}</div>
                  </td>
                  
                  {/* CUSTOMER */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{bill.customerName || <span className="text-gray-400 italic font-medium">Cash Customer</span>}</div>
                    {bill.customerPhone && <div className="text-[10px] font-mono text-gray-500 mt-0.5">{bill.customerPhone}</div>}
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    <span className="font-black text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 text-[11px]">{bill.items?.length || 0}</span>
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wide border ${bill.paymentMode === 'Finance' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {bill.paymentMode || 'Cash'}
                    </span>
                  </td>
                  
                  {/* AMOUNT */}
                  <td className="px-6 py-4 text-right">
                    <span className="font-black text-gray-900 text-base">{profile?.currency || '₹'}{(Number(bill.total)||0).toFixed(2)}</span>
                  </td>
                  
                  {/* ACTION */}
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handlePrint(bill)} 
                      className="p-2 bg-white border border-gray-300 text-gray-600 hover:text-primary hover:border-primary hover:bg-primary/5 rounded-lg transition shadow-sm" 
                      title="Preview & Print"
                    >
                      <Printer size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredBills.length === 0 && (
                <tr><td colSpan="7" className="text-center py-12"><div className="flex flex-col items-center justify-center text-gray-400"><FileText size={48} className="mb-3 opacity-20"/><p className="font-black uppercase tracking-widest text-sm">No {activeTab} bills found</p></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}