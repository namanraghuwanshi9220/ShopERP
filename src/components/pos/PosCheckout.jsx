import { Landmark, FileText } from 'lucide-react';
import { useToastStore } from '../store/useToastStore'; 

export default function PosCheckout({ 
  customer, setCustomer, settings, setSettings, finance, setFinance, profile, 
  subtotal, discountAmt, totalGstAmt, totalPakka, cartLength, generating, handleCheckout 
}) {
  
  const { addToast } = useToastStore(); // Hook for toasts

  // CUSTOM VALIDATION FUNCTION
  const validateAndCheckout = (isEstimate) => {
    // 1. Validation Checks
    if (!customer.name.trim()) return addToast("Please enter Customer Name", "error");
    if (!customer.phone.trim()) return addToast("Please enter Customer Phone Number", "error");
    
    // Check for Finance Validation
    if (settings.paymentMode === 'Finance') {
      if (!finance.downPayment || !finance.emiMonths || !finance.emiAmount) {
        return addToast("Please fill all Finance Details", "error");
      }
    }

    // 2. Proceed to checkout if all good
    handleCheckout(isEstimate);
  };

  // CHECK IF CORE FORM IS INCOMPLETE FOR BUTTON DISABLE
  const isFormIncomplete = !customer.name.trim() || !customer.phone.trim();

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
        
        {/* CUSTOMER DETAILS FORM */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Customer Name *" 
              className={`w-1/2 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none font-bold ${!customer.name.trim() ? 'border-red-300 bg-red-50 placeholder-red-300' : 'border-gray-300 placeholder-gray-400'}`} 
              value={customer.name} 
              onChange={e => setCustomer({...customer, name: e.target.value})} 
            />
            <input 
              type="text" 
              placeholder="Phone Number *" 
              className={`w-1/2 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none font-bold ${!customer.phone.trim() ? 'border-red-300 bg-red-50 placeholder-red-300' : 'border-gray-300 placeholder-gray-400'}`} 
              value={customer.phone} 
              onChange={e => setCustomer({...customer, phone: e.target.value})} 
            />
          </div>
          
          {/* ADDRESS INPUT INCLUDED PROPERLY */}
          <input 
            type="text" 
            placeholder="Customer Address (Optional)" 
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none font-medium text-gray-700 bg-gray-50 placeholder-gray-400" 
            value={customer.address || ''} 
            onChange={e => setCustomer({...customer, address: e.target.value})} 
          />
        </div>
        
        {/* BILLING SETTINGS */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div><label className="block text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-wider">Discount %</label><input type="number" className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm font-bold text-red-600 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" value={settings.discount} onChange={e => setSettings({...settings, discount: Number(e.target.value)})} /></div>
          <div><label className="block text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-wider">GST %</label><input type="number" className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary" value={settings.gst} onChange={e => setSettings({...settings, gst: Number(e.target.value)})} /></div>
          <div>
            <label className="block text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-wider">Payment</label>
            <select 
              className={`w-full border border-gray-300 rounded-md px-2 py-2 text-sm font-bold outline-none focus:ring-1 ${settings.paymentMode === 'Finance' ? 'bg-blue-50 text-blue-700 border-blue-300 focus:ring-blue-500' : 'focus:ring-primary focus:border-primary'}`} 
              value={settings.paymentMode} 
              onChange={e => setSettings({...settings, paymentMode: e.target.value})}
            >
              <option value="Cash">Cash</option><option value="UPI">UPI</option><option value="Card">Card</option><option value="Finance">Finance</option>
            </select>
          </div>
        </div>

        {/* DYNAMIC FINANCE UI */}
        {settings.paymentMode === 'Finance' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3 mt-3 shadow-inner">
            <div className="flex items-center gap-1.5 text-blue-800">
              <Landmark size={16} />
              <h4 className="text-xs font-black uppercase tracking-wider">Finance Details</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="block text-[10px] text-blue-700 font-bold mb-0.5">Provider</label>
                <select className="w-full border border-blue-200 rounded px-2 py-1.5 text-xs font-bold outline-none text-blue-900 bg-white" value={finance.provider} onChange={e => setFinance({...finance, provider: e.target.value})}>
                  <option value="Bajaj Finserv">Bajaj Finserv</option>
                  <option value="TVS Credit">TVS Credit</option>
                  <option value="Home Credit">Home Credit</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="IDFC First">IDFC First</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div><label className="block text-[10px] text-blue-700 font-bold mb-0.5">Down Payment ({profile?.currency})</label><input type="number" className="w-full border border-blue-200 rounded px-2 py-1.5 text-xs font-bold outline-none text-blue-900 bg-white" value={finance.downPayment} onChange={e => setFinance({...finance, downPayment: e.target.value})} /></div>
              <div><label className="block text-[10px] text-blue-700 font-bold mb-0.5">EMI Months</label><input type="number" placeholder="e.g. 6" className="w-full border border-blue-200 rounded px-2 py-1.5 text-xs font-bold outline-none text-blue-900 bg-white" value={finance.emiMonths} onChange={e => setFinance({...finance, emiMonths: e.target.value})} /></div>
              <div className="col-span-2"><label className="block text-[10px] text-blue-700 font-bold mb-0.5">Monthly EMI ({profile?.currency})</label><input type="number" className="w-full border border-blue-200 rounded px-2 py-1.5 text-xs font-bold outline-none text-blue-900 bg-white" value={finance.emiAmount} onChange={e => setFinance({...finance, emiAmount: e.target.value})} /></div>
            </div>
          </div>
        )}
        
        {/* TOTALS PANEL */}
        <div className="pt-3 border-t border-gray-200 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600 font-bold"><span>Subtotal</span><span>{profile?.currency}{subtotal.toFixed(2)}</span></div>
          {discountAmt > 0 && <div className="flex justify-between text-red-500 font-bold"><span>Discount</span><span>-{profile?.currency}{discountAmt.toFixed(2)}</span></div>}
          {totalGstAmt > 0 && <div className="flex justify-between text-gray-500 font-medium text-xs"><span>Tax ({settings.gst}%)</span><span>+{profile?.currency}{totalGstAmt.toFixed(2)}</span></div>}
          <div className="flex justify-between text-2xl font-black text-gray-900 pt-2 border-t mt-2"><span>Total</span><span>{profile?.currency}{totalPakka.toFixed(2)}</span></div>
        </div>
      </div>

      {/* CHECKOUT BUTTONS */}
      <div className="flex gap-3">
        {/* KACCHA BILL BUTTON */}
        <button 
          onClick={() => validateAndCheckout(true)} 
          disabled={generating || cartLength === 0 || isFormIncomplete} 
          className={`w-1/3 py-3.5 border-2 text-sm font-black rounded-xl flex items-center justify-center gap-1.5 uppercase shadow-sm transition ${generating || cartLength === 0 || isFormIncomplete ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-800 text-gray-800 hover:bg-gray-100'}`}
        >
          <FileText size={18} /> Kaccha
        </button>
        
        {/* PAKKA BILL BUTTON */}
        <button 
          onClick={() => validateAndCheckout(false)} 
          disabled={generating || cartLength === 0 || isFormIncomplete} 
          className={`w-2/3 py-3.5 text-lg font-black rounded-xl shadow-lg transition uppercase tracking-wide border ${generating || cartLength === 0 || isFormIncomplete ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white border-green-700 hover:bg-green-700'}`}
        >
          {generating ? 'Processing...' : 'Pakka Bill'}
        </button>
      </div>
    </div>
  );
}