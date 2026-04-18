import { useState, useMemo } from 'react';
import { useInventoryStore } from '../store/useInventoryStore';
import { useShopStore } from '../store/useShopStore';
import { useCartStore } from '../store/useCartStore';
import { useToastStore } from '../store/useToastStore';
import InventoryPanel from '../components/InventoryPanel';
import { Smartphone, Shield, Layers, Package, LayoutGrid } from 'lucide-react';

export default function NewBill() {
  const { items = [] } = useInventoryStore();
  const { profile } = useShopStore();
  const { addToast } = useToastStore();
  
  // Get Cart Functions
  const { processAddToCart } = useCartStore();

  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState(null); 

  // CATEGORY CARDS LOGIC
  const categoryStats = useMemo(() => {
    const stats = {}; 
    (items || []).forEach(item => { 
      if ((item.stock || 0) > 0) {
        stats[item.category] = (stats[item.category] || 0) + 1; 
      }
    });
    
    return [
      { name: 'Mobile', count: stats['Mobile'] || 0, icon: Smartphone, color: 'bg-blue-100 text-blue-700 border-blue-200' },
      { name: 'Cover', count: stats['Cover'] || 0, icon: Shield, color: 'bg-purple-100 text-purple-700 border-purple-200' },
      { name: 'Glass', count: stats['Glass'] || 0, icon: Layers, color: 'bg-teal-100 text-teal-700 border-teal-200' },
      { name: 'Accessories', count: stats['Accessories'] || 0, icon: Package, color: 'bg-orange-100 text-orange-700 border-orange-200' },
      { name: 'Other', count: stats['Other'] || 0, icon: Package, color: 'bg-gray-100 text-gray-700 border-gray-200' }
    ].filter(c => c.count > 0);
  }, [items]);

  // SEARCH RESULTS LOGIC
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    return (items || []).filter(i => 
      (i.stock || 0) > 0 && 
      `${i.name || ''} ${i.imei || ''} ${i.sku || ''}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, items]);

  // ITEMS INSIDE FOLDER LOGIC
  const folderItems = useMemo(() => {
    return (items || []).filter(i => (i.stock || 0) > 0 && i.category === activeFolder);
  }, [items, activeFolder]);

  // HANDLE ADD TO CART
  const handleCardClick = (item) => {
    const imeis = item.imei ? item.imei.split(',').filter(Boolean) : [];
    if (item.category === 'Mobile' && imeis.length > 0) {
      addToast("Click an IMEI number to add.", "info");
    } else {
      processAddToCart(item, '', addToast);
      setSearch('');
    }
  };

  // BARCODE ENTER LOGIC
  const handleSearchEnter = (e) => {
    if (e.key === 'Enter' && search.trim() !== '') {
      const exactImeiMatch = (items || []).find(i => 
        i.imei?.includes(search.trim()) && (i.stock || 0) > 0
      );
      if (exactImeiMatch) {
        processAddToCart(exactImeiMatch, search.trim(), addToast);
        setSearch('');
      }
    }
  };

  return (
    <div className="h-full relative print:hidden flex flex-col">
      {/* 
        Header & Container for Inventory Panel 
        We use flex-1 so it takes all available screen height 
      */}
      <div className="flex justify-between items-center mb-4">
         <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
           <LayoutGrid className="text-primary" /> Point of Sale
         </h1>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 overflow-hidden relative">
        <InventoryPanel 
          search={search} 
          setSearch={setSearch} 
          handleSearchEnter={handleSearchEnter} 
          activeFolder={activeFolder} 
          setActiveFolder={setActiveFolder} 
          categoryStats={categoryStats} 
          searchResults={searchResults} 
          folderItems={folderItems} 
          handleCardClick={handleCardClick} 
          processAddToCart={(item, imei) => { processAddToCart(item, imei, addToast); setSearch(''); }} 
          currency={profile?.currency || '₹'} 
        />
      </div>
    </div>
  );
}