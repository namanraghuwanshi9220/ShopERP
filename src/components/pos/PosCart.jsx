import { Minus, Plus, Trash2, Edit2, RefreshCcw, Package } from 'lucide-react';

export default function PosCart({ cart, profile, clearDraft, updatePrice, updateQty, removeCartItem }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden max-h-[350px]">
      <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-black text-gray-800 uppercase tracking-wide text-sm">Cart</span>
          <span className="bg-gray-200 text-gray-700 px-2 rounded-full text-xs font-bold">{cart.length}</span>
        </div>
        {cart.length > 0 && (
          <button onClick={clearDraft} className="text-[10px] flex items-center gap-1 font-bold text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded border border-red-100 transition">
            <RefreshCcw size={12}/> CLEAR DRAFT
          </button>
        )}
      </div>
      
      <div className="overflow-y-auto flex-1 p-2">
        {cart.map(item => (
          <div key={`${item.id}-${item.soldImei}`} className="flex flex-col p-3 border-b border-dashed last:border-0 hover:bg-gray-50 transition group rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-2">
                <p className="font-bold text-sm text-gray-900 leading-tight">{item.name}</p>
                {item.soldImei && <p className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 inline-block px-1.5 py-0.5 rounded mt-1 border border-blue-100">IMEI: {item.soldImei}</p>}
              </div>
              <div className="text-right">
                <div className="font-black text-sm text-gray-900">{profile?.currency}{(item.cartPrice * item.qty).toFixed(2)}</div>
                <div className="flex items-center justify-end gap-1 mt-1 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200 transition">
                  <Edit2 size={12} className="text-yellow-600" />
                  <input type="number" step="any" className="w-16 text-right font-bold text-xs text-yellow-800 focus:outline-none bg-transparent" value={item.cartPrice} onChange={(e) => updatePrice(item.id, item.soldImei, e.target.value)} title="Edit Selling Price" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 border border-gray-300 rounded bg-white overflow-hidden shadow-sm">
                <button onClick={() => updateQty(item.id, item.soldImei, item.qty - 1)} className="w-8 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200"><Minus size={14}/></button>
                <input type="number" step="any" value={item.qty} onChange={(e) => updateQty(item.id, item.soldImei, e.target.value)} className="w-10 text-center text-sm font-bold outline-none" />
                <button onClick={() => updateQty(item.id, item.soldImei, item.qty + 1)} className="w-8 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200"><Plus size={14}/></button>
              </div>
              <button onClick={() => removeCartItem(item.id, item.soldImei)} className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
        {cart.length === 0 && <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 py-10"><Package size={40} opacity={0.5}/><p className="text-sm font-medium">Cart is empty</p></div>}
      </div>
    </div>
  );
}