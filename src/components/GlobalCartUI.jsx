import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useShopStore } from '../store/useShopStore';
import { useBillStore } from '../store/useBillStore';
import { useToastStore } from '../store/useToastStore';
import { useCartStore } from '../store/useCartStore';
import { generateBill, generateEstimate } from '../firebase/db';
import { ShoppingCart, CheckCircle2, Printer } from 'lucide-react';
import PrintBill from './PrintBill';
import DraftsModal from './DraftsModal';
import CartSidebar from './CartSidebar';

export default function GlobalCartUI() {
  const { user } = useAuthStore();
  const { items, fetchItems } = useInventoryStore();
  const { profile } = useShopStore();
  const { addLocalBill } = useBillStore();
  const { addToast } = useToastStore();
  const cartState = useCartStore(); 
  
  const [generating, setGenerating] = useState(false);

  const subtotal = cartState.cart.reduce((acc, item) => acc + ((Number(item.cartPrice) || 0) * (Number(item.qty) || 1)), 0);
  const discountAmt = subtotal * ((Number(cartState.settings.discount) || 0) / 100);
  const afterDiscount = subtotal - discountAmt;
  const totalGstAmt = afterDiscount * ((Number(cartState.settings.gst) || 0) / 100);
  const totalPakka = afterDiscount + totalGstAmt;

  const handleCheckout = async (isEstimate) => {
    // PREVENT DOUBLE CLICK
    if (generating) return;
    
    setGenerating(true);
    try {
      const payload = {
        customerName: cartState.customer.name || "", customerPhone: cartState.customer.phone || "", customerAddress: cartState.customer.address || "",
        items: cartState.cart.map(c => ({ id: c.id, name: c.name || "", price: Number(c.cartPrice || 0), qty: Number(c.qty || 1), unit: c.unit || 'Pcs', category: c.category || "", ram: c.ram || "", rom: c.rom || "", color: c.color || "", soldImei: c.soldImei || "" })),
        subtotal: Number(subtotal || 0), discount: Number(discountAmt || 0), gstPercent: isEstimate ? 0 : Number(cartState.settings.gst || 0), gstAmt: isEstimate ? 0 : Number(totalGstAmt || 0), cgstAmt: isEstimate ? 0 : Number((totalGstAmt / 2) || 0), sgstAmt: isEstimate ? 0 : Number((totalGstAmt / 2) || 0), total: isEstimate ? Number(afterDiscount || 0) : Number(totalPakka || 0), paymentMode: cartState.settings.paymentMode || "Cash", isEstimate
      };
      
      if (cartState.settings.paymentMode === 'Finance') {
        payload.financeDetails = { provider: cartState.finance.provider, downPayment: Number(cartState.finance.downPayment || 0), emiMonths: Number(cartState.finance.emiMonths || 0), emiAmount: Number(cartState.finance.emiAmount || 0) };
      }

      let finalBill = isEstimate ? await generateEstimate(user.uid, payload, cartState.cart) : await generateBill(user.uid, payload, cartState.cart);
      
      if (!isEstimate) addLocalBill(finalBill);
      
      cartState.setPrintedBill(finalBill); 
      cartState.clearActiveSession(profile?.defaultGST || 0); 
      cartState.setIsCartOpen(false); 
      
      if (user) await fetchItems(user.uid); 
      addToast(isEstimate ? "Estimate Created!" : "Bill Generated!", "success");
    } catch (error) { 
      addToast("Error processing request", 'error'); 
    } finally { 
      setGenerating(false); 
    }
  };

  if (cartState.printedBill) return (
    <div className="fixed inset-0 z-[100] flex flex-col h-full bg-white print:bg-white print:fixed print:inset-0 print:z-50">
      <div className="print:hidden p-5 border-b flex justify-between items-center bg-gray-50">
        <h2 className={`text-2xl font-black flex items-center gap-2 ${cartState.printedBill.isEstimate ? 'text-amber-600' : 'text-green-600'}`}><CheckCircle2 size={28} /> {cartState.printedBill.isEstimate ? 'Estimate Created!' : 'Bill Generated!'}</h2>
        <div className="space-x-4 flex"><button onClick={() => cartState.setPrintedBill(null)} className="px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-100 font-bold text-gray-700">Close</button><button onClick={() => window.print()} className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white rounded-xl font-black shadow-md uppercase"><Printer size={20}/> Print</button></div>
      </div>
      <div className="flex-1 overflow-auto bg-white p-4 print:p-0"><PrintBill bill={cartState.printedBill} profile={profile} /></div>
    </div>
  );

  return (
    <>
      {!cartState.isCartOpen && (
        <button onClick={() => cartState.setIsCartOpen(true)} className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40 bg-gray-900 text-white p-4 rounded-full shadow-2xl hover:scale-105 hover:bg-black transition-all flex items-center justify-center border-4 border-white print:hidden">
          <ShoppingCart size={28} />
          {cartState.cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">{cartState.cart.length}</span>}
        </button>
      )}

      <CartSidebar 
        isOpen={cartState.isCartOpen} toggleCart={() => cartState.setIsCartOpen(false)} cart={cartState.cart} 
        updateQty={cartState.updateQty} sanitizeQty={cartState.sanitizeQty} updatePrice={cartState.updatePrice} sanitizePrice={cartState.sanitizePrice} removeCartItem={cartState.removeCartItem} 
        customer={cartState.customer} setCustomer={cartState.setCustomer} settings={cartState.settings} setSettings={cartState.setSettings} finance={cartState.finance} setFinance={cartState.setFinance} 
        subtotal={subtotal} discountAmt={discountAmt} totalGstAmt={totalGstAmt} totalPakka={totalPakka} drafts={cartState.drafts} 
        clearDraft={() => { if(confirm("Clear current cart?")) cartState.clearActiveSession(profile?.defaultGST||0); }} 
        holdCurrentBill={() => cartState.holdCurrentBill(totalPakka, addToast)} 
        clearActiveSession={() => cartState.clearActiveSession(profile?.defaultGST||0)} 
        handleCheckout={handleCheckout} generating={generating} setIsDraftsModalOpen={cartState.setIsDraftsModalOpen} currency={profile?.currency || '₹'} 
      />

      <DraftsModal isOpen={cartState.isDraftsModalOpen} onClose={() => cartState.setIsDraftsModalOpen(false)} drafts={cartState.drafts} onLoadDraft={(d) => cartState.resumeDraft(d, addToast)} onDeleteDraft={cartState.deleteDraft} currency={profile?.currency || '₹'} />
    </>
  );
}