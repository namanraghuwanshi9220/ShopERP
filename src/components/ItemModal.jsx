import { useState, useEffect } from 'react';
import { X, BellRing, BellOff } from 'lucide-react';

export default function ItemModal({ isOpen, onClose, onSave, item }) {
  const defaultState = { 
    name: '', category: 'Mobile', price: 0, stock: 0, minStock: 2, 
    sku: '', unit: 'Pcs', ram: '', rom: '', color: '', imei: '' 
  };
  
  const [formData, setFormData] = useState(defaultState);
  
  // NEW STATE: Toggle Low Stock Alert
  const [isAlertEnabled, setIsAlertEnabled] = useState(true);

  // Load data on open
  useEffect(() => {
    if (item) {
      setFormData({ ...defaultState, ...item });
      setIsAlertEnabled(item.minStock > 0); // Agar minStock 0 se bada hai, matlab alert ON tha.
    } else {
      setFormData(defaultState);
      setIsAlertEnabled(true);
    }
  }, [item, isOpen]);

  // SMART LOGIC: Auto-calculate stock based on IMEI count for Mobiles
  useEffect(() => {
    if (formData.category === 'Mobile') {
      const imeiList = formData.imei ? formData.imei.split(',').map(i => i.trim()).filter(Boolean) : [];
      setFormData(prev => ({ ...prev, stock: imeiList.length, unit: 'Pcs' }));
    }
  }, [formData.imei, formData.category]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Agar alert OFF hai, to strictly minStock ko 0 set kardo taaki alert na aaye
    const finalMinStock = isAlertEnabled ? Number(formData.minStock || 0) : 0;
    
    onSave({ 
      ...formData, 
      price: Number(formData.price || 0), 
      stock: Number(formData.stock || 0), 
      minStock: finalMinStock 
    });
  };

  const handleKeyDown = (e) => {
    if (['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">{item ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-1.5 bg-gray-200 text-gray-500 hover:text-red-500 hover:bg-red-100 rounded-full transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto flex-1 bg-white">
          <form id="itemForm" onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                <select 
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-gray-800" 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Mobile">Mobile Phone</option>
                  <option value="Cover">Mobile Cover</option>
                  <option value="Glass">Tempered Glass</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Product / Model Name</label>
                <input 
                  required 
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-gray-900 placeholder-gray-400" 
                  placeholder="e.g. iPhone 15 / Galaxy S23" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
            </div>

            {formData.category === 'Mobile' && (
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200 space-y-4 shadow-inner">
                <h3 className="text-[10px] font-black text-blue-800 uppercase tracking-widest border-b border-blue-200 pb-2">Mobile Specifications</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">RAM</label>
                    <input placeholder="8GB" className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-400 bg-white" value={formData.ram} onChange={e => setFormData({...formData, ram: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">ROM (Storage)</label>
                    <input placeholder="256GB" className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-400 bg-white" value={formData.rom} onChange={e => setFormData({...formData, rom: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">Color</label>
                    <input placeholder="Black" className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-400 bg-white" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">IMEI Numbers (Comma separated)</label>
                  <textarea 
                    rows="3" 
                    placeholder="Scan or type IMEIs here. Example: 8392837492, 8392837493" 
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm font-mono font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-400 leading-relaxed bg-white shadow-sm" 
                    value={formData.imei} 
                    onChange={e => setFormData({...formData, imei: e.target.value})}
                  ></textarea>
                  <p className="text-[10px] text-blue-600 font-bold mt-1.5 flex justify-between">
                    <span>*Stock quantity auto-updates.</span>
                    <span className="bg-blue-200 px-2 py-0.5 rounded-full text-blue-800">Count: {formData.imei ? formData.imei.split(',').filter(i=>i.trim()).length : 0}</span>
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">SKU / Barcode</label>
                <input 
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-gray-900" 
                  placeholder="Optional" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Selling Price (₹)</label>
                <input 
                  type="number" step="any" min="0" required onKeyDown={handleKeyDown}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-black text-primary text-lg" 
                  value={formData.price === 0 ? '' : formData.price} onChange={e => setFormData({...formData, price: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                  Current Stock {formData.category === 'Mobile' && <span className="text-red-500 lowercase normal-case text-[9px]">(Auto)</span>}
                </label>
                <div className="flex gap-2">
                  <input 
                    type="number" step="any" min="0" required onKeyDown={handleKeyDown}
                    className={`w-full border-2 rounded-xl px-4 py-2.5 outline-none transition-all font-black text-lg ${formData.category === 'Mobile' ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-50 border-gray-200 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary text-gray-900'}`}
                    value={formData.stock === 0 && formData.category !== 'Mobile' ? '' : formData.stock} 
                    onChange={e => setFormData({...formData, stock: e.target.value})} readOnly={formData.category === 'Mobile'} 
                  />
                  <select 
                    className="w-24 border-2 border-gray-200 rounded-xl px-2 py-2.5 bg-white font-bold text-gray-800 outline-none focus:border-primary disabled:opacity-50" 
                    value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} disabled={formData.category === 'Mobile'} 
                  >
                    <option value="Pcs">Pcs</option><option value="Box">Box</option><option value="Pkt">Pkt</option>
                  </select>
                </div>
              </div>

              {/* NEW: ALERT TOGGLE FEATURE */}
              <div>
                <label className="flex items-center justify-between text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                  <span>Low Stock Alert</span>
                  <button type="button" onClick={() => setIsAlertEnabled(!isAlertEnabled)} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] transition-colors ${isAlertEnabled ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-gray-200 text-gray-500 border border-gray-300'}`}>
                    {isAlertEnabled ? <><BellRing size={12} /> ON</> : <><BellOff size={12} /> OFF</>}
                  </button>
                </label>
                
                {isAlertEnabled ? (
                  <input 
                    type="number" step="any" min="1" required onKeyDown={handleKeyDown}
                    className="w-full border-2 border-amber-200 rounded-xl px-4 py-2.5 bg-amber-50 focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-black text-lg text-amber-900" 
                    placeholder="Alert below..." value={formData.minStock === 0 ? '' : formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} 
                  />
                ) : (
                  <div className="w-full border-2 border-dashed border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-400 font-bold text-sm flex items-center justify-center">
                    Alert Disabled
                  </div>
                )}
              </div>

            </div>
          </form>
        </div>
        
        <div className="p-5 border-t bg-gray-50 flex justify-end">
          <button type="submit" form="itemForm" className="w-full bg-gray-900 text-white font-black py-4 rounded-xl shadow-lg hover:bg-black hover:shadow-xl transition-all uppercase tracking-widest text-sm">
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
}