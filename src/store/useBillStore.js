import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getBills } from '../firebase/db';
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; // Missing imports added
import { db } from '../firebase/config';

export const useBillStore = create(
  persist(
    (set, get) => ({
      bills: [],
      estimates: [], // NAYA STATE FOR KACCHA BILLS
      loading: false,
      
      // FETCH PAKKA BILLS
      fetchBills: async (shopId) => {
        try {
          const currentBills = get().bills || [];
          if (currentBills.length === 0) set({ loading: true });
          
          const bills = await getBills(shopId);
          set({ bills: bills || [], loading: false });
        } catch (error) {
          console.error("Bill Fetch Error:", error);
          set({ loading: false });
        }
      },

      // NAYA FUNCTION: FETCH KACCHA BILLS (ESTIMATES)
      fetchEstimates: async (shopId) => {
        try {
          const snap = await getDocs(query(collection(db, "shops", shopId, "estimates"), orderBy("createdAt", "desc")));
          const estimates = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          set({ estimates });
        } catch (error) {
          console.error("Estimate Fetch Error:", error);
        }
      },

      // Add to local state without refreshing from DB
      addLocalBill: (bill) => {
        if (bill.isEstimate) {
          set((state) => ({ estimates: [bill, ...(state.estimates || [])] }));
        } else {
          set((state) => ({ bills: [bill, ...(state.bills || [])] }));
        }
      }
    }),
    {
      name: 'bills-storage',
      // Sirf actual data save karo memory me, loading state nahi
      partialize: (state) => ({ bills: state.bills, estimates: state.estimates }), 
    }
  )
);