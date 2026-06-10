'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

export default function ProductCard({ product }) {
  const { addItem } = useCartStore();
  const { user, toggleWishlist } = useAuthStore();

  const isWishlisted = user?.wishlist?.some((item) => item._id === product._id || item === product._id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Default to first variant if present
    const defaultVariant = product.variants && product.variants.length > 0
      ? product.variants[0]
      : { size: 'Standard', color: 'Default' };
      
    addItem(product, 1, defaultVariant.size, defaultVariant.color);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please sign in to add items to your wishlist!');
      return;
    }
    toggleWishlist(product._id);
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
      {/* Product Image Panel */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Link href={`/product/${product._id}`}>
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
          />
        </Link>
        
        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-600 hover:text-brand-accent p-2 rounded-full shadow-md backdrop-blur-sm transition-colors duration-200 z-10 focus:outline-none"
        >
          <Heart size={18} className={isWishlisted ? "fill-brand-accent text-brand-accent animate-pulse" : ""} />
        </button>

        {/* Discount Badge */}
        {product.discountPercent > 0 && (
          <span className="absolute top-4 left-4 bg-brand-accent text-white text-[11px] font-black tracking-wide px-2.5 py-1 rounded-full uppercase shadow-md z-10 animate-bounce">
            {product.discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand */}
          <span className="text-[10px] tracking-widest font-black uppercase text-brand-secondary">
            {product.brand}
          </span>
          
          {/* Title */}
          <Link href={`/product/${product._id}`}>
            <h3 className="text-sm font-bold text-slate-800 hover:text-brand-accent transition-colors duration-150 line-clamp-2 mt-1 mb-2 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-3">
            <div className="flex items-center text-brand-amber">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(product.rating) ? 'fill-current' : 'text-slate-200'}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              ({product.numReviews})
            </span>
          </div>
        </div>

        {/* Pricing and Action row */}
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-base font-extrabold text-slate-900">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            className="bg-brand-primary hover:bg-brand-accent text-white p-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none"
            title="Quick Add to Cart"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
