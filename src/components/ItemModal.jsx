import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ItemModal({ isOpen, onClose, onSave, item }) {
  const [formData, setFormData] = useState({ name: '', category: '', price: 0, stock: 0, minStock: 5, sku: '', unit: 'Pcs' });

  useEffect(() => {
    if (item) setFormData(item);
    else setFormData({ name: '', category: '', price: 0, stock: 0, minStock: 5, sku: '', unit: 'Pcs' });
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, price: Number(formData.price), stock: Number(formData.stock), minStock: Number(formData.minStock) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">{item ? 'Edit Item' : 'Add New Item'}</h2>
          <button onClick={onClose}><X className="text-gray-500 hover:text-gray-700" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div><label className="block text-sm font-medium mb-1">Item Name</label><input required className="w-full border rounded px-3 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Category</label><input required className="w-full border rounded px-3 py-2" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select className="w-full border rounded px-3 py-2 bg-white" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                <option value="Pcs">Pcs (Pieces)</option>
                <option value="Kg">Kg (Kilogram)</option>
                <option value="Ltr">Ltr (Liter)</option>
                <option value="Box">Box</option>
                <option value="Pkt">Pkt (Packet)</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Price (per unit)</label><input type="number" step="0.01" required className="w-full border rounded px-3 py-2" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Current Stock</label><input type="number" step="any" required className="w-full border rounded px-3 py-2" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} /></div>
          </div>
          <button type="submit" className="w-full bg-primary text-white font-medium py-2 rounded-lg hover:bg-primary-dark">Save Item</button>
        </form>
      </div>
    </div>
  );
}