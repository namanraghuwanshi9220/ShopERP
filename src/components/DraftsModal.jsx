import { X, Clock, User, ShoppingCart, Play, Trash2 } from 'lucide-react';

export default function DraftsModal({ isOpen, onClose, drafts, onLoadDraft, onDeleteDraft, currency }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <Clock className="text-blue-600" /> Saved Drafts (Hold Bills)
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Load incomplete bills to continue processing</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-red-100 hover:text-red-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Drafts List */}
        <div className="p-5 overflow-y-auto flex-1 bg-gray-100/50">
          {drafts.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingCart size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-bold">No saved drafts found.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {drafts.map(draft => (
                <div key={draft.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
                        {draft.date}
                      </span>
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                        {draft.itemCount} Items
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-gray-800 text-lg">
                      <User size={16} className="text-gray-400" />
                      {draft.customerName}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Total Amount</p>
                      <p className="font-black text-lg text-primary flex items-center justify-end">
                        {currency}{draft.total.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 border-l pl-4">
                      <button 
                        onClick={() => onLoadDraft(draft)}
                        className="flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition shadow-sm"
                      >
                        <Play size={16} fill="currentColor" /> Resume
                      </button>
                      <button 
                        onClick={() => onDeleteDraft(draft.id)}
                        className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-500 hover:text-white transition"
                        title="Delete Draft"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}