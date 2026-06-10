import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('mahomart_token') : null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem('mahomart_token', token);
    } else {
      localStorage.removeItem('mahomart_token');
    }
    set({ token });
  },

  logout: () => {
    localStorage.removeItem('mahomart_token');
    set({ user: null, token: null });
  },

  fetchProfile: async () => {
    const { token } = get();
    if (!token) return;
    set({ loading: true });
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        set({ user: data, loading: false });
      } else {
        // Token might be expired
        set({ user: null, token: null, loading: false });
        localStorage.removeItem('mahomart_token');
      }
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  toggleWishlist: async (productId) => {
    const { token, user } = get();
    if (!token || !user) return;
    try {
      const res = await fetch('http://localhost:5000/api/auth/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      if (res.ok) {
        const wishlist = await res.json();
        set({ user: { ...user, wishlist } });
      }
    } catch (err) {
      console.error(err);
    }
  },

  addSavedAddress: async (addressData) => {
    const { token, user } = get();
    if (!token || !user) return;
    try {
      const res = await fetch('http://localhost:5000/api/auth/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });
      if (res.ok) {
        const savedAddresses = await res.json();
        set({ user: { ...user, savedAddresses } });
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  }
}));
