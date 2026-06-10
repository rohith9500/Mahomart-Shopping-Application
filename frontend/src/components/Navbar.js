'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Heart, Package, LogOut, X, Sparkles, Laptop, Footprints, Armchair, Layers } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { fetchProductSuggestions } from '../utils/api';

export default function Navbar() {
  const router = useRouter();
  const { cartItems, setCartOpen, getCartCount } = useCartStore();
  const { user, token, logout, fetchProfile } = useAuthStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const suggestionRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch profile on load
  useEffect(() => {
    if (token && !user) {
      fetchProfile();
    }
  }, [token, user, fetchProfile]);

  // Debounced search suggestions
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await fetchProductSuggestions(searchTerm);
        setSuggestions(data);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle outside clicks to close menus
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/catalog?keyword=${encodeURIComponent(searchTerm)}`);
      setShowSuggestions(false);
    }
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-slate-900 font-semibold rounded-sm px-0.5">{part}</mark>
      ) : part
    );
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-40 w-full bg-brand-dark text-white shadow-md glass-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-blue-400 to-brand-accent bg-clip-text text-transparent">
                  MAHOMART
                </span>
              </Link>
            </div>

            {/* Desktop Navigation / Mega Menu */}
            <nav className="hidden md:flex space-x-8 text-sm font-semibold">
              <Link href="/catalog" className="hover:text-brand-accent transition-colors">Catalog</Link>
              <Link href="/catalog?category=electronics" className="hover:text-brand-accent transition-colors flex items-center gap-1">
                <Laptop size={14} /> Electronics
              </Link>
              <Link href="/catalog?category=footwear" className="hover:text-brand-accent transition-colors flex items-center gap-1">
                <Footprints size={14} /> Footwear
              </Link>
              <Link href="/catalog?category=office-home" className="hover:text-brand-accent transition-colors flex items-center gap-1">
                <Armchair size={14} /> Office
              </Link>
            </nav>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-md mx-8 hidden lg:block" ref={suggestionRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search brand, product name..."
                    className="w-full bg-slate-800/80 text-white pl-4 pr-10 py-2 rounded-full border border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-accent text-sm"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                  />
                  <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-white">
                    <Search size={18} />
                  </button>
                </div>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-100 overflow-hidden z-50">
                  {suggestions.map((item) => (
                    <Link
                      key={item._id}
                      href={`/product/${item._id}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                    >
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-10 h-10 object-cover rounded-md mr-3 border border-slate-200"
                      />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs text-brand-secondary font-bold uppercase">{item.brand}</p>
                        <p className="text-sm font-semibold truncate text-slate-800">
                          {highlightMatch(item.title, searchTerm)}
                        </p>
                      </div>
                      <div className="text-sm font-bold text-brand-primary">
                        ₹{item.price.toLocaleString()}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Action Icons */}
            <div className="flex items-center space-x-6">
              {/* Desktop Search Toggle for Medium Screens */}
              <button className="lg:hidden hover:text-brand-accent transition-colors" onClick={() => router.push('/catalog')}>
                <Search size={20} />
              </button>

              {/* Wishlist Link */}
              <Link href="/dashboard" className="relative hover:text-brand-accent transition-colors">
                <Heart size={22} className={user?.wishlist?.length > 0 ? "fill-brand-accent text-brand-accent" : ""} />
                {user?.wishlist?.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-accent text-white rounded-full text-[10px] w-4.5 h-4.5 flex items-center justify-center font-bold">
                    {user.wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Toggle */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center hover:text-brand-accent transition-colors focus:outline-none"
              >
                <ShoppingCart size={22} />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-accent text-white rounded-full text-[10px] w-4.5 h-4.5 flex items-center justify-center font-bold">
                    {getCartCount()}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                {user ? (
                  <div>
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center space-x-1 hover:text-brand-accent focus:outline-none"
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center font-bold text-sm text-white shadow-inner">
                        {user.name.charAt(0)}
                      </div>
                    </button>
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-3 w-48 bg-white text-slate-800 rounded-lg shadow-xl py-2 border border-slate-100 z-50">
                        <div className="px-4 py-2 border-b border-slate-100 font-semibold text-sm truncate text-slate-700">
                          Hi, {user.name}
                        </div>
                        <Link
                          href="/dashboard"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center px-4 py-2 text-sm hover:bg-slate-50 transition-colors"
                        >
                          <Package size={16} className="mr-2" /> Dashboard & Orders
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setShowProfileMenu(false);
                            router.push('/');
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-slate-100"
                        >
                          <LogOut size={16} className="mr-2" /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-1 hover:text-brand-accent transition-colors text-sm font-semibold"
                  >
                    <User size={20} />
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-dark/95 backdrop-blur-md border-t border-slate-800 text-white z-40 h-16 flex items-center justify-around px-4">
        <Link href="/" className="flex flex-col items-center justify-center text-xs gap-1 opacity-70 hover:opacity-100 focus:opacity-100">
          <Sparkles size={20} />
          <span>Home</span>
        </Link>
        <Link href="/catalog" className="flex flex-col items-center justify-center text-xs gap-1 opacity-70 hover:opacity-100">
          <Layers size={20} />
          <span>Shop</span>
        </Link>
        <button
          onClick={() => setCartOpen(true)}
          className="flex flex-col items-center justify-center text-xs gap-1 relative opacity-70 hover:opacity-100"
        >
          <ShoppingCart size={20} />
          {getCartCount() > 0 && (
            <span className="absolute top-0 right-2 bg-brand-accent text-white rounded-full text-[9px] px-1 font-bold">
              {getCartCount()}
            </span>
          )}
          <span>Cart</span>
        </button>
        <Link href="/dashboard" className="flex flex-col items-center justify-center text-xs gap-1 opacity-70 hover:opacity-100">
          <User size={20} />
          <span>Account</span>
        </Link>
      </div>
    </>
  );
}
