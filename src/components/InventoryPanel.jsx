import { Search, ChevronLeft, Plus } from 'lucide-react';

export default function InventoryPanel({ 
  search, setSearch, handleSearchEnter, activeFolder, setActiveFolder, 
  categoryStats, searchResults, folderItems, handleCardClick, processAddToCart, currency 
}) {

  const renderItemCard = (item) => {
    const imeis = item.imei ? item.imei.split(',').map(i => i.trim()).filter(Boolean) : [];
    return (
      <div key={item.id} className="flex flex-col border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:border-primary hover:shadow-md transition group cursor-pointer" onClick={() => handleCardClick(item)}>
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-3">
            <div className="font-black text-gray-900 text-base">{item.name}</div>
            {item.category === 'Mobile' && <div className="text-xs text-gray-500 font-bold mt-1">{item.ram}/{item.rom} <span className="mx-1 text-gray-300">•</span> {item.color}</div>}
          </div>
          <div className="text-right">
            <div className="font-black text-primary text-lg">{currency}{item.price}</div>
            <div className="text-[11px] font-bold text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded-full inline-block border border-gray-200">Stock: {item.stock}</div>
          </div>
        </div>
        {item.category === 'Mobile' && imeis.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tap IMEI to Quick Add</p>
            <div className="flex flex-wrap gap-2">
              {imeis.map((imeiStr, idx) => (
                <button key={idx} onClick={(e) => { e.stopPropagation(); processAddToCart(item, imeiStr); }} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                  {imeiStr} <Plus size={14} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col space-y-5 h-full relative">
      <div className="relative shadow-sm rounded-xl overflow-hidden bg-white border border-gray-200">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
        <input autoFocus type="text" placeholder="Search Product Name or Scan Barcode/IMEI..." className="w-full pl-12 pr-4 py-4 outline-none text-lg font-bold text-gray-800 placeholder-gray-400" value={search} onChange={(e) => { setSearch(e.target.value); setActiveFolder(null); }} onKeyDown={handleSearchEnter} />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-24">
        {search.trim() !== '' ? (
          <div className="space-y-6">
            {['Mobile', 'Cover', 'Glass', 'Accessories', 'Other'].map(cat => {
              const groupItems = searchResults.filter(i => i.category === cat);
              if (groupItems.length === 0) return null;
              return (
                <div key={cat} className="space-y-3">
                  <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider border-b-2 border-gray-100 pb-2">{cat}</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">{groupItems.map(item => renderItemCard(item))}</div>
                </div>
              )
            })}
          </div>
        ) : activeFolder === null ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categoryStats.map(cat => {
              const Icon = cat.icon;
              return (
                <div key={cat.name} onClick={() => setActiveFolder(cat.name)} className={`border-2 rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center justify-center gap-3 bg-white h-40 ${cat.color}`}>
                  <div className="p-4 bg-white/50 rounded-full shadow-sm"><Icon size={36} /></div>
                  <div className="font-black text-lg text-gray-900">{cat.name}</div>
                  <div className="text-xs font-bold text-gray-600 bg-white/80 px-3 py-1 rounded-full shadow-sm">{cat.count} Products</div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <button onClick={() => setActiveFolder(null)} className="flex items-center gap-1.5 text-sm font-black text-gray-500 hover:text-gray-900 transition bg-white shadow-sm px-4 py-2 rounded-xl border border-gray-200">
              <ChevronLeft size={20} /> Back to Categories
            </button>
            <h3 className="font-black text-gray-900 text-2xl border-b-2 border-gray-100 pb-3 uppercase tracking-tight">{activeFolder}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">{folderItems.map(item => renderItemCard(item))}</div>
          </div>
        )}
      </div>
    </div>
  );
}