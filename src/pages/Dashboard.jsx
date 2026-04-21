import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useShopStore } from '../store/useShopStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useBillStore } from '../store/useBillStore';
import { IndianRupee, Receipt, PackageSearch, AlertTriangle, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { profile } = useShopStore();
  const { items = [], fetchItems } = useInventoryStore();
  const { bills = [], fetchBills } = useBillStore();
  
  const [reportRange, setReportRange] = useState('Today');

  useEffect(() => {
    if (user) { 
      fetchItems(user.uid); 
      fetchBills(user.uid); 
    }
  }, [user, fetchItems, fetchBills]);

  // STATS CALCULATION
  const today = new Date().toISOString().split('T')[0];
  const todayBills = bills.filter(b => b.createdAt?.startsWith(today));
  const todaySales = todayBills.reduce((acc, bill) => acc + (Number(bill.total) || 0), 0);
  
  const lowStockItems = items.filter(i => (i.minStock || 0) > 0 && (i.stock || 0) <= (i.minStock || 0));
  const outOfStockCount = items.filter(i => (i.stock || 0) <= 0).length;

  // EXCEL / CSV EXPORT
  const handleExport = () => {
    const now = new Date();
    let filteredBills = bills;

    if (reportRange === 'Today') {
      const todayStr = now.toISOString().split('T')[0];
      filteredBills = bills.filter(b => b.createdAt?.startsWith(todayStr));
    } else if (reportRange === 'Weekly') {
      const lastWeek = new Date(now.setDate(now.getDate() - 7));
      filteredBills = bills.filter(b => b.createdAt && new Date(b.createdAt) >= lastWeek);
    } else if (reportRange === 'Monthly') {
      const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
      filteredBills = bills.filter(b => b.createdAt && new Date(b.createdAt) >= lastMonth);
    } else if (reportRange === 'Yearly') {
      const lastYear = new Date(now.setFullYear(now.getFullYear() - 1));
      filteredBills = bills.filter(b => b.createdAt && new Date(b.createdAt) >= lastYear);
    }

    if (filteredBills.length === 0) {
      alert(`No sales found for: ${reportRange}`);
      return;
    }

    let csvContent = "Bill No,Date,Customer Name,Phone,Payment Mode,Subtotal,Discount,Tax,Total Amount,Items Sold\n";
    filteredBills.forEach(b => {
      const itemsStr = (b.items || []).map(i => `${i.name || 'Unknown'} (${i.qty || 1})`).join(" | ").replace(/,/g, '');
      const dateStr = b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-GB') : 'Unknown';
      const cName = (b.customerName || 'Cash').replace(/,/g, '');
      csvContent += `${b.billNo || 'N/A'},${dateStr},${cName},${b.customerPhone || 'N/A'},${b.paymentMode || 'Cash'},${b.subtotal || 0},${b.discount || 0},${b.gstAmt || 0},${b.total || 0},"${itemsStr}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ShopERP_Sales_${reportRange}.csv`;
    link.click();
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, bgClass, iconClass }) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 border ${bgClass} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group bg-white`}>
      <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
        <Icon size={120} />
      </div>
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">{title}</p>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs font-bold text-gray-400 mt-2">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${iconClass} shadow-inner`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-5 pb-8 animate-fade-in">
      
      {/* HEADER & EXPORT CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>

        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-sm w-full sm:w-auto">
          <select 
            className="bg-white border border-gray-200 text-gray-700 text-xs font-black rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow cursor-pointer flex-1 sm:flex-none shadow-sm uppercase tracking-wide"
            value={reportRange}
            onChange={(e) => setReportRange(e.target.value)}
          >
            <option value="Today">Today's Report</option>
            <option value="Weekly">Last 7 Days</option>
            <option value="Monthly">Last 30 Days</option>
            <option value="Yearly">This Year</option>
            <option value="All Time">All Time</option>
          </select>
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-black text-xs transition-all shadow-md hover:shadow-xl flex-1 sm:flex-none uppercase tracking-wide"
          >
            <FileSpreadsheet size={16} /> Export
          </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Today's Revenue" 
          value={`${profile?.currency || '₹'}${todaySales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          subtitle={`${todayBills.length} invoices generated`}
          icon={IndianRupee} 
          bgClass="border-green-100" 
          iconClass="bg-green-100 text-green-600" 
        />
        <StatCard 
          title="Invoices Today" 
          value={todayBills.length} 
          subtitle="Total transactions"
          icon={Receipt} 
          bgClass="border-blue-100" 
          iconClass="bg-blue-100 text-blue-600" 
        />
        <StatCard 
          title="Total Inventory" 
          value={items.length} 
          subtitle="Unique products in DB"
          icon={PackageSearch} 
          bgClass="border-purple-100" 
          iconClass="bg-purple-100 text-purple-600" 
        />
        <StatCard 
          title="Attention Needed" 
          value={lowStockItems.length} 
          subtitle={`${outOfStockCount} completely out of stock`}
          icon={AlertTriangle} 
          bgClass="border-red-100" 
          iconClass="bg-red-100 text-red-600" 
        />
      </div>

      {/* DATA TABLES */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 flex-1 min-h-0">
        
        {/* RECENT BILLS */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col overflow-hidden max-h-[500px]">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 z-10">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Receipt size={16} strokeWidth={2.5} /></div>
              <h2 className="font-black text-gray-800 text-xs uppercase tracking-widest">Recent Transactions</h2>
            </div>
            <Link to="/history" className="flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition uppercase tracking-widest shadow-sm">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          
          <div className="overflow-y-auto flex-1 p-3">
            <div className="flex flex-col gap-2">
              {bills.slice(0, 10).map((b, index) => (
                <div key={b.id || index} className="flex justify-between items-center p-3 border border-gray-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 transition-colors group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-500 text-xs border border-gray-200 group-hover:bg-blue-100 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors">
                      {b.customerName ? b.customerName.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <div className="font-black text-gray-900 text-sm leading-tight">{b.customerName || 'Cash Customer'}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{b.billNo}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-[10px] font-bold text-gray-400">{new Date(b.createdAt).toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-gray-900 text-base">{profile?.currency || '₹'}{(Number(b.total) || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                    <div className={`inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest border ${b.paymentMode === 'Finance' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                      {b.paymentMode || 'Cash'}
                    </div>
                  </div>
                </div>
              ))}
              {bills.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Receipt size={40} className="mb-3 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No bills generated yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LOW STOCK ALERTS */}
        <div className="bg-white rounded-3xl shadow-sm border border-red-100 flex flex-col overflow-hidden max-h-[500px]">
          <div className="px-6 py-4 border-b border-red-50 flex justify-between items-center bg-red-50/30 z-10">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-red-100 text-red-600 rounded-lg"><AlertTriangle size={16} strokeWidth={2.5} /></div>
              <h2 className="font-black text-red-900 text-xs uppercase tracking-widest">Inventory Alerts</h2>
            </div>
            <span className="text-[10px] font-black text-red-700 bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 uppercase tracking-widest shadow-sm">
              {lowStockItems.length} Warnings
            </span>
          </div>
          
          <div className="overflow-y-auto flex-1 p-3">
            <div className="flex flex-col gap-2">
              {lowStockItems.map((item, index) => (
                <div key={item.id || index} className="flex justify-between items-center p-3 border border-red-100 rounded-2xl hover:bg-red-50/50 transition-colors cursor-default">
                  <div>
                    <div className="font-black text-gray-900 text-sm leading-tight">{item.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 uppercase tracking-widest">{item.category}</span>
                      {item.stock <= 0 ? (
                        <span className="text-[9px] font-black text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200 uppercase tracking-widest">Out of Stock</span>
                      ) : (
                        <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-widest">Low Stock (Min: {item.minStock})</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Current</div>
                    <div className={`font-black text-lg leading-none ${item.stock <= 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.stock} <span className="text-[10px] font-bold text-gray-500">{item.unit || 'Pcs'}</span>
                    </div>
                  </div>
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-green-500">
                  <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center mb-3 border border-green-100">
                    <PackageSearch size={24} className="text-green-500 opacity-80" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-600">All items are fully stocked! 🎉</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}