import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useShopStore } from '../store/useShopStore';
import { useToastStore } from '../store/useToastStore';
import { Plus, Search, Edit, Trash2, Smartphone, Shield, Layers } from 'lucide-react';
import ItemModal from '../components/ItemModal';

export default function Inventory() {
  const { user } = useAuthStore();
  const { profile } = useShopStore();
  const { items = [], fetchItems, addItem, updateItem, deleteItem, loading } = useInventoryStore();
  const { addToast } = useToastStore();
  
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => { if (user) fetchItems(user.uid); }, [user, fetchItems]);

  const filteredItems = (items || []).filter(item => {
    if (!item) return false;
    const searchString = `${item.name} ${item.sku} ${item.imei} ${item.ram} ${item.color}`.toLowerCase();
    const matchesSearch = searchString.includes(search.toLowerCase());
    const matchesTab = activeTab === 'All' || item.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleSave = async (data) => {
    try {
      if (editingItem) { await updateItem(user.uid, editingItem.id, data); addToast("Item updated"); } 
      else { await addItem(user.uid, data); addToast("Item added"); }
      setIsModalOpen(false); setEditingItem(null);
    } catch (error) { addToast(error.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try { await deleteItem(user.uid, id); addToast("Item deleted"); } catch (error) { addToast(error.message, 'error'); }
    }
  };

  const tabs = [
    { name: 'All', icon: Layers },
    { name: 'Mobile', icon: Smartphone },
    { name: 'Cover', icon: Shield },
    { name: 'Glass', icon: Layers }
  ];

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
        <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition shadow-md">
          <Plus size={20} /> Add New Item
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.name} onClick={() => setActiveTab(tab.name)} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition whitespace-nowrap ${activeTab === tab.name ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <Icon size={16} /> {tab.name}
              </button>
            )
          })}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search by name, IMEI, RAM, Color..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:border-primary outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3">Item Details</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Price</th>
                <th className="px-6 py-3 text-center">Stock</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && items.length === 0 ? <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading items...</td></tr> : 
               filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{item.name}</div>
                    {item.category === 'Mobile' && (
                      <div className="text-xs text-gray-500 mt-1 space-x-2">
                        {item.ram && <span className="bg-gray-100 px-1.5 py-0.5 rounded border">{item.ram} / {item.rom}</span>}
                        {item.color && <span className="text-gray-400">{item.color}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{item.category}</td>
                  <td className="px-6 py-4 text-right font-bold text-primary">{profile?.currency}{(item.price || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-center font-bold text-gray-700">{item.stock} <span className="text-xs text-gray-400 font-normal">{item.unit || 'Pcs'}</span></td>
                  <td className="px-6 py-4 text-center">
                    {item.stock <= 0 ? <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold">Out of Stock</span> :
                     <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold">In Stock</span>}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {!loading && filteredItems.length === 0 && <tr><td colSpan="6" className="text-center py-8 text-gray-500">No items found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <ItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} item={editingItem} />
    </div>
  );
}