import { useToastStore } from '../store/useToastStore';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { createPortal } from 'react-dom'; // IMPORT PORTAL

export default function Toast() {
  const { toasts } = useToastStore();
  
  if (toasts.length === 0) return null;

  // Render the toasts directly into the body tag so NOTHING can block it!
  return createPortal(
    <div className="fixed bottom-6 right-6 z-[999999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white font-bold text-sm tracking-wide animate-fade-in pointer-events-auto border border-white/10 backdrop-blur-sm ${
            toast.type === 'error' ? 'bg-red-600/95' : 
            toast.type === 'info' ? 'bg-blue-600/95' : 'bg-gray-900/95'
          }`}
        >
          {toast.type === 'error' ? <XCircle size={20} /> : 
           toast.type === 'info' ? <Info size={20} /> : <CheckCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>,
    document.body // THIS MAGIC LINE THROWS IT OUTSIDE ALL CONTAINERS
  );
}