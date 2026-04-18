import { ShoppingCart, Clock, Save, Trash2, Edit2, Minus, Plus, User, Landmark, FileText, X } from 'lucide-react';

export default function CartSidebar({
  isOpen, toggleCart, cart, updateQty, sanitizeQty, updatePrice, sanitizePrice, removeCartItem,
  customer, setCustomer, settings, setSettings, finance, setFinance,
  subtotal, discountAmt, totalGstAmt, totalPakka, drafts, holdCurrentBill, clearActiveSession,
  handleCheckout, generating, setIsDraftsModalOpen, currency
}) {
  
  // Custom Handler to PREVENT Alphabets (e, -, +) AND Arrow Keys (Up/Down)
  const handleKeyDown = (e) => {
    if (['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <>
      {/* OVERLAY FOR MOBILE */}
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 transition-opacity" onClick={toggleCart}></div>}

      {/* RIGHT SIDEBAR DRAWER */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full md:w-[480px] bg-gray-50 shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* HEADER */}
        <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-2">
            <button onClick={toggleCart} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition"><X size={24}/></button>
            <ShoppingCart size={22} className="text-primary ml-1" />
            <span className="font-black text-gray-900 text-lg">Cart</span>
            <span className="bg-primary text-white px-2.5 py-0.5 rounded-full text-xs font-bold">{cart.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsDraftsModalOpen(true)} className="flex items-center gap-1.5 text-xs font-bold bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg shadow-sm transition">
              <Clock size={14}/> Drafts <span className="bg-gray-800 text-white rounded-full px-1.5 py-0.5">{drafts.length}</span>
            </button>
            {(cart.length > 0 || customer.name) && (
              <>
                <button onClick={holdCurrentBill} className="flex items-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-3 py-2 rounded-lg shadow-sm transition" title="Hold Bill"><Save size={14}/> Hold</button>
                <button onClick={() => clearActiveSession("Cart Cleared")} className="flex items-center justify-center bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white p-2 rounded-lg shadow-sm transition"><Trash2 size={16}/></button>
              </>
            )}
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          
          {/* CART ITEMS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {cart.map(item => (
              <div key={`${item.id}-${item.soldImei}`} className="flex flex-col p-4 border-b border-dashed border-gray-200 last:border-0 hover:bg-gray-50 transition group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-3">
                    <p className="font-black text-sm text-gray-900 leading-tight">{item.name}</p>
                    {item.soldImei && <p className="text-[11px] font-mono font-bold text-blue-800 bg-blue-50 inline-block px-2 py-1 rounded mt-1.5 border border-blue-200">IMEI: {item.soldImei}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Amount</p>
                    <div className="font-black text-lg text-gray-900">{currency}{(Number(item.cartPrice || 0) * Number(item.qty || 1)).toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex items-end justify-between border-t border-gray-100 pt-3">
                  {/* QUANTITY EDITOR */}
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block">Quantity</span>
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm">
                      <button onClick={() => sanitizeQty(item.id, item.soldImei, (Number(item.qty) || 0) - 1)} className="w-10 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-200 text-gray-700 transition"><Minus size={16}/></button>
                      <input 
                        type="number" 
                        min="0"
                        onKeyDown={handleKeyDown}
                        className="w-14 text-center text-sm font-black outline-none border-x border-gray-200 focus:bg-blue-50 focus:text-blue-700 transition" 
                        value={item.qty === 0 ? '' : item.qty} 
                        onChange={(e) => updateQty(item.id, item.soldImei, e.target.value)} 
                        onBlur={(e) => sanitizeQty(item.id, item.soldImei, e.target.value)} 
                      />
                      <button onClick={() => sanitizeQty(item.id, item.soldImei, (Number(item.qty) || 0) + 1)} className="w-10 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-200 text-gray-700 transition"><Plus size={16}/></button>
                    </div>
                  </div>

                  {/* PRICE EDITOR */}
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Edit2 size={10} className="text-primary"/> Unit Price</span>
                    <div className="flex items-center bg-yellow-50 border border-yellow-300 rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-yellow-400 transition-all">
                      <span className="px-3 py-2 text-sm text-yellow-800 font-black bg-yellow-100 border-r border-yellow-300">{currency}</span>
                      <input 
                        type="number" 
                        min="0"
                        onKeyDown={handleKeyDown}
                        className="w-24 text-right font-black text-sm text-yellow-900 bg-transparent px-3 py-2 outline-none" 
                        value={item.cartPrice === 0 ? '' : item.cartPrice} 
                        onChange={(e) => updatePrice(item.id, item.soldImei, e.target.value)} 
                        onBlur={(e) => sanitizePrice(item.id, item.soldImei, e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="flex flex-col items-center justify-center text-gray-300 py-12">
                <ShoppingCart size={48} className="mb-3 text-gray-300"/>
                <p className="text-base font-black text-gray-400 uppercase tracking-widest">CART IS EMPTY</p>
              </div>
            )}
          </div>

          {/* CHECKOUT SETTINGS */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mt-2">
            <div className="space-y-3 mb-3">
              <div className="flex items-center gap-2 mb-2 text-gray-800">
                <User size={18} /><h3 className="font-black text-sm uppercase tracking-wider">Customer Details</h3>
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="Customer Name" className="w-1/2 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none font-bold" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                <input type="number" onKeyDown={handleKeyDown} placeholder="Phone Number" className="w-1/2 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none font-bold" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
              </div>
              <input type="text" placeholder="Full Address (Optional)" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none font-medium text-gray-700 bg-gray-50" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
              <div><label className="block text-[10px] text-gray-500 mb-1 font-bold uppercase">Discount %</label><input type="number" onKeyDown={handleKeyDown} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm font-black text-red-600 outline-none focus:ring-2 focus:ring-red-500 shadow-sm" value={settings.discount === 0 ? '' : settings.discount} onChange={e => setSettings({...settings, discount: e.target.value})} placeholder="0" /></div>
              <div><label className="block text-[10px] text-gray-500 mb-1 font-bold uppercase">Tax (GST) %</label><input type="number" onKeyDown={handleKeyDown} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm font-black outline-none focus:ring-2 focus:ring-primary shadow-sm" value={settings.gst === 0 ? '' : settings.gst} onChange={e => setSettings({...settings, gst: e.target.value})} placeholder="0" /></div>
              <div><label className="block text-[10px] text-gray-500 mb-1 font-bold uppercase">Payment</label><select className={`w-full border border-gray-300 rounded-lg px-2 py-2 text-sm font-black outline-none focus:ring-2 shadow-sm ${settings.paymentMode === 'Finance' ? 'bg-blue-50 text-blue-700 border-blue-400' : 'focus:ring-primary'}`} value={settings.paymentMode} onChange={e => setSettings({...settings, paymentMode: e.target.value})}><option value="Cash">Cash</option><option value="UPI">UPI</option><option value="Card">Card</option><option value="Finance">Finance</option></select></div>
            </div>

            {settings.paymentMode === 'Finance' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-3 space-y-3 shadow-inner">
                <div className="flex items-center gap-2 text-blue-800"><Landmark size={18} /><h4 className="text-xs font-black uppercase tracking-widest">Finance Plan</h4></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><label className="block text-[10px] text-blue-700 font-bold mb-1 uppercase">Provider</label><select className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm font-bold outline-none text-blue-900 shadow-sm" value={finance.provider} onChange={e => setFinance({...finance, provider: e.target.value})}><option value="Bajaj Finserv">Bajaj Finserv</option><option value="TVS Credit">TVS Credit</option><option value="IDFC First">IDFC First</option><option value="Other">Other</option></select></div>
                  <div><label className="block text-[10px] text-blue-700 font-bold mb-1 uppercase">Down Payment</label><input type="number" onKeyDown={handleKeyDown} className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm font-bold outline-none text-blue-900 shadow-sm" value={finance.downPayment} onChange={e => setFinance({...finance, downPayment: e.target.value})} /></div>
                  <div><label className="block text-[10px] text-blue-700 font-bold mb-1 uppercase">EMI Months</label><input type="number" onKeyDown={handleKeyDown} placeholder="6" className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm font-bold outline-none text-blue-900 shadow-sm" value={finance.emiMonths} onChange={e => setFinance({...finance, emiMonths: e.target.value})} /></div>
                  <div className="col-span-2"><label className="block text-[10px] text-blue-700 font-bold mb-1 uppercase">Monthly EMI Amount</label><input type="number" onKeyDown={handleKeyDown} className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm font-bold outline-none text-blue-900 shadow-sm" value={finance.emiAmount} onChange={e => setFinance({...finance, emiAmount: e.target.value})} /></div>
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t-2 border-gray-800 space-y-2 text-sm mt-3">
              <div className="flex justify-between text-gray-600 font-bold"><span>Subtotal</span><span className="text-gray-900">{currency}{subtotal.toFixed(2)}</span></div>
              {discountAmt > 0 && <div className="flex justify-between text-red-600 font-bold"><span>Discount</span><span>-{currency}{discountAmt.toFixed(2)}</span></div>}
              {totalGstAmt > 0 && <div className="flex justify-between text-gray-500 font-bold text-xs"><span>Tax ({(Number(settings.gst)||0)}%)</span><span>+{currency}{totalGstAmt.toFixed(2)}</span></div>}
              <div className="flex justify-between text-3xl font-black text-primary pt-3 border-t border-gray-200 mt-2"><span>Total</span><span>{currency}{totalPakka.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        {/* BOTTOM BUTTONS */}
        <div className="p-4 bg-white border-t border-gray-200 flex gap-3 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
          <button onClick={() => handleCheckout(true)} disabled={generating || cart.length === 0} className="w-1/3 py-4 bg-white border-2 border-gray-300 text-gray-700 text-sm font-black rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
            <FileText size={18} /> Kaccha
          </button>
          <button onClick={() => handleCheckout(false)} disabled={generating || cart.length === 0} className="w-2/3 py-4 bg-gray-900 text-white text-lg font-black rounded-xl shadow-xl hover:bg-black transition-all disabled:opacity-50 tracking-wider">
            {generating ? 'Processing...' : 'Pakka Bill'}
          </button>
        </div>

      </div>
    </>
  );
}