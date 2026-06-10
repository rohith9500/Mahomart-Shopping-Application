'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Laptop, Footprints, Armchair, ShoppingBag, ArrowRight } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import { fetchProducts, fetchCategories } from '../utils/api';

const categoryIcons = {
  electronics: Laptop,
  footwear: Footprints,
  'office-home': Armchair,
  accessories: ShoppingBag,
};

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const catData = await fetchCategories();
        setCategories(catData);

        // Fetch products for rows
        const prodData = await fetchProducts({ pageSize: 6 });
        setTrending(prodData.products);
        
        // Reverse products or select different ones for recommended
        setRecommended([...prodData.products].reverse());
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const SkeletonLoader = () => (
    <div className="flex space-x-6 overflow-hidden py-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="min-w-[250px] w-[280px] bg-white rounded-2xl border border-slate-100 p-4 space-y-4 animate-pulse">
          <div className="bg-slate-200 aspect-square rounded-xl w-full" />
          <div className="space-y-2">
            <div className="bg-slate-200 h-3 w-1/3 rounded" />
            <div className="bg-slate-200 h-4 w-3/4 rounded" />
            <div className="bg-slate-200 h-5 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Carousel */}
      <HeroCarousel />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Categories Section */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Sparkles size={20} className="text-brand-accent animate-pulse" /> Shop by Category
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
              ))
            ) : (
              categories.map((category) => {
                const IconComponent = categoryIcons[category.slug] || ShoppingBag;
                return (
                  <Link
                    key={category._id}
                    href={`/catalog?category=${category.slug}`}
                    className="group relative h-36 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 flex items-center justify-center bg-slate-900"
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent" />
                    <div className="relative z-10 flex flex-col items-center text-white space-y-2">
                      <IconComponent size={28} className="group-hover:rotate-12 transition-transform duration-300 text-brand-accent" />
                      <span className="font-extrabold text-sm tracking-wide">{category.name}</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* Trending Now */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Trending Now</h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Top picks dominating current lifestyle trends</p>
            </div>
            <Link href="/catalog" className="text-brand-secondary hover:text-brand-accent text-xs font-black tracking-wider flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <SkeletonLoader />
          ) : (
            <div className="flex space-x-6 overflow-x-auto no-scrollbar py-4 px-1 -mx-1">
              {trending.map((product) => (
                <div key={product._id} className="min-w-[250px] w-[280px] flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Brand Banner */}
        <section className="bg-brand-dark rounded-3xl overflow-hidden relative shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/40 to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop"
            alt="Office Banner"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-30"
          />
          <div className="relative z-20 max-w-lg p-8 sm:p-12 text-white space-y-4">
            <span className="bg-brand-accent text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase">
              EXECUTIVE COMFORT
            </span>
            <h3 className="text-xl sm:text-3xl font-black tracking-tight leading-none">
              Redefining Workplace Ergonomics
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore our line of posture-supporting premium seating options engineered for peak daily performance.
            </p>
            <div className="pt-2">
              <Link
                href="/catalog?category=office-home"
                className="inline-block bg-white hover:bg-brand-accent text-slate-900 hover:text-white px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-200"
              >
                Shop Office Chair
              </Link>
            </div>
          </div>
        </section>

        {/* Recommended For You */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Recommended for You</h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Personalized recommendations chosen for you</p>
            </div>
            <Link href="/catalog" className="text-brand-secondary hover:text-brand-accent text-xs font-black tracking-wider flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <SkeletonLoader />
          ) : (
            <div className="flex space-x-6 overflow-x-auto no-scrollbar py-4 px-1 -mx-1">
              {recommended.map((product) => (
                <div key={product._id} className="min-w-[250px] w-[280px] flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
