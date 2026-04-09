import { create } from 'zustand';
import { getProfile, updateProfile } from '../firebase/db';

export const useShopStore = create((set, get) => ({
  profile: null,
  loading: false,
  fetchProfile: async (shopId) => {
    set({ loading: true });
    const profile = await getProfile(shopId);
    set({ profile, loading: false });
  },
  updateProfile: async (shopId, data) => {
    await updateProfile(shopId, data);
    set((state) => ({ profile: { ...state.profile, ...data } }));
  }
}));