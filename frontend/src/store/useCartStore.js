import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  cartItems: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mahomart_cart') || '[]') : [],
  cartOpen: false,

  setCartOpen: (open) => set({ cartOpen: open }),

  addItem: (product, quantity = 1, size = '', color = '') => {
    const { cartItems } = get();
    // Unique key: product_id + size + color
    const existingIndex = cartItems.findIndex(
      (item) => item.product === product._id && item.size === size && item.color === color
    );

    let updatedCart;
    if (existingIndex > -1) {
      updatedCart = [...cartItems];
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart = [
        ...cartItems,
        {
          product: product._id,
          title: product.title,
          image: product.images[0],
          price: product.price,
          brand: product.brand,
          size,
          color,
          quantity,
        },
      ];
    }

    set({ cartItems: updatedCart, cartOpen: true });
    localStorage.setItem('mahomart_cart', JSON.stringify(updatedCart));
  },

  removeItem: (productId, size = '', color = '') => {
    const { cartItems } = get();
    const updatedCart = cartItems.filter(
      (item) => !(item.product === productId && item.size === size && item.color === color)
    );
    set({ cartItems: updatedCart });
    localStorage.setItem('mahomart_cart', JSON.stringify(updatedCart));
  },

  updateQuantity: (productId, quantity, size = '', color = '') => {
    if (quantity < 1) return;
    const { cartItems } = get();
    const updatedCart = cartItems.map((item) => {
      if (item.product === productId && item.size === size && item.color === color) {
        return { ...item, quantity };
      }
      return item;
    });
    set({ cartItems: updatedCart });
    localStorage.setItem('mahomart_cart', JSON.stringify(updatedCart));
  },

  clearCart: () => {
    set({ cartItems: [] });
    localStorage.removeItem('mahomart_cart');
  },

  getCartTotal: () => {
    const { cartItems } = get();
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  },

  getCartCount: () => {
    const { cartItems } = get();
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  },
}));
