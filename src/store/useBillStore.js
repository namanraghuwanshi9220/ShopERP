import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getBills } from '../firebase/db';

export const useBillStore = create(
  persist(
    (set, get) => ({
      bills: [],
      loading: false,
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
      addLocalBill: (bill) => set((state) => ({ bills: [bill, ...(state.bills || [])] }))
    }),
    {
      name: 'bills-storage',
      partialize: (state) => ({ bills: state.bills }), // CRITICAL FIX
    }
  )
);