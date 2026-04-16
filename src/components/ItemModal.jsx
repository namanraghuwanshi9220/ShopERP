import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ItemModal({ isOpen, onClose, onSave, item }) {
  const defaultState = { name: '', category: 'Mobile', price: 0, stock: 0, minStock: 2, sku: '', unit: 'Pcs', ram: '', rom: '', color: '', imei: '' };
  const [formData, setFormData] = useState(defaultState);

  useEffect(() => {
    if (item) setFormData({ ...defaultState, ...item });
    else setFormData(defaultState);
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      ...formData, 
      price: Number(formData.price), 
      stock: Number(formData.stock), 
      minStock: Number(formData.minStock) 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">{item ? 'Edit Item' : 'Add New Item'}</h2>
          <button onClick={onClose}><X className="text-gray-500 hover:text-red-500 transition" /></button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          <form id="itemForm" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium mb-1 text-gray-700">Category</label>
                <select className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-primary focus:border-primary" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="Mobile">Mobile Phone</option>
                  <option value="Cover">Mobile Cover</option>
                  <option value="Glass">Tempered Glass</option>
                  <option value="Accessories">Accessories (Charger, Earphone)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium mb-1 text-gray-700">Item / Model Name</label>
                <input required className="w-full border rounded-lg px-3 py-2 focus:ring-primary focus:border-primary" placeholder="e.g. iPhone 15 / Samsung S23" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
            </div>

            {/* DEDICATED MOBILE SECTION */}
            {formData.category === 'Mobile' && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-3">
                <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Mobile Specifications</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-xs font-medium mb-1">RAM</label><input placeholder="e.g. 8GB" className="w-full border rounded px-2 py-1.5 text-sm" value={formData.ram} onChange={e => setFormData({...formData, ram: e.target.value})} /></div>
                  <div><label className="block text-xs font-medium mb-1">ROM (Storage)</label><input placeholder="e.g. 128GB" className="w-full border rounded px-2 py-1.5 text-sm" value={formData.rom} onChange={e => setFormData({...formData, rom: e.target.value})} /></div>
                  <div><label className="block text-xs font-medium mb-1">Color</label><input placeholder="e.g. Black" className="w-full border rounded px-2 py-1.5 text-sm" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} /></div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">IMEI Numbers (Comma separated for multiple stock)</label>
                  <textarea rows="2" placeholder="e.g. 8392837492..., 8392837493..." className="w-full border rounded px-2 py-1.5 text-sm" value={formData.imei} onChange={e => setFormData({...formData, imei: e.target.value})}></textarea>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1 text-gray-700">Unit</label>
                <select className="w-full border rounded-lg px-3 py-2 bg-white" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                  <option value="Pcs">Pcs (Pieces)</option><option value="Box">Box</option><option value="Kg">Kg</option><option value="Ltr">Ltr</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">SKU / Barcode</label><input className="w-full border rounded-lg px-3 py-2" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">Price (₹)</label><input type="number" step="0.01" required className="w-full border rounded-lg px-3 py-2" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">Stock Qty</label><input type="number" step="any" required className="w-full border rounded-lg px-3 py-2" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} /></div>
            </div>
          </form>
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <button type="submit" form="itemForm" className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-md hover:bg-primary-dark transition">Save Item</button>
        </div>
      </div>
    </div>
  );
}