import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useShopStore } from '../store/useShopStore';
import { useToastStore } from '../store/useToastStore';
import { Plus, Search, Edit, Trash2, Smartphone, Shield, Layers, UploadCloud, Download, X } from 'lucide-react';
import ItemModal from '../components/ItemModal';
import Papa from 'papaparse';

export default function Inventory() {
  const { user } = useAuthStore();
  const { profile } = useShopStore();
  const { items = [], fetchItems, addItem, updateItem, deleteItem, loading } = useInventoryStore();
  const { addToast } = useToastStore();
  
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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

  // SMART DUPLICATE CHECK LOGIC
  const handleSave = async (data) => {
    try {
      if (editingItem) {
        // Edit mode me normal update hoga
        await updateItem(user.uid, editingItem.id, data);
        addToast("Item updated successfully", "success");
      } else {
        // Naya item add karte waqt DUPLICATE CHECK
        
        // Mobile ko chhod kar baaki items check karo (kyunki mobile IMEI par depend karta hai)
        if (data.category !== 'Mobile') {
          // Aisa item dhundo jiska naam, category aur price exactly same ho (Case insensitive)
          const existingItem = items.find(i => 
            i.name.trim().toLowerCase() === data.name.trim().toLowerCase() && 
            i.category === data.category && 
            Number(i.price) === Number(data.price)
          );

          if (existingItem) {
            // Agar mil gaya, to naya stock usme PLUS (+) kar do
            const updatedStock = Number(existingItem.stock) + Number(data.stock);
            await updateItem(user.uid, existingItem.id, { stock: updatedStock });
            addToast(`Merged with existing item! Stock updated to ${updatedStock}`, "info");
            setIsModalOpen(false); 
            setEditingItem(null);
            return; // Yahan se function wapas bhej do, naya item mat banao!
          }
        } else {
          // Agar MOBILE hai, toh IMEI duplicates check karein
          const existingMobile = items.find(i => 
            i.name.trim().toLowerCase() === data.name.trim().toLowerCase() && 
            i.category === 'Mobile' &&
            i.ram === data.ram && i.rom === data.rom && i.color === data.color
          );

          if (existingMobile) {
            // Agar same phone already maujood hai, toh nayi IMEIs purane me add kardo
            let existingImeis = existingMobile.imei ? existingMobile.imei.split(',').map(i => i.trim()).filter(Boolean) : [];
            let newImeis = data.imei ? data.imei.split(',').map(i => i.trim()).filter(Boolean) : [];
            
            // Remove duplicates
            const mergedImeis = [...new Set([...existingImeis, ...newImeis])];
            
            await updateItem(user.uid, existingMobile.id, { 
              imei: mergedImeis.join(', '), 
              stock: mergedImeis.length 
            });
            
            addToast(`IMEIs merged with existing Mobile model!`, "info");
            setIsModalOpen(false); 
            setEditingItem(null);
            return;
          }
        }

        // Agar bilkul naya item hai, toh Add kardo
        await addItem(user.uid, data);
        addToast("New item added successfully", "success");
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) { addToast("Error saving item", 'error'); console.error(error); }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this item permanently?")) {
      try { await deleteItem(user.uid, id); addToast("Item deleted", "success"); } catch (error) { addToast("Failed to delete", 'error'); }
    }
  };

  // BULK IMPORT LOGIC
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
          if (!row.name || !row.category) continue; 

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
        fetchItems(user.uid); 
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
    <div className="h-full flex flex-col space-y-5 animate-fade-in pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Inventory</h1>
          <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest">{items.length} Products Total</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={() => setIsImportOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm text-sm">
            <UploadCloud size={18} /> Bulk Import
          </button>
          
          <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-black hover:bg-primary-dark transition shadow-md shadow-primary/20 text-sm uppercase tracking-wide">
            <Plus size={18} strokeWidth={3} /> Add Product
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm overflow-x-auto w-full lg:w-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.name} onClick={() => setActiveTab(tab.name)} className={`flex flex-1 items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-black text-xs transition uppercase tracking-wider whitespace-nowrap ${activeTab === tab.name ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                <Icon size={16} /> {tab.name}
              </button>
            )
          })}
        </div>
        <div className="relative flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search product name, IMEI, RAM, Color..." className="w-full pl-12 pr-4 py-3 outline-none text-sm font-bold text-gray-800 placeholder-gray-400" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 p-2">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-400 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-5 py-4 font-black uppercase text-[10px] tracking-widest rounded-tl-xl">Item Details</th>
                <th className="px-5 py-4 font-black uppercase text-[10px] tracking-widest">Category</th>
                <th className="px-5 py-4 font-black uppercase text-[10px] tracking-widest text-right">Price</th>
                <th className="px-5 py-4 font-black uppercase text-[10px] tracking-widest text-center">Stock</th>
                <th className="px-5 py-4 font-black uppercase text-[10px] tracking-widest text-center">Status</th>
                <th className="px-5 py-4 font-black uppercase text-[10px] tracking-widest text-center rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && items.length === 0 ? <tr><td colSpan="6" className="text-center py-12 text-gray-400 font-bold uppercase tracking-widest text-xs">Loading items...</td></tr> : 
               filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition group">
                  <td className="px-5 py-4">
                    <div className="font-black text-gray-900 text-sm leading-tight">{item.name}</div>
                    {item.category === 'Mobile' && (
                      <div className="text-[10px] text-gray-500 font-bold mt-1 bg-gray-100 inline-block px-1.5 py-0.5 rounded border border-gray-200">
                        {item.ram}/{item.rom} • {item.color}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-200 bg-white px-2 py-1 rounded-lg shadow-sm">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-black text-gray-900 text-base">
                    {profile?.currency || '₹'}{(item.price || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="font-black text-gray-800 text-base">{item.stock} <span className="text-[10px] font-bold text-gray-400">{item.unit || 'Pcs'}</span></div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {item.stock <= 0 ? 
                      <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded border border-red-200 text-[10px] font-black uppercase tracking-widest shadow-sm">Out of Stock</span> 
                      : item.minStock > 0 && item.stock <= item.minStock ?
                      <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded border border-amber-200 text-[10px] font-black uppercase tracking-widest shadow-sm">Low Stock</span>
                      :
                      <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded border border-green-200 text-[10px] font-black uppercase tracking-widest shadow-sm">In Stock</span>
                    }
                  </td>
                  <td className="px-5 py-4 text-center space-x-3">
                    <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 bg-white text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white rounded-lg transition shadow-sm" title="Edit"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-white text-red-500 border border-red-200 hover:bg-red-500 hover:text-white rounded-lg transition shadow-sm" title="Delete"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {!loading && filteredItems.length === 0 && <tr><td colSpan="6" className="text-center py-12"><div className="flex flex-col items-center justify-center text-gray-400"><Layers size={40} className="mb-3 opacity-20"/><p className="font-black uppercase tracking-widest text-xs">No items found</p></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <ItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} item={editingItem} />

      {/* BULK IMPORT MODAL */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
                <UploadCloud className="text-primary" /> Bulk Import
              </h2>
              <button onClick={() => !uploading && setIsImportOpen(false)} className="p-1.5 bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-full transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl shadow-inner">
                <h3 className="font-black text-blue-900 mb-1 text-xs uppercase tracking-widest">Step 1: Get Template</h3>
                <p className="text-[11px] font-bold text-blue-600 mb-4 leading-relaxed">Download this Excel (CSV) template and fill your products exactly in the given format.</p>
                <button onClick={downloadTemplate} className="w-full flex items-center justify-center gap-2 bg-white text-blue-700 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-100 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm">
                  <Download size={18} /> Download Template
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-primary hover:bg-gray-50 transition bg-white group">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-100 group-hover:text-green-600 transition">
                  <UploadCloud size={32} className="text-gray-400 group-hover:text-primary transition" />
                </div>
                <h3 className="font-black text-gray-900 mb-1 text-xs uppercase tracking-widest">Step 2: Upload Data</h3>
                <p className="text-[11px] font-bold text-gray-500 mb-5">Select your filled CSV file</p>
                
                <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} disabled={uploading} className="hidden" id="csvUpload" />
                <label htmlFor="csvUpload" className={`cursor-pointer inline-flex items-center justify-center w-full px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md ${uploading ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark hover:shadow-lg'}`}>
                  {uploading ? 'Processing...' : 'Browse CSV File'}
                </label>

                {uploading && (
                  <div className="mt-5 w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                    <div className="bg-primary h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                    <p className="text-[10px] text-gray-500 mt-2 font-black uppercase tracking-widest">{uploadProgress}% Complete</p>
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