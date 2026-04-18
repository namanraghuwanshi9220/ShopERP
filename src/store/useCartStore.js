import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      customer: { name: '', phone: '', address: '' },
      settings: { discount: 0, gst: 0, paymentMode: 'Cash' },
      finance: { provider: 'Bajaj Finserv', downPayment: '', emiMonths: '', emiAmount: '' },
      drafts: [],
      isCartOpen: false,
      isDraftsModalOpen: false,
      printedBill: null,

      setPrintedBill: (val) => set({ printedBill: val }),
      setIsCartOpen: (val) => set({ isCartOpen: val }),
      setIsDraftsModalOpen: (val) => set({ isDraftsModalOpen: val }),
      
      setCustomer: (updater) => set({ customer: typeof updater === 'function' ? updater(get().customer) : { ...get().customer, ...updater } }),
      setSettings: (updater) => set({ settings: typeof updater === 'function' ? updater(get().settings) : { ...get().settings, ...updater } }),
      setFinance: (updater) => set({ finance: typeof updater === 'function' ? updater(get().finance) : { ...get().finance, ...updater } }),

      processAddToCart: (item, selectedImei, addToast) => {
        const { cart } = get();
        const existingIndex = cart.findIndex(c => c.id === item.id && c.soldImei === selectedImei);
        if (existingIndex >= 0) {
          if (cart[existingIndex].qty >= item.stock) {
            if (addToast) addToast("Stock limit reached", "error");
            return;
          }
          const newCart = [...cart];
          newCart[existingIndex] = { ...newCart[existingIndex], qty: Number(newCart[existingIndex].qty) + 1 };
          set({ cart: newCart, isCartOpen: true });
        } else {
          set({ cart: [...cart, { ...item, qty: 1, soldImei: selectedImei || '', cartPrice: item.price }], isCartOpen: true });
        }
      },

      updateQty: (id, soldImei, newQty) => set({ cart: get().cart.map(c => (c.id === id && c.soldImei === soldImei) ? { ...c, qty: Math.max(0, Number(newQty) || 0) } : c).filter(c => c.qty > 0) }),
      updatePrice: (id, soldImei, newPrice) => set({ cart: get().cart.map(c => (c.id === id && c.soldImei === soldImei) ? { ...c, cartPrice: newPrice } : c) }),
      sanitizePrice: (id, soldImei, val) => { let num = parseFloat(val); if (isNaN(num) || num < 0) num = 0; set({ cart: get().cart.map(c => (c.id === id && c.soldImei === soldImei) ? { ...c, cartPrice: Number(num.toFixed(2)) } : c) }); },
      sanitizeQty: (id, soldImei, val) => { let num = parseFloat(val); if (isNaN(num) || num <= 0) set({ cart: get().cart.filter(c => !(c.id === id && c.soldImei === soldImei)) }); else set({ cart: get().cart.map(c => (c.id === id && c.soldImei === soldImei) ? { ...c, qty: num } : c) }); },
      removeCartItem: (id, soldImei) => set({ cart: get().cart.filter(c => !(c.id === id && c.soldImei === soldImei)) }),

      holdCurrentBill: (totalPakka, addToast) => {
        const { cart, customer, settings, finance, drafts } = get();
        if (cart.length === 0 && !customer.name) return;
        const newDraft = { id: Date.now(), date: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' }), customerName: customer.name || "Unknown", itemCount: cart.length, total: totalPakka, data: { cart, customer, settings, finance } };
        set({ drafts: [newDraft, ...drafts], isCartOpen: false });
        get().clearActiveSession();
        if (addToast) addToast("Bill saved to Drafts", "success");
      },
      resumeDraft: (draft, addToast) => {
        set({ cart: draft.data.cart || [], customer: draft.data.customer || {}, settings: draft.data.settings || {}, finance: draft.data.finance || {}, drafts: get().drafts.filter(d => d.id !== draft.id), isDraftsModalOpen: false, isCartOpen: true });
        if (addToast) addToast("Draft loaded!", "success");
      },
      deleteDraft: (id) => set({ drafts: get().drafts.filter(d => d.id !== id) }),
      clearActiveSession: (defaultGST = 0) => set({ cart: [], customer: { name: '', phone: '', address: '' }, settings: { discount: 0, gst: defaultGST, paymentMode: 'Cash' }, finance: { provider: 'Bajaj Finserv', downPayment: '', emiMonths: '', emiAmount: '' } })
    }),
    { name: 'pos_global_cart_state' } // Automatically saves cart to memory
  )
);