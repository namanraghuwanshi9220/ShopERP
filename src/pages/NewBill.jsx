import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useShopStore } from '../store/useShopStore';
import { useBillStore } from '../store/useBillStore';
import { useToastStore } from '../store/useToastStore';
import { generateBill, generateEstimate } from '../firebase/db';
import { Printer, ShoppingCart, CheckCircle2, Smartphone, Shield, Layers, Package } from 'lucide-react';
import PrintBill from '../components/PrintBill';
import DraftsModal from '../components/DraftsModal';
import InventoryPanel from '../components/InventoryPanel';
import CartSidebar from '../components/CartSidebar';

export default function NewBill() {
  const { user } = useAuthStore();
  const { items = [], fetchItems } = useInventoryStore();
  const { profile } = useShopStore();
  const { addLocalBill } = useBillStore();
  const { addToast } = useToastStore();

  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState(null); 
  const [generating, setGenerating] = useState(false);
  const [printedBill, setPrintedBill] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // SAFE INITIALIZATION STATE
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [settings, setSettings] = useState({ discount: 0, gst: 0, paymentMode: 'Cash' });
  const [finance, setFinance] = useState({ provider: 'Bajaj Finserv', downPayment: '', emiMonths: '', emiAmount: '' });

  const [drafts, setDrafts] = useState([]);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);

  // EDGE CASE FIX: Ref for Mount & Auto-Save Debouncing
  const isInitialMount = useRef(true);
  const debounceTimer = useRef(null);

  // EDGE CASE FIX 1: LOAD ONLY ONCE ON MOUNT
  useEffect(() => { 
    if (user && items.length === 0) fetchItems(user.uid); 
    
    try {
      const savedDrafts = JSON.parse(localStorage.getItem('pos_drafts_list') || '[]');
      setDrafts(Array.isArray(savedDrafts) ? savedDrafts : []);
      
      const activeSession = localStorage.getItem('pos_active_session');
      if (activeSession) {
        const parsed = JSON.parse(activeSession);
        // Load data safely
        setCart(Array.isArray(parsed.cart) ? parsed.cart : []); 
        setCustomer(parsed.customer || { name: '', phone: '', address: '' });
        setSettings(parsed.settings || { discount: 0, gst: profile?.defaultGST || 0, paymentMode: 'Cash' });
        setFinance(parsed.finance || { provider: 'Bajaj Finserv', downPayment: '', emiMonths: '', emiAmount: '' });
      } else if (profile) {
        setSettings(s => ({ ...s, gst: profile.defaultGST || 0 }));
      }
    } catch (e) { 
      console.error("Storage Recovery Error:", e); 
      // Reset if corrupted
      localStorage.removeItem('pos_active_session');
    }
  }, [user, profile?.defaultGST]); // Empty array nahi kiya warna user badal jaye toh fas jayega, but safe dependency di hai.

  // EDGE CASE FIX 2: AUTO-SAVE DEBOUNCE (Stops Infinite Render Loops)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    // Save only after 800ms of user inactivity (Smart Auto-save)
    debounceTimer.current = setTimeout(() => {
      try {
        if (cart.length > 0 || customer.name || customer.phone) {
          localStorage.setItem('pos_active_session', JSON.stringify({ cart, customer, settings, finance }));
        }
      } catch (e) { console.error("Auto-save Failed:", e); }
    }, 800);

    return () => clearTimeout(debounceTimer.current);
  }, [cart, customer, settings, finance]);

  // EDGE CASE FIX 3: SAFE MEMOIZATION
  const categoryStats = useMemo(() => {
    const stats = {}; 
    (items || []).forEach(item => { if ((item.stock || 0) > 0) stats[item.category] = (stats[item.category] || 0) + 1; });
    
    return [
      { name: 'Mobile', count: stats['Mobile'] || 0, icon: Smartphone, color: 'bg-blue-100 text-blue-700 border-blue-200' },
      { name: 'Cover', count: stats['Cover'] || 0, icon: Shield, color: 'bg-purple-100 text-purple-700 border-purple-200' },
      { name: 'Glass', count: stats['Glass'] || 0, icon: Layers, color: 'bg-teal-100 text-teal-700 border-teal-200' },
      { name: 'Accessories', count: stats['Accessories'] || 0, icon: Package, color: 'bg-orange-100 text-orange-700 border-orange-200' },
      { name: 'Other', count: stats['Other'] || 0, icon: Package, color: 'bg-gray-100 text-gray-700 border-gray-200' }
    ].filter(c => c.count > 0);
  }, [items]);

  const searchResults = useMemo(() => {
    if (!search || !search.trim()) return [];
    return (items || []).filter(i => (i.stock || 0) > 0 && `${i.name || ''} ${i.imei || ''} ${i.sku || ''}`.toLowerCase().includes(search.toLowerCase()));
  }, [search, items]);

  const folderItems = useMemo(() => {
    return (items || []).filter(i => (i.stock || 0) > 0 && i.category === activeFolder);
  }, [items, activeFolder]);

  // CART ADD LOGIC (Wrapped in useCallback for performance)
  const processAddToCart = useCallback((item, selectedImei = '') => {
    setCart(prev => {
      const existingIndex = prev.findIndex(c => c.id === item.id && c.soldImei === selectedImei);
      if (existingIndex >= 0) {
        if (prev[existingIndex].qty >= (item.stock || 0)) {
          addToast("Stock limit reached", "error");
          return prev;
        }
        const newCart = [...prev];
        newCart[existingIndex] = { ...newCart[existingIndex], qty: Number(newCart[existingIndex].qty) + 1 };
        return newCart;
      }
      return [...prev, { ...item, qty: 1, soldImei: selectedImei, cartPrice: Number(item.price || 0) }];
    });
    setIsCartOpen(true); 
    setSearch('');
  }, [addToast]);

  const handleCardClick = useCallback((item) => {
    const imeis = item.imei ? item.imei.split(',').filter(Boolean) : [];
    if (item.category === 'Mobile' && imeis.length > 0) addToast("Click an IMEI number to add.", "info");
    else processAddToCart(item, ''); 
  }, [addToast, processAddToCart]);

  const handleSearchEnter = (e) => {
    if (e.key === 'Enter' && search.trim() !== '') {
      const exactImeiMatch = (items || []).find(i => i.imei?.includes(search.trim()) && (i.stock || 0) > 0);
      if (exactImeiMatch) processAddToCart(exactImeiMatch, search.trim());
      setSearch('');
    }
  };

  // CART MODIFIERS (Strict NaN and Empty Value Checks)
  const updateQty = (id, soldImei, newQty) => {
    setCart(prev => prev.map(c => (c.id === id && c.soldImei === soldImei) ? { ...c, qty: Math.max(0, Number(newQty) || 0) } : c).filter(c => c.qty > 0));
  };
  const updatePrice = (id, soldImei, newPrice) => {
    setCart(prev => prev.map(c => (c.id === id && c.soldImei === soldImei) ? { ...c, cartPrice: newPrice } : c)); // Keeps string for input editing
  };
  const sanitizePrice = (id, soldImei, val) => { 
    let num = parseFloat(val); if (isNaN(num) || num < 0) num = 0; 
    setCart(prev => prev.map(c => (c.id === id && c.soldImei === soldImei) ? { ...c, cartPrice: Number(num.toFixed(2)) } : c)); 
  };
  const sanitizeQty = (id, soldImei, val) => { 
    let num = parseFloat(val); 
    if (isNaN(num) || num <= 0) setCart(prev => prev.filter(c => !(c.id === id && c.soldImei === soldImei))); 
    else setCart(prev => prev.map(c => (c.id === id && c.soldImei === soldImei) ? { ...c, qty: num } : c)); 
  };
  const removeCartItem = (id, soldImei) => setCart(prev => prev.filter(c => !(c.id === id && c.soldImei === soldImei)));

  // DRAFT LOGIC
  const holdCurrentBill = () => {
    if (cart.length === 0 && !customer.name) return addToast("Cart is empty!", "error");
    const newDraft = { 
      id: Date.now(), 
      date: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' }), 
      customerName: customer.name || "Unknown", itemCount: cart.length, total: totalPakka, 
      data: { cart, customer, settings, finance } 
    };
    const updatedDrafts = [newDraft, ...drafts]; 
    setDrafts(updatedDrafts); localStorage.setItem('pos_drafts_list', JSON.stringify(updatedDrafts));
    clearActiveSession("Bill saved to Drafts"); setIsCartOpen(false);
  };

  const resumeDraft = (draft) => {
    setCart(draft.data.cart || []); setCustomer(draft.data.customer || {}); setSettings(draft.data.settings || {}); setFinance(draft.data.finance || {});
    const updatedDrafts = drafts.filter(d => d.id !== draft.id); 
    setDrafts(updatedDrafts); localStorage.setItem('pos_drafts_list', JSON.stringify(updatedDrafts));
    setIsDraftsModalOpen(false); setIsCartOpen(true); addToast("Draft loaded!");
  };

  const deleteDraft = (id) => { 
    if(confirm("Delete this draft?")) { 
      const updatedDrafts = drafts.filter(d => d.id !== id); 
      setDrafts(updatedDrafts); localStorage.setItem('pos_drafts_list', JSON.stringify(updatedDrafts)); 
    } 
  };

  const clearActiveSession = (msg = "Cart cleared") => {
    setCart([]); setCustomer({ name: '', phone: '', address: '' }); 
    setSettings({ discount: 0, gst: profile?.defaultGST || 0, paymentMode: 'Cash' }); 
    setFinance({ provider: 'Bajaj Finserv', downPayment: '', emiMonths: '', emiAmount: '' });
    localStorage.removeItem('pos_active_session'); if(msg) addToast(msg, "success");
  };

  // EDGE CASE FIX 4: MATH NaN FALLBACKS
  const subtotal = cart.reduce((acc, item) => acc + ((Number(item.cartPrice) || 0) * (Number(item.qty) || 1)), 0);
  const discountAmt = subtotal * ((Number(settings.discount) || 0) / 100);
  const afterDiscount = subtotal - discountAmt;
  const totalGstAmt = afterDiscount * ((Number(settings.gst) || 0) / 100);
  const totalPakka = afterDiscount + totalGstAmt;
  const totalKaccha = afterDiscount;

  const handleCheckout = async (isEstimate) => {
    if (cart.length === 0) return addToast("Cart is empty", "error");
    setGenerating(true);
    try {
      const payload = {
        customerName: customer.name || "", customerPhone: customer.phone || "", customerAddress: customer.address || "",
        items: cart.map(c => ({ 
          id: c.id, name: c.name || "Unknown", price: Number(c.cartPrice || 0), qty: Number(c.qty || 1), unit: c.unit || 'Pcs', 
          category: c.category || "", ram: c.ram || "", rom: c.rom || "", color: c.color || "", soldImei: c.soldImei || "" 
        })),
        subtotal: Number(subtotal || 0), discount: Number(discountAmt || 0), 
        gstPercent: isEstimate ? 0 : Number(settings.gst || 0), gstAmt: isEstimate ? 0 : Number(totalGstAmt || 0), 
        cgstAmt: isEstimate ? 0 : Number((totalGstAmt / 2) || 0), sgstAmt: isEstimate ? 0 : Number((totalGstAmt / 2) || 0), 
        total: isEstimate ? Number(totalKaccha || 0) : Number(totalPakka || 0), 
        paymentMode: settings.paymentMode || "Cash", isEstimate
      };
      
      if (settings.paymentMode === 'Finance') {
        payload.financeDetails = { 
          provider: finance.provider || "", downPayment: Number(finance.downPayment || 0), 
          emiMonths: Number(finance.emiMonths || 0), emiAmount: Number(finance.emiAmount || 0) 
        };
      }
      
      let finalBill = isEstimate ? await generateEstimate(user.uid, payload, cart) : await generateBill(user.uid, payload, cart);
      
      if (!isEstimate) addLocalBill(finalBill);
      
      setPrintedBill(finalBill); 
      clearActiveSession(null); setIsCartOpen(false); 
      if (user) await fetchItems(user.uid); // Refresh stock strictly
      addToast("Success!", "success");
    } catch (error) { 
      addToast("Error generating bill", 'error'); console.error("Checkout Error:", error);
    } finally { 
      setGenerating(false); 
    }
  };

  if (printedBill) return (
    <div className="flex flex-col h-full bg-white relative print:bg-white print:fixed print:inset-0 print:z-50">
      <div className="print:hidden p-5 border-b flex justify-between items-center bg-gray-50">
        <h2 className={`text-2xl font-black flex items-center gap-2 ${printedBill.isEstimate ? 'text-amber-600' : 'text-green-600'}`}><CheckCircle2 size={28} /> {printedBill.isEstimate ? 'Estimate Created!' : 'Bill Generated!'}</h2>
        <div className="space-x-4 flex"><button onClick={() => setPrintedBill(null)} className="px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-100 font-bold text-gray-700">New Bill</button><button onClick={() => window.print()} className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white rounded-xl font-black shadow-md uppercase"><Printer size={20}/> Print</button></div>
      </div>
      <div className="flex-1 overflow-auto bg-white p-4 print:p-0"><PrintBill bill={printedBill} profile={profile} /></div>
    </div>
  );

  return (
    <div className="h-full relative print:hidden">
      <InventoryPanel search={search} setSearch={setSearch} handleSearchEnter={handleSearchEnter} activeFolder={activeFolder} setActiveFolder={setActiveFolder} categoryStats={categoryStats} searchResults={searchResults} folderItems={folderItems} handleCardClick={handleCardClick} processAddToCart={processAddToCart} currency={profile?.currency || '₹'} />

      {!isCartOpen && (
        <button onClick={() => setIsCartOpen(true)} className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-30 bg-gray-900 text-white p-4 rounded-full shadow-2xl hover:scale-105 hover:bg-black transition-all flex items-center justify-center border-4 border-white">
          <ShoppingCart size={28} />
          {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">{cart.length}</span>}
        </button>
      )}

      <CartSidebar isOpen={isCartOpen} toggleCart={() => setIsCartOpen(false)} cart={cart} updateQty={updateQty} sanitizeQty={sanitizeQty} updatePrice={updatePrice} sanitizePrice={sanitizePrice} removeCartItem={removeCartItem} customer={customer} setCustomer={setCustomer} settings={settings} setSettings={setSettings} finance={finance} setFinance={setFinance} subtotal={subtotal} discountAmt={discountAmt} totalGstAmt={totalGstAmt} totalPakka={totalPakka} drafts={drafts} clearDraft={clearActiveSession} holdCurrentBill={holdCurrentBill} clearActiveSession={clearActiveSession} handleCheckout={handleCheckout} generating={generating} setIsDraftsModalOpen={setIsDraftsModalOpen} currency={profile?.currency || '₹'} />

      <DraftsModal isOpen={isDraftsModalOpen} onClose={() => setIsDraftsModalOpen(false)} drafts={drafts} onLoadDraft={resumeDraft} onDeleteDraft={deleteDraft} currency={profile?.currency || '₹'} />
    </div>
  );
}