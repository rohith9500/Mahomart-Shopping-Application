'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { AnimatePresence, motion } from 'framer-motion';

export default function CartDrawer() {
  const router = useRouter();
  const { cartItems, cartOpen, setCartOpen, removeItem, updateQuantity, getCartTotal } = useCartStore();

  const handleCheckoutClick = () => {
    setCartOpen(false);
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Dark Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col h-full border-l border-slate-100"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center space-x-2">
                <ShoppingBag size={20} className="text-brand-accent" />
                <span className="font-extrabold text-lg tracking-wide">My Cart ({cartItems.length})</span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="hover:text-brand-accent transition-colors p-1 rounded-full focus:outline-none"
              >
                <X size={22} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                  <ShoppingBag size={48} className="stroke-[1.5]" />
                  <p className="text-sm font-semibold">Your cart is empty.</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="text-xs text-brand-secondary border border-brand-secondary px-4 py-2 rounded-full hover:bg-brand-secondary hover:text-white transition-all font-bold"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div
                    key={`${item.product}-${item.size}-${item.color}`}
                    className="flex items-start space-x-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-black uppercase text-brand-secondary">{item.brand}</span>
                      <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">{item.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        {item.size && (
                          <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                            Color: {item.color}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2.5 mt-2.5">
                        <button
                          onClick={() => updateQuantity(item.product, item.quantity - 1, item.size, item.color)}
                          className="text-slate-500 hover:text-brand-accent p-0.5 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold text-slate-800 w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product, item.quantity + 1, item.size, item.color)}
                          className="text-slate-500 hover:text-brand-accent p-0.5 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Price and Delete */}
                    <div className="flex flex-col items-end justify-between h-16">
                      <span className="text-sm font-black text-slate-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeItem(item.product, item.size, item.color)}
                        className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer / Checkout Summary */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-sm font-bold text-slate-500">Subtotal</span>
                  <span className="text-xl font-black text-slate-900">₹{getCartTotal().toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4 leading-normal">
                  Shipping, taxes, and discounts calculated at checkout. Backed by local delivery routing.
                </p>
                <button
                  onClick={handleCheckoutClick}
                  className="w-full bg-brand-accent hover:bg-red-600 text-white py-3.5 rounded-xl font-bold tracking-wide transition-all shadow-lg hover:shadow-xl text-center block text-sm"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
