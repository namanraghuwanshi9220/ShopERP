import { useToastStore } from '../store/useToastStore';
import { CheckCircle, XCircle } from 'lucide-react';

export default function Toast() {
  const { toasts } = useToastStore();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-primary'}`}>
          {toast.type === 'error' ? <XCircle size={20} /> : <CheckCircle size={20} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}