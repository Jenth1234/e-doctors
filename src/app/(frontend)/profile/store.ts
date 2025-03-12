import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  dob: string;
}

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
})); 