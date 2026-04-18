import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useShopStore } from '../store/useShopStore';
import { useToastStore } from '../store/useToastStore';
import { Plus, Search, Edit, Trash2, Smartphone, Shield, Layers, UploadCloud, Download, X } from 'lucide-react';
import ItemModal from '../components/ItemModal';
import Papa from 'papaparse'; // Excel/CSV Parser

export default function Inventory() {
  const { user } = useAuthStore();
  const { profile } = useShopStore();
  const { items = [], fetchItems, addItem, updateItem, deleteItem, loading } = useInventoryStore();
  const { addToast } = useToastStore();
  
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // BULK IMPORT STATES
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

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

  // ---------------- BULK IMPORT LOGIC ----------------
  const downloadTemplate = () => {
    const headers = "name,category,price,stock,minStock,sku,unit,ram,rom,color,imei\n";
    const sampleData = "iPhone 15,Mobile,75000,10,2,IP15,Pcs,8GB,256GB,Black,123456789012345\n";
    const blob = new Blob([headers + sampleData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "ShopERP_Inventory_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      return addToast("Please upload a valid CSV file.", "error");
    }

    setUploading(true);
    setUploadProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async function(results) {
        const rows = results.data;
        if (rows.length === 0) {
          setUploading(false);
          return addToast("The CSV file is empty.", "error");
        }

        let successCount = 0;
        let total = rows.length;

        for (let i = 0; i < total; i++) {
          const row = rows[i];
          if (!row.name || !row.category) continue; // Basic Validation

          try {
            await addItem(user.uid, {
              name: row.name,
              category: row.category,
              price: Number(row.price || 0),
              stock: Number(row.stock || 0),
              minStock: Number(row.minStock || 5),
              sku: row.sku || '',
              unit: row.unit || 'Pcs',
              ram: row.ram || '',
              rom: row.rom || '',
              color: row.color || '',
              imei: row.imei || ''
            });
            successCount++;
          } catch (err) {
            console.error(`Error adding item at row ${i + 1}:`, err);
          }
          
          setUploadProgress(Math.round(((i + 1) / total) * 100));
        }

        addToast(`${successCount} Items imported successfully!`, "success");
        setUploading(false);
        setIsImportOpen(false);
        fetchItems(user.uid); // Refresh Inventory after import
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      error: function(err) {
        setUploading(false);
        addToast("Error reading file. Please check format.", "error");
      }
    });
  };

  const tabs = [ { name: 'All', icon: Layers }, { name: 'Mobile', icon: Smartphone }, { name: 'Cover', icon: Shield }, { name: 'Glass', icon: Layers } ];

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* BULK IMPORT BUTTON */}
          <button onClick={() => setIsImportOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm">
            <UploadCloud size={20} /> Bulk Import
          </button>
          
          {/* ADD ITEM BUTTON */}
          <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition shadow-md">
            <Plus size={20} /> Add Item
          </button>
        </div>
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

      {/* BULK IMPORT MODAL */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
                <UploadCloud className="text-primary" /> Bulk Import Items
              </h2>
              <button onClick={() => !uploading && setIsImportOpen(false)} className="p-1 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-lg transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Step 1 */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <h3 className="font-bold text-blue-800 mb-1 text-sm">Step 1: Download Template</h3>
                <p className="text-xs text-blue-600 mb-3">Fill your data exactly in this format.</p>
                <button onClick={downloadTemplate} className="flex items-center gap-2 bg-white text-blue-700 border border-blue-300 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm">
                  <Download size={16} /> Download CSV Template
                </button>
              </div>

              {/* Step 2 */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary transition bg-gray-50">
                <UploadCloud size={36} className="mx-auto text-gray-400 mb-3" />
                <h3 className="font-bold text-gray-800 mb-1 text-sm">Step 2: Upload Data</h3>
                <p className="text-xs text-gray-500 mb-4">Select your filled CSV file</p>
                
                <input 
                  type="file" 
                  accept=".csv" 
                  ref={fileInputRef}
                  onChange={handleFileUpload} 
                  disabled={uploading}
                  className="hidden" 
                  id="csvUpload"
                />
                <label htmlFor="csvUpload" className={`cursor-pointer flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition shadow-sm ${uploading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark'}`}>
                  {uploading ? 'Processing...' : 'Browse CSV File'}
                </label>

                {/* Progress Bar */}
                {uploading && (
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                    <p className="text-[10px] text-gray-500 mt-1 font-bold text-center">{uploadProgress}% Complete</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}