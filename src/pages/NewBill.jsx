import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useShopStore } from '../store/useShopStore';
import { useBillStore } from '../store/useBillStore';
import { useToastStore } from '../store/useToastStore';
import { generateBill } from '../firebase/db';
import { Search, Plus, Minus, Trash2, Printer } from 'lucide-react';
import PrintBill from '../components/PrintBill';

export default function NewBill() {
  const { user } = useAuthStore();
  const { items = [], fetchItems } = useInventoryStore();
  const { profile } = useShopStore();
  const { addLocalBill } = useBillStore();
  const { addToast } = useToastStore();

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [settings, setSettings] = useState({ discount: 0, gst: 0, paymentMode: 'Cash' });
  const [generating, setGenerating] = useState(false);
  const [printedBill, setPrintedBill] = useState(null);

  useEffect(() => { 
    if (user) fetchItems(user.uid); 
    if (profile) setSettings(s => ({ ...s, gst: profile.defaultGST || 0 }));
  }, [user, profile, fetchItems]);

  const filteredItems = (items || []).filter(i => i.stock > 0 && (i.name || '').toLowerCase().includes(search.toLowerCase()));

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      if (existing.qty >= item.stock) return addToast("Not enough stock", "error");
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else setCart([...cart, { ...item, qty: 1 }]);
  };

  const updateQty = (id, newQty) => {
    setCart(cart.map(c => {
      if (c.id === id) {
        const itemStock = items.find(i => i.id === id)?.stock || 0;
        const finalQty = Math.max(0, Number(newQty));
        if (finalQty > itemStock) { addToast("Stock limit reached", "error"); return c; }
        return { ...c, qty: finalQty };
      }
      return c;
    }).filter(c => c.qty > 0)); 
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discountAmt = subtotal * (settings.discount / 100);
  const afterDiscount = subtotal - discountAmt;
  const gstAmt = afterDiscount * (settings.gst / 100);
  const total = afterDiscount + gstAmt;

  const handleGenerate = async () => {
    if (cart.length === 0) return addToast("Cart is empty", "error");
    setGenerating(true);
    try {
      const billData = {
        customerName: customer.name, customerPhone: customer.phone,
        items: cart.map(c => ({ id: c.id, name: c.name, price: c.price, qty: c.qty, unit: c.unit || 'Pcs' })),
        subtotal, discount: discountAmt, gst: gstAmt, total, paymentMode: settings.paymentMode
      };
      
      const finalBill = await generateBill(user.uid, billData, cart);
      
      addLocalBill(finalBill);
      setPrintedBill(finalBill); // Set bill to print
      
      // Clear Cart
      setCart([]); setCustomer({ name: '', phone: '' });
      fetchItems(user.uid); 
      addToast("Bill generated successfully!");
      
    } catch (error) { 
      console.error(error);
      addToast("Error generating bill", 'error'); 
    } finally { 
      setGenerating(false); 
    }
  };

  // Safe Print Execution
  const handlePrint = () => {
    setTimeout(() => { window.print(); }, 100);
  };

  if (printedBill) return (
    <div className="flex flex-col h-full bg-white relative print:bg-white print:fixed print:inset-0 print:z-50">
      <div className="print:hidden p-4 border-b flex justify-between items-center bg-gray-50">
        <h2 className="text-xl font-bold text-green-600">Bill Generated Successfully!</h2>
        <div className="space-x-4 flex">
          <button onClick={() => setPrintedBill(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-100 font-medium">Create New Bill</button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium"><Printer size={20}/> Print Bill</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-white p-4 print:p-0"><PrintBill bill={printedBill} profile={profile} /></div>
    </div>
  );

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 print:hidden">
      <div className="flex-1 flex flex-col space-y-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search to filter items..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        
        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-1">
          {filteredItems.map(item => (
            <div key={item.id} onClick={() => addToCart(item)} className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-green-50 hover:border-primary transition flex flex-col justify-between h-24 shadow-sm">
              <div className="font-bold text-gray-800 text-sm truncate" title={item.name}>{item.name}</div>
              <div className="flex justify-between items-end mt-2">
                <div className="text-xs text-gray-500">Stock: {item.stock} {item.unit || 'Pcs'}</div>
                <div className="font-bold text-primary">{profile?.currency || '₹'}{(item.price || 0).toFixed(2)}</div>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && <div className="col-span-full text-center py-10 text-gray-400">No items available</div>}
        </div>
      </div>

      <div className="w-full lg:w-[450px] flex flex-col space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden max-h-[350px]">
          <div className="p-3 border-b bg-gray-50 font-bold text-gray-700">Cart Items ({cart.length})</div>
          <div className="overflow-y-auto flex-1 p-2">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 border-b last:border-0 hover:bg-gray-50">
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">@ {profile?.currency}{(item.price || 0)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 text-gray-600"><Minus size={14}/></button>
                  <input type="number" step="any" value={item.qty} onChange={(e) => updateQty(item.id, e.target.value)} className="w-14 text-center border rounded py-1 text-sm font-medium focus:ring-1 focus:ring-primary outline-none" />
                  <span className="text-xs text-gray-500 w-6">{item.unit || 'Pcs'}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 text-gray-600"><Plus size={14}/></button>
                </div>
                <div className="w-16 text-right font-bold text-sm ml-2">{profile?.currency}{((item.price || 0) * item.qty).toFixed(2)}</div>
                <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="ml-3 text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
              </div>
            ))}
            {cart.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">Cart is empty. Click items to add.</div>}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
          <div className="flex gap-2">
            <input type="text" placeholder="Customer Name" className="w-1/2 border rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
            <input type="text" placeholder="Phone Number" className="w-1/2 border rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className="block text-xs text-gray-500 mb-1">Disc (%)</label><input type="number" className="w-full border rounded-lg px-2 py-1.5 text-sm outline-none" value={settings.discount} onChange={e => setSettings({...settings, discount: Number(e.target.value)})} /></div>
            <div><label className="block text-xs text-gray-500 mb-1">GST (%)</label><input type="number" className="w-full border rounded-lg px-2 py-1.5 text-sm outline-none" value={settings.gst} onChange={e => setSettings({...settings, gst: Number(e.target.value)})} /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Payment</label><select className="w-full border rounded-lg px-2 py-1.5 text-sm outline-none" value={settings.paymentMode} onChange={e => setSettings({...settings, paymentMode: e.target.value})}><option>Cash</option><option>UPI</option><option>Card</option></select></div>
          </div>
          
          <div className="pt-3 border-t space-y-1 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{profile?.currency}{subtotal.toFixed(2)}</span></div>
            {discountAmt > 0 && <div className="flex justify-between text-red-500"><span>Discount</span><span>-{profile?.currency}{discountAmt.toFixed(2)}</span></div>}
            {gstAmt > 0 && <div className="flex justify-between text-gray-600"><span>GST</span><span>+{profile?.currency}{gstAmt.toFixed(2)}</span></div>}
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t mt-2"><span>Total</span><span>{profile?.currency}{total.toFixed(2)}</span></div>
          </div>
        </div>

        <button onClick={handleGenerate} disabled={generating || cart.length === 0} className="w-full py-3 bg-primary text-white text-lg font-bold rounded-xl shadow-md hover:bg-primary-dark transition disabled:opacity-50">
          {generating ? 'Generating...' : 'Generate Bill'}
        </button>
      </div>
    </div>
  );
}