import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from '../firebase/db';

export const useInventoryStore = create(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      fetchItems: async (shopId) => {
        try {
          const currentItems = get().items || [];
          if (currentItems.length === 0) set({ loading: true });
          
          const items = await getInventory(shopId);
          set({ items: items || [], loading: false });
        } catch (error) {
          console.error("Inventory Fetch Error:", error);
          set({ loading: false });
        }
      },
      addItem: async (shopId, item) => {
        const newItem = await addInventoryItem(shopId, item);
        set((state) => ({ items: [newItem, ...(state.items || [])] }));
      },
      updateItem: async (shopId, id, data) => {
        await updateInventoryItem(shopId, id, data);
        set((state) => ({ items: (state.items || []).map((i) => (i.id === id ? { ...i, ...data } : i)) }));
      },
      deleteItem: async (shopId, id) => {
        await deleteInventoryItem(shopId, id);
        set((state) => ({ items: (state.items || []).filter((i) => i.id !== id) }));
      }
    }),
    {
      name: 'inventory-storage',
      // MAGIC FIX: Sirf items save karo, loading state kabhi save mat karo
      partialize: (state) => ({ items: state.items }), 
    }
  )
);