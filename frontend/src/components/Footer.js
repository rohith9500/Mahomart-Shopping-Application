'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div>
            <span className="text-xl font-black tracking-wider text-white bg-gradient-to-r from-blue-400 to-brand-accent bg-clip-text text-transparent">
              MAHOMART
            </span>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Your destination for curated high-performance lifestyle, footwear, and technology products. Designed for premium durability and modern usability.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/catalog" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/catalog?category=electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link href="/catalog?category=footwear" className="hover:text-white transition-colors">Footwear</Link></li>
              <li><Link href="/catalog?category=office-home" className="hover:text-white transition-colors">Office Chairs</Link></li>
            </ul>
          </div>

          {/* Policy Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Join the Club</h4>
            <p className="text-sm text-slate-400 mb-4">Subscribe to receive first access to new collections and weekly sales alerts.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex">
              <input
                type="email"
                placeholder="Enter email"
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white rounded-l-md border-0 focus:ring-2 focus:ring-brand-accent outline-none"
              />
              <button
                type="submit"
                className="bg-brand-accent text-white px-4 rounded-r-md text-sm font-bold hover:bg-red-600 transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MahoMart. All rights reserved.</p>
          <p className="mt-4 md:mt-0">Designed by Sanjay S. & Pair Programmed with Gemini 3.5 Flash</p>
        </div>
      </div>
    </footer>
  );
}
